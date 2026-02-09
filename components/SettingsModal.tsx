import React from 'react';
import { X, Moon, Sun, Key, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  toggleTheme,
  apiKey,
  setApiKey,
  model,
  setModel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Appearance Section */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">Dark Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Adjust the appearance of the app</p>
                </div>
              </div>
              
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          </div>

          {/* AI Configuration Section */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
             <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">AI Configuration</h3>
             
             {/* Model Selection */}
             <div className="mb-5">
               <div className="flex items-center gap-2 mb-2">
                 <Cpu size={16} className="text-slate-500" />
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Model</label>
               </div>
               <select
                 value={model}
                 onChange={(e) => setModel(e.target.value)}
                 className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
               >
                 <optgroup label="Gemini 3.0 (Preview)">
                   <option value="gemini-3-flash-preview">Gemini 3.0 Flash (Fastest)</option>
                   <option value="gemini-3-pro-preview">Gemini 3.0 Pro (High Intelligence)</option>
                 </optgroup>
                 <optgroup label="Gemini 2.0">
                   <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                   <option value="gemini-2.0-flash-lite-preview-02-05">Gemini 2.0 Flash Lite</option>
                   <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Experimental</option>
                   <option value="gemini-2.0-flash-thinking-exp-01-21">Gemini 2.0 Flash Thinking</option>
                 </optgroup>
               </select>
               <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
                 "Flash" models are faster. "Pro" and "Thinking" models handle complex diagrams better but may be slower.
               </p>
             </div>

             {/* API Key Input */}
             <div>
               <div className="flex items-center gap-2 mb-2">
                 <Key size={16} className="text-slate-500" />
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Custom API Key <span className="text-slate-400 font-normal">(Optional)</span></label>
               </div>
               <input 
                 type="password"
                 value={apiKey}
                 onChange={(e) => setApiKey(e.target.value)}
                 placeholder="Enter your Gemini API Key"
                 className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
               />
               <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
                 If left empty, the application's default API key will be used. Your key is stored locally in your browser.
               </p>
             </div>
          </div>

        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-center shrink-0">
          <p className="text-xs text-slate-400">Niber v1.1.0</p>
        </div>
      </div>
    </div>
  );
};