import { useEffect, useState } from 'react';
import { ArrowRight, Mail, User, Gamepad2 } from 'lucide-react';
import { highlightCards, type ViewKey } from '@/data';
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
  const [cardImages, setCardImages] = useState<Record<string, { url: string; type: string }>>({});
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['profile_photo_url', 'profile_media_type']);
      for (const row of data || []) {
        if (row.key === 'profile_photo_url' && row.value) setPhotoUrl(row.value);
        if (row.key === 'profile_media_type' && row.value) setPhotoMediaType(row.value);
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
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
        </div>
        {/* Eye-catching game button top-right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <button
            onClick={() => setShowGame(true)}
            className="group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-yellow-400/20 backdrop-blur-sm border-2 border-yellow-400/60 text-yellow-300 font-bold text-sm hover:bg-yellow-400/30 hover:border-yellow-300 transition-all hover:scale-110 shadow-lg shadow-yellow-400/10"
          >
            <span className="animate-bounce inline-block">
              <Gamepad2 size={18} />
            </span>
            <span>Play a Game!</span>
            <span className="absolute -top-2 -right-2 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400 items-center justify-center">
                <span className="text-[8px] text-navy-900 font-black">★</span>
              </span>
            </span>
          </button>
          <p className="mt-1 text-[10px] text-yellow-200/60 text-center">I built this for you!</p>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 text-sm font-medium mb-6">
                Mechatronics Engineer
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
                Poojitha Dilshan Jayathilaka
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-blue-100 font-medium">
                Multidisciplinary Mechatronics Engineer
              </p>
              <p className="mt-6 text-base sm:text-lg text-blue-200/80 leading-relaxed max-w-2xl">
                Welcome to my portfolio. I am a Mechatronics Engineer specializing in bridging the gap
                between mechanical design, physical fabrication, embedded IoT systems, and industrial
                production management. Explore my site to see my academic research, professional
                consulting work, and physical engineering builds.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('projects')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-navy-800 font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
                >
                  View My Projects
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all hover:scale-105"
                >
                  <Mail size={18} />
                  Contact Me
                </button>
              </div>
            </div>

            <button
              onClick={() => onNavigate('about')}
              className="shrink-0 group"
              aria-label="Go to About Me"
            >
              <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border-4 border-white/20 shadow-2xl group-hover:border-white/40 transition-all group-hover:scale-105">
                {!photoUrl || photoFailed ? (
                  <div className="w-full h-full flex items-center justify-center text-blue-200/50">
                    <User size={72} strokeWidth={1.5} />
                  </div>
                ) : photoMediaType === 'video' ? (
                  <video
                    src={photoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onError={() => setPhotoFailed(true)}
                  />
                ) : (
                  <img
                    src={photoUrl}
                    alt="Poojitha Dilshan Jayathilaka"
                    onError={() => setPhotoFailed(true)}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Highlight Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Areas of Expertise
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            A multidisciplinary skill set spanning mechanical design, manufacturing, embedded
            electronics, and software.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlightCards.map((card, i) => {
            const Icon = card.icon;
            const image = cardImages[card.title];
            return (
              <button
                key={card.title}
                onClick={() => onNavigateToProject(card.title)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-navy-300 transition-all duration-300 animate-fade-up text-left"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                  {image ? (
                    <>
                      {image.type === 'video' ? (
                        <video
                          src={image.url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <img
                          src={image.url}
                          alt={card.title}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Icon size={40} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-navy-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="text-white" size={22} />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{card.description}</p>
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
