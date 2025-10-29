export default function PatientPendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white rounded shadow p-6 space-y-4">
  <h1 className="text-2xl font-semibold">En attente d&apos;approbation</h1>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>Vérifiez votre adresse e-mail via le lien reçu.</li>
          <li>Après vérification, votre praticien doit approuver votre demande.</li>
        </ol>
      </div>
    </div>
  );
}
