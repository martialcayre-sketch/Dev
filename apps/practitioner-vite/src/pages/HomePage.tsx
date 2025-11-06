import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4">Espace Praticien</h1>
        <p className="text-lg text-slate-700 mb-8">Gérez vos patients et vos questionnaires</p>
        <Link
          to="/login"
          className="inline-block px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
