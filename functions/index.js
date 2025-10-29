const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2/options');
const admin = require('firebase-admin');
const express = require('express');

setGlobalOptions({ region: 'europe-west1' });

// Initialize Admin SDK
try { admin.app(); } catch (e) { admin.initializeApp(); }

// Minimal HTTP function placeholder used by firebase.json rewrites
exports.webapp = onRequest((req, res) => {
  res.status(200).send('neuronutrition-app web function placeholder. Build and serve static web from Hosting.');
});

// Simple Express API for Hosting rewrites /api/**
const app = express();
// Support both with and without the /api prefix since Hosting rewrite keeps it
app.get(['/health', '/api/health'], (req, res) => res.json({ ok: true }));
app.get(['/hello', '/api/hello'], (req, res) => res.json({ message: 'Hello from Functions Gen2 API' }));
// Placeholder scoring route
app.get(['/scoring', '/api/scoring'], (req, res) => res.json({ score: null, message: 'Not implemented' }));
// Fallback 404 for /api/*
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found', path: req.path }));

exports.api = onRequest(app);

// Secure admin utility: set or unset custom admin claim.
// Usage: POST /setUserAdmin with header x-admin-api-key: <secret> and JSON body { uid: string, admin: boolean, role?: string }
exports.setUserAdmin = onRequest({ secrets: ['ADMIN_API_KEY'] }, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('Content-Type', 'application/json');
  // Basic CORS for manual calls; tighten as needed
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-api-key');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).send(JSON.stringify({ error: 'Method not allowed' }));

  // Try to get API key from secret first, then environment
  const apiKey = process.env.ADMIN_API_KEY;
  console.log('API Key configured:', !!apiKey);
  if (!apiKey) return res.status(500).send(JSON.stringify({ error: 'Server not configured' }));
  
  const provided = req.get('x-admin-api-key');
  console.log('API Key provided:', !!provided);
  
  if (!provided || provided !== apiKey) {
    console.log('Authorization failed');
    return res.status(401).send(JSON.stringify({ error: 'Unauthorized' }));
  }

  const { uid, admin: isAdmin, role, fullAdmin } = req.body || {};
  if (!uid || typeof isAdmin !== 'boolean') return res.status(400).send(JSON.stringify({ error: 'Invalid payload' }));

  try {
    const claims = { admin: isAdmin };
    if (role) claims.role = role;
    if (typeof fullAdmin === 'boolean') claims.fullAdmin = fullAdmin;
    
    await admin.auth().setCustomUserClaims(uid, claims);
    console.log('Claims set successfully:', claims);
    return res.status(200).send(JSON.stringify({ ok: true, uid, claims }));
  } catch (err) {
    console.error(err);
    return res.status(500).send(JSON.stringify({ error: String(err && err.message || err) }));
  }
});

// Read claims for a user (debug). Requires same header as above.
exports.getUserClaims = onRequest(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('Content-Type', 'application/json');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-api-key');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'GET') return res.status(405).send(JSON.stringify({ error: 'Method not allowed' }));
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) return res.status(500).send(JSON.stringify({ error: 'Server not configured' }));
  const provided = req.get('x-admin-api-key');
  if (!provided || provided !== apiKey) return res.status(401).send(JSON.stringify({ error: 'Unauthorized' }));
  const uid = req.query.uid;
  if (!uid) return res.status(400).send(JSON.stringify({ error: 'Missing uid' }));
  try {
    const user = await admin.auth().getUser(uid);
    return res.status(200).send(JSON.stringify({ uid, claims: user.customClaims || {} }));
  } catch (err) {
    console.error(err);
    return res.status(500).send(JSON.stringify({ error: String(err && err.message || err) }));
  }
});

// Patient self-activation: mark patient document as approved
// Client must be authenticated as the patient. No input is required.
exports.activatePatient = onCall(async (request) => {
  const { auth } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = auth.uid;
  try {
    await admin.firestore().collection('patients').doc(uid).set({
      status: 'approved',
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Optionally ensure role=patient remains
    try {
      const user = await admin.auth().getUser(uid);
      const claims = user.customClaims || {};
      if (claims.role !== 'patient') {
        await admin.auth().setCustomUserClaims(uid, { ...claims, role: 'patient' });
      }
    } catch (_) { /* ignore */ }

    return { ok: true };
  } catch (error) {
    console.error('activatePatient error', error);
    throw new HttpsError('internal', 'Activation failed');
  }
});

// Invite a patient: create user, send email/SMS via Firestore queue
exports.invitePatient = onCall(async (request) => {
  const { data, auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const practitionerId = auth.uid;
  const claims = auth.token ?? {};
  const hasPractitionerClaim =
    claims.role === 'practitioner' || claims.admin === true || claims.fullAdmin === true;

  // Determine patient app base URL for links (trim trailing slash)
  const baseUrl = (process.env.PATIENT_APP_BASE_URL || 'https://patient.neuronutrition-app.com').replace(/\/$/, '');

  let practitionerDoc;
  try {
    // Try practitioners collection first
    practitionerDoc = await admin.firestore().collection('practitioners').doc(practitionerId).get();
    
    // If not found, try users collection as fallback
    if (!practitionerDoc || !practitionerDoc.exists) {
      console.log('Practitioner not found in practitioners collection, checking users collection');
      practitionerDoc = await admin.firestore().collection('users').doc(practitionerId).get();
    }
  } catch (error) {
    console.error('Error loading practitioner document', error);
    practitionerDoc = null;
  }

  // Check if user is practitioner via claims OR document
  const isPractitionerViaDoc = practitionerDoc && practitionerDoc.exists && 
    (practitionerDoc.data().role === 'practitioner' || 
     practitionerDoc.data().admin === true || 
     practitionerDoc.data().fullAdmin === true);

  if (!hasPractitionerClaim && !isPractitionerViaDoc) {
    throw new HttpsError('permission-denied', 'User is not a practitioner');
  }

  const { email, phone, firstname, lastname } = data || {};
  if (!email) {
    throw new HttpsError('invalid-argument', 'Email is required');
  }

  const normalizedFirstName = typeof firstname === 'string' ? firstname.trim() : '';
  const normalizedLastName = typeof lastname === 'string' ? lastname.trim() : '';
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
  const fullName = [normalizedFirstName, normalizedLastName].filter(Boolean).join(' ').trim();

  try {
    // We'll support both flows: new user with temp password, or existing user with reset link
    let userRecord;
    let isExistingUser = false;
    let tempPassword = '';

    // Try to find an existing user first to avoid createUser errors
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      isExistingUser = true;
    } catch (lookupErr) {
      // If user not found, create a new one with a temporary password
      const notFound = lookupErr && (lookupErr.code === 'auth/user-not-found' || lookupErr.errorInfo?.code === 'auth/user-not-found');
      if (!notFound) throw lookupErr;

      tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      userRecord = await admin.auth().createUser({
        email,
        password: tempPassword,
        displayName: fullName || email,
      });
    }

    // Ensure custom claims for patient role (idempotent)
    try {
      const current = await admin.auth().getUser(userRecord.uid);
      const currentClaims = current.customClaims || {};
      if (currentClaims.role !== 'patient') {
        await admin.auth().setCustomUserClaims(userRecord.uid, { ...currentClaims, role: 'patient' });
      }
    } catch (_) {
      // non-fatal
    }

    // Create/merge patient document in Firestore
    await admin.firestore().collection('patients').doc(userRecord.uid).set({
      email,
      phone: normalizedPhone || null,
      firstname: normalizedFirstName || null,
      lastname: normalizedLastName || null,
      practitionerId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Prepare links for email content
  const signupLink = `${baseUrl}/signup?email=${encodeURIComponent(email)}${!isExistingUser && tempPassword ? `&temp=${encodeURIComponent(tempPassword)}` : ''}`;
    let resetLink = null;
    if (isExistingUser) {
      try {
        // For existing users: generate a secure password reset link
        // Redirect back to the patient app signup page after reset
        resetLink = await admin.auth().generatePasswordResetLink(email, { url: `${baseUrl}/signup` });
      } catch (genErr) {
        console.warn('Could not generate password reset link, will fallback to login URL.', genErr);
      }
    }

    const practitionerData = practitionerDoc && practitionerDoc.exists ? practitionerDoc.data() : {};
    const practitionerName =
      (practitionerData && (practitionerData.name || practitionerData.fullName || practitionerData.displayName)) ||
      (typeof claims.name === 'string' ? claims.name : '') ||
      practitionerId;

  const firstName = normalizedFirstName || 'Cher patient';
  const lastName = normalizedLastName || '';
  // Use a distinct variable name to avoid shadowing earlier `fullName`
  const displayFullName = `${firstName} ${lastName}`.trim();

    await admin.firestore().collection('mail').add({
      to: email,
      message: {
        subject: `Invitation à rejoindre NeuroNutrition - ${practitionerName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .button:hover { background-color: #4338CA; }
    .credentials { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧠 NeuroNutrition</h1>
    </div>
    <div class="content">
  <h2>Bonjour ${displayFullName},</h2>
      <p><strong>${practitionerName}</strong> vous a invité(e) à rejoindre la plateforme NeuroNutrition.</p>
      
      <p>Cette plateforme vous permettra de :</p>
      <ul>
        <li>✅ Remplir des questionnaires médicaux en ligne</li>
        <li>✅ Suivre vos consultations et recommandations</li>
        <li>✅ Communiquer avec votre praticien de manière sécurisée</li>
      </ul>

      ${!isExistingUser && tempPassword ? `
      <div class="credentials" style="background-color:#FEF3C7;border-left:4px solid #F59E0B;padding:15px;margin:20px 0;">
        <h3>🔐 Vos identifiants temporaires :</h3>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Mot de passe temporaire :</strong> <code>${tempPassword}</code></p>
        <p><em>⚠️ Vous devrez changer ce mot de passe lors de votre première connexion.</em></p>
      </div>
      ` : `
      <div class="credentials" style="background-color:#DBEAFE;border-left:4px solid #3B82F6;padding:15px;margin:20px 0;">
        <h3>🔐 Compte déjà existant</h3>
        <p>Votre email est déjà associé à un compte sur NeuroNutrition.</p>
        <p>${resetLink ? 'Vous pouvez définir un nouveau mot de passe en toute sécurité via le bouton ci‑dessous.' : 'Connectez‑vous via le bouton ci‑dessous.'}</p>
      </div>
      `}

      <center>
  ${!isExistingUser ? `<a href="${signupLink}" class="button">Créer mon compte</a>` : resetLink ? `<a href="${resetLink}" class="button">Définir mon mot de passe</a>` : `<a href="${baseUrl}/signup?email=${encodeURIComponent(email)}" class="button">Continuer</a>`}
      </center>

      <p style="margin-top: 30px; font-size: 14px; color: #666;">
  Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
  ${!isExistingUser ? `<a href="${signupLink}">${signupLink}</a>` : resetLink ? `<a href="${resetLink}">${resetLink}</a>` : `<a href="${baseUrl}/signup?email=${encodeURIComponent(email)}">${baseUrl}/signup?email=${encodeURIComponent(email)}</a>`}
      </p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé par ${practitionerName} via NeuroNutrition</p>
      <p>Si vous n'êtes pas concerné(e) par cette invitation, veuillez ignorer cet email.</p>
    </div>
  </div>
</body>
</html>
  `,
  text: `
Bonjour ${displayFullName},

${practitionerName} vous a invité(e) à rejoindre la plateforme NeuroNutrition.

${!isExistingUser && tempPassword ? `
Vos identifiants temporaires :
- Email : ${email}
- Mot de passe temporaire : ${tempPassword}

Créez votre compte en cliquant sur ce lien :
${signupLink}

⚠️ Vous devrez changer ce mot de passe lors de votre première connexion.
` : `
Votre email est déjà associé à un compte sur NeuroNutrition.
${resetLink ? `
Définissez un nouveau mot de passe via ce lien sécurisé :
${resetLink}
` : `
Poursuivez via ce lien :
${baseUrl}/signup?email=${email}
`}
`}

---
Cet email a été envoyé par ${practitionerName} via NeuroNutrition.
Si vous n'êtes pas concerné(e) par cette invitation, veuillez ignorer cet email.
        `,
      },
    });

    // Queue SMS notification
    if (normalizedPhone) {
      const greetingName = normalizedFirstName || 'votre';
      await admin.firestore().collection('sms').add({
        to: normalizedPhone,
        body: `Bonjour ${greetingName}, votre praticien vous a invité sur NeuroNutrition. Consultez votre email pour activer votre compte.`,
      });
    }

    return { success: true, patientId: userRecord.uid };
  } catch (error) {
    console.error('Error inviting patient:', error);
    throw new HttpsError('internal', error.message);
  }
});
