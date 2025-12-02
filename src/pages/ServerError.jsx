import { Link } from 'react-router-dom';

export default function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">500</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Erro no servidor</h2>
        <p className="text-gray-600 mb-8">
          Ocorreu um erro inesperado no servidor. Por favor, tente novamente mais tarde.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Tentar novamente
          </button>
          <Link to="/" className="btn-outline">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

