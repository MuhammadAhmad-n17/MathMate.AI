import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import Plot from 'react-plotly.js';
import * as mathjs from 'mathjs';

export const GraphViewer = ({ equation }) => {
  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('2d'); // '2d' or '3d'

  useEffect(() => {
    if (!equation) return;
    try {
      let expressionStr = equation;
      if (expressionStr.includes('=')) {
        expressionStr = expressionStr.split('=').pop().trim();
      }

      // Detect if expression has two variables (x and y) → 3D
      const hasY = /\by\b/.test(expressionStr);
      const hasX = /\bx\b/.test(expressionStr);

      if (hasX && hasY) {
        // 3D surface plot
        setMode('3d');
        generate3D(expressionStr);
      } else {
        // 2D line plot
        setMode('2d');
        generate2D(expressionStr);
      }

      setError(null);
    } catch (err) {
      setError("Cannot parse or graph this equation.");
      console.error("Graph Error:", err);
    }
  }, [equation]);

  const generate2D = (expressionStr) => {
    const node = mathjs.parse(expressionStr);
    const code = node.compile();
    const xValues = mathjs.range(-10, 10, 0.1).toArray();
    const yValues = xValues.map(x => {
      try { const v = code.evaluate({ x }); return typeof v === 'number' && isFinite(v) ? v : null; }
      catch { return null; }
    });

    setPlotData([{
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(99, 102, 241, 1)', width: 3 },
      connectgaps: false,
    }]);
  };

  const generate3D = (expressionStr) => {
    const node = mathjs.parse(expressionStr);
    const code = node.compile();
    const range = mathjs.range(-5, 5, 0.4).toArray();
    const zData = range.map(y =>
      range.map(x => {
        try { const v = code.evaluate({ x, y }); return typeof v === 'number' && isFinite(v) ? v : null; }
        catch { return null; }
      })
    );

    setPlotData([{
      z: zData,
      x: range,
      y: range,
      type: 'surface',
      colorscale: [
        [0, 'rgb(49, 46, 129)'],
        [0.25, 'rgb(79, 70, 229)'],
        [0.5, 'rgb(99, 102, 241)'],
        [0.75, 'rgb(34, 211, 238)'],
        [1, 'rgb(16, 185, 129)']
      ],
      showscale: false,
    }]);
  };

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    try {
      let expressionStr = equation;
      if (expressionStr.includes('=')) expressionStr = expressionStr.split('=').pop().trim();
      if (newMode === '3d') generate3D(expressionStr);
      else generate2D(expressionStr);
    } catch { /* keep current */ }
  };

  if (error) return null;

  const layout2D = {
    autosize: true,
    margin: { l: 40, r: 20, t: 30, b: 40 },
    paper_bgcolor: 'rgba(17, 24, 39, 0.8)',
    plot_bgcolor: 'rgba(17, 24, 39, 0)',
    xaxis: { title: 'X', gridcolor: '#374151', zerolinecolor: '#6b7280' },
    yaxis: { title: 'Y', gridcolor: '#374151', zerolinecolor: '#6b7280' },
    font: { color: '#9CA3AF' },
  };

  const layout3D = {
    autosize: true,
    margin: { l: 0, r: 0, t: 30, b: 0 },
    paper_bgcolor: 'rgba(17, 24, 39, 0.8)',
    scene: {
      xaxis: { title: 'X', gridcolor: '#374151', color: '#9CA3AF', backgroundcolor: 'rgba(17, 24, 39, 0)' },
      yaxis: { title: 'Y', gridcolor: '#374151', color: '#9CA3AF', backgroundcolor: 'rgba(17, 24, 39, 0)' },
      zaxis: { title: 'Z', gridcolor: '#374151', color: '#9CA3AF', backgroundcolor: 'rgba(17, 24, 39, 0)' },
      bgcolor: 'rgba(17, 24, 39, 0)',
    },
    font: { color: '#9CA3AF' },
  };

  return (
    <div className="w-full mt-6 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-gray-800">
      {/* 2D/3D Toggle */}
      <div className="flex items-center justify-end gap-1 px-4 py-2 bg-gray-900/80 border-b border-gray-800/50">
        <button
          onClick={() => switchMode('2d')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            mode === '2d' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          2D
        </button>
        <button
          onClick={() => switchMode('3d')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            mode === '3d' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          3D
        </button>
      </div>

      <div className="h-[400px]">
        <Plot
          data={plotData || []}
          layout={mode === '3d' ? layout3D : layout2D}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
    </div>
  );
};
