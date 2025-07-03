import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useState } from 'react';

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = () => {
    setIsToggling(true);
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setTimeout(() => setIsToggling(false), 400); // match animation duration
  };

  return (
    <header className="w-full px-4 py-3 flex items-center justify-between bg-background border-b border-border">
      <span className="text-lg font-bold tracking-tight text-primary">Notification Cascade Flow</span>
      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle theme"
        onClick={handleToggle}
        className="gap-2 relative overflow-hidden"
      >
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-400 ${theme === 'dark' && !isToggling ? 'opacity-0' : 'opacity-100'} ${isToggling ? 'animate-spin-slow' : ''}`}
        >
          {/* Sun icon for light mode */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-400">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <g stroke="currentColor" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </g>
          </svg>
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-400 ${theme === 'dark' && !isToggling ? 'opacity-100' : 'opacity-0'} ${isToggling ? 'animate-spin-slow' : ''}`}
        >
          {/* Crescent moon icon for dark mode */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="currentColor" />
          </svg>
        </span>
      </Button>
      <style>{`
        .animate-spin-slow {
          animation: spin 0.4s linear;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }
      `}</style>
    </header>
  );
}; 