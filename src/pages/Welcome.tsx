import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center">Bienvenue sur Neuronutrition</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Espace Praticien</h2>
          <Link to="/register/practitioner" className="w-full mb-2">
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
              Créer un compte
            </button>
          </Link>
          <Link to="/login/practitioner" className="w-full">
            <button className="w-full py-2 px-4 bg-gray-200 text-blue-700 rounded hover:bg-gray-300">
              Se connecter
            </button>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Espace Patient</h2>
          <Link to="/register/patient" className="w-full mb-2">
            <button className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">
              Créer un compte
            </button>
          </Link>
          <Link to="/login/patient" className="w-full">
            <button className="w-full py-2 px-4 bg-gray-200 text-green-700 rounded hover:bg-gray-300">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
