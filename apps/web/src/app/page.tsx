export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Neuronutrition App</h1>
      <p>Bienvenue. Connectez-vous pour accéder au tableau de bord.</p>
      <div className="flex gap-3">
        <a href="/signin" className="px-3 py-2 bg-black text-white rounded">Se connecter</a>
        <a href="/signup" className="px-3 py-2 border rounded">Créer un compte</a>
      </div>
    </section>
  )
}

