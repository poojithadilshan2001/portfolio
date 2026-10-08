import { useState, useEffect } from 'react';
import { Cpu, Gauge, Video, Image as ImageIcon, Loader2, ArrowLeft, Microscope } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getImageSrcSet, getOptimizedImageUrl } from '@/lib/media';
import MediaLightbox, { type LightboxItem } from '@/components/MediaLightbox';
import type { ResearchRow } from '@/data';

interface ResearchMedia {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  is_cover: boolean;
}

interface ResearchListItem extends ResearchRow {
  cover: ResearchMedia | null;
}

function ResearchDetail({ research, onBack }: { research: ResearchRow; onBack: () => void }) {
  const [media, setMedia] = useState<ResearchMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ items: LightboxItem[]; index: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('entity_media')
        .select('id, media_url, media_type, caption, is_cover')
        .eq('entity_type', 'research')
        .eq('entity_id', research.id)
        .order('sort_order', { ascending: true });
      setMedia((data || []) as ResearchMedia[]);
      setMediaLoading(false);
    })();
  }, [research.id]);

  const images = media.filter((m) => m.media_type === 'image');
  const videos = media.filter((m) => m.media_type === 'video');

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy-700 transition-colors mb-10"
      >
        <ArrowLeft size={16} />
        Back to research list
      </button>

      {/* Header */}
      <div className="mb-12 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-navy-50 text-navy-700 text-sm font-medium mb-4">
          {research.period}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">{research.title}</h1>
        <p className="mt-4 text-slate-600 leading-relaxed max-w-3xl mx-auto">{research.description}</p>
      </div>

      {/* Two Columns */}
      <div className="grid md:grid-cols-2 gap-6 mb-14">
        <div className="bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-md hover:border-navy-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-navy-700 flex items-center justify-center">
              <Cpu className="text-white" size={22} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Hardware Architecture</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{research.hardware_architecture}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-md hover:border-navy-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-navy-700 flex items-center justify-center">
              <Gauge className="text-white" size={22} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Software Integration</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{research.software_integration}</p>
        </div>
      </div>

      {/* Media Section */}
      {mediaLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-navy-600" size={28} />
        </div>
      ) : (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="text-navy-600" size={22} />
            <h3 className="text-xl font-semibold text-slate-800">Image Gallery</h3>
          </div>
          {images.length === 0 ? (
            <p className="text-slate-400 text-sm mb-10">No photos added yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() =>
                    setLightbox({
                      items: images.map((m) => ({ url: m.media_url, caption: m.caption, type: m.media_type })),
                      index: i,
                    })
                  }
                  className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:shadow-md transition-all cursor-zoom-in"
                >
                  <img src={getOptimizedImageUrl(img.media_url, { width: 720, quality: 76 })} srcSet={getImageSrcSet(img.media_url, [360, 540, 720, 960])}
                    alt={img.caption || research.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                   loading="lazy" decoding="async"/>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <Video className="text-navy-600" size={22} />
            <h3 className="text-xl font-semibold text-slate-800">Video Demo</h3>
          </div>
          {videos.length === 0 ? (
            <div className="aspect-video rounded-2xl bg-navy-900 border border-slate-200 flex items-center justify-center">
              <div className="text-center">
                <Video className="text-white/40 mx-auto mb-3" size={48} />
                <p className="text-white/60 text-sm">No demo video yet</p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {videos.map((v) => (
                <video key={v.id} src={v.media_url} controls className="w-full aspect-video rounded-2xl bg-navy-900" />
              ))}
            </div>
          )}
        </section>
      )}

      {lightbox && (
        <MediaLightbox
          items={lightbox.items}
          startIndex={lightbox.index}
          title={research.title}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

export default function ResearchesView() {
  const [researches, setResearches] = useState<ResearchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ResearchRow | null>(null);

  useEffect(() => {
    (async () => {
      let { data, error } = await supabase
        .from('researches')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) {
        // Fallback: sort_order column may not exist yet
        ({ data, error } = await supabase
          .from('researches')
          .select('*')
          .order('created_at', { ascending: false }));
      }
      if (error) {
        setError('Unable to load research. Please try again later.');
        setLoading(false);
        return;
      }
      const rows = (data || []) as ResearchRow[];

      const { data: mediaData } = await supabase
        .from('entity_media')
        .select('entity_id, media_url, media_type, caption, is_cover, sort_order')
        .eq('entity_type', 'research')
        .order('sort_order', { ascending: true });

      const withCovers = rows.map((r) => {
        const items = ((mediaData || []) as unknown as (ResearchMedia & { entity_id: string })[]).filter(
          (m) => m.entity_id === r.id
        );
        const cover = (items.find((m) => m.is_cover) || items[0] || null) as ResearchMedia | null;
        return { ...r, cover };
      });

      setResearches(withCovers);
      setLoading(false);
    })();
  }, []);

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

  if (selected) {
    return <ResearchDetail research={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Researches</h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          Academic research projects — click any project to see the full details.
        </p>
      </div>

      {researches.length === 0 ? (
        <p className="text-slate-400 text-sm text-center">No research published yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {researches.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-navy-300 transition-all duration-300 animate-fade-up text-left"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[16/9] bg-slate-100">
                {r.cover ? (
                  r.cover.media_type === 'video' ? (
                    <video
                      src={r.cover.media_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img src={getOptimizedImageUrl(r.cover.media_url, { width: 720, quality: 76 })} srcSet={getImageSrcSet(r.cover.media_url, [360, 540, 720, 960])}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     loading="lazy" decoding="async"/>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Microscope size={40} />
                  </div>
                )}
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 rounded-full bg-navy-50 text-navy-700 text-xs font-medium mb-3">
                  {r.period}
                </span>
                <h3 className="font-semibold text-slate-800 text-lg">{r.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">{r.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
