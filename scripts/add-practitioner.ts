// Script d'initialisation pour ajouter le praticien Martial CAYRE
// À exécuter une seule fois dans l'émulateur ou en production

import { createPractitionerProfile } from '../src/services/userService';

async function main() {
  try {
    const user = await createPractitionerProfile({
      email: 'martialcayre@gmail.com',
      password: 'Plexmartial1902',
      displayName: 'Martial CAYRE',
    });
    console.log('Praticien ajouté:', user);
  } catch (e) {
    console.error('Erreur lors de la création du praticien:', e);
  }
}

main();
