export default function PatientPendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">En attente d&apos;approbation</h1>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>
            Vérifiez votre adresse e-mail: cliquez sur le lien de vérification reçu. Tant que votre
            e-mail n&apos;est pas vérifié, vous ne pouvez pas accéder à votre espace.
          </li>
          <li>
            Après vérification, votre praticien doit approuver votre demande. Vous serez notifié et
            pourrez accéder à votre espace une fois approuvé.
          </li>
        </ol>
      </div>
    </div>
  );
}
