import { navItems, type ViewKey } from '@/data';

interface FooterProps {
  onNavigate: (view: ViewKey) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-navy-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PD</span>
            </div>
            <div>
              <p className="text-white font-semibold">Poojitha Dilshan Jayathilaka</p>
              <p className="text-sm">Mechatronics Engineer</p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className="text-sm hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-navy-800 text-center text-sm">
          <p>© {new Date().getFullYear()} Poojitha Dilshan Jayathilaka. All rights reserved.</p>
          <button
            onClick={() => onNavigate('desmen')}
            className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Also building DESMEN →
          </button>
        </div>
      </div>
    </footer>
  );
}
