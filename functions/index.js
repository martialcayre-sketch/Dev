const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2/options');
const admin = require('firebase-admin');
const express = require('express');

setGlobalOptions({ region: 'europe-west1' });

// Initialize Admin SDK
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Minimal HTTP function placeholder used by firebase.json rewrites
exports.webapp = onRequest((req, res) => {
  res
    .status(200)
    .send('neuronutrition-app web function placeholder. Build and serve static web from Hosting.');
});

// Simple Express API for Hosting rewrites /api/**
const app = express();
app.use(express.json());

// Support both with and without the /api prefix since Hosting rewrite keeps it
app.get(['/health', '/api/health'], (req, res) => res.json({ ok: true }));
app.get(['/hello', '/api/hello'], (req, res) =>
  res.json({ message: 'Hello from Functions Gen2 API' })
);

// Life Journey: latest entry
app.get(
  ['/patients/:patientId/lifejourney', '/api/patients/:patientId/lifejourney'],
  async (req, res) => {
    try {
      const { patientId } = req.params;
      if (!patientId) return res.status(400).json({ error: 'Missing patientId' });

      const snap = await admin
        .firestore()
        .collection('patients')
        .doc(patientId)
        .collection('lifejourney')
        .orderBy('submittedAt', 'desc')
        .limit(1)
        .get();

      if (snap.empty) return res.status(404).json({ error: 'No lifejourney data' });
      const doc = snap.docs[0];
      return res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
      console.error('GET /api/patients/:id/lifejourney error', err);
      return res.status(500).json({ error: 'Internal error' });
    }
  }
);

// Life Journey: all entries (optional ?limit)
app.get(
  ['/patients/:patientId/lifejourney/all', '/api/patients/:patientId/lifejourney/all'],
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const limit = Math.max(1, Math.min(parseInt(String(req.query.limit || '20'), 10) || 20, 100));
      if (!patientId) return res.status(400).json({ error: 'Missing patientId' });

      const snap = await admin
        .firestore()
        .collection('patients')
        .doc(patientId)
        .collection('lifejourney')
        .orderBy('submittedAt', 'desc')
        .limit(limit)
        .get();

      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.json({ count: data.length, items: data });
    } catch (err) {
      console.error('GET /api/patients/:id/lifejourney/all error', err);
      return res.status(500).json({ error: 'Internal error' });
    }
  }
);

// Placeholder scoring route
app.get(['/scoring', '/api/scoring'], (req, res) =>
  res.json({ score: null, message: 'Not implemented' })
);

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
  if (req.method !== 'POST')
    return res.status(405).send(JSON.stringify({ error: 'Method not allowed' }));

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
  if (!uid || typeof isAdmin !== 'boolean')
    return res.status(400).send(JSON.stringify({ error: 'Invalid payload' }));

  try {
    const claims = { admin: isAdmin };
    if (role) claims.role = role;
    if (typeof fullAdmin === 'boolean') claims.fullAdmin = fullAdmin;

    await admin.auth().setCustomUserClaims(uid, claims);
    console.log('Claims set successfully:', claims);
    return res.status(200).send(JSON.stringify({ ok: true, uid, claims }));
  } catch (err) {
    console.error(err);
    return res.status(500).send(JSON.stringify({ error: String((err && err.message) || err) }));
  }
});

// Read claims for a user (debug). Requires same header as above.
exports.getUserClaims = onRequest(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('Content-Type', 'application/json');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-api-key');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'GET')
    return res.status(405).send(JSON.stringify({ error: 'Method not allowed' }));
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) return res.status(500).send(JSON.stringify({ error: 'Server not configured' }));
  const provided = req.get('x-admin-api-key');
  if (!provided || provided !== apiKey)
    return res.status(401).send(JSON.stringify({ error: 'Unauthorized' }));
  const uid = req.query.uid;
  if (!uid) return res.status(400).send(JSON.stringify({ error: 'Missing uid' }));
  try {
    const user = await admin.auth().getUser(uid);
    return res.status(200).send(JSON.stringify({ uid, claims: user.customClaims || {} }));
  } catch (err) {
    console.error(err);
    return res.status(500).send(JSON.stringify({ error: String((err && err.message) || err) }));
  }
});

// Get invitation token details (for patient signup with temporary password)
// Allow unauthenticated calls since user hasn't signed in yet
exports.getInvitationToken = onCall({ cors: true }, async (request) => {
  const { data } = request;
  const { token } = data || {};

  if (!token) {
    return { valid: false, error: 'Token manquant' };
  }

  try {
    const tokenDoc = await admin.firestore().collection('invitationTokens').doc(token).get();

    if (!tokenDoc.exists) {
      return { valid: false, error: "Lien d'invitation invalide" };
    }

    const tokenData = tokenDoc.data();
    const now = admin.firestore.Timestamp.now();

    // Check if token is expired
    if (tokenData.expiresAt && tokenData.expiresAt.toMillis() < now.toMillis()) {
      return { valid: false, error: "Ce lien d'invitation a expiré (valable 24 heures)" };
    }

    // Check if token was already used
    if (tokenData.used) {
      return { valid: false, error: "Ce lien d'invitation a déjà été utilisé" };
    }

    // Return email and temporary password (without marking as used yet)
    return {
      valid: true,
      email: tokenData.email,
      tempPassword: tokenData.tempPassword,
    };
  } catch (error) {
    console.error('getInvitationToken error', error);
    return { valid: false, error: 'Erreur lors de la vérification du lien' };
  }
});

// Mark invitation token as used after successful account creation
exports.markInvitationTokenUsed = onCall(async (request) => {
  const { data, auth } = request;
  const { token } = data || {};

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!token) {
    throw new HttpsError('invalid-argument', 'Token is required');
  }

  try {
    await admin.firestore().collection('invitationTokens').doc(token).update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
      usedBy: auth.uid,
    });

    return { ok: true };
  } catch (error) {
    console.error('markInvitationTokenUsed error', error);
    throw new HttpsError('internal', 'Failed to mark token as used');
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
    await admin.firestore().collection('patients').doc(uid).set(
      {
        status: 'approved',
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Optionally ensure role=patient remains
    try {
      const user = await admin.auth().getUser(uid);
      const claims = user.customClaims || {};
      if (claims.role !== 'patient') {
        await admin.auth().setCustomUserClaims(uid, { ...claims, role: 'patient' });
      }
    } catch (_) {
      /* ignore */
    }

    return { ok: true };
  } catch (error) {
    console.error('activatePatient error', error);
    throw new HttpsError('internal', 'Activation failed');
  }
});

/**
 * Assign default questionnaires to a patient
 */
const DEFAULT_QUESTIONNAIRES = [
  {
    id: 'plaintes-et-douleurs',
    title: 'Mes plaintes actuelles et troubles ressentis',
    category: 'Mode de vie',
    description: "Évaluez l'intensité de vos troubles actuels (fatigue, douleurs, digestion, etc.)",
  },
  {
    id: 'mode-de-vie',
    title: 'Questionnaire contextuel mode de vie',
    category: 'Mode de vie',
    description: 'Renseignez vos habitudes quotidiennes et votre mode de vie',
  },
  {
    id: 'nutri-assessment',
    title: 'Bilan nutrition PNNS5 × SIIN',
    category: 'Nutrition',
    description:
      'Questionnaire PNNS5 × SIIN avec radar nutritionnel et recommandations personnalisées',
  },
  {
    id: 'dnsm',
    title: 'Questionnaire Dopamine-Noradrénaline-Sérotonine-Mélatonine',
    category: 'Neuro-psychologie',
    description: 'Évaluez vos neurotransmetteurs et votre équilibre hormonal (7 questions)',
  },
];

exports.assignQuestionnaires = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const patientUid = auth.uid;
  const { practitionerId } = data || {};

  try {
    console.log(`🔵 START: Assigning questionnaires to patient ${patientUid}`);

    // Check if questionnaires already assigned
    const firstQuestionnaireRef = admin
      .firestore()
      .collection('patients')
      .doc(patientUid)
      .collection('questionnaires')
      .doc(DEFAULT_QUESTIONNAIRES[0].id);
    const firstQuestionnaireSnap = await firstQuestionnaireRef.get();

    if (firstQuestionnaireSnap.exists) {
      console.log(`✅ Questionnaires already assigned to patient ${patientUid}`);
      return {
        success: true,
        alreadyAssigned: true,
        message: 'Les questionnaires ont déjà été assignés',
      };
    }

    console.log(`📝 Creating ${DEFAULT_QUESTIONNAIRES.length} questionnaires...`);

    // Create questionnaires in Firestore
    const batch = admin.firestore().batch();
    const now = admin.firestore.FieldValue.serverTimestamp();

    DEFAULT_QUESTIONNAIRES.forEach((template) => {
      const questionnaireRef = admin
        .firestore()
        .collection('patients')
        .doc(patientUid)
        .collection('questionnaires')
        .doc(template.id);

      batch.set(questionnaireRef, {
        ...template,
        patientUid,
        practitionerId: practitionerId || null,
        status: 'pending',
        assignedAt: now,
        completedAt: null,
        responses: {},
      });
    });

    await batch.commit();
    console.log(`✅ Batch committed: ${DEFAULT_QUESTIONNAIRES.length} questionnaires created`);

    // Update patient document
    console.log(`📄 Updating patient document...`);
    await admin.firestore().collection('patients').doc(patientUid).set(
      {
        hasQuestionnairesAssigned: true,
        questionnairesAssignedAt: now,
        pendingQuestionnairesCount: DEFAULT_QUESTIONNAIRES.length,
      },
      { merge: true }
    );

    // Create ONE notification PER questionnaire (not one global notification)
    console.log(`🔔 Creating ${DEFAULT_QUESTIONNAIRES.length} notifications...`);
    const notificationPromises = DEFAULT_QUESTIONNAIRES.map((template) =>
      admin
        .firestore()
        .collection('patients')
        .doc(patientUid)
        .collection('notifications')
        .add({
          type: 'questionnaire_assigned',
          questionnaireId: template.id,
          title: `Nouveau questionnaire : ${template.title}`,
          message: `Veuillez compléter le questionnaire "${template.title}".`,
          read: false,
          createdAt: now,
          link: `/dashboard/questionnaires/${template.id}`,
        })
    );
    await Promise.all(notificationPromises);

    console.log(
      `🎉 SUCCESS: Assigned ${DEFAULT_QUESTIONNAIRES.length} questionnaires to patient ${patientUid}`
    );

    // Send email notification
    try {
      const patientDoc = await admin.firestore().collection('patients').doc(patientUid).get();
      const patientData = patientDoc.data();
      const patientEmail = patientData?.email || auth.token.email;

      if (patientEmail) {
        await admin
          .firestore()
          .collection('mail')
          .add({
            to: patientEmail,
            message: {
              subject: '📋 Nouveaux questionnaires à remplir - NeuroNutrition',
              html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Nouveaux questionnaires disponibles</h2>
                <p>Bonjour,</p>
                <p>Votre praticien vous a assigné <strong>${DEFAULT_QUESTIONNAIRES.length} questionnaires</strong> à compléter :</p>
                <ul>
                  ${DEFAULT_QUESTIONNAIRES.map((q) => `<li><strong>${q.title}</strong> - ${q.description}</li>`).join('\n')}
                </ul>
                <p>Ces questionnaires nous aideront à mieux comprendre votre situation et à personnaliser votre suivi.</p>
                <p style="margin: 30px 0;">
                  <a href="${process.env.PATIENT_APP_URL || 'https://neuronutrition-app.web.app'}/dashboard/questionnaires" 
                     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Remplir les questionnaires
                  </a>
                </p>
                <p style="color: #666; font-size: 12px;">
                  Si vous n'avez pas demandé ces questionnaires, veuillez contacter votre praticien.
                </p>
              </div>
            `,
            },
          });
        console.log(`📧 Email notification queued for patient ${patientUid}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send email notification:', emailError);
      // Don't block if email fails
    }

    return {
      success: true,
      questionnaires: DEFAULT_QUESTIONNAIRES.map((q) => ({ id: q.id, title: q.title })),
      message: `${DEFAULT_QUESTIONNAIRES.length} questionnaires ont été assignés`,
    };
  } catch (error) {
    console.error('❌ ERROR: Failed to assign questionnaires:', error);
    throw new HttpsError('internal', `Failed to assign questionnaires: ${error.message}`);
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
  // Priority: env var > default production URL
  const baseUrl = (
    process.env.PATIENT_APP_BASE_URL || 'https://neuronutrition-app-patient.web.app'
  ).replace(/\/$/, '');

  console.log('invitePatient - Using baseUrl:', baseUrl, {
    fromEnv: process.env.PATIENT_APP_BASE_URL,
  });

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
  const isPractitionerViaDoc =
    practitionerDoc &&
    practitionerDoc.exists &&
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
      const notFound =
        lookupErr &&
        (lookupErr.code === 'auth/user-not-found' ||
          lookupErr.errorInfo?.code === 'auth/user-not-found');
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
        await admin
          .auth()
          .setCustomUserClaims(userRecord.uid, { ...currentClaims, role: 'patient' });
      }
    } catch (_) {
      // non-fatal
    }

    // Create/merge patient document in Firestore
    await admin
      .firestore()
      .collection('patients')
      .doc(userRecord.uid)
      .set(
        {
          email,
          phone: normalizedPhone || null,
          firstname: normalizedFirstName || null,
          lastname: normalizedLastName || null,
          practitionerId,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    // Prepare links for email content
    let signupLink;
    let resetLink = null;

    if (!isExistingUser && tempPassword) {
      // For new users: store temporary password in Firestore with 24h expiration
      const tokenRef = admin.firestore().collection('invitationTokens').doc();
      const token = tokenRef.id;
      await tokenRef.set({
        email,
        tempPassword,
        practitionerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        used: false,
      });
      signupLink = `${baseUrl}/signup?token=${token}`;
    } else {
      // Fallback for edge cases
      signupLink = `${baseUrl}/signup?email=${encodeURIComponent(email)}`;
    }

    if (isExistingUser) {
      try {
        // For existing users: generate a secure password reset link valid for 24 hours
        // Redirect back to the patient app signup page after reset
        const actionCodeSettings = {
          url: `${baseUrl}/signup`,
          handleCodeInApp: false,
        };
        resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
      } catch (genErr) {
        console.warn('Could not generate password reset link, will fallback to login URL.', genErr);
      }
    }

    const practitionerData =
      practitionerDoc && practitionerDoc.exists ? practitionerDoc.data() : {};
    const practitionerName =
      (practitionerData &&
        (practitionerData.name || practitionerData.fullName || practitionerData.displayName)) ||
      (typeof claims.name === 'string' ? claims.name : '') ||
      practitionerId;

    const firstName = normalizedFirstName || 'Cher patient';
    const lastName = normalizedLastName || '';
    // Use a distinct variable name to avoid shadowing earlier `fullName`
    const displayFullName = `${firstName} ${lastName}`.trim();

    await admin
      .firestore()
      .collection('mail')
      .add({
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

      ${
        !isExistingUser && tempPassword
          ? `
      <div class="credentials" style="background-color:#FEF3C7;border-left:4px solid #F59E0B;padding:15px;margin:20px 0;">
        <h3>🔐 Création de votre compte</h3>
        <p><strong>Email :</strong> ${email}</p>
        <p>Un mot de passe temporaire vous sera fourni après avoir cliqué sur le lien ci-dessous.</p>
        <p><em>⚠️ Ce lien est valable pendant 24 heures. Vous devrez changer le mot de passe lors de votre première connexion.</em></p>
      </div>
      `
          : `
      <div class="credentials" style="background-color:#DBEAFE;border-left:4px solid #3B82F6;padding:15px;margin:20px 0;">
        <h3>🔐 Compte déjà existant</h3>
        <p>Votre email est déjà associé à un compte sur NeuroNutrition.</p>
        <p>${resetLink ? 'Vous pouvez définir un nouveau mot de passe en toute sécurité via le bouton ci‑dessous. Ce lien est valable 24 heures.' : 'Connectez‑vous via le bouton ci‑dessous.'}</p>
      </div>
      `
      }

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

${
  !isExistingUser && tempPassword
    ? `
Vos identifiants temporaires :
- Email : ${email}
- Mot de passe temporaire : ${tempPassword}

Créez votre compte en cliquant sur ce lien :
${signupLink}

⚠️ Vous devrez changer ce mot de passe lors de votre première connexion.
`
    : `
Votre email est déjà associé à un compte sur NeuroNutrition.
${
  resetLink
    ? `
Définissez un nouveau mot de passe via ce lien sécurisé :
${resetLink}
`
    : `
Poursuivez via ce lien :
${baseUrl}/signup?email=${email}
`
}
`
}

---
Cet email a été envoyé par ${practitionerName} via NeuroNutrition.
Si vous n'êtes pas concerné(e) par cette invitation, veuillez ignorer cet email.
        `,
        },
      });

    // Queue SMS notification
    if (normalizedPhone) {
      const greetingName = normalizedFirstName || 'votre';
      await admin
        .firestore()
        .collection('sms')
        .add({
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

/**
 * Firestore Trigger: Automatically notifies practitioner when a questionnaire is completed
 * Trigger path: patients/{patientUid}/questionnaires/{questionnaireId}
 */
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');

exports.onQuestionnaireCompleted = onDocumentUpdated(
  {
    document: 'patients/{patientUid}/questionnaires/{questionnaireId}',
    region: 'europe-west1',
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    // Check if status changed to 'completed'
    if (!afterData || afterData.status !== 'completed' || beforeData?.status === 'completed') {
      return null;
    }

    const patientUid = event.params.patientUid;
    const questionnaireId = event.params.questionnaireId;
    const questionnaireTitle = afterData.title || questionnaireId;
    const practitionerId = afterData.practitionerId;

    console.log(`🔵 Questionnaire completed: ${questionnaireTitle} by patient ${patientUid}`);

    try {
      // 1. Get patient information
      const patientRef = admin.firestore().collection('patients').doc(patientUid);
      const patientSnap = await patientRef.get();

      if (!patientSnap.exists) {
        console.warn(`⚠️ Patient document not found: ${patientUid}`);
        return null;
      }

      const patientData = patientSnap.data();
      const patientName =
        patientData.displayName ||
        `${patientData.firstname || ''} ${patientData.lastname || ''}`.trim() ||
        patientData.email?.split('@')[0] ||
        'Patient';
      const patientEmail = patientData.email;

      // 2. Count pending questionnaires
      const questionnairesRef = admin
        .firestore()
        .collection('patients')
        .doc(patientUid)
        .collection('questionnaires');
      const pendingQuery = await questionnairesRef.where('status', '==', 'pending').get();
      const pendingCount = pendingQuery.size;

      // 3. Update patient document with counter
      await patientRef.update({
        pendingQuestionnairesCount: pendingCount,
        lastQuestionnaireCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Updated patient document: ${pendingCount} pending questionnaires remaining`);

      // 4. Record submission in questionnaireSubmissions
      try {
        await admin
          .firestore()
          .collection('questionnaireSubmissions')
          .add({
            patientUid,
            patientName,
            patientEmail,
            practitionerId: practitionerId || patientData.practitionerId,
            questionnaire: questionnaireTitle,
            questionnaireId,
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
            responses: afterData.responses || {},
          });
        console.log(`✅ Questionnaire submission recorded`);
      } catch (submissionError) {
        console.error('❌ Failed to record submission:', submissionError);
      }

      // 5. Notify practitioner if assigned
      const targetPractitionerId = practitionerId || patientData.practitionerId;

      if (!targetPractitionerId) {
        console.warn(`⚠️ No practitioner assigned to patient ${patientUid}`);
        return null;
      }

      console.log(`🔔 Notifying practitioner ${targetPractitionerId}`);

      // 6. Get practitioner information
      const practitionerRef = admin
        .firestore()
        .collection('practitioners')
        .doc(targetPractitionerId);
      const practitionerSnap = await practitionerRef.get();

      if (!practitionerSnap.exists) {
        console.warn(`⚠️ Practitioner not found: ${targetPractitionerId}`);
        return null;
      }

      const practitionerData = practitionerSnap.data();
      const practitionerEmail = practitionerData.email;
      const practitionerName =
        practitionerData.displayName || practitionerData.firstname || 'Praticien';

      // 7. Create in-app notification for practitioner
      await admin
        .firestore()
        .collection('practitioners')
        .doc(targetPractitionerId)
        .collection('notifications')
        .add({
          type: 'questionnaire_completed',
          title: 'Nouveau questionnaire complété',
          message: `${patientName} a complété le questionnaire "${questionnaireTitle}"`,
          patientId: patientUid,
          patientName,
          questionnaireId,
          questionnaireTitle,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          link: `/patients/${patientUid}/questionnaires/${questionnaireId}`,
        });

      console.log(`✅ In-app notification created for practitioner`);

      // 8. Increment unread notifications counter
      try {
        await practitionerRef.update({
          unreadNotificationsCount: admin.firestore.FieldValue.increment(1),
        });
      } catch (counterError) {
        await practitionerRef.set(
          {
            unreadNotificationsCount: 1,
          },
          { merge: true }
        );
      }

      // 9. Send email to practitioner
      if (practitionerEmail) {
        try {
          await admin
            .firestore()
            .collection('mail')
            .add({
              to: practitionerEmail,
              message: {
                subject: `📋 ${patientName} a complété un questionnaire - NeuroNutrition`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #10B981;">Nouveau questionnaire complété</h2>
                  <p>Bonjour ${practitionerName},</p>
                  <p>Votre patient <strong>${patientName}</strong> vient de compléter le questionnaire :</p>
                  <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #4F46E5;">📋 ${questionnaireTitle}</h3>
                    <p style="margin: 0; color: #666;">
                      ${pendingCount === 0 ? '✅ Tous les questionnaires ont été complétés !' : `⏳ ${pendingCount} questionnaire${pendingCount > 1 ? 's' : ''} en attente`}
                    </p>
                  </div>
                  <p>Vous pouvez maintenant consulter les réponses et adapter votre suivi en conséquence.</p>
                  <p style="margin: 30px 0;">
                    <a href="https://neuronutrition-app-practitioner.web.app/patients/${patientUid}/questionnaires/${questionnaireId}" 
                       style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                      Consulter les réponses
                    </a>
                  </p>
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    💡 <strong>Astuce :</strong> Vous pouvez accéder à tous les questionnaires du patient depuis sa fiche.
                  </p>
                  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px;">
                    Cet email a été envoyé automatiquement par NeuroNutrition.<br>
                    Pour modifier vos préférences de notification, rendez-vous dans vos paramètres.
                  </p>
                </div>
              `,
              },
            });
          console.log(`✅ Email notification sent to practitioner ${practitionerEmail}`);
        } catch (emailError) {
          console.error('❌ Failed to send email notification:', emailError);
        }
      }

      // 10. Special notification if all questionnaires completed
      if (pendingCount === 0) {
        console.log(`🎉 All questionnaires completed for patient ${patientUid}`);

        await admin
          .firestore()
          .collection('practitioners')
          .doc(targetPractitionerId)
          .collection('notifications')
          .add({
            type: 'all_questionnaires_completed',
            title: 'Tous les questionnaires complétés',
            message: `${patientName} a terminé tous ses questionnaires`,
            patientId: patientUid,
            patientName,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            link: `/patients/${patientUid}`,
            priority: 'high',
          });

        if (practitionerEmail) {
          await admin
            .firestore()
            .collection('mail')
            .add({
              to: practitionerEmail,
              message: {
                subject: `🎉 ${patientName} a terminé tous ses questionnaires - NeuroNutrition`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #10B981;">✅ Tous les questionnaires complétés !</h2>
                  <p>Bonjour ${practitionerName},</p>
                  <p>Bonne nouvelle ! <strong>${patientName}</strong> a terminé tous les questionnaires qui lui ont été assignés.</p>
                  <p>Vous disposez maintenant de toutes les informations nécessaires pour :</p>
                  <ul>
                    <li>Établir un diagnostic complet</li>
                    <li>Élaborer un plan de traitement personnalisé</li>
                    <li>Planifier les prochaines consultations</li>
                    <li>Suivre l'évolution du patient</li>
                  </ul>
                  <p style="margin: 30px 0;">
                    <a href="https://neuronutrition-app-practitioner.web.app/patients/${patientUid}" 
                       style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                      Voir le dossier complet
                    </a>
                  </p>
                  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px;">
                    NeuroNutrition - Plateforme de suivi patient
                  </p>
                </div>
              `,
              },
            });
        }
      }

      console.log(`🎉 SUCCESS: Notification flow completed for questionnaire ${questionnaireId}`);

      return null;
    } catch (error) {
      console.error('❌ ERROR in onQuestionnaireCompleted:', error);
      return null;
    }
  }
);
