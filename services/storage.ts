import { Book, Note } from '../types';

const BOOKS_KEY = 'notescribe_books';
const NOTES_KEY = 'notescribe_notes';

export const storage = {
  getBooks: (): Book[] => {
    const data = localStorage.getItem(BOOKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveBook: (book: Book) => {
    const books = storage.getBooks();
    books.push(book);
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  },

  deleteBook: (bookId: string) => {
    const books = storage.getBooks().filter(b => b.id !== bookId);
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    
    // Cleanup notes for this book
    const notes = storage.getNotes(bookId); // Actually get all notes then filter
    const allNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') as Note[];
    const remainingNotes = allNotes.filter(n => n.bookId !== bookId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(remainingNotes));
  },

  getNotes: (bookId: string): Note[] => {
    const allNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') as Note[];
    return allNotes.filter(n => n.bookId === bookId).sort((a, b) => b.createdAt - a.createdAt);
  },

  saveNote: (note: Note) => {
    const allNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') as Note[];
    allNotes.push(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
  },

  deleteNote: (noteId: string) => {
    const allNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') as Note[];
    const remaining = allNotes.filter(n => n.id !== noteId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(remaining));
  },

  // Export helpers
  getAllData: () => {
    const books = storage.getBooks();
    const allNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') as Note[];
    return { books, notes: allNotes };
  },

  getBookData: (bookId: string) => {
    const book = storage.getBooks().find(b => b.id === bookId);
    if (!book) throw new Error('Book not found');
    const notes = storage.getNotes(bookId);
    return { book, notes };
  },

  // Import helper
  importData: (data: any) => {
    const currentBooks = storage.getBooks();
    const currentNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') as Note[];

    let newBooks: Book[] = [];
    let newNotes: Note[] = [];

    // Handle "Export All" format
    if (data.books && Array.isArray(data.books)) {
      newBooks = data.books;
    } 
    // Handle "Export Book" format
    else if (data.book) {
      newBooks = [data.book];
    }

    if (data.notes && Array.isArray(data.notes)) {
      newNotes = data.notes;
    }

    // Merge Books (upsert based on ID)
    newBooks.forEach(b => {
      const index = currentBooks.findIndex(cb => cb.id === b.id);
      if (index >= 0) {
        currentBooks[index] = b; // Update existing
      } else {
        currentBooks.push(b); // Add new
      }
    });

    // Merge Notes (upsert based on ID)
    newNotes.forEach(n => {
       const index = currentNotes.findIndex(cn => cn.id === n.id);
       if (index >= 0) {
         currentNotes[index] = n;
       } else {
         currentNotes.push(n);
       }
    });

    localStorage.setItem(BOOKS_KEY, JSON.stringify(currentBooks));
    localStorage.setItem(NOTES_KEY, JSON.stringify(currentNotes));
    
    return { bookCount: newBooks.length, noteCount: newNotes.length };
  }
};