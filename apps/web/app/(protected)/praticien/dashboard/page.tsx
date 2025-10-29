import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { currentUserServer, getUserDoc } from '@/lib/auth-server';

export default async function PractitionerDashboardPage() {
  const user = await currentUserServer();
  const userDoc = user ? await getUserDoc(user.uid) : null;
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tableau de bord Praticien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600">Bonjour {userDoc?.username ?? 'praticien'}.</p>
            <div className="flex gap-3">
              <Link
                href="/praticien/approbations"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Approbations
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
