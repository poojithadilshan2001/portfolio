import { useState, useEffect } from 'react';
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

function App() {
  const [view, setView] = useState<ViewKey>(
    window.location.hash === '#admin' ? 'admin' : 'home'
  );
  const [focusProjectTitle, setFocusProjectTitle] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <main className="flex-1">
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
    </div>
  );
}

export default App;
