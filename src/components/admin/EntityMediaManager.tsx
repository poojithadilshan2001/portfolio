import { useEffect, useState } from 'react';
import { Loader2, Trash2, Star, Upload, ArrowUp, ArrowDown, Video, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EntityMediaRow {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  is_cover: boolean;
  sort_order: number;
}

async function uploadFile(file: File, folder: string) {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('portfolio-media').upload(path, file);
  if (error) return { url: null, error };
  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

async function removeFile(url: string) {
  const path = url.split('/portfolio-media/')[1];
  if (path) await supabase.storage.from('portfolio-media').remove([path]);
}

interface EntityMediaManagerProps {
  entityType: string;
  entityId: string;
}

export default function EntityMediaManager({ entityType, entityId }: EntityMediaManagerProps) {
  const [items, setItems] = useState<EntityMediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('entity_media')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('sort_order', { ascending: true });
    setItems((data || []) as EntityMediaRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    const { url, error: uploadError } = await uploadFile(file, entityType);
    if (uploadError || !url) {
      setError(uploadError?.message || 'Upload failed');
      setUploading(false);
      return;
    }
    await supabase.from('entity_media').insert({
      entity_type: entityType,
      entity_id: entityId,
      media_url: url,
      media_type: uploadType,
      caption: caption.trim() || null,
      is_cover: items.length === 0,
      sort_order: items.length,
    });
    setCaption('');
    await load();
    setUploading(false);
  };

  const handleSetCover = async (item: EntityMediaRow) => {
    await supabase
      .from('entity_media')
      .update({ is_cover: false })
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);
    await supabase.from('entity_media').update({ is_cover: true }).eq('id', item.id);
    await load();
  };

  const handleDelete = async (item: EntityMediaRow) => {
    await supabase.from('entity_media').delete().eq('id', item.id);
    await removeFile(item.media_url);
    if (item.is_cover) {
      const remaining = items.filter((i) => i.id !== item.id);
      if (remaining.length > 0) {
        await supabase.from('entity_media').update({ is_cover: true }).eq('id', remaining[0].id);
      }
    }
    await load();
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    await supabase.from('entity_media').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('entity_media').update({ sort_order: a.sort_order }).eq('id', b.id);
    await load();
  };

  if (loading) return <Loader2 className="animate-spin text-navy-600" size={20} />;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {items.map((item, index) => (
          <div key={item.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
            {item.media_type === 'video' ? (
              <video src={item.media_url} muted className="w-full h-full object-cover" />
            ) : (
              <img src={item.media_url} alt={item.caption || ''} className="w-full h-full object-cover" />
            )}
            {item.is_cover && (
              <span className="absolute top-1 left-1 p-0.5 rounded-full bg-navy-700 text-white">
                <Star size={10} fill="currentColor" />
              </span>
            )}
            {item.media_type === 'video' && (
              <span className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white">
                <Video size={10} />
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-1">
                {!item.is_cover && (
                  <button
                    onClick={() => handleSetCover(item)}
                    className="p-1 rounded-full bg-white/20 text-white hover:bg-white/40"
                    aria-label="Set as cover"
                    title="Set as cover"
                  >
                    <Star size={12} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1 rounded-full bg-red-600/80 text-white hover:bg-red-600"
                  aria-label="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="p-1 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30"
                  aria-label="Move earlier"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  onClick={() => handleMove(index, 1)}
                  disabled={index === items.length - 1}
                  className="p-1 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30"
                  aria-label="Move later"
                >
                  <ArrowDown size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setUploadType('image')}
            className={`px-2 py-1.5 text-xs font-medium flex items-center gap-1 ${
              uploadType === 'image' ? 'bg-navy-700 text-white' : 'bg-white text-slate-600'
            }`}
          >
            <ImageIcon size={12} /> Image
          </button>
          <button
            type="button"
            onClick={() => setUploadType('video')}
            className={`px-2 py-1.5 text-xs font-medium flex items-center gap-1 ${
              uploadType === 'video' ? 'bg-navy-700 text-white' : 'bg-white text-slate-600'
            }`}
          >
            <Video size={12} /> Video
          </button>
        </div>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
        />
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-700 text-white text-xs font-medium hover:bg-navy-800 cursor-pointer">
          {uploading ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
          Add
          <input
            type="file"
            accept={uploadType === 'image' ? 'image/*' : 'video/*'}
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
