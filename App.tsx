import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BookList } from './components/BookList';
import { NoteList } from './components/NoteList';
import { TranscriptionView } from './components/TranscriptionView';
import { SettingsModal } from './components/SettingsModal';
import { Book, Note, AIProvider } from './types';
import { storage } from './services/storage';

type ViewState = 'books' | 'notes' | 'transcribe';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('books');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  
  // Settings & Theme State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('niber_theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // AI Settings
  const [provider, setProvider] = useState<AIProvider>(() => {
    const saved = localStorage.getItem('niber_provider');
    // Fallback if the saved provider is no longer supported (e.g. deepseek)
    if (saved === 'deepseek') return 'google';
    return (saved as AIProvider) || 'google';
  });
  
  const [model, setModel] = useState(() => localStorage.getItem('niber_model') || 'gemini-3-flash-preview');
  
  // Custom Provider Settings
  const [customBaseUrl, setCustomBaseUrl] = useState(() => localStorage.getItem('niber_custom_base_url') || 'http://localhost:11434/v1');

  // Initialize keys from local storage
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>(() => {
    const saved = localStorage.getItem('niber_api_keys');
    const defaults = { google: '', openai: '', anthropic: '', custom: '' };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
           google: parsed.google || '',
           openai: parsed.openai || '',
           anthropic: parsed.anthropic || '',
           custom: parsed.custom || ''
        };
      } catch { return defaults; }
    }
    return defaults;
  });

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('niber_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('niber_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist AI Settings
  useEffect(() => {
    localStorage.setItem('niber_provider', provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem('niber_model', model);
  }, [model]);
  
  useEffect(() => {
    localStorage.setItem('niber_custom_base_url', customBaseUrl);
  }, [customBaseUrl]);

  useEffect(() => {
    localStorage.setItem('niber_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSetApiKey = (p: AIProvider, key: string) => {
    setApiKeys(prev => ({ ...prev, [p]: key }));
  };

  const navigateToBook = (book: Book) => {
    setActiveBook(book);
    setView('notes');
  };

  const navigateToHome = () => {
    setActiveBook(null);
    setView('books');
  };

  const startTranscription = () => {
    setView('transcribe');
  };

  const handleSaveTranscription = (content: string, previewImage?: string) => {
    if (!activeBook) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      bookId: activeBook.id,
      content,
      createdAt: Date.now(),
      previewImage
    };
    
    storage.saveNote(newNote);
    setView('notes');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="flex-1 overflow-hidden relative flex flex-col">
        
        {view === 'books' && (
          <div className="flex-1 overflow-y-auto">
            <BookList onSelectBook={navigateToBook} />
          </div>
        )}

        {view === 'notes' && activeBook && (
          <NoteList 
            book={activeBook} 
            onBack={navigateToHome}
            onAddNote={startTranscription}
          />
        )}

        {view === 'transcribe' && activeBook && (
           <TranscriptionView 
             onCancel={() => setView('notes')}
             onSave={handleSaveTranscription}
             provider={provider}
             apiKey={apiKeys[provider]}
             model={model}
             customBaseUrl={customBaseUrl}
           />
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        provider={provider}
        setProvider={setProvider}
        apiKeys={apiKeys}
        setApiKey={handleSetApiKey}
        model={model}
        setModel={setModel}
        customBaseUrl={customBaseUrl}
        setCustomBaseUrl={setCustomBaseUrl}
      />
    </div>
  );
};

export default App;