import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';
import { decodeSolution } from '../engine/shareEngine';
import { Card } from '../components/ui/Card';
import { GraphViewer } from '../components/GraphViewer';
import { BlockMath, InlineMath } from 'react-katex';

const renderTextWithMath = (text) => {
  if (!text) return null;
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) return <BlockMath key={index} math={part.slice(2, -2)} />;
    if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
    return <span key={index}>{part}</span>;
  });
};

export default function SharedSolution() {
  const { hash } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  useEffect(() => {
    if (!hash) { setError(true); return; }
    const decoded = decodeSolution(hash);
    if (decoded) {
      setData(decoded);
      // Inject JSON-LD structured data for SEO
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MathSolver',
        name: 'MathMate.AI',
        url: window.location.href,
        description: `Solution for: ${decoded.input}`,
        potentialAction: {
          '@type': 'SolveMathAction',
          'eduQuestionType': 'Math Problem',
          target: window.location.href,
        },
      };
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
      return () => document.head.removeChild(script);
    }
    else setError(true);
  }, [hash]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Invalid Share Link</h1>
          <p className="text-gray-400 mb-8">This solution link is invalid or corrupted.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Go to MathMate.AI <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading solution...</div>
      </div>
    );
  }

  const { input, solution } = data;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-900/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-cyan-900/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">∑</span>
            </div>
            <span className="text-xl font-black tracking-tighter">
              MathMate<span className="text-indigo-400">.AI</span>
            </span>
          </Link>
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
            Try It Free
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Problem */}
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Shared Solution</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white overflow-x-auto">
            <BlockMath math={input} />
          </h1>
        </div>

        {/* Graph */}
        {solution.graphExpression && <GraphViewer equation={solution.graphExpression} />}

        {/* Answer */}
        <Card hoverEffect className="border-cyan-500/20 bg-cyan-950/10">
          <h3 className="text-sm font-bold tracking-widest text-cyan-500 uppercase mb-4 flex items-center gap-2">
            <Play size={14} /> Answer
          </h3>
          <div className="text-xl sm:text-2xl font-semibold text-white overflow-x-auto">
            {solution.latex ? <BlockMath math={solution.latex} /> : solution.answer}
          </div>
        </Card>

        {/* Steps */}
        {solution.steps?.length > 0 && (
          <Card className="border-gray-800/50">
            <h3 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-6">Steps</h3>
            <div className="space-y-4">
              {solution.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border border-gray-800 bg-gray-950 flex items-center justify-center text-gray-400 text-sm shrink-0">
                    {step.step || idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm mb-2">{renderTextWithMath(step.description)}</div>
                    {step.latex && (
                      <div className="bg-gray-950/80 px-4 py-3 rounded-lg border border-gray-800/80 overflow-x-auto">
                        <BlockMath math={step.latex} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Embed Widget */}
        <div className="pt-4">
          <button
            onClick={() => {
              const embedCode = `<iframe src="${window.location.href}" width="100%" height="600" frameborder="0" style="border-radius:12px;border:1px solid #374151"></iframe>`;
              navigator.clipboard.writeText(embedCode).catch(() => {});
              setEmbedCopied(true);
              setTimeout(() => setEmbedCopied(false), 2000);
            }}
            className="text-xs text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {embedCopied ? '✓ Embed code copied!' : '< /> Copy embed code'}
          </button>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <p className="text-gray-400 mb-4">Want to solve your own problems?</p>
          <Link to="/register" className="group inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all shadow-xl shadow-indigo-500/20">
            Get Started Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
}
