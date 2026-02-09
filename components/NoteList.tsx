import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Plus, Trash2, FileText, Calendar, Download } from 'lucide-react';
import { Book, Note } from '../types';
import { storage } from '../services/storage';
import { MermaidChart } from './MermaidChart';

interface NoteListProps {
  book: Book;
  onBack: () => void;
  onAddNote: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({ book, onBack, onAddNote }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, [book.id]);

  const loadNotes = () => {
    setNotes(storage.getNotes(book.id));
  };

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (confirm('Delete this note?')) {
      storage.deleteNote(noteId);
      loadNotes();
      if (selectedNote?.id === noteId) setSelectedNote(null);
    }
  };

  const handleExportBook = () => {
    try {
      const data = storage.getBookData(book.id);
      const safeTitle = data.book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeTitle}_${new Date().toISOString().slice(0, 10)}.json`;
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to export book data');
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden">
      {/* Sidebar List */}
      <div className={`
        w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full transition-colors
        ${selectedNote ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-none bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium mb-3"
          >
            <ArrowLeft size={16} /> Back to Books
          </button>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate pr-2">{book.title}</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportBook}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg shadow-sm transition-colors"
                title="Export this Book"
              >
                <Download size={20} />
              </button>
              <button
                onClick={onAddNote}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg shadow-sm transition-colors"
                title="Add New Note"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notes.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400 dark:text-slate-500">
              <FileText size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes in this book yet.</p>
              <button onClick={onAddNote} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-2 hover:underline">
                Transcribe your first note
              </button>
            </div>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`
                  p-4 rounded-xl cursor-pointer transition-all border
                  ${selectedNote?.id === note.id 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }
                `}
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`font-semibold line-clamp-1 text-sm ${selectedNote?.id === note.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>
                    {note.content.split('\n')[0].replace(/^#+\s*/, '') || 'Untitled Note'}
                  </h3>
                  <button 
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                   {note.content.substring(0, 100).replace(/[#*_`]/g, '')}...
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">
                  <Calendar size={10} />
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className={`
        flex-1 bg-slate-50 dark:bg-slate-950 h-full flex flex-col transition-colors
        ${!selectedNote ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedNote ? (
          <>
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-3 md:hidden">
               <button onClick={() => setSelectedNote(null)} className="text-slate-500 dark:text-slate-400">
                 <ArrowLeft size={20} />
               </button>
               <span className="font-semibold text-slate-700 dark:text-slate-200">Reading Note</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <ReactMarkdown
                  components={{
                    code(props) {
                      const { children, className, node, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || '');
                      
                      if (match && match[1] === 'mermaid') {
                        return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
                      }

                      return match ? (
                        <div className="bg-slate-800 dark:bg-slate-950 text-slate-100 rounded-md p-4 overflow-x-auto my-4 not-prose border border-slate-700 dark:border-slate-800">
                           <code className={className} {...rest}>{children}</code>
                        </div>
                      ) : (
                        <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-medium" {...rest}>{children}</code>
                      );
                    }
                  }}
                >
                  {selectedNote.content}
                </ReactMarkdown>
              </article>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Select a note to view</p>
          </div>
        )}
      </div>
    </div>
  );
};