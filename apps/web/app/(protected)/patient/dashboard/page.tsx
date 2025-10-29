import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function PatientDashboard() {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tableau de bord Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Bienvenue ! Vous avez accès aux fonctionnalités patient.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
