import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Zap, Globe, Camera, Download, Brain, ArrowRight, Cpu, ChevronRight, Play } from 'lucide-react';
import { solveLocally, canSolveLocally } from '../engine/mathEngine';
import { BlockMath } from 'react-katex';
import { LanguagePicker } from '../components/LanguagePicker';
import { ThemeToggle } from '../components/ThemeToggle';

const features = [
  {
    icon: <Zap size={24} />,
    title: 'Instant Solving',
    description: 'Solve algebra, calculus, and more instantly — right in your browser with zero API calls.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: <Brain size={24} />,
    title: 'Step-by-Step',
    description: 'Every solution shows clear, detailed steps so you understand the process, not just the answer.',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: <Camera size={24} />,
    title: 'Image OCR',
    description: 'Snap a photo of any math problem — handwritten or printed — and we\'ll extract and solve it.',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: <Globe size={24} />,
    title: 'Works Offline',
    description: 'Our local math engine runs entirely in your browser. No internet? No problem.',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: <Download size={24} />,
    title: 'PDF & LaTeX Export',
    description: 'Download solutions as beautifully formatted PDFs or LaTeX files for your assignments.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: <Sparkles size={24} />,
    title: '100% Free',
    description: 'No subscriptions, no paywalls on basic features. Premium math solving for everyone.',
    color: 'from-violet-500 to-fuchsia-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
];

const demoProblems = [
  'x^2 + 5x + 6 = 0',
  'derivative of x^3 + 2x',
  'integrate x^2',
  'factor x^2 - 9',
  '3x + 7 = 22',
  'expand (x+3)^2',
];

export default function LandingPage() {
  const { t } = useTranslation();
  const [demoInput, setDemoInput] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  // JSON-LD for SEO
  useEffect(() => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'MathMate.AI',
      url: window.location.origin,
      description: 'Free, instant math solver with step-by-step solutions, graphing, image OCR, and PDF export. Works offline.',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: 'Math solving, Step-by-step solutions, 3D Graphing, OCR, PDF Export, LaTeX Export, Practice Mode',
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const handleDemoSolve = (e) => {
    e?.preventDefault();
    if (!demoInput.trim()) return;

    setDemoLoading(true);
    setDemoResult(null);

    // Small delay for visual feedback
    setTimeout(() => {
      const result = solveLocally(demoInput);
      if (result.success) {
        setDemoResult(result.data);
      } else {
        setDemoResult({ error: 'Sign up for free to unlock AI-powered solving for complex problems!' });
      }
      setDemoLoading(false);
    }, 300);
  };

  const tryProblem = (problem) => {
    setDemoInput(problem);
    setDemoResult(null);
    setDemoLoading(true);
    setTimeout(() => {
      const result = solveLocally(problem);
      if (result.success) setDemoResult(result.data);
      setDemoLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-900/15 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-900/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-900/5 blur-[200px] rounded-full"></div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-2xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">∑</span>
            </div>
            <span className="text-xl font-black tracking-tighter">
              MathMate<span className="text-indigo-400">.AI</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguagePicker />
            <ThemeToggle />
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors px-4 py-2 text-sm font-medium">
              {t('nav.signIn')}
            </Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5">
              {t('nav.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8 animate-in fade-in duration-700">
          <Cpu size={14} />
          {t('landing.badge')}
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {t('landing.heroTitle1')}
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-cyan-400 to-emerald-400">
            {t('landing.heroTitle2')}
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          {t('landing.heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link to="/register" className="group inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
            {t('landing.startSolving')}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#demo" className="inline-flex items-center gap-2 text-gray-400 hover:text-white px-6 py-3.5 rounded-xl text-lg font-medium transition-colors hover:bg-white/5">
            <Play size={18} />
            {t('landing.tryDemo')}
          </a>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Try it right now</h2>
          <p className="text-gray-400">No sign-up needed. Type a problem or click an example below.</p>
        </div>

        {/* Quick try buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {demoProblems.map((problem) => (
            <button
              key={problem}
              onClick={() => tryProblem(problem)}
              className="px-3 py-1.5 text-xs font-mono bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-indigo-500/30 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              {problem}
            </button>
          ))}
        </div>

        {/* Demo solver */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleDemoSolve} className="flex gap-3">
            <input
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              placeholder="Type any math problem..."
              className="flex-1 bg-gray-950/80 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={demoLoading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles size={18} className={demoLoading ? 'animate-spin' : ''} />
              Solve
            </button>
          </form>

          {/* Demo result */}
          {demoResult && !demoResult.error && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-5">
                <h3 className="text-xs font-bold tracking-widest text-cyan-500 uppercase mb-3 flex items-center gap-2">
                  <Play size={12} /> Answer
                </h3>
                <div className="text-xl font-semibold text-white overflow-x-auto">
                  {demoResult.latex ? <BlockMath math={demoResult.latex} /> : demoResult.answer}
                </div>
              </div>

              {demoResult.steps?.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Steps</h3>
                  <div className="space-y-3">
                    {demoResult.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-700 bg-gray-900 text-gray-400 text-xs shrink-0 mt-0.5">
                          {step.step || idx + 1}
                        </span>
                        <div className="flex-1 text-sm">
                          <p className="text-gray-300 mb-1">{step.description}</p>
                          {step.latex && (
                            <div className="bg-gray-950/80 px-3 py-2 rounded-lg border border-gray-800/80 overflow-x-auto">
                              <BlockMath math={step.latex} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Cpu size={12} />
                  Solved locally in your browser — no API used
                </span>
              </div>
            </div>
          )}

          {demoResult?.error && (
            <div className="mt-6 text-center py-8 animate-in fade-in duration-300">
              <p className="text-gray-400 mb-4">{demoResult.error}</p>
              <Link to="/register" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all text-sm">
                Sign Up Free <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('landing.featuresTitle')}</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            {t('landing.featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`group ${feature.bg} border ${feature.border} rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
            >
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="bg-linear-to-br from-indigo-900/30 to-cyan-900/20 border border-indigo-500/20 rounded-3xl p-10 sm:p-14 text-center backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('landing.ctaTitle')}</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            {t('landing.ctaSubtitle')}
          </p>
          <Link to="/register" className="group inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3.5 rounded-xl text-lg font-bold transition-all shadow-xl hover:shadow-white/10 hover:-translate-y-0.5">
            {t('landing.ctaButton')}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 bg-gray-900/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">∑</span>
            </div>
            <span className="font-bold tracking-tight">MathMate<span className="text-indigo-400">.AI</span></span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 MathMate.AI — Made for mathematicians, students, and engineers</p>
        </div>
      </footer>
    </div>
  );
}
