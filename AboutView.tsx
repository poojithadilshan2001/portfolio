import { useEffect, useState } from 'react';
import { Award, MapPin, Loader2, Users, Trophy, Music, BadgeCheck, MapPin as VisitPin, Plane, Camera, Heart, Rocket, ChevronRight } from 'lucide-react';
import { education, workExperience, type ViewKey } from '@/data';
import { supabase } from '@/lib/supabase';
import { getImageSrcSet, getOptimizedImageUrl } from '@/lib/media';
import MediaLightbox, { type LightboxItem } from '@/components/MediaLightbox';

interface GalleryCategory {
  id: string;
  name: string;
  sort_order: number;
}

interface GalleryMediaItem {
  id: string;
  entity_id: string;
  caption: string | null;
  media_url: string;
  media_type: string;
  is_cover: boolean;
  sort_order: number;
}

interface Certification {
  id: string;
  title: string;
  issuer: string | null;
  issued_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
}

interface LeadershipRow {
  id: string;
  role: string;
  org: string | null;
  period: string | null;
}

interface EntityMediaRow {
  entity_type: string;
  entity_id: string;
  media_url: string;
  caption: string | null;
  is_cover: boolean;
}

const CATEGORY_ICONS: Record<string, typeof Users> = {
  'IEEE & Club Work': Users,
  Sports: Trophy,
  Music: Music,
  Visits: VisitPin,
  Travel: Plane,
  Hobbies: Heart,
  Photography: Camera,
};

function GalleryTile({ photo, onClick }: { photo: GalleryMediaItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:shadow-md transition-all text-left w-full cursor-zoom-in"
    >
      <div className="aspect-square bg-slate-100 overflow-hidden">
        {photo.media_type === 'video' ? (
          <video
            src={photo.media_url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img src={getOptimizedImageUrl(photo.media_url, { width: 720, quality: 76 })} srcSet={getImageSrcSet(photo.media_url, [360, 540, 720, 960])}
            alt={photo.caption || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
           loading="lazy" decoding="async"/>
        )}
      </div>
      {photo.caption && <p className="px-3 py-2 text-xs text-slate-500 truncate">{photo.caption}</p>}
    </button>
  );
}

interface AboutViewProps {
  onNavigate: (view: ViewKey) => void;
}

export default function AboutView({ onNavigate }: AboutViewProps) {
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [leadership, setLeadership] = useState<LeadershipRow[]>([]);
  const [leadershipLoading, setLeadershipLoading] = useState(true);
  const [media, setMedia] = useState<Record<string, EntityMediaRow[]>>({});
  const [lightbox, setLightbox] = useState<{ items: LightboxItem[]; title?: string; startIndex?: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: catData } = await supabase
        .from('gallery_categories')
        .select('id, name, sort_order')
        .order('sort_order', { ascending: true });
      setGalleryCategories((catData || []) as GalleryCategory[]);

      const { data: mediaData } = await supabase
        .from('entity_media')
        .select('id, entity_id, caption, media_url, media_type, is_cover, sort_order')
        .eq('entity_type', 'gallery')
        .order('sort_order', { ascending: true });
      setGalleryMedia((mediaData || []) as GalleryMediaItem[]);
      setGalleryLoading(false);
    })();

    (async () => {
      const { data } = await supabase
        .from('certifications')
        .select('*')
        .order('sort_order', { ascending: true });
      setCertifications((data || []) as Certification[]);
      setCertsLoading(false);
    })();

    (async () => {
      const { data } = await supabase
        .from('leadership')
        .select('*')
        .order('sort_order', { ascending: true });
      setLeadership((data || []) as LeadershipRow[]);
      setLeadershipLoading(false);
    })();

    (async () => {
      const { data } = await supabase
        .from('entity_media')
        .select('entity_type, entity_id, media_url, caption, is_cover')
        .in('entity_type', ['certification', 'leadership'])
        .order('sort_order', { ascending: true });
      const grouped: Record<string, EntityMediaRow[]> = {};
      for (const m of (data || []) as EntityMediaRow[]) {
        if (!grouped[m.entity_id]) grouped[m.entity_id] = [];
        grouped[m.entity_id].push(m);
      }
      setMedia(grouped);
    })();
  }, []);

  const coverOf = (entityId: string) => {
    const items = media[entityId] || [];
    return items.find((m) => m.is_cover) || items[0] || null;
  };

  const openLightbox = (entityId: string, title: string) => {
    const items = media[entityId] || [];
    if (items.length === 0) return;
    setLightbox({ items: items.map((m) => ({ url: m.media_url, caption: m.caption })), title });
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Personal intro */}
      <div className="mb-14 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">About Me</h1>
        <p className="mt-5 text-lg text-slate-600 leading-relaxed">
          I am a Mechatronics Engineering graduate from Uva Wellassa University of Sri Lanka,
          based in Badulla. My core interest is in <strong className="text-slate-800 font-semibold">mechanical design and CAD</strong> —
          specifically designing parts and assemblies in SolidWorks that can actually be fabricated
          and assembled in the real world.
        </p>
        <p className="mt-4 text-base text-slate-500 leading-relaxed">
          Alongside CAD, I have practical experience with SolidWorks Simulation for basic FEA,
          PCB design and electronics through project work, and basic SolidCAM for machining.
          I also build software — mobile apps and web tools — as a supporting skill that helps
          me work across multidisciplinary engineering projects.
        </p>
        <p className="mt-4 text-base text-slate-500 leading-relaxed">
          Through university projects, personal builds, and collaborative team work under{' '}
          <button
            className="font-medium text-navy-600 hover:underline"
            onClick={() => onNavigate('desmen')}
          >
            DESMEN Solutions
          </button>
          , I have gained practical experience working on real project requirements, coordinating
          with teammates, and delivering engineering work from concept to prototype.
          I am currently looking for an opportunity to begin my professional engineering career.
        </p>
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={15} className="text-navy-500 shrink-0" />
          Badulla, Sri Lanka
        </div>
      </div>

      {/* Work Experience */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Work Experience</h2>
        <div className="grid gap-5">
          {workExperience.map((job, i) => {
            const Icon = job.icon;
            return (
              <div
                key={i}
                className="flex gap-5 bg-white rounded-2xl border border-navy-200 p-6 hover:shadow-md transition-all animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center">
                  <Icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-800 text-lg">{job.role}</h3>
                    {job.current && (
                      <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <p className="text-navy-600 font-medium">{job.org}</p>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{job.detail}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-navy-50 text-navy-700 text-sm font-medium">
                    {job.period}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Education */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Education</h2>
        <div className="grid gap-5">
          {education.map((edu, i) => {
            const Icon = edu.icon;
            return (
              <div
                key={i}
                className="flex gap-5 bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-navy-200 transition-all animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center">
                  <Icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-lg">{edu.degree}</h3>
                  <p className="text-navy-600 font-medium">{edu.field}</p>
                  <p className="text-slate-500 mt-1">{edu.school}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-navy-50 text-navy-700 text-sm font-medium">
                    {edu.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-navy-600" size={24} />
          <h2 className="text-2xl font-semibold text-slate-800">Certifications</h2>
        </div>
        {certsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-navy-600" size={28} />
          </div>
        ) : certifications.length === 0 ? (
          <p className="text-slate-400 text-sm">No certifications added yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certifications.map((cert) => {
              const cover = coverOf(cert.id);
              const count = (media[cert.id] || []).length;
              return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-navy-200 transition-all"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {cover ? (
                    <button
                      onClick={() => openLightbox(cert.id, cert.title)}
                      className="w-full h-full block cursor-zoom-in relative"
                      aria-label={`View ${cert.title} certificate`}
                    >
                      <img src={getOptimizedImageUrl(cover.media_url, { width: 640, quality: 76 })} srcSet={getImageSrcSet(cover.media_url, [320, 480, 640, 960])} sizes="(max-width: 768px) 90vw, 320px" alt={cert.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      {count > 1 && (
                        <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-navy-950/70 text-white text-xs font-medium">
                          +{count - 1} more
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <BadgeCheck size={40} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug">{cert.title}</h3>
                  {(cert.issuer || cert.issued_date) && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      {cert.issuer}
                      {cert.issuer && cert.issued_date && ' · '}
                      {cert.issued_date && `Issued ${cert.issued_date}`}
                    </p>
                  )}
                  {cert.credential_id && (
                    <p className="mt-1 text-xs text-slate-400">Credential ID: {cert.credential_id}</p>
                  )}
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-medium text-navy-600 hover:underline"
                    >
                      Show credential
                    </a>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Leadership */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          University Life & Leadership
        </h2>
        {leadershipLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-navy-600" size={28} />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {leadership.map((item, i) => {
              const cover = coverOf(item.id);
              const count = (media[item.id] || []).length;
              return (
              <div
                key={item.id}
                onClick={() => count > 0 && openLightbox(item.id, item.role)}
                className={`flex gap-4 bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-navy-200 transition-all animate-fade-up ${count > 0 ? 'cursor-pointer' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-navy-50 flex items-center justify-center">
                  {cover ? (
                    <img src={getOptimizedImageUrl(cover.media_url, { width: 640, quality: 76 })} srcSet={getImageSrcSet(cover.media_url, [320, 480, 640, 960])} sizes="(max-width: 768px) 90vw, 320px" alt={item.role} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <Users className="text-navy-600" size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{item.role}</h3>
                  <p className="text-slate-500 text-sm">{item.org}</p>
                  <span className="text-navy-600 text-sm font-medium">{item.period}</span>
                  {count > 1 && <span className="ml-2 text-xs text-navy-600 font-medium">+{count - 1} more photos</span>}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DESMEN — Team & Project Experience */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Other Experience</h2>
        <p className="text-slate-500 mb-6">
          Outside of formal employment and university, I have been involved in team engineering work.
        </p>
        <button
          onClick={() => onNavigate('desmen')}
          className="w-full group bg-white rounded-2xl border border-slate-200 hover:border-navy-300 hover:shadow-lg transition-all duration-300 overflow-hidden text-left"
        >
          <div className="flex items-center gap-5 p-6">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-navy-700 flex items-center justify-center group-hover:bg-navy-600 transition-colors">
              <Rocket className="text-white" size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-800 text-lg">DESMEN Solutions</h3>
                <span className="px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 text-xs font-medium border border-navy-100">
                  Co-Founder
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                  2023 – Present
                </span>
              </div>
              <p className="mt-1.5 text-slate-500 text-sm leading-relaxed">
                A student engineering team I started with university friends. We worked on real
                project requirements across mechanical design, electronics, and software — gaining
                practical experience in teamwork, project coordination, and engineering delivery.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Mechanical Design', 'PCB & Electronics', 'Software', 'Team Leadership', 'Project Coordination'].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight className="shrink-0 text-slate-300 group-hover:text-navy-400 transition-colors" size={22} />
          </div>
        </button>
      </section>

      {/* Photo Gallery */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Beyond Engineering</h2>
        <p className="text-slate-500 mb-8 max-w-2xl">
          A look at my involvement in IEEE and club work, sports, music, and visits outside the workshop.
        </p>
        {galleryLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-navy-600" size={28} />
          </div>
        ) : galleryCategories.length === 0 ? (
          <p className="text-slate-400 text-sm">No photos added yet.</p>
        ) : (
          <div className="space-y-14">
            {galleryCategories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || Users;
              const items = galleryMedia.filter((m) => m.entity_id === cat.id);
              if (items.length === 0) return null;

              const coverPhoto = items.find((p) => p.is_cover) || items[0] || null;
              const rest = items.filter((p) => p.id !== coverPhoto?.id);

              const openAt = (idx: number) =>
                setLightbox({
                  items: items.map((p) => ({ url: p.media_url, caption: p.caption, type: p.media_type })),
                  title: cat.name,
                  startIndex: idx,
                });

              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-navy-700 flex items-center justify-center shrink-0">
                      <Icon className="text-white" size={18} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">{cat.name}</h3>
                    <span className="text-sm text-slate-400 font-medium">{items.length} photo{items.length !== 1 ? 's' : ''}</span>
                  </div>

                  {coverPhoto && (
                    <button
                      onClick={() => openAt(items.indexOf(coverPhoto))}
                      className="group w-full relative rounded-2xl overflow-hidden mb-4 cursor-zoom-in block"
                    >
                      <div className="aspect-[16/7] bg-slate-100 overflow-hidden">
                        {coverPhoto.media_type === 'video' ? (
                          <video
                            src={coverPhoto.media_url}
                            autoPlay loop muted playsInline
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <img src={getOptimizedImageUrl(coverPhoto.media_url, { width: 720, quality: 76 })} srcSet={getImageSrcSet(coverPhoto.media_url, [360, 540, 720, 960])}
                            alt={coverPhoto.caption || cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                           loading="lazy" decoding="async"/>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent pointer-events-none" />
                      {items.length > 1 && (
                        <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-navy-950/70 text-white text-xs font-medium backdrop-blur-sm">
                          +{items.length - 1} more
                        </span>
                      )}
                      {coverPhoto.caption && (
                        <span className="absolute bottom-3 left-3 text-white/90 text-sm font-medium drop-shadow">
                          {coverPhoto.caption}
                        </span>
                      )}
                    </button>
                  )}

                  {rest.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {rest.map((photo) => (
                        <GalleryTile
                          key={photo.id}
                          photo={photo}
                          onClick={() => openAt(items.indexOf(photo))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {lightbox && (
        <MediaLightbox items={lightbox.items} title={lightbox.title} startIndex={lightbox.startIndex} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
