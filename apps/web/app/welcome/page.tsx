import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Je suis praticien</CardTitle>
            <CardDescription>Accédez à votre espace et gérez les approbations.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-x-2">
            <Link
              href="/praticien/login"
              className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Se connecter
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Je suis patient</CardTitle>
            <CardDescription>Créez un compte ou connectez-vous à votre espace.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-3">
              <Link href="/patient/signup" className="px-4 py-2 bg-green-600 text-white rounded">
                Créer un compte
              </Link>
              <Link href="/patient/login" className="px-4 py-2 bg-blue-600 text-white rounded">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
