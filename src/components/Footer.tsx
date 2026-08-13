import { navItems, type ViewKey } from '@/data';

interface FooterProps {
  onNavigate: (view: ViewKey) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-navy-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">PD</span>
              </div>
              <div>
                <p className="text-white font-semibold">Poojitha Dilshan Jayathilaka</p>
                <p className="text-sm text-slate-500">Mechanical Design &amp; CAD · Engineering Graduate</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 max-w-xs mt-2">
              Looking for an opportunity to begin my engineering career and contribute to a professional team.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a href="https://www.linkedin.com/in/poojithadilshan2001" target="_blank" rel="noopener noreferrer" className="text-xs hover:text-white transition-colors">LinkedIn</a>
              <a href="https://github.com/poojithadilshan2001" target="_blank" rel="noopener noreferrer" className="text-xs hover:text-white transition-colors">GitHub</a>
              <a href="mailto:pujithajayathilaka2001@gmail.com" className="text-xs hover:text-white transition-colors">Email</a>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
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
        <div className="mt-8 pt-6 border-t border-navy-800/60 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Poojitha Dilshan Jayathilaka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
