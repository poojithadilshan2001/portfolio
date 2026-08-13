import { useEffect, useState } from 'react';
import { ArrowRight, Download, Mail, User, Gamepad2, CheckCircle2 } from 'lucide-react';
import { highlightCards, skillGroups, type ViewKey } from '@/data';
import { supabase } from '@/lib/supabase';
import CarGame from '@/components/CarGame';

interface HomeViewProps {
  onNavigate: (view: ViewKey) => void;
  onNavigateToProject: (title: string) => void;
}

export default function HomeView({ onNavigate, onNavigateToProject }: HomeViewProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoMediaType, setPhotoMediaType] = useState<string>('image');
  const [photoFailed, setPhotoFailed] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cardImages, setCardImages] = useState<Record<string, { url: string; type: string }>>({});
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['profile_photo_url', 'profile_media_type', 'cv_url']);
      for (const row of data || []) {
        if (row.key === 'profile_photo_url' && row.value) setPhotoUrl(row.value);
        if (row.key === 'profile_media_type' && row.value) setPhotoMediaType(row.value);
        if (row.key === 'cv_url' && row.value) setCvUrl(row.value);
      }
    })();

    (async () => {
      const { data: projData } = await supabase.from('projects').select('id, title');
      const { data: mediaData } = await supabase
        .from('entity_media')
        .select('entity_id, media_url, is_cover, sort_order')
        .eq('entity_type', 'project')
        .order('sort_order', { ascending: true });

      const map: Record<string, { url: string; type: string }> = {};
      for (const p of projData || []) {
        const items = (mediaData || []).filter((m: { entity_id: string; media_url: string; media_type?: string; is_cover: boolean }) => m.entity_id === p.id);
        const cover = items.find((m: { is_cover: boolean }) => m.is_cover) || items[0];
        if (cover) map[p.title] = { url: cover.media_url, type: (cover as { media_type?: string }).media_type || 'image' };
      }
      setCardImages(map);
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-400 rounded-full blur-3xl" />
        </div>
        {/* Subtle game button — tucked in corner */}
        <button
          onClick={() => setShowGame(true)}
          title="Play a quick game I built"
          className="absolute bottom-4 right-4 z-10 p-2 rounded-lg text-white/20 hover:text-white/50 transition-colors"
          aria-label="Play a game"
        >
          <Gamepad2 size={16} />
        </button>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
            <div className="max-w-2xl w-full">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-700/60 border border-navy-600/50 text-blue-200 text-xs font-medium">
                  <CheckCircle2 size={12} className="text-green-400" />
                  Open to Opportunities
                </span>
                <span className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-200/70 text-xs font-medium">
                  Uva Wellassa University · Sri Lanka
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                Poojitha Dilshan<br />
                <span className="text-blue-300">Jayathilaka</span>
              </h1>

              <p className="mt-4 text-lg sm:text-xl text-slate-300 font-medium">
                Mechatronics Engineering Graduate
              </p>

              <p className="mt-5 text-base text-slate-400 leading-relaxed max-w-xl">
                I work across mechanical design, electronics, and software — building things
                that actually function in the real world. My strongest area is CAD and mechanical
                design (SolidWorks), and I also have hands-on experience with PCB design,
                FEA simulation, and building software applications.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('projects')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-navy-900 font-semibold text-sm hover:bg-blue-50 transition-all hover:shadow-lg hover:shadow-white/10"
                >
                  View My Projects
                  <ArrowRight size={16} />
                </button>
                {cvUrl && (
                  <a
                    href={cvUrl}
                    download="Poojitha_Dilshan_CV.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-navy-700 border border-navy-600 text-white font-semibold text-sm hover:bg-navy-600 transition-all"
                  >
                    <Download size={16} />
                    Download CV
                  </a>
                )}
                <button
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-all"
                >
                  <Mail size={16} />
                  Contact
                </button>
              </div>

              {/* Key skills quick-view */}
              <div className="mt-10 flex flex-wrap gap-2">
                {['SolidWorks', 'Mechanical Design', 'FEA / Simulation', 'PCB Design', 'SolidCAM — Basic', 'Python', 'Flutter'].map((s) => (
                  <span key={s} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate('about')}
              className="shrink-0 group"
              aria-label="Go to About Me"
            >
              <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-2xl overflow-hidden bg-navy-800 border border-navy-700 shadow-2xl group-hover:border-navy-500 transition-all duration-300 group-hover:scale-[1.03]">
                {!photoUrl || photoFailed ? (
                  <div className="w-full h-full flex items-center justify-center text-navy-600">
                    <User size={64} strokeWidth={1.5} />
                  </div>
                ) : photoMediaType === 'video' ? (
                  <video src={photoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" onError={() => setPhotoFailed(true)} />
                ) : (
                  <img src={photoUrl} alt="Poojitha Dilshan Jayathilaka" onError={() => setPhotoFailed(true)} className="w-full h-full object-cover" />
                )}
              </div>
              <p className="mt-2 text-center text-xs text-slate-500 group-hover:text-slate-400 transition-colors">About Me →</p>
            </button>
          </div>
        </div>
      </section>

      {/* Skills — primary hierarchy */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Skills &amp; Technical Capabilities</h2>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Built through university coursework, personal projects, and hands-on team engineering work.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {skillGroups.map((group) => (
              <div
                key={group.label}
                className={`rounded-xl border p-5 ${
                  group.tier === 'primary'
                    ? 'border-navy-300 bg-navy-50 col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-1'
                    : group.tier === 'secondary'
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded ${
                    group.tier === 'primary' ? 'bg-navy-700 text-white' :
                    group.tier === 'secondary' ? 'bg-slate-200 text-slate-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {group.tier === 'primary' ? 'Primary' : group.tier === 'secondary' ? 'Secondary' : 'Supporting'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">{group.label}</h3>
                <ul className="space-y-1.5">
                  {group.skills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        group.tier === 'primary' ? 'bg-navy-600' :
                        group.tier === 'secondary' ? 'bg-slate-400' : 'bg-slate-300'
                      }`} />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Areas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Project Areas</h2>
          <p className="mt-2 text-slate-500">
            Explore my work across engineering disciplines.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlightCards.map((card, i) => {
            const Icon = card.icon;
            const image = cardImages[card.title];
            return (
              <button
                key={card.title}
                onClick={() => onNavigateToProject(card.title)}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-navy-200 transition-all duration-300 animate-fade-up text-left"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                  {image ? (
                    <>
                      {image.type === 'video' ? (
                        <video src={image.url} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <img src={image.url} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Icon size={36} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center mb-3 group-hover:bg-navy-600 transition-colors">
                    <Icon className="text-white" size={18} />
                  </div>
                  <h3 className="font-semibold text-slate-800">{card.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">{card.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-navy-600">
                    View projects <ArrowRight size={12} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {showGame && <CarGame onClose={() => setShowGame(false)} />}
    </div>
  );
}
