import React, { useState, useRef, useEffect } from 'react';

const KEYBOARD_ROWS = [
  [
    { label: 'x', insert: 'x' },
    { label: 'y', insert: 'y' },
    { label: 'z', insert: 'z' },
    { label: '(', insert: '(' },
    { label: ')', insert: ')' },
    { label: '=', insert: '=' },
    { label: '+', insert: '+' },
    { label: '−', insert: '-' },
    { label: '×', insert: '*' },
    { label: '÷', insert: '/' },
  ],
  [
    { label: 'x²', insert: '^2' },
    { label: 'xⁿ', insert: '^' },
    { label: '√', insert: 'sqrt(' },
    { label: 'π', insert: 'pi' },
    { label: 'e', insert: 'e' },
    { label: '|x|', insert: 'abs(' },
    { label: 'log', insert: 'log(' },
    { label: 'ln', insert: 'ln(' },
    { label: ',', insert: ',' },
    { label: '.', insert: '.' },
  ],
  [
    { label: 'sin', insert: 'sin(' },
    { label: 'cos', insert: 'cos(' },
    { label: 'tan', insert: 'tan(' },
    { label: 'sin⁻¹', insert: 'asin(' },
    { label: 'cos⁻¹', insert: 'acos(' },
    { label: 'tan⁻¹', insert: 'atan(' },
    { label: '∞', insert: 'Infinity' },
    { label: '≤', insert: '<=' },
    { label: '≥', insert: '>=' },
    { label: '≠', insert: '!=' },
  ],
  [
    { label: 'd/dx', insert: 'derivative of ' },
    { label: '∫', insert: 'integrate ' },
    { label: 'factor', insert: 'factor ' },
    { label: 'expand', insert: 'expand ' },
    { label: 'simplify', insert: 'simplify ' },
    { label: '⌫', insert: '__BACKSPACE__', className: 'col-span-2 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' },
    { label: 'Clear', insert: '__CLEAR__', className: 'col-span-3 bg-gray-700/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50' },
  ],
];

export const MathKeyboard = ({ value, onChange, inputRef }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleKey = (key) => {
    if (key.insert === '__BACKSPACE__') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key.insert === '__CLEAR__') {
      onChange('');
      return;
    }
    onChange(value + key.insert);
    // Focus back on input
    inputRef?.current?.focus();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-500 hover:text-indigo-400 transition-colors mt-2 flex items-center gap-1 cursor-pointer"
      >
        <span className="text-base">⌨</span> Math Keyboard
      </button>
    );
  }

  return (
    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <span className="text-base">⌨</span> Math Keyboard
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          ✕ Close
        </button>
      </div>
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-3 backdrop-blur-xl space-y-1.5">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-10 gap-1">
            {row.map((key, keyIdx) => (
              <button
                key={keyIdx}
                type="button"
                onClick={() => handleKey(key)}
                className={`py-2 px-1 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-150 cursor-pointer active:scale-95 ${
                  key.className ||
                  'bg-gray-800/60 border-gray-700/50 text-gray-200 hover:bg-gray-700 hover:text-white hover:border-indigo-500/30'
                }`}
              >
                {key.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
