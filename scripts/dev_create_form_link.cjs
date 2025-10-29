#!/usr/bin/env node
// Create a formLinks/{token} doc for local emulator testing
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

const token = process.argv[2] || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
const questionnaireId = process.argv[3] || 'mes-plaintes-actuelles-et-troubles-ressentis'
const projectId = process.env.FIREBASE_PROJECT_ID || 'neuronutrition-app'

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:5003'

try { initializeApp({ projectId }) } catch {}
const db = getFirestore()

async function main() {
  const ref = db.collection('formLinks').doc(token)
  const payload = {
    questionnaireId,
    createdAt: new Date().toISOString(),
    // expiresAt: add later if needed
  }
  await ref.set(payload)
  console.log('Created formLinks token:', token)
  console.log('Questionnaire:', questionnaireId)
  console.log('Open (public): /forms/' + token)
}

main().catch(err => { console.error(err); process.exit(1) })

