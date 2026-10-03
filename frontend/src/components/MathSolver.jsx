import React, { useState, useRef, useEffect } from 'react';
import { Play, Sparkles, Cpu, Cloud, FileDown, FileText, Share2, Check } from 'lucide-react';
import { solveService } from '../services/api';
import { solveLocally, canSolveLocally, detectProblemType, getTypeInfo, getRelatedProblems } from '../engine/mathEngine';
import { exportToPdf, exportToLatex } from '../engine/exportEngine';
import { addToHistory } from './History';
import { getShareUrl, copyToClipboard } from '../engine/shareEngine';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Loader } from './ui/Loader';
import { OcrUpload } from './OcrUpload';
import { GraphViewer } from './GraphViewer';
import { MathKeyboard } from './MathKeyboard';

import { BlockMath, InlineMath } from 'react-katex';

const renderTextWithMath = (text) => {
  if (!text) return null;
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <BlockMath key={index} math={part.slice(2, -2)} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={index} math={part.slice(1, -1)} />;
    }
    return <span key={index}>{part}</span>;
  });
};

export const MathSolver = ({ onHistoryUpdate, initialInput = '' }) => {
  const [input, setInput] = useState(initialInput);

  useEffect(() => {
    if (initialInput) setInput(initialInput);
  }, [initialInput]);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState('');
  const [solveMethod, setSolveMethod] = useState(null);
  const [copied, setCopied] = useState(false);
  const [problemType, setProblemType] = useState(null);
  const inputRef = useRef(null);

  const handleSolve = async (e) => {
    e?.preventDefault();
    if (!input) return setError("Please enter an equation.");
    
    setError('');
    setLoading(true);
    setSolution(null);
    setSolveMethod(null);
    const detected = detectProblemType(input);
    setProblemType(detected);

    // Strategy: Try local engine first, fall back to API
    if (canSolveLocally(input)) {
      const localResult = solveLocally(input);
      if (localResult.success) {
        setSolution(localResult.data);
        setSolveMethod('local');
        setLoading(false);
        addToHistory(input, localResult.data);
        onHistoryUpdate?.();
        return;
      }
    }

    // Fallback to cloud API
    try {
      setSolveMethod('cloud');
      const result = await solveService.solveEquation({ input, format: 'text', problemType: 'other' });
      setSolution(result);
      addToHistory(input, result);
      onHistoryUpdate?.();
    } catch (err) {
      setError(err.response?.data?.error || "Error solving problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setEquationFromOcr = (extractedStr) => {
    setInput(extractedStr);
  };

  const loadProblem = (problemInput) => {
    setInput(problemInput);
    setSolution(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Input Section */}
      <Card hoverEffect className="relative shadow-xl">
        <form onSubmit={handleSolve} className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <Input 
              ref={inputRef}
              placeholder="e.g. x^2 + 5x - 3 = 0, derivative of x^3, integrate x^2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-gray-950/80 text-lg py-4 border-gray-800"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <OcrUpload onEquationExtracted={setEquationFromOcr} />
            <Button 
              type="submit" 
              className="flex-1 sm:flex-none gap-2 rounded-xl text-lg px-8 shadow-indigo-500/30 font-semibold" 
              isLoading={loading}
            >
              <Sparkles size={20} className={loading ? 'animate-spin' : ''} />
              <span className="tracking-wide">Solve</span>
            </Button>
          </div>
        </form>

        {/* Math Keyboard */}
        <MathKeyboard value={input} onChange={setInput} inputRef={inputRef} />

        {error && <p className="text-red-400 mt-4 text-sm font-medium animate-pulse">{error}</p>}
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="flex justify-center border-indigo-500/20 bg-indigo-950/10">
          <Loader text={solveMethod === 'cloud' ? "Solving with AI..." : "Solving your problem..."} />
        </Card>
      )}

      {/* Results */}
      {solution && !loading && (
        <div className="flex flex-col gap-8 items-stretch pt-4">
          {solution.graphExpression && <GraphViewer equation={solution.graphExpression} />}
          
          <div className="space-y-8 lg:min-w-0">
            {/* Solve Method Badge + Export Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${
                  solveMethod === 'local'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}>
                  {solveMethod === 'local' ? <Cpu size={12} /> : <Cloud size={12} />}
                  {solveMethod === 'local' ? 'Solved Instantly (Local Engine)' : 'Solved with AI'}
                </span>
                {problemType && (() => {
                  const info = getTypeInfo(problemType.type);
                  return (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${info.color}`}>
                      {info.label}
                    </span>
                  );
                })()}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => exportToPdf(solution, input)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:text-white hover:border-indigo-500/30 transition-all cursor-pointer"
                >
                  <FileDown size={13} /> PDF
                </button>
                <button
                  onClick={() => exportToLatex(solution, input)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:text-white hover:border-indigo-500/30 transition-all cursor-pointer"
                >
                  <FileText size={13} /> LaTeX
                </button>
                <button
                  onClick={async () => {
                    const url = getShareUrl(input, solution);
                    await copyToClipboard(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:text-white hover:border-indigo-500/30'
                  }`}
                >
                  {copied ? <><Check size={13} /> Copied!</> : <><Share2 size={13} /> Share</>}
                </button>
              </div>
            </div>

            {/* Answer Card */}
            <Card hoverEffect className="border-cyan-500/20 bg-cyan-950/10 transition-all duration-300">
              <h3 className="text-sm font-bold tracking-widest text-cyan-500 uppercase mb-4 flex items-center gap-2">
                <Play size={14} /> Final Answer
              </h3>
              <div className="text-xl sm:text-2xl font-semibold text-white tracking-tight overflow-x-auto min-h-16 flex items-center shrink-0">
                {solution.latex ? <BlockMath math={solution.latex} /> : solution.solution}
              </div>
            </Card>

            {/* Steps Card */}
            <Card className="border-gray-800/50">
              <h3 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-6 flex items-center gap-2">
                Step by Step Solution
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-gray-800 before:to-transparent">
                {solution.steps?.length > 0 ? solution.steps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 sm:gap-6 group">
                    <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full border border-gray-800 bg-gray-950 text-gray-400 group-hover:text-indigo-400 group-hover:border-indigo-500/50 shrink-0 shadow transition-colors duration-300 z-10">
                      {step.step || (idx + 1)}
                    </div>
                    <div className="flex-1 p-5 rounded-xl bg-gray-900/50 backdrop-blur border border-gray-800 shadow hover:border-gray-700 transition lg:min-w-0 overflow-x-auto">
                      <div className="text-gray-300 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                        {renderTextWithMath(step.description)}
                      </div>
                      {step.latex && (
                        <div className="bg-gray-950/80 px-4 py-3 rounded-lg border border-gray-800/80 overflow-x-auto">
                          <BlockMath math={step.latex} />
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 italic pb-2 pl-12 text-sm">No steps recorded.</p>
                )}
              </div>
            </Card>
            {/* Related Problems */}
            {problemType && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-2">Try similar:</p>
                <div className="flex flex-wrap gap-2">
                  {getRelatedProblems(problemType.type).map((rp, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setInput(rp); setSolution(null); }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-white hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      {rp}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
