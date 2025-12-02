import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export default function Nav() {
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/students', label: 'Alunos' },
    { path: '/evaluations', label: 'Avaliações' },
    { path: '/classes', label: 'Aulas' },
    { path: '/finance', label: 'Caixa' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx(
                  'px-3 py-4 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

