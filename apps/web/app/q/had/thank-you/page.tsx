import { Button } from '@/components/ui/button';

export default function ThankYouPage({ searchParams }: { searchParams: { sessionId: string } }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-card rounded-lg p-6 shadow-sm text-center">
        <h1 className="text-2xl font-semibold mb-4">Merci pour vos réponses</h1>

        <p className="text-muted-foreground mb-6">
          Vos réponses ont bien été enregistrées. Votre praticien pourra les analyser lors de votre
          prochaine consultation.
        </p>

        <div className="space-y-2">
          <Button className="w-full" onClick={() => (window.location.href = '/q')}>
            Retour aux questionnaires
          </Button>
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = '/')}>\
            Retour à l&apos;accueil
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          ID de session: {searchParams.sessionId}
        </p>
      </div>
    </div>
  );
}
