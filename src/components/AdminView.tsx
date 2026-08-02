import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Loader2,
  LogOut,
  Trash2,
  Upload,
  ImagePlus,
  UserCircle2,
  FolderKanban,
  Rocket,
  Save,
  Pencil,
  ArrowUp,
  ArrowDown,
  Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EntityMediaManager from '@/components/admin/EntityMediaManager';

interface GalleryCategory {
  id: string;
  name: string;
  sort_order: number;
}

interface ResearchEntry {
  id: string;
  title: string;
  sort_order: number;
}

interface ProjectRow {
  id: string;
  title: string;
  overview: string | null;
  image_url: string | null;
  sort_order: number;
}

interface SubprojectRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

interface CertificationRow {
  id: string;
  title: string;
  issuer: string | null;
  issued_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  image_url: string | null;
  sort_order: number;
}

interface LeadershipRow {
  id: string;
  role: string;
  org: string | null;
  period: string | null;
  image_url: string | null;
  sort_order: number;
}


async function uploadToMedia(file: File, folder: string) {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('portfolio-media').upload(path, file);
  if (error) return { url: null, error };
  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

async function removeFromMedia(url: string) {
  const path = url.split('/portfolio-media/')[1];
  if (path) await supabase.storage.from('portfolio-media').remove([path]);
}

function AuthGate({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'info',
          text: 'Account created. If email confirmation is enabled on this Supabase project, check your inbox before signing in.',
        });
        setMode('signin');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        onSignedIn();
      }
    }
    setBusy(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-32">
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Admin Access</h1>
        <p className="text-sm text-slate-500 mb-6">
          {mode === 'signin' ? 'Sign in to manage your site content.' : 'Create your one owner account.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-navy-600'}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-700 text-white font-semibold hover:bg-navy-800 transition-all disabled:opacity-60"
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setMessage(null);
          }}
          className="mt-4 text-sm text-navy-600 hover:underline"
        >
          {mode === 'signin' ? "First time here? Create your account" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

function GalleryManager() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [covers, setCovers] = useState<Record<string, { url: string; type: string }>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: catData } = await supabase
      .from('gallery_categories')
      .select('id, name, sort_order')
      .order('sort_order', { ascending: true });
    const cats = (catData || []) as GalleryCategory[];
    setCategories(cats);

    if (cats.length > 0) {
      const { data: mediaData } = await supabase
        .from('entity_media')
        .select('entity_id, media_url, media_type, is_cover, sort_order')
        .eq('entity_type', 'gallery')
        .order('sort_order', { ascending: true });
      const coverMap: Record<string, { url: string; type: string }> = {};
      for (const m of mediaData || []) {
        const existing = coverMap[m.entity_id];
        if (m.is_cover && m.media_type !== 'video') {
          coverMap[m.entity_id] = { url: m.media_url, type: m.media_type };
        } else if (!existing && m.media_type !== 'video') {
          coverMap[m.entity_id] = { url: m.media_url, type: m.media_type };
        } else if (!existing) {
          coverMap[m.entity_id] = { url: m.media_url, type: m.media_type };
        }
      }
      setCovers(coverMap);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMoveCategory = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const a = categories[index];
    const b = categories[target];
    await supabase.from('gallery_categories').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('gallery_categories').update({ sort_order: a.sort_order }).eq('id', b.id);
    await load();
  };

  if (loading) return <Loader2 className="animate-spin text-navy-600 mx-auto" size={28} />;

  return (
    <div>
      <h2 className="font-semibold text-slate-800 mb-2">Gallery categories</h2>
      <p className="text-sm text-slate-500 mb-6">
        Upload photos &amp; videos per category. Click the ★ star on any item to make it the cover shown on the site.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((cat, index) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              {covers[cat.id]?.url ? (
                <img
                  src={covers[cat.id].url}
                  alt={cat.name}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                  <ImagePlus size={18} className="text-navy-400" />
                </div>
              )}
              <p className="flex-1 font-medium text-slate-800 text-sm">{cat.name}</p>
              <button
                onClick={() => handleMoveCategory(index, -1)}
                disabled={index === 0}
                className="p-1 rounded text-slate-400 hover:text-navy-600 hover:bg-navy-50 disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => handleMoveCategory(index, 1)}
                disabled={index === categories.length - 1}
                className="p-1 rounded text-slate-400 hover:text-navy-600 hover:bg-navy-50 disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown size={14} />
              </button>
            </div>
            <EntityMediaManager entityType="gallery" entityId={cat.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePhotoManager() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [currentMediaType, setCurrentMediaType] = useState<string>('image');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['profile_photo_url', 'profile_media_type']);
    for (const row of data || []) {
      if (row.key === 'profile_photo_url') setCurrentUrl(row.value || null);
      if (row.key === 'profile_media_type') setCurrentMediaType(row.value || 'image');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');

    const isVideo = file.type.startsWith('video/');
    const ext = file.name.split('.').pop();
    const path = `profile/profile-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('portfolio-media').upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('portfolio-media').getPublicUrl(path);
    const mediaType = isVideo ? 'video' : 'image';

    const { error: upsertError } = await supabase
      .from('site_settings')
      .upsert([
        { key: 'profile_photo_url', value: publicUrlData.publicUrl },
        { key: 'profile_media_type', value: mediaType },
      ], { onConflict: 'key' });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      await load();
    }
    setUploading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
        <UserCircle2 size={18} className="text-navy-600" />
        Home page profile photo or video
      </h2>
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          {currentUrl ? (
            currentMediaType === 'video' ? (
              <video src={currentUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={currentUrl} alt="Profile" className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <UserCircle2 size={40} />
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-2">Accepts images or videos (video plays on loop in hero)</p>
          <input type="file" accept="image/*,video/*" onChange={handleFile} disabled={uploading} className="text-sm text-slate-600" />
          {uploading && <p className="text-sm text-slate-500 mt-2">Uploading...</p>}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function ResearchMediaManager() {
  const [allResearch, setAllResearch] = useState<ResearchEntry[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newPeriod, setNewPeriod] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newHardware, setNewHardware] = useState('');
  const [newSoftware, setNewSoftware] = useState('');
  const [creating, setCreating] = useState(false);

  const loadResearchList = async (keepSelected?: string) => {
    setLoading(true);
    const { data } = await supabase.from('researches').select('id, title, sort_order').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    const rows = (data || []) as ResearchEntry[];
    setAllResearch(rows);
    const nextSelected = keepSelected && rows.find((r) => r.id === keepSelected) ? keepSelected : rows[0]?.id || '';
    setSelectedId(nextSelected);
    setLoading(false);
  };

  const handleMoveResearch = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= allResearch.length) return;
    const a = allResearch[index];
    const b = allResearch[target];
    await supabase.from('researches').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('researches').update({ sort_order: a.sort_order }).eq('id', b.id);
    await loadResearchList(selectedId);
  };

  useEffect(() => {
    loadResearchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError('');

    const { data, error: insertError } = await supabase
      .from('researches')
      .insert({
        title: newTitle.trim(),
        period: newPeriod.trim() || null,
        description: newDescription.trim() || null,
        hardware_architecture: newHardware.trim() || null,
        software_integration: newSoftware.trim() || null,
      })
      .select('id')
      .single();

    if (insertError) {
      setError(insertError.message);
    } else {
      setNewTitle('');
      setNewPeriod('');
      setNewDescription('');
      setNewHardware('');
      setNewSoftware('');
      await loadResearchList(data?.id);
    }
    setCreating(false);
  };

  if (loading) return <Loader2 className="animate-spin text-navy-600 mx-auto" size={28} />;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-semibold text-slate-800 mb-4">Add a new research project</h2>
        <form onSubmit={handleCreateResearch} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Period</label>
            <input
              type="text"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
              placeholder="e.g. 2026 - Present"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Hardware Architecture</label>
            <textarea
              value={newHardware}
              onChange={(e) => setNewHardware(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Software Integration</label>
            <textarea
              value={newSoftware}
              onChange={(e) => setNewSoftware(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-700 text-white font-semibold hover:bg-navy-800 disabled:opacity-60"
          >
            {creating ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            Add Research Project
          </button>
        </form>
      </div>

      {allResearch.length === 0 ? (
        <p className="text-slate-500 text-sm">No research entries yet — add one above.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-slate-800 mb-3">Research projects (reorder &amp; manage media)</h2>
            <div className="space-y-3">
              {allResearch.map((r, idx) => (
                <div
                  key={r.id}
                  className={`bg-white rounded-2xl border p-4 cursor-pointer transition-colors ${selectedId === r.id ? 'border-navy-400 bg-navy-50/30' : 'border-slate-200 hover:border-navy-200'}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <p className="flex-1 font-medium text-slate-800 text-sm">{r.title}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveResearch(idx, -1); }}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-navy-600 hover:bg-navy-50 disabled:opacity-30"
                      aria-label="Move earlier"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveResearch(idx, 1); }}
                      disabled={idx === allResearch.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-navy-600 hover:bg-navy-50 disabled:opacity-30"
                      aria-label="Move later"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  {selectedId === r.id && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <p className="text-xs text-slate-500 mb-2">Media for this research:</p>
                      <EntityMediaManager entityType="research" entityId={r.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SubprojectRowEditor({
  sp,
  onSave,
  onCancel,
}: {
  sp: SubprojectRow;
  onSave: (title: string, description: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(sp.title);
  const [description, setDescription] = useState(sp.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(title, description);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl border border-navy-200 p-4 space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 resize-none"
      />
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">Photos</label>
        <EntityMediaManager entityType="subproject" entityId={sp.id} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-navy-700 text-white text-sm font-medium hover:bg-navy-800 disabled:opacity-60"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ProjectsManager() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [subprojects, setSubprojects] = useState<SubprojectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projOverview, setProjOverview] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const [subCovers, setSubCovers] = useState<Record<string, { url: string; type: string }>>({});

  const load = async () => {
    setLoading(true);
    const { data: projData } = await supabase
      .from('projects')
      .select('id, title, overview, image_url, sort_order')
      .order('sort_order');
    const projRows = (projData || []) as ProjectRow[];
    setProjects(projRows);
    if (projRows.length > 0 && !newProjectId) setNewProjectId(projRows[0].id);

    const { data: subData } = await supabase.from('subprojects').select('*').order('project_id').order('sort_order');
    setSubprojects((subData || []) as SubprojectRow[]);

    const { data: mediaData } = await supabase
      .from('entity_media')
      .select('entity_id, media_url, media_type, is_cover, sort_order')
      .eq('entity_type', 'subproject')
      .order('sort_order', { ascending: true });
    const coverMap: Record<string, { url: string; type: string }> = {};
    for (const m of mediaData || []) {
      const existing = coverMap[m.entity_id];
      if (m.is_cover && m.media_type !== 'video') {
        coverMap[m.entity_id] = { url: m.media_url, type: m.media_type };
      } else if (!existing && m.media_type !== 'video') {
        coverMap[m.entity_id] = { url: m.media_url, type: m.media_type };
      }
    }
    setSubCovers(coverMap);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEditProject = (p: ProjectRow) => {
    setEditingProjectId(p.id);
    setProjTitle(p.title);
    setProjOverview(p.overview || '');
  };

  const handleSaveProject = async (p: ProjectRow) => {
    setSavingProject(true);
    await supabase
      .from('projects')
      .update({ title: projTitle.trim(), overview: projOverview.trim() || null })
      .eq('id', p.id);
    setEditingProjectId(null);
    setSavingProject(false);
    await load();
  };

  const handleMoveProject = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const a = projects[index];
    const b = projects[target];
    await supabase.from('projects').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('projects').update({ sort_order: a.sort_order }).eq('id', b.id);
    await load();
  };

  const handleMoveSubproject = async (sp: SubprojectRow, direction: -1 | 1) => {
    const siblings = subprojects.filter((s) => s.project_id === sp.project_id);
    const index = siblings.findIndex((s) => s.id === sp.id);
    const target = index + direction;
    if (target < 0 || target >= siblings.length) return;
    const a = siblings[index];
    const b = siblings[target];
    await supabase.from('subprojects').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('subprojects').update({ sort_order: a.sort_order }).eq('id', b.id);
    await load();
  };

  const handleAddSubproject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProjectId) return;
    setAdding(true);
    setError('');

    const { error: insertError } = await supabase.from('subprojects').insert({
      project_id: newProjectId,
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      sort_order: subprojects.filter((s) => s.project_id === newProjectId).length,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setNewTitle('');
      setNewDescription('');
      await load();
    }
    setAdding(false);
  };

  const handleDeleteSubproject = async (sp: SubprojectRow) => {
    const { data: mediaRows } = await supabase
      .from('entity_media')
      .select('media_url')
      .eq('entity_type', 'subproject')
      .eq('entity_id', sp.id);
    await supabase.from('entity_media').delete().eq('entity_type', 'subproject').eq('entity_id', sp.id);
    for (const m of mediaRows || []) await removeFromMedia(m.media_url);
    await supabase.from('subprojects').delete().eq('id', sp.id);
    await load();
  };

  const handleSaveEditSubproject = async (sp: SubprojectRow, title: string, description: string) => {
    await supabase
      .from('subprojects')
      .update({ title: title.trim(), description: description.trim() || null })
      .eq('id', sp.id);
    setEditingId(null);
    await load();
  };

  if (loading) return <Loader2 className="animate-spin text-navy-600 mx-auto" size={28} />;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-semibold text-slate-800 mb-2">Category photos</h2>
        <p className="text-sm text-slate-500 mb-4">
          Upload as many as you like; click the star on a photo to make it the cover shown on the site.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((p, index) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                {editingProjectId === p.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800"
                    />
                    <textarea
                      value={projOverview}
                      onChange={(e) => setProjOverview(e.target.value)}
                      rows={3}
                      placeholder="Overview"
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveProject(p)}
                        disabled={savingProject || !projTitle.trim()}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-navy-700 text-white text-xs font-medium hover:bg-navy-800 disabled:opacity-60"
                      >
                        <Save size={12} /> Save
                      </button>
                      <button
                        onClick={() => setEditingProjectId(null)}
                        className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-slate-800 text-sm">{p.title}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveProject(index, -1)}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-navy-600 hover:bg-navy-50 disabled:opacity-30"
                        aria-label="Move earlier"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveProject(index, 1)}
                        disabled={index === projects.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-navy-600 hover:bg-navy-50 disabled:opacity-30"
                        aria-label="Move later"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => startEditProject(p)}
                        className="p-1 rounded text-slate-400 hover:text-navy-600 hover:bg-navy-50"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
              <EntityMediaManager entityType="project" entityId={p.id} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FolderKanban size={18} className="text-navy-600" />
          Add a sub-project
        </h2>
        <form onSubmit={handleAddSubproject} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 resize-none"
            />
          </div>
          <p className="text-xs text-slate-400">You can add photos after creating the sub-project, below.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-700 text-white font-semibold hover:bg-navy-800 disabled:opacity-60"
          >
            {adding ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            Add Sub-project
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-4">Existing sub-projects</h2>
        <div className="space-y-6">
          {projects.map((p) => {
            const items = subprojects.filter((s) => s.project_id === p.id);
            if (items.length === 0) return null;
            return (
              <div key={p.id}>
                <h3 className="text-sm font-semibold text-slate-600 mb-2">{p.title}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {items.map((sp, spIndex) =>
                    editingId === sp.id ? (
                      <SubprojectRowEditor
                        key={sp.id}
                        sp={sp}
                        onSave={(title, description) => handleSaveEditSubproject(sp, title, description)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                    <div key={sp.id} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3">
                      <div className="w-14 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {subCovers[sp.id]?.url && (
                          <img src={subCovers[sp.id].url} alt={sp.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <p className="flex-1 text-sm text-slate-700 truncate">{sp.title}</p>
                      <button
                        onClick={() => handleMoveSubproject(sp, -1)}
                        disabled={spIndex === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-navy-600 hover:bg-navy-50 disabled:opacity-30"
                        aria-label="Move earlier"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveSubproject(sp, 1)}
                        disabled={spIndex === items.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-navy-600 hover:bg-navy-50 disabled:opacity-30"
                        aria-label="Move later"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(sp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-navy-600 hover:bg-navy-50"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSubproject(sp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VenturesManager() {
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['desmen_tagline', 'desmen_description']);
    for (const row of data || []) {
      if (row.key === 'desmen_tagline') setTagline(row.value || '');
      if (row.key === 'desmen_description') setDescription(row.value || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await supabase
      .from('site_settings')
      .upsert([
        { key: 'desmen_tagline', value: tagline.trim() || null },
        { key: 'desmen_description', value: description.trim() || null },
      ], { onConflict: 'key' });
    setSaving(false);
    setSaved(true);
  };

  if (loading) return <Loader2 className="animate-spin text-navy-600 mx-auto" size={28} />;

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2">
        <Rocket size={18} className="text-navy-600" />
        DESMEN page content
      </h2>
      <p className="text-sm text-slate-500">
        This text appears on the separate DESMEN page, reachable from a small link in the site footer
        (kept off the main navigation and out of your job-facing profile).
      </p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tagline</label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="e.g. A small hardware studio for practical product ideas"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          placeholder="Explain what DESMEN does, in your own words."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 resize-none"
        />
      </div>
      {saved && <p className="text-sm text-navy-600">Saved.</p>}
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-700 text-white font-semibold hover:bg-navy-800 disabled:opacity-60"
      >
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        Save
      </button>
    </form>
  );
}

function CertificationsManager() {
  const [certs, setCerts] = useState<CertificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newIssuer, setNewIssuer] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCredentialId, setNewCredentialId] = useState('');
  const [newCredentialUrl, setNewCredentialUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('certifications').select('*').order('sort_order', { ascending: true });
    setCerts((data || []) as CertificationRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    setError('');

    const { error: insertError } = await supabase.from('certifications').insert({
      title: newTitle.trim(),
      issuer: newIssuer.trim() || null,
      issued_date: newDate.trim() || null,
      credential_id: newCredentialId.trim() || null,
      credential_url: newCredentialUrl.trim() || null,
      sort_order: certs.length,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setNewTitle('');
      setNewIssuer('');
      setNewDate('');
      setNewCredentialId('');
      setNewCredentialUrl('');
      await load();
    }
    setAdding(false);
  };

  const handleDelete = async (cert: CertificationRow) => {
    const { data: mediaRows } = await supabase
      .from('entity_media')
      .select('media_url')
      .eq('entity_type', 'certification')
      .eq('entity_id', cert.id);
    await supabase.from('entity_media').delete().eq('entity_type', 'certification').eq('entity_id', cert.id);
    for (const m of mediaRows || []) await removeFromMedia(m.media_url);
    await supabase.from('certifications').delete().eq('id', cert.id);
    await load();
  };

  if (loading) return <Loader2 className="animate-spin text-navy-600 mx-auto" size={28} />;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-semibold text-slate-800 mb-4">Existing certifications</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {certs.map((cert) => (
            <div key={cert.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{cert.title}</p>
                  <p className="text-xs text-slate-400">{cert.issuer} · {cert.issued_date}</p>
                </div>
                <button
                  onClick={() => handleDelete(cert)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <EntityMediaManager entityType="certification" entityId={cert.id} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-4">Add a certification</h2>
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Issuer</label>
              <input
                type="text"
                value={newIssuer}
                onChange={(e) => setNewIssuer(e.target.value)}
                placeholder="e.g. Udemy"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Issued</label>
              <input
                type="text"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="e.g. Nov 2025"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Credential ID</label>
            <input
              type="text"
              value={newCredentialId}
              onChange={(e) => setNewCredentialId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Credential URL (optional)</label>
            <input
              type="url"
              value={newCredentialUrl}
              onChange={(e) => setNewCredentialUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
          <p className="text-xs text-slate-400">You can add photos after creating the certification, below.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-700 text-white font-semibold hover:bg-navy-800 disabled:opacity-60"
          >
            {adding ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            Add Certification
          </button>
        </form>
      </div>
    </div>
  );
}

function LeadershipManager() {
  const [items, setItems] = useState<LeadershipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newRole, setNewRole] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newPeriod, setNewPeriod] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('leadership').select('*').order('sort_order', { ascending: true });
    setItems((data || []) as LeadershipRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    setAdding(true);
    setError('');

    const { error: insertError } = await supabase.from('leadership').insert({
      role: newRole.trim(),
      org: newOrg.trim() || null,
      period: newPeriod.trim() || null,
      sort_order: items.length,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setNewRole('');
      setNewOrg('');
      setNewPeriod('');
      await load();
    }
    setAdding(false);
  };

  const handleDelete = async (item: LeadershipRow) => {
    const { data: mediaRows } = await supabase
      .from('entity_media')
      .select('media_url')
      .eq('entity_type', 'leadership')
      .eq('entity_id', item.id);
    await supabase.from('entity_media').delete().eq('entity_type', 'leadership').eq('entity_id', item.id);
    for (const m of mediaRows || []) await removeFromMedia(m.media_url);
    await supabase.from('leadership').delete().eq('id', item.id);
    await load();
  };

  if (loading) return <Loader2 className="animate-spin text-navy-600 mx-auto" size={28} />;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-semibold text-slate-800 mb-4">Existing entries</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{item.role}</p>
                  <p className="text-xs text-slate-400 truncate">{item.org} · {item.period}</p>
                </div>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <EntityMediaManager entityType="leadership" entityId={item.id} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-4">Add an entry</h2>
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
            <input
              type="text"
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Period</label>
            <input
              type="text"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
              placeholder="e.g. 2025 – 2026"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
          <p className="text-xs text-slate-400">You can add photos after creating the entry, above.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={adding || !newRole.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-700 text-white font-semibold hover:bg-navy-800 disabled:opacity-60"
          >
            {adding ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            Add Entry
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminView() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<
    'gallery' | 'profile' | 'research' | 'projects' | 'ventures' | 'certifications' | 'leadership'
  >('gallery');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-navy-600" size={32} />
      </div>
    );
  }

  if (!session) {
    return <AuthGate onSignedIn={() => {}} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Content Admin</h1>
          <p className="text-sm text-slate-500">{session.user.email}</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {(['gallery', 'profile', 'research', 'projects', 'certifications', 'leadership', 'ventures'] as const).map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-navy-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'gallery' && 'Gallery'}
              {t === 'profile' && 'Profile Photo'}
              {t === 'research' && 'Research'}
              {t === 'projects' && 'Projects'}
              {t === 'certifications' && 'Certifications'}
              {t === 'leadership' && 'Leadership'}
              {t === 'ventures' && 'Ventures'}
            </button>
          )
        )}
      </div>

      {tab === 'gallery' && <GalleryManager />}
      {tab === 'profile' && <ProfilePhotoManager />}
      {tab === 'research' && <ResearchMediaManager />}
      {tab === 'projects' && <ProjectsManager />}
      {tab === 'certifications' && <CertificationsManager />}
      {tab === 'leadership' && <LeadershipManager />}
      {tab === 'ventures' && <VenturesManager />}
    </div>
  );
}
