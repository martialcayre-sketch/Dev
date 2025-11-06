import clsx from 'clsx';
import { CalendarCheck, ClipboardList, Compass, FileText, Home, Salad } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: Home },
  { name: 'Espace consultation', href: '/dashboard/consultation', icon: CalendarCheck },
  { name: 'Questionnaires', href: '/dashboard/questionnaires', icon: ClipboardList },
  { name: 'Mode de vie', href: '/dashboard/life-journey', icon: Compass },
  { name: 'Plan nutrition', href: '/dashboard/plan', icon: Salad },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="px-6 py-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-nn-primary-500 to-nn-accent-500 flex items-center justify-center text-white text-lg font-semibold shadow-lg shadow-nn-primary-500/40">
            NN
          </span>
          <div>
            <p className="text-sm tracking-wide text-white/60 uppercase">NeuroNutrition</p>
            <p className="text-lg font-semibold text-white">Espace patient</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-8 scrollbar-thin">
        <p className="px-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          Mon parcours
        </p>
        <ul className="mt-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={clsx(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    active
                      ? 'bg-white/10 text-white shadow-lg shadow-nn-primary-500/20'
                      : 'text-white/65 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 py-6 border-t border-white/5">
        <div className="rounded-xl bg-gradient-to-r from-nn-primary-500/15 via-transparent to-nn-accent-500/15 p-4">
          <p className="text-sm font-semibold text-white">💡 Besoin d'aide ?</p>
          <p className="mt-1 text-xs text-white/60">
            Consultez nos guides ou contactez votre praticien pour toute question.
          </p>
          <button className="mt-3 inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors">
            Voir les guides
          </button>
        </div>
      </div>
    </aside>
  );
}
