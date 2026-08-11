import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeView from '@/components/HomeView';
import AboutView from '@/components/AboutView';
import ProjectsView from '@/components/ProjectsView';
import ResearchesView from '@/components/ResearchesView';
import ContactView from '@/components/ContactView';
import AdminView from '@/components/AdminView';
import DesmenView from '@/components/DesmenView';
import type { ViewKey } from '@/data';

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-navy-700 text-white shadow-lg hover:bg-navy-800 hover:scale-110 transition-all flex items-center justify-center animate-fade-in"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}

function App() {
  const [view, setView] = useState<ViewKey>(
    window.location.hash === '#admin' ? 'admin' : 'home'
  );
  const [focusProjectTitle, setFocusProjectTitle] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  const handleNavigate = (v: ViewKey) => {
    if (v !== 'projects') setFocusProjectTitle(null);
    setView(v);
  };

  const handleNavigateToProject = (title: string) => {
    setFocusProjectTitle(title);
    setView('projects');
  };

  if (view === 'admin') {
    return <AdminView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar active={view} onNavigate={handleNavigate} />
      <main key={view} className="flex-1">
        {view === 'home' && (
          <HomeView onNavigate={handleNavigate} onNavigateToProject={handleNavigateToProject} />
        )}
        {view === 'about' && <AboutView />}
        {view === 'projects' && <ProjectsView focusTitle={focusProjectTitle} />}
        {view === 'researches' && <ResearchesView />}
        {view === 'contact' && <ContactView />}
        {view === 'desmen' && <DesmenView onNavigate={handleNavigate} />}
      </main>
      <Footer onNavigate={handleNavigate} />
      <BackToTop />
    </div>
  );
}

export default App;
