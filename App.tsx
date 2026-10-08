import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
const HomeView = lazy(() => import('@/components/HomeView'));
const AboutView = lazy(() => import('@/components/AboutView'));
const ProjectsView = lazy(() => import('@/components/ProjectsView'));
const ResearchesView = lazy(() => import('@/components/ResearchesView'));
const ContactView = lazy(() => import('@/components/ContactView'));
const AdminView = lazy(() => import('@/components/AdminView'));
const DesmenView = lazy(() => import('@/components/DesmenView'));
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
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-navy-700 animate-spin" />
          </div>
        }
      >
        <AdminView />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar active={view} onNavigate={handleNavigate} />
      <main key={view} className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center" aria-label="Loading">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-navy-700 animate-spin" />
            </div>
          }
        >
          {view === 'home' && (
            <HomeView onNavigate={handleNavigate} onNavigateToProject={handleNavigateToProject} />
          )}
          {view === 'about' && <AboutView onNavigate={handleNavigate} />}
          {view === 'projects' && <ProjectsView focusTitle={focusProjectTitle} />}
          {view === 'researches' && <ResearchesView />}
          {view === 'contact' && <ContactView />}
          {view === 'desmen' && <DesmenView onNavigate={handleNavigate} />}
        </Suspense>
      </main>
      <Footer onNavigate={handleNavigate} />
      <BackToTop />
    </div>
  );
}

export default App;
