import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BookList } from './components/BookList';
import { NoteList } from './components/NoteList';
import { TranscriptionView } from './components/TranscriptionView';
import { SettingsModal } from './components/SettingsModal';
import { Book, Note } from './types';
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
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('niber_api_key') || '');
  const [model, setModel] = useState(() => localStorage.getItem('niber_model') || 'gemini-3-flash-preview');

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
    localStorage.setItem('niber_api_key', customApiKey);
  }, [customApiKey]);

  useEffect(() => {
    localStorage.setItem('niber_model', model);
  }, [model]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
             apiKey={customApiKey}
             model={model}
           />
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        apiKey={customApiKey}
        setApiKey={setCustomApiKey}
        model={model}
        setModel={setModel}
      />
    </div>
  );
};

export default App;