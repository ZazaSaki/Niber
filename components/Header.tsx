import React from 'react';
import { PenTool, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm z-10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-200 dark:shadow-none">
          <PenTool size={20} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">NoteScribe</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
          Handwritten Notes to Markdown
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};