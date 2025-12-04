import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">
              Academia Digital
            </h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <span className="hidden sm:inline">Sair</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

