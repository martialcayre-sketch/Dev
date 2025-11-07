import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Service account key not found.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function sendQuestionnaireNotification() {
  const email = 'plexmartial@gmail.com';
  const patientId = '37a87xmECVhDkxEmN0qFrr4IsfF2';

  try {
    console.log("📧 Envoi de l'email de notification des questionnaires...\n");

    // Get patient info
    const patientDoc = await db.collection('patients').doc(patientId).get();
    if (!patientDoc.exists) {
      console.error('❌ Patient not found');
      process.exit(1);
    }

    const patientData = patientDoc.data();
    const patientName = patientData.firstname || patientData.displayName || 'Patient';

    // Get practitioner info
    const practitionerId = patientData.practitionerId;
    let practitionerName = 'Votre praticien';

    if (practitionerId) {
      const practitionerDoc = await db.collection('practitioners').doc(practitionerId).get();
      if (practitionerDoc.exists) {
        const practitionerData = practitionerDoc.data();
        practitionerName =
          practitionerData.displayName || practitionerData.email || 'Votre praticien';
      }
    }

    // Get pending questionnaires
    const questionnairesSnap = await db
      .collection('questionnaires')
      .where('patientUid', '==', patientId)
      .where('status', '==', 'pending')
      .get();

    const pendingCount = questionnairesSnap.size;

    if (pendingCount === 0) {
      console.log('⚠️  No pending questionnaires found');
      process.exit(0);
    }

    console.log(`📋 Found ${pendingCount} pending questionnaires\n`);

    // Build questionnaires list for email
    const questionnairesList = questionnairesSnap.docs
      .map((doc) => {
        const data = doc.data();
        return `<li style="margin: 8px 0;">${data.title || 'Questionnaire'}</li>`;
      })
      .join('');

    // Patient app URL + cache-busting param (avoid stale client state after email click)
    const patientAppUrl = 'https://neuronutrition-app-patient.web.app';
    const refreshParam = `refresh=${Date.now()}`;
    const questionnairesUrl = `${patientAppUrl}/dashboard/questionnaires?${refreshParam}`;

    // Create email document
    const emailDoc = {
      to: email,
      message: {
        subject: `📋 ${pendingCount} questionnaire${pendingCount > 1 ? 's' : ''} à remplir - NeuroNutrition`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🧠 NeuroNutrition</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #4F46E5; margin-top: 0;">Bonjour ${patientName},</h2>
              
              <p style="color: #374151; line-height: 1.6;">
                ${practitionerName} vous a assigné <strong>${pendingCount} questionnaire${pendingCount > 1 ? 's' : ''}</strong> à remplir.
              </p>

              <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #1F2937; margin-top: 0; font-size: 16px;">📋 Questionnaires à compléter :</h3>
                <ul style="color: #4B5563; line-height: 1.8; margin: 10px 0;">
                  ${questionnairesList}
                </ul>
              </div>

              <p style="color: #374151; line-height: 1.6;">
                Ces questionnaires permettront à votre praticien de mieux comprendre votre situation et de vous proposer un accompagnement personnalisé.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${questionnairesUrl}" 
                   style="display: inline-block; background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Remplir mes questionnaires
                </a>
              </div>

              <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6B7280; font-size: 14px; margin: 5px 0;">
                  💡 <strong>Astuce :</strong> Vos réponses sont sauvegardées automatiquement, vous pouvez compléter les questionnaires en plusieurs fois.
                </p>
                <p style="color: #6B7280; font-size: 14px; margin: 5px 0;">
                  🔗 <strong>Lien direct :</strong> <a href="${questionnairesUrl}" style="color: #4F46E5;">${questionnairesUrl}</a><br/>
                  (Si la page ne montre aucun questionnaire immédiatement, appuyez sur Ctrl+Shift+R pour un rafraîchissement complet)
                </p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                  Vous recevez cet email car ${practitionerName} vous a assigné des questionnaires.<br>
                  Si vous avez des questions, contactez directement votre praticien.
                </p>
              </div>
            </div>
          </div>
        `,
      },
    };

    // Add to mail collection
    const mailRef = await db.collection('mail').add(emailDoc);
    console.log("✅ Email ajouté à la queue d'envoi");
    console.log(`📬 ID: ${mailRef.id}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL DE NOTIFICATION CRÉÉ\n');
    console.log(`📨 Destinataire: ${email}`);
    console.log(`📋 Questionnaires: ${pendingCount}`);
    console.log(`🔗 Lien: ${questionnairesUrl}\n`);
    console.log("💡 L'email sera envoyé dans quelques secondes par l'extension Firebase.");
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendQuestionnaireNotification();
