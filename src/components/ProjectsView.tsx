import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2, FolderOpen, Rocket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { iconMap, type ProjectRow, type SubprojectRow } from '@/data';
import MediaLightbox, { type LightboxItem } from '@/components/MediaLightbox';

interface DesmenProjectItem {
  id: string;
  title: string;
  description: string | null;
  our_role: string | null;
  technologies: string | null;
  project_type: string | null;
  portfolio_project_id: string | null;
  sort_order: number;
  cover: { url: string; type: string } | null;
}

interface EntityMediaRow {
  entity_type: string;
  entity_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  is_cover: boolean;
  sort_order: number;
}

interface ProjectsViewProps {
  focusTitle?: string | null;
}

export default function ProjectsView({ focusTitle }: ProjectsViewProps) {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [subprojects, setSubprojects] = useState<Record<string, SubprojectRow[]>>({});
  const [media, setMedia] = useState<Record<string, EntityMediaRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [desmenOpen, setDesmenOpen] = useState(false);
  const [desmenProjects, setDesmenProjects] = useState<DesmenProjectItem[]>([]);
  const [linkedDesmenMap, setLinkedDesmenMap] = useState<Record<string, DesmenProjectItem[]>>({});
  const [lightbox, setLightbox] = useState<{ items: LightboxItem[]; title?: string } | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    (async () => {
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });
      if (projError) {
        setError('Unable to load projects. Please try again later.');
        setLoading(false);
        return;
      }
      const projRows = (projData || []) as ProjectRow[];
      setProjects(projRows);
      const focusMatch = focusTitle && projRows.find((p) => p.title === focusTitle);
      if (focusMatch) {
        setOpenId(focusMatch.id);
      } else if (projRows.length > 0) {
        setOpenId(projRows[0].id);
      }

      const { data: subData, error: subError } = await supabase
        .from('subprojects')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!subError && subData) {
        const grouped: Record<string, SubprojectRow[]> = {};
        for (const sp of subData as SubprojectRow[]) {
          if (!grouped[sp.project_id]) grouped[sp.project_id] = [];
          grouped[sp.project_id].push(sp);
        }
        setSubprojects(grouped);
      }

      const { data: mediaData } = await supabase
        .from('entity_media')
        .select('*')
        .in('entity_type', ['project', 'subproject'])
        .order('sort_order', { ascending: true });
      const groupedMedia: Record<string, EntityMediaRow[]> = {};
      for (const m of (mediaData || []) as EntityMediaRow[]) {
        if (!groupedMedia[m.entity_id]) groupedMedia[m.entity_id] = [];
        groupedMedia[m.entity_id].push(m);
      }
      setMedia(groupedMedia);

      // DESMEN projects
      const { data: desmenData } = await supabase
        .from('desmen_projects')
        .select('id, title, description, our_role, technologies, project_type, portfolio_project_id, sort_order')
        .order('sort_order', { ascending: true });
      const { data: desmenMedia } = await supabase
        .from('entity_media')
        .select('entity_id, media_url, media_type, is_cover, sort_order')
        .eq('entity_type', 'desmen_project')
        .order('sort_order', { ascending: true });
      const desmenWithCovers = ((desmenData || []) as Omit<DesmenProjectItem, 'cover'>[]).map((p) => {
        const items = (desmenMedia || []).filter((m) => m.entity_id === p.id);
        const cover = items.find((m) => m.is_cover) || items[0] || null;
        return { ...p, cover: cover ? { url: cover.media_url, type: cover.media_type } : null };
      });
      setDesmenProjects(desmenWithCovers);

      // Build map: portfolio_project_id → desmen projects
      const map: Record<string, DesmenProjectItem[]> = {};
      for (const p of desmenWithCovers) {
        if (p.portfolio_project_id) {
          if (!map[p.portfolio_project_id]) map[p.portfolio_project_id] = [];
          map[p.portfolio_project_id].push(p);
        }
      }
      setLinkedDesmenMap(map);

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (focusTitle && openId && itemRefs.current[openId]) {
      itemRefs.current[openId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, loading]);

  const coverOf = (entityId: string) => {
    const items = media[entityId] || [];
    return items.find((m) => m.is_cover) || items[0] || null;
  };

  const imageCoverOf = (entityId: string) => {
    const items = media[entityId] || [];
    const cover = items.find((m) => m.is_cover);
    if (cover && cover.media_type !== 'video') return cover;
    return items.find((m) => m.media_type !== 'video') || null;
  };

  const openLightbox = (entityId: string, title?: string) => {
    const items = media[entityId] || [];
    if (items.length === 0) return;
    setLightbox({
      items: items.map((m) => ({ url: m.media_url, caption: m.caption, type: m.media_type })),
      title,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-navy-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Projects</h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          A categorized portfolio of my engineering work. Click any section to expand the details.
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((section, i) => {
          const Icon = (section.icon_name && iconMap[section.icon_name]) || iconMap.Code2;
          const isOpen = openId === section.id;
          const subs = subprojects[section.id] || [];
          const cover = coverOf(section.id);
          const headerImage = imageCoverOf(section.id);
          const coverCount = (media[section.id] || []).length;
          return (
            <div
              key={section.id}
              ref={(el) => { itemRefs.current[section.id] = el; }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-navy-200 transition-colors animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
              >
                <div
                  className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center transition-colors ${
                    isOpen ? 'bg-navy-700' : 'bg-navy-50'
                  }`}
                >
                  {headerImage ? (
                    <img src={headerImage.media_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Icon className={isOpen ? 'text-white' : 'text-navy-600'} size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">{section.title}</h3>
                </div>
                <ChevronDown
                  className={`text-slate-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  size={22}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6 pt-2">
                    <button
                      onClick={() => openLightbox(section.id, section.title)}
                      disabled={!cover}
                      className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 block relative group"
                    >
                      {cover ? (
                        <>
                          {cover.media_type === 'video' ? (
                            <video
                              src={cover.media_url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <img
                              src={cover.media_url}
                              alt={section.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          {coverCount > 1 && (
                            <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-navy-950/70 text-white text-xs font-medium">
                              +{coverCount - 1} more
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Icon size={48} />
                        </div>
                      )}
                    </button>
                    <div className="space-y-4">
                      {section.overview && (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-600 uppercase tracking-wide">Overview</h4>
                          <p className="mt-1 text-slate-600 leading-relaxed text-sm">{section.overview}</p>
                        </div>
                      )}
                      {section.areas && (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-600 uppercase tracking-wide">Areas Covered</h4>
                          <p className="mt-1 text-slate-600 leading-relaxed text-sm">{section.areas}</p>
                        </div>
                      )}
                      {section.tools && (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-600 uppercase tracking-wide">Tools & Software</h4>
                          <p className="mt-1 text-slate-600 leading-relaxed text-sm">{section.tools}</p>
                        </div>
                      )}
                      {section.techniques && (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-600 uppercase tracking-wide">Techniques & Systems</h4>
                          <p className="mt-1 text-slate-600 leading-relaxed text-sm">{section.techniques}</p>
                        </div>
                      )}
                      {section.featured && (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-600 uppercase tracking-wide">Featured Projects</h4>
                          <p className="mt-1 text-slate-600 leading-relaxed text-sm">{section.featured}</p>
                        </div>
                      )}
                      {section.languages && (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-600 uppercase tracking-wide">Languages & Frameworks</h4>
                          <p className="mt-1 text-slate-600 leading-relaxed text-sm">{section.languages}</p>
                        </div>
                      )}
                      {section.key_focus && (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-600 uppercase tracking-wide">Key Focus</h4>
                          <p className="mt-1 text-slate-600 leading-relaxed text-sm">{section.key_focus}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DESMEN projects linked to this category */}
                  {(linkedDesmenMap[section.id] || []).length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Rocket className="text-navy-600" size={20} />
                        <h4 className="text-base font-semibold text-slate-800">Under DESMEN Solutions</h4>
                        <span className="text-xs text-slate-400">({linkedDesmenMap[section.id].length})</span>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {linkedDesmenMap[section.id].map((dp) => (
                          <button
                            key={dp.id}
                            onClick={() => {
                              if (dp.cover) setLightbox({ items: [{ url: dp.cover.url, type: dp.cover.type }], title: dp.title });
                            }}
                            disabled={!dp.cover}
                            className="group rounded-xl border border-navy-100 bg-navy-50/30 overflow-hidden hover:shadow-md hover:border-navy-300 transition-all text-left"
                          >
                            <div className="aspect-[16/10] bg-navy-100 overflow-hidden relative">
                              {dp.cover ? (
                                dp.cover.type === 'video' ? (
                                  <video src={dp.cover.url} autoPlay loop muted playsInline
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                  <img src={dp.cover.url} alt={dp.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-navy-300">
                                  <Rocket size={28} />
                                </div>
                              )}
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-navy-900/80 text-navy-300 text-[10px] font-semibold">DESMEN</span>
                            </div>
                            <div className="p-4">
                              <h5 className="font-semibold text-slate-800 text-sm">{dp.title}</h5>
                              {dp.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{dp.description}</p>}
                              {dp.technologies && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {dp.technologies.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3).map((t, ti) => (
                                    <span key={ti} className="px-1.5 py-0.5 rounded bg-navy-100 text-navy-700 font-mono text-[10px]">{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-projects */}
                  {subs.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <FolderOpen className="text-navy-600" size={20} />
                        <h4 className="text-base font-semibold text-slate-800">
                          Featured Builds ({subs.length})
                        </h4>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subs.map((sp) => {
                          const spCover = coverOf(sp.id);
                          const spCount = (media[sp.id] || []).length;
                          return (
                            <div
                              key={sp.id}
                              className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-navy-200 transition-all"
                            >
                              <button
                                onClick={() => openLightbox(sp.id, sp.title)}
                                disabled={!spCover}
                                className="w-full aspect-[16/10] bg-slate-100 overflow-hidden block relative"
                              >
                                {spCover ? (
                                  <>
                                    {spCover.media_type === 'video' ? (
                                      <video
                                        src={spCover.media_url}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    ) : (
                                      <img
                                        src={spCover.media_url}
                                        alt={sp.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    )}
                                    {spCount > 1 && (
                                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-navy-950/70 text-white text-[10px] font-medium">
                                        +{spCount - 1}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <FolderOpen size={28} />
                                  </div>
                                )}
                              </button>
                              <div className="p-4">
                                <h5 className="font-semibold text-slate-800 text-sm">{sp.title}</h5>
                                {sp.description && (
                                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-3">
                                    {sp.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* DESMEN Projects Section — shown after regular categories */}
        {desmenProjects.length > 0 && (
          <div className="bg-white rounded-2xl border border-navy-200 overflow-hidden hover:border-navy-400 transition-colors animate-fade-up">
            <button
              onClick={() => setDesmenOpen(!desmenOpen)}
              className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${desmenOpen ? 'bg-navy-700' : 'bg-navy-50'}`}>
                <Rocket className={desmenOpen ? 'text-white' : 'text-navy-600'} size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">DESMEN Solutions Projects</h3>
                <p className="text-xs text-navy-500 font-medium mt-0.5">My engineering startup</p>
              </div>
              <ChevronDown className={`text-slate-400 transition-transform duration-300 ${desmenOpen ? 'rotate-180' : ''}`} size={22} />
            </button>

            {desmenOpen && (
              <div className="px-5 sm:px-6 pb-6 animate-fade-in">
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Projects built under <span className="font-semibold text-navy-700">DESMEN Solutions</span> — my student engineering startup.
                  We work on mechanical design, electronics, embedded systems and software for real clients.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {desmenProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (p.cover) {
                          setLightbox({
                            items: [{ url: p.cover.url, type: p.cover.type }],
                            title: p.title,
                          });
                        }
                      }}
                      disabled={!p.cover}
                      className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-navy-200 transition-all text-left"
                    >
                      <div className="aspect-[16/10] bg-navy-50 overflow-hidden relative">
                        {p.cover ? (
                          p.cover.type === 'video' ? (
                            <video src={p.cover.url} autoPlay loop muted playsInline
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <img src={p.cover.url} alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-navy-200">
                            <Rocket size={32} />
                          </div>
                        )}
                        {p.project_type && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-navy-900/80 text-navy-300 text-[10px] font-semibold">
                            {p.project_type}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h5 className="font-semibold text-slate-800 text-sm">{p.title}</h5>
                        {p.description && (
                          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">{p.description}</p>
                        )}
                        {p.technologies && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.technologies.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3).map((t, ti) => (
                              <span key={ti} className="px-1.5 py-0.5 rounded bg-navy-50 text-navy-600 font-mono text-[10px]">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {lightbox && (
        <MediaLightbox items={lightbox.items} title={lightbox.title} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
