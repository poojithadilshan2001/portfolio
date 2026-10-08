import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navItems, type ViewKey } from '@/data';

interface NavbarProps {
  active: ViewKey;
  onNavigate: (view: ViewKey) => void;
}

export default function Navbar({ active, onNavigate }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const handleNav = (key: ViewKey) => {
    onNavigate(key);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-sm">PD</span>
            </div>
            <span className="font-semibold text-slate-800 hidden sm:block">
              Poojitha Dilshan
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active === item.key
                    ? 'bg-navy-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-navy-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1 animate-slide-down">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active === item.key
                    ? 'bg-navy-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
