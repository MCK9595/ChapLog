import { create } from 'zustand';
import apiClient, { ApiResponse, PagedResult } from '@/lib/api-client';

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  genre?: string;
  status: 'unread' | 'reading' | 'completed';
  currentPage: number;
  totalPages?: number;
  notes?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  genre?: string;
  totalPages?: number;
  status: 'unread' | 'reading' | 'completed';
  currentPage?: number;
  notes?: string;
  coverImageUrl?: string;
}

export interface UpdateBookRequest extends CreateBookRequest {
  id: string;
}

export interface BooksFilter {
  status?: string;
  search?: string;
  genre?: string;
  author?: string;
}

export interface BooksState {
  // State
  books: Book[];
  currentBook: Book | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  
  // Filters
  filters: BooksFilter;
  
  // Actions
  fetchBooks: (page?: number, filters?: BooksFilter) => Promise<void>;
  fetchBook: (id: string) => Promise<Book | null>;
  createBook: (book: CreateBookRequest) => Promise<Book>;
  updateBook: (book: UpdateBookRequest) => Promise<Book>;
  updateBookStatus: (id: string, status: Book['status']) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  
  // UI Actions
  setCurrentBook: (book: Book | null) => void;
  setFilters: (filters: Partial<BooksFilter>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  books: [],
  currentBook: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  pageSize: 12,
  totalCount: 0,
  filters: {},
};

export const useBooksStore = create<BooksState>((set, get) => ({
  ...initialState,

  fetchBooks: async (page = 1, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { pageSize } = get();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get<ApiResponse<PagedResult<Book>>>(
        `/api/books?${params}`
      );

      if (response.data.success && response.data.data) {
        const pagedResult = response.data.data;
        set({
          books: pagedResult.items || [],
          totalPages: pagedResult.totalPages || 1,
          totalCount: pagedResult.totalItems || 0,
          currentPage: page,
          filters,
          isLoading: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch books');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch books',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchBook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ApiResponse<Book>>(`/api/books/${id}`);

      if (response.data.success && response.data.data) {
        const book = response.data.data;
        set({
          currentBook: book,
          isLoading: false,
        });
        return book;
      } else {
        throw new Error(response.data.message || 'Failed to fetch book');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch book',
        isLoading: false,
      });
      throw error;
    }
  },

  createBook: async (bookData: CreateBookRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<Book>>('/api/books', bookData);

      if (response.data.success && response.data.data) {
        const newBook = response.data.data;
        set((state) => ({
          books: [newBook, ...state.books],
          totalCount: state.totalCount + 1,
          isLoading: false,
        }));
        return newBook;
      } else {
        throw new Error(response.data.message || 'Failed to create book');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create book',
        isLoading: false,
      });
      throw error;
    }
  },

  updateBook: async (bookData: UpdateBookRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<ApiResponse<Book>>(`/api/books/${bookData.id}`, bookData);

      if (response.data.success && response.data.data) {
        const updatedBook = response.data.data;
        set((state) => ({
          books: state.books.map((book) =>
            book.id === updatedBook.id ? updatedBook : book
          ),
          currentBook: state.currentBook?.id === updatedBook.id ? updatedBook : state.currentBook,
          isLoading: false,
        }));
        return updatedBook;
      } else {
        throw new Error(response.data.message || 'Failed to update book');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update book',
        isLoading: false,
      });
      throw error;
    }
  },

  updateBookStatus: async (id: string, status: Book['status']) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<ApiResponse<Book>>(`/api/books/${id}/status`, {
        status,
      });

      if (response.data.success && response.data.data) {
        const updatedBook = response.data.data;
        set((state) => ({
          books: state.books.map((book) =>
            book.id === updatedBook.id ? updatedBook : book
          ),
          currentBook: state.currentBook?.id === updatedBook.id ? updatedBook : state.currentBook,
          isLoading: false,
        }));
      } else {
        throw new Error(response.data.message || 'Failed to update book status');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update book status',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/books/${id}`);

      set((state) => ({
        books: state.books.filter((book) => book.id !== id),
        currentBook: state.currentBook?.id === id ? null : state.currentBook,
        totalCount: Math.max(0, state.totalCount - 1),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete book',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentBook: (book: Book | null) => {
    set({ currentBook: book });
  },

  setFilters: (newFilters: Partial<BooksFilter>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));