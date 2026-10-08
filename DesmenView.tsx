import { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Loader2, Rocket,
  Wrench, Zap, Code2, Cpu, Package, Microscope,
  GraduationCap, Users as UsersIcon, CheckCircle2, Coins,
  ChevronRight, Mail, ImageIcon, Video,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getImageSrcSet, getOptimizedImageUrl } from '@/lib/media';
import type { ViewKey } from '@/data';
import MediaLightbox, { type LightboxItem } from '@/components/MediaLightbox';

interface DesmenViewProps {
  onNavigate: (view: ViewKey) => void;
}

interface DesmenProject {
  id: string;
  title: string;
  description: string | null;
  our_role: string | null;
  technologies: string | null;
  project_type: string | null;
  sort_order: number;
  cover: { url: string; type: string } | null;
}

interface DesmenMedia {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  is_cover: boolean;
}

// ── Static content ──────────────────────────────────────────

const ACRONYM = [
  { letter: 'D', word: 'Designs' },
  { letter: 'E', word: 'Electrical, Electronics & Embedded' },
  { letter: 'S', word: 'Software & Smart Systems' },
  { letter: 'M', word: 'Mechanical Engineering' },
  { letter: 'E', word: 'Engineering Solutions' },
  { letter: 'N', word: 'New Solutions' },
];

const CAPABILITIES = [
  {
    icon: Wrench,
    title: 'Mechanical Design',
    desc: '3D modelling, CAD design, product development, mechanical systems and prototyping.',
  },
  {
    icon: Zap,
    title: 'Electrical & Electronics',
    desc: 'Circuit design, electrical systems, sensors, controllers and electronic prototypes.',
  },
  {
    icon: Code2,
    title: 'Software & Embedded Systems',
    desc: 'Embedded programming, automation, applications, control systems and software solutions.',
  },
  {
    icon: Cpu,
    title: 'Automation & Smart Systems',
    desc: 'IoT, automation, monitoring systems, intelligent control and smart engineering solutions.',
  },
  {
    icon: Package,
    title: 'Prototyping & Development',
    desc: 'Turning concepts and designs into physical working prototypes.',
  },
  {
    icon: Microscope,
    title: 'Engineering Projects',
    desc: 'Research, development and customized engineering solutions based on client requirements.',
  },
];

const JOURNEY = [
  {
    year: '2023',
    title: 'The Start',
    desc: 'Two university friends started working on engineering ideas together — turning academic knowledge into something practical.',
  },
  {
    year: '2024',
    title: 'Building a Team',
    desc: 'We brought together friends with different technical backgrounds — mechanical, electrical, and software — and started operating as a small multidisciplinary team.',
  },
  {
    year: '2024',
    title: 'First Real Projects',
    desc: 'We took on real project work while studying, learning what it means to deliver engineering solutions against actual requirements — not just assignments.',
  },
  {
    year: '2025',
    title: 'Gaining Experience',
    desc: 'Multiple projects across mechanical design, electronics, and software gave us practical experience in coordination, problem-solving, and engineering delivery.',
  },
  {
    year: '2026',
    title: 'Continuing to Learn',
    desc: 'We continue to work on engineering projects, apply what we have learned, and develop our skills in a team environment.',
  },
];

const TEAM = [
  { role: 'Founder / Engineering', name: 'Poojitha Dilshan', initials: 'PD', highlight: true },
  { role: 'Mechanical & Design', name: 'Sakuna Tishan', initials: 'ST' },
  { role: 'Electrical & Electronics', name: 'Sashan Rumesh', initials: 'SR' },
];

const WHY_US = [
  {
    icon: GraduationCap,
    title: 'Student Mindset + Engineering Skills',
    desc: 'We approach every project with curiosity and a willingness to learn.',
  },
  {
    icon: CheckCircle2,
    title: 'Practical Solutions',
    desc: 'We focus on solutions that can actually be built, tested and used.',
  },
  {
    icon: UsersIcon,
    title: 'Multi-disciplinary Team',
    desc: 'Mechanical, electrical, electronics and software skills come together in one project.',
  },
  {
    icon: Wrench,
    title: 'Flexible & Custom',
    desc: "We develop solutions based on the client's actual requirement instead of forcing a fixed product.",
  },
  {
    icon: Coins,
    title: 'Cost-Conscious Development',
    desc: 'As a young engineering team, we look for practical and efficient ways to develop solutions.',
  },
];

const PROCESS = [
  { step: '01', title: 'Understand', desc: "We first understand the client's problem and requirements." },
  { step: '02', title: 'Plan', desc: 'We discuss possible solutions, technologies, cost and development approach.' },
  { step: '03', title: 'Design', desc: 'We create the necessary mechanical, electrical, electronic or software designs.' },
  { step: '04', title: 'Develop', desc: 'We build the prototype or develop the required system.' },
  { step: '05', title: 'Test', desc: 'We test the system, identify problems and improve the solution.' },
  { step: '06', title: 'Deliver', desc: 'The completed solution is delivered to the client.' },
];

// ── Project detail page ──────────────────────────────────────

function DesmenProjectDetail({ project, onBack }: { project: DesmenProject; onBack: () => void }) {
  const [media, setMedia] = useState<DesmenMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ items: LightboxItem[]; index: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('entity_media')
        .select('id, media_url, media_type, caption, is_cover')
        .eq('entity_type', 'desmen_project')
        .eq('entity_id', project.id)
        .order('sort_order', { ascending: true });
      setMedia((data || []) as DesmenMedia[]);
      setMediaLoading(false);
    })();
  }, [project.id]);

  const images = media.filter((m) => m.media_type === 'image');
  const videos = media.filter((m) => m.media_type === 'video');

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-950 text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            Back to DESMEN
          </button>
          <p className="text-xs font-semibold tracking-widest text-navy-400 uppercase mb-3">DESMEN Solutions</p>
          {project.project_type && (
            <span className="inline-block px-3 py-1 rounded-full bg-navy-700 text-navy-300 text-xs font-semibold mb-4">{project.project_type}</span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{project.title}</h1>
          {project.description && (
            <p className="text-slate-300 leading-relaxed max-w-3xl text-base mb-6">{project.description}</p>
          )}
          <div className="flex flex-wrap gap-6">
            {project.our_role && (
              <div>
                <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Our Role</p>
                <div className="flex flex-wrap gap-2">
                  {project.our_role.split(',').map((r) => r.trim()).filter(Boolean).map((r, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-navy-800 text-slate-300 text-xs font-medium">{r}</span>
                  ))}
                </div>
              </div>
            )}
            {project.technologies && (
              <div>
                <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.split(',').map((t) => t.trim()).filter(Boolean).map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded bg-navy-800 text-navy-300 font-mono text-xs">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {mediaLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-navy-600" size={28} />
          </div>
        ) : images.length === 0 && videos.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-16">No media added yet.</p>
        ) : (
          <div className="space-y-14">
            {images.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon className="text-navy-600" size={20} />
                  <h3 className="text-lg font-semibold text-slate-800">Photos</h3>
                  <span className="text-sm text-slate-400">({images.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() =>
                        setLightbox({
                          items: images.map((m) => ({ url: m.media_url, caption: m.caption, type: m.media_type })),
                          index: i,
                        })
                      }
                      className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-zoom-in"
                    >
                      <img src={getOptimizedImageUrl(img.media_url, { width: 720, quality: 76 })} srcSet={getImageSrcSet(img.media_url, [360, 540, 720, 960])} sizes="(max-width: 768px) 90vw, 360px" alt={img.caption || project.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              </section>
            )}
            {videos.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Video className="text-navy-600" size={20} />
                  <h3 className="text-lg font-semibold text-slate-800">Videos</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {videos.map((v) => (
                    <video key={v.id} src={v.media_url} controls className="w-full aspect-video rounded-2xl bg-navy-950 shadow-md" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {lightbox && (
        <MediaLightbox
          items={lightbox.items}
          startIndex={lightbox.index}
          title={project.title}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────

export default function DesmenView({ onNavigate }: DesmenViewProps) {
  const [tagline, setTagline] = useState('');
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<DesmenProject[]>([]);
  const [selected, setSelected] = useState<DesmenProject | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: settings }, { data: projData }, { data: mediaData }] = await Promise.all([
        supabase.from('site_settings').select('key, value').in('key', ['desmen_tagline', 'profile_photo_url']),
        supabase.from('desmen_projects').select('id, title, description, our_role, technologies, project_type, sort_order').order('sort_order', { ascending: true }),
        supabase
          .from('entity_media')
          .select('entity_id, media_url, media_type, is_cover, sort_order')
          .eq('entity_type', 'desmen_project')
          .order('sort_order', { ascending: true }),
      ]);

      for (const row of settings || []) {
        if (row.key === 'desmen_tagline') setTagline(row.value || '');
        if (row.key === 'profile_photo_url') setProfileUrl(row.value || null);
      }

      const rows = (projData || []) as Omit<DesmenProject, 'cover' | 'our_role' | 'technologies' | 'project_type'> & { our_role: string | null; technologies: string | null; project_type: string | null }[];
      const withCovers = rows.map((p) => {
        const items = (mediaData || []).filter((m) => m.entity_id === p.id);
        const cover = items.find((m) => m.is_cover) || items[0] || null;
        return { ...p, cover: cover ? { url: cover.media_url, type: cover.media_type } : null };
      });
      setProjects(withCovers);
      setLoading(false);
    })();
  }, []);

  if (selected) return <DesmenProjectDetail project={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="animate-fade-in">

      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <section className="bg-navy-950 text-white py-24 sm:py-32 relative overflow-hidden">
        {/* subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-14"
          >
            <ArrowLeft size={16} />
            Back to portfolio
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-navy-700 flex items-center justify-center shrink-0 shadow-lg">
              <Rocket className="text-white" size={26} />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-navy-400 uppercase mb-1">My Startup</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">DESMEN Solutions</h1>
            </div>
          </div>

          <p className="text-xl sm:text-2xl font-semibold text-slate-200 mb-5 max-w-2xl">
            Team &amp; project experience from university.
          </p>

          <p className="text-slate-400 leading-relaxed max-w-2xl mb-4">
            While studying, I started working on engineering projects with a group of university friends.
            What began as a shared interest in building real things grew into a small, multidisciplinary team
            where we took on actual project work — gaining hands-on experience beyond the classroom.
          </p>
          <p className="text-navy-400 font-medium mb-10">
            Initiative · Teamwork · Coordination · Practical delivery
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const el = document.getElementById('desmen-projects');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-navy-900 font-semibold hover:bg-slate-100 transition-all shadow-lg"
            >
              View Team Projects
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-navy-600 text-white font-semibold hover:bg-navy-800 transition-all"
            >
              <Mail size={16} />
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. OUR STORY
      ══════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-navy-500 uppercase mb-3">Our Story</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8">How DESMEN Started</h2>

          <div className="space-y-5 text-slate-600 leading-relaxed text-base">
            <p>
              <strong className="text-slate-800">DESMEN Solutions started at university.</strong> It began with two
              friends who shared an interest in engineering, technology, design and problem solving. While studying at
              university, we wanted to do more than just academic projects. We wanted to use what we learned to solve
              real problems.
            </p>
            <p>
              I started DESMEN and brought together friends with different technical skills. Together, we started
              working on projects, experimenting with ideas, designing solutions, and learning from real client
              requirements.
            </p>
            <p>
              As more opportunities came, our small group developed into a team capable of handling projects across{' '}
              <strong className="text-slate-800">
                design, mechanical engineering, electronics, embedded systems, software and automation.
              </strong>
            </p>
          </div>

          <blockquote className="mt-10 border-l-4 border-navy-600 pl-6 py-2">
            <p className="text-lg font-semibold text-navy-800 italic leading-snug">
              "A good engineering idea becomes valuable when we can turn it into a working solution."
            </p>
          </blockquote>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. ACRONYM
      ══════════════════════════════════════════ */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-navy-500 uppercase mb-3 text-center">The Name</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-12 text-center">What DESMEN Stands For</h2>

          <div className="space-y-3 mb-10">
            {ACRONYM.map(({ letter, word }, i) => (
              <div
                key={i}
                className="flex items-center gap-6 bg-white rounded-2xl border border-slate-200 px-6 py-4 hover:border-navy-300 hover:shadow-sm transition-all animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-4xl font-black text-navy-700 w-10 shrink-0">{letter}</span>
                <div className="w-px h-8 bg-slate-200 shrink-0" />
                <span className="text-slate-700 font-semibold text-base">{word}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 font-medium text-sm">
            Different skills. One team. Real solutions.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. CAPABILITIES
      ══════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-navy-500 uppercase mb-3">Services</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-12">Our Capabilities</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 hover:border-navy-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center mb-4">
                  <Icon className="text-white" size={22} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. PROJECTS — dark showcase
      ══════════════════════════════════════════ */}
      <section id="desmen-projects" className="bg-navy-950 py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-navy-400 uppercase mb-3">Portfolio</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Projects We've Worked On</h2>
          <p className="text-slate-400 mb-12 max-w-2xl">
            From university projects to real client solutions. Over time, we have worked on several academic,
            personal, research and client-based projects.
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-navy-400" size={32} />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-12">Projects coming soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="group relative bg-navy-900 rounded-2xl border border-navy-800 overflow-hidden hover:border-navy-500 hover:shadow-2xl transition-all duration-300 text-left animate-fade-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-navy-800">
                    {p.cover ? (
                      p.cover.type === 'video' ? (
                        <video
                          src={p.cover.url}
                          autoPlay loop muted playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <img src={getOptimizedImageUrl(p.cover.url, { width: 720, quality: 76 })} srcSet={getImageSrcSet(p.cover.url, [360, 540, 720, 960])}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         loading="lazy" decoding="async"/>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Rocket size={36} className="text-navy-600" />
                      </div>
                    )}
                    {/* index badge */}
                    <span className="absolute top-3 left-3 text-xs font-bold text-slate-500 bg-navy-950/80 px-2 py-0.5 rounded-full">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-5">
                    {p.project_type && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-navy-700 text-navy-300 text-xs font-medium mb-2">{p.project_type}</span>
                    )}
                    <h3 className="font-semibold text-white text-base leading-snug mb-2">{p.title}</h3>
                    {p.description && (
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-3">{p.description}</p>
                    )}
                    {p.technologies && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.technologies.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 4).map((t, ti) => (
                          <span key={ti} className="px-1.5 py-0.5 rounded bg-navy-800 text-navy-400 font-mono text-xs">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-navy-400 group-hover:text-navy-300 text-xs font-medium transition-colors">
                      View project <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. JOURNEY
      ══════════════════════════════════════════ */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-navy-500 uppercase mb-3">History</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-14">Our Journey</h2>

          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[39px] top-0 bottom-0 w-px bg-slate-200" />

            <div className="space-y-10">
              {JOURNEY.map(({ year, title, desc }, i) => (
                <div key={i} className="flex gap-6 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  {/* node */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-[50px] h-[50px] rounded-full bg-navy-700 text-white flex flex-col items-center justify-center text-xs font-bold leading-tight shadow-md z-10 border-2 border-slate-50">
                      <span>{year.slice(0, 2)}</span>
                      <span>{year.slice(2)}</span>
                    </div>
                  </div>
                  {/* content */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex-1 hover:border-navy-200 hover:shadow-sm transition-all">
                    <p className="text-xs font-semibold text-navy-500 mb-1">{year}</p>
                    <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. FOUNDER
      ══════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-navy-500 uppercase mb-3">Leadership</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-12">
            Founded by Students. Built by Engineers.
          </h2>

          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start">
            {/* photo */}
            <div className="shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-navy-100 border border-slate-200">
              {profileUrl ? (
                <img src={getOptimizedImageUrl(profileUrl, { width: 640, quality: 82 })} srcSet={getImageSrcSet(profileUrl, [320, 480, 640, 960])} sizes="(max-width: 768px) 50vw, 240px" alt="Poojitha Dilshan" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-navy-700">PD</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800">Poojitha Dilshan</h3>
              <p className="text-navy-600 font-medium text-sm mb-5">Founder — DESMEN Solutions</p>

              <blockquote className="border-l-4 border-navy-600 pl-4 mb-5">
                <p className="text-slate-700 italic leading-relaxed">
                  "DESMEN was started with a simple idea: we don't have to wait until graduation to start building
                  real engineering solutions."
                </p>
              </blockquote>

              <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
                <p>
                  While studying at university, I wanted to create a platform where students and young engineers
                  could work together, gain practical experience, and solve real-world problems.
                </p>
                <p>
                  I started by bringing together friends with different skills. Together, we have worked on
                  projects for clients and developed our experience through every challenge.
                </p>
              </div>

              <p className="mt-6 text-navy-800 font-semibold text-sm">
                DESMEN is not just a company. It is a team built around learning, engineering and creating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. TEAM
      ══════════════════════════════════════════ */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-navy-500 uppercase mb-3">People</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">The Team Behind DESMEN</h2>
          <p className="text-slate-500 mb-12 max-w-xl">
            A team of young engineers and creators. We bring together people with different technical backgrounds and skills.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
            {TEAM.map(({ role, name, initials, highlight }, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-5 text-center transition-all animate-fade-up ${
                  highlight
                    ? 'bg-navy-700 border-navy-600 text-white shadow-lg'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-navy-200 hover:shadow-sm'
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-base ${
                    highlight ? 'bg-navy-600 text-white' : 'bg-slate-100 text-navy-700'
                  }`}
                >
                  {initials}
                </div>
                <p className={`font-semibold text-sm mb-1 ${highlight ? 'text-white' : 'text-slate-800'}`}>{name}</p>
                <p className={`text-xs leading-tight ${highlight ? 'text-navy-300' : 'text-slate-400'}`}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. WHY DESMEN
      ══════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-navy-500 uppercase mb-3">Reasons</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-12">Why DESMEN?</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_US.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-2xl border border-slate-200 hover:border-navy-200 hover:shadow-sm transition-all animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                  <Icon size={18} className="text-navy-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. PROCESS
      ══════════════════════════════════════════ */}
      <section className="bg-navy-950 py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-navy-400 uppercase mb-3">Process</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12">How We Work</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROCESS.map(({ step, title, desc }, i) => (
              <div
                key={i}
                className="bg-navy-900 rounded-2xl border border-navy-800 p-6 hover:border-navy-600 transition-all animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-3xl font-black text-navy-700 mb-3 block">{step}</span>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white">{title}</h3>
                  {i < PROCESS.length - 1 && (
                    <ChevronRight size={14} className="text-navy-600" />
                  )}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          11. CTA
      ══════════════════════════════════════════ */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Want to Know More?</h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            This experience has helped me develop teamwork, communication, project coordination,
            and practical engineering skills. Feel free to get in touch or view my full project portfolio.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-700 text-white font-semibold hover:bg-navy-800 transition-all shadow-md"
            >
              View All Projects
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-white transition-all"
            >
              <Mail size={16} />
              Get in Touch
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
