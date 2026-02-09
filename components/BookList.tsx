import React, { useState, useEffect, useRef } from 'react';
import { Book as BookIcon, Plus, Trash2, Folder, Calendar, Download, Upload } from 'lucide-react';
import { Book } from '../types';
import { storage } from '../services/storage';

interface BookListProps {
  onSelectBook: (book: Book) => void;
}

export const BookList: React.FC<BookListProps> = ({ onSelectBook }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    setBooks(storage.getBooks());
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const newBook: Book = {
      id: crypto.randomUUID(),
      title: newBookTitle,
      createdAt: Date.now(),
    };

    storage.saveBook(newBook);
    setNewBookTitle('');
    setIsCreating(false);
    loadBooks();
  };

  const handleDeleteBook = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this book and all its notes?')) {
      storage.deleteBook(bookId);
      loadBooks();
    }
  };

  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAll = () => {
    const data = storage.getAllData();
    const filename = `notescribe_backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadJson(data, filename);
  };

  const handleExportBook = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    try {
      const data = storage.getBookData(bookId);
      const safeTitle = data.book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeTitle}_${new Date().toISOString().slice(0, 10)}.json`;
      downloadJson(data, filename);
    } catch (err) {
      console.error(err);
      alert('Failed to export book data');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const result = storage.importData(json);
        loadBooks();
        alert(`Import successful! Added/Updated ${result.bookCount} books and ${result.noteCount} notes.`);
      } catch (err) {
        console.error(err);
        alert('Failed to import file. Please ensure it is a valid NoteScribe JSON export.');
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Notebooks</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Select a book to view or add notes</p>
        </div>
        
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
            accept=".json"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
             className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-colors"
             title="Import books from JSON"
          >
             <Upload size={18} /> <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={handleExportAll}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-colors"
            title="Export all data as JSON"
          >
            <Download size={18} /> <span className="hidden sm:inline">Export All</span>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> New Book
          </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateBook} className="mb-8 bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm flex gap-4 items-center animate-in fade-in slide-in-from-top-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Folder size={24} />
          </div>
          <input
            type="text"
            value={newBookTitle}
            onChange={(e) => setNewBookTitle(e.target.value)}
            placeholder="Enter book title..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-lg placeholder-slate-400 font-medium text-slate-800 dark:text-slate-100"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newBookTitle.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {books.length === 0 && !isCreating ? (
        <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <BookIcon size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">No books yet</h3>
          <p className="text-slate-500 dark:text-slate-500 mb-6 max-w-xs mx-auto">Create your first notebook to start organizing your transcriptions.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Create a Book
          </button>
          
          <div className="mt-4 flex justify-center">
             <button
               onClick={() => fileInputRef.current?.click()}
               className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm flex items-center gap-1"
             >
                <Upload size={14} /> Import from Backup
             </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-amber-600 dark:text-amber-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <BookIcon size={24} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => handleExportBook(e, book.id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Export Book"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteBook(e, book.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Book"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-1">{book.title}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-4">
                <Calendar size={12} />
                <span>{new Date(book.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};