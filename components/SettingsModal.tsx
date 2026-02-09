import React from 'react';
import { X, Moon, Sun, Key, Cpu, Zap, Box, Server, Globe } from 'lucide-react';
import { AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
  
  apiKeys: Record<AIProvider, string>;
  setApiKey: (provider: AIProvider, key: string) => void;
  
  model: string;
  setModel: (model: string) => void;

  customBaseUrl: string;
  setCustomBaseUrl: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  toggleTheme,
  provider,
  setProvider,
  apiKeys,
  setApiKey,
  model,
  setModel,
  customBaseUrl,
  setCustomBaseUrl
}) => {
  if (!isOpen) return null;

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    // Set default model for the new provider
    switch (newProvider) {
      case 'google': setModel('gemini-3-flash-preview'); break;
      case 'openai': setModel('gpt-4o'); break;
      case 'anthropic': setModel('claude-3-5-sonnet-20241022'); break;
      case 'custom': setModel('llama3.2-vision'); break; // Common default for Ollama
    }
  };

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
             
             {/* Provider Selection */}
             <div className="mb-5">
               <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">AI Provider</label>
               <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleProviderChange('google')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                      provider === 'google' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Zap size={18} />
                    <span className="text-[10px] font-semibold">Google</span>
                  </button>
                  
                  <button
                    onClick={() => handleProviderChange('openai')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                      provider === 'openai' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Cpu size={18} />
                    <span className="text-[10px] font-semibold">OpenAI</span>
                  </button>

                  <button
                    onClick={() => handleProviderChange('anthropic')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                      provider === 'anthropic' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Box size={18} />
                    <span className="text-[10px] font-semibold">Anthropic</span>
                  </button>

                  <button
                    onClick={() => handleProviderChange('custom')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                      provider === 'custom' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Server size={18} />
                    <span className="text-[10px] font-semibold">Custom</span>
                  </button>
               </div>
             </div>

             {/* Custom Base URL (Only for Custom Provider) */}
             {provider === 'custom' && (
               <div className="mb-5">
                 <div className="flex items-center gap-2 mb-2">
                   <Globe size={16} className="text-slate-500" />
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Base URL</label>
                 </div>
                 <input 
                   type="text"
                   value={customBaseUrl}
                   onChange={(e) => setCustomBaseUrl(e.target.value)}
                   placeholder="http://localhost:11434/v1"
                   className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                 />
                 <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
                   Endpoint compatible with OpenAI Chat Completions (e.g., Ollama, LocalAI).
                 </p>
               </div>
             )}

             {/* Model Selection */}
             <div className="mb-5">
               <div className="flex items-center gap-2 mb-2">
                 <Cpu size={16} className="text-slate-500" />
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Model</label>
               </div>
               
               {provider === 'custom' ? (
                 <input 
                   type="text"
                   value={model}
                   onChange={(e) => setModel(e.target.value)}
                   placeholder="e.g., llama3.2-vision, mistral, etc."
                   className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                 />
               ) : (
                 <select
                   value={model}
                   onChange={(e) => setModel(e.target.value)}
                   className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                 >
                   {provider === 'google' && (
                     <>
                      <optgroup label="Gemini 3.0 (Preview)">
                        <option value="gemini-3-flash-preview">Gemini 3.0 Flash</option>
                        <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
                      </optgroup>
                      <optgroup label="Gemini 2.0">
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp</option>
                      </optgroup>
                     </>
                   )}
                   {provider === 'openai' && (
                     <>
                       <option value="gpt-4o">GPT-4o</option>
                       <option value="gpt-4o-mini">GPT-4o Mini</option>
                       <option value="gpt-4-turbo">GPT-4 Turbo</option>
                       <option value="chatgpt-4o-latest">ChatGPT-4o Latest</option>
                     </>
                   )}
                   {provider === 'anthropic' && (
                     <>
                       <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                       <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                     </>
                   )}
                 </select>
               )}
             </div>

             {/* API Key Input */}
             <div>
               <div className="flex items-center gap-2 mb-2">
                 <Key size={16} className="text-slate-500" />
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                   {provider === 'custom' ? 'API Key (Optional)' : `${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key`}
                 </label>
               </div>
               <input 
                 type="password"
                 value={apiKeys[provider] || ''}
                 onChange={(e) => setApiKey(provider, e.target.value)}
                 placeholder={`Enter your ${provider} API Key`}
                 className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
               />
               <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
                 Your key is stored locally in your browser and used only for requests to {provider}.
               </p>
             </div>
          </div>

        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-center shrink-0">
          <p className="text-xs text-slate-400">Niber v1.3.0</p>
        </div>
      </div>
    </div>
  );
};