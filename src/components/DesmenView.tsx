import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Rocket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ViewKey } from '@/data';

interface DesmenViewProps {
  onNavigate: (view: ViewKey) => void;
}

export default function DesmenView({ onNavigate }: DesmenViewProps) {
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['desmen_tagline', 'desmen_description']);
      for (const row of data || []) {
        if (row.key === 'desmen_tagline') setTagline(row.value || '');
        if (row.key === 'desmen_description') setDescription(row.value || '');
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy-700 transition-colors mb-10"
      >
        <ArrowLeft size={16} />
        Back to portfolio
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center">
          <Rocket className="text-white" size={22} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">DESMEN</h1>
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-navy-600" size={28} />
      ) : (
        <>
          {tagline && <p className="text-lg text-navy-700 font-medium mb-6">{tagline}</p>}
          {description ? (
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{description}</p>
          ) : (
            <p className="text-slate-400 text-sm">Content coming soon.</p>
          )}
        </>
      )}
    </div>
  );
}
