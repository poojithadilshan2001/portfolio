import { useState, useEffect } from 'react';
import { Download, FileText, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { contactInfo } from '@/data';

export default function ContactView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'cv_url')
      .single()
      .then(({ data }) => { if (data?.value) setCvUrl(data.value); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus('sending');
    setErrorMsg('');

    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    if (error) {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again or email me directly.');
    } else {
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Let's Connect</h1>
        <p className="mt-3 text-slate-600 max-w-2xl text-lg leading-relaxed">
          I am currently looking for an opportunity to begin my engineering career and
          contribute to a professional team. If you are hiring for a mechanical design,
          CAD, or engineering role — I would love to hear from you.
        </p>
        <p className="mt-2 text-slate-500">
          Open to graduate engineer roles, internships, and project collaborations.
        </p>
      </div>

      {/* Contact Info */}
      <div className="grid sm:grid-cols-2 gap-5 mb-14">
        {contactInfo.map((info) => {
          const Icon = info.icon;
          const content = (
            <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-navy-200 transition-all">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center">
                <Icon className="text-white" size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">{info.label}</p>
                <p className="text-slate-800 font-semibold break-all">{info.value}</p>
              </div>
            </div>
          );
          return info.href ? (
            <a
              key={info.label}
              href={info.href}
              target={info.href.startsWith('http') ? '_blank' : undefined}
              rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="block"
            >
              {content}
            </a>
          ) : (
            <div key={info.label}>{content}</div>
          );
        })}
      </div>

      {/* Contact Form */}
      <section className="mb-14">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Send a Message</h2>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Tell me about your project or inquiry..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {status === 'sent' && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-fade-in">
              <CheckCircle2 size={18} />
              Message sent successfully! I'll get back to you soon.
            </div>
          )}
          {status === 'error' && (
            <p className="text-red-600 text-sm font-medium">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-navy-700 text-white font-semibold hover:bg-navy-800 transition-all hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === 'sending' ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Message
              </>
            )}
          </button>
        </form>
      </section>

      {/* Resume Section */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Resume</h2>
        {cvUrl ? (
          <>
            <div className="rounded-2xl border border-slate-200 overflow-hidden mb-6 bg-slate-50" style={{ height: '70vh' }}>
              <iframe
                src={cvUrl + '#toolbar=0&navpanes=0'}
                className="w-full h-full"
                title="CV"
              />
            </div>
            <a
              href={cvUrl}
              download="Poojitha_Dilshan_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-navy-700 text-white font-semibold hover:bg-navy-800 transition-all hover:scale-105 shadow-lg"
            >
              <Download size={20} />
              Download Full CV as PDF
            </a>
          </>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 aspect-[16/10] flex flex-col items-center justify-center">
            <FileText className="text-slate-400 mb-4" size={56} />
            <p className="text-slate-500 font-medium text-center px-4">CV not uploaded yet</p>
            <p className="text-sm text-slate-400 mt-1">Upload from the admin panel</p>
          </div>
        )}
      </section>
    </div>
  );
}
