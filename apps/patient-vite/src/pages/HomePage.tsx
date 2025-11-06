import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">🧠 NeuroNutrition</h1>
        <p className="text-2xl text-gray-700 mb-8">Plateforme de consultation nutritionnelle</p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
          >
            Connexion Patient
          </Link>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-lg"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
