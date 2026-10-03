import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Eye } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const icons = {
    dark: <Moon size={16} className="text-indigo-400" />,
    light: <Sun size={16} className="text-amber-400" />,
    'high-contrast': <Eye size={16} className="text-yellow-300" />,
  };

  const labels = {
    dark: 'Dark',
    light: 'Light',
    'high-contrast': 'Hi-Con',
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-all px-2.5 py-2 rounded-lg hover:bg-white/5 cursor-pointer"
      title={`Theme: ${labels[theme]} — Click to cycle`}
    >
      {icons[theme]}
      <span className="text-xs hidden sm:inline">{labels[theme]}</span>
    </button>
  );
};
