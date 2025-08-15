import { create } from 'zustand';
import apiClient, { ApiResponse, PagedResult } from '@/lib/api-client';

export interface ReadingEntry {
  id: string;
  bookId: string;
  book?: {
    id: string;
    title: string;
    author: string;
  };
  readingDate: string;
  startPage: number;
  endPage: number;
  chapter?: string;
  rating: number;
  impression?: string;
  notes?: string;
  learnings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryRequest {
  bookId: string;
  readingDate: string;
  startPage: number;
  endPage: number;
  chapter?: string;
  rating: number;
  impression?: string;
  notes?: string;
  learnings: string[];
}

export interface UpdateEntryRequest extends CreateEntryRequest {
  id: string;
}

export interface EntriesFilter {
  bookId?: string;
  dateFrom?: string;
  dateTo?: string;
  rating?: number;
  sortBy?: 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';
}

export interface EntriesState {
  // State
  entries: ReadingEntry[];
  currentEntry: ReadingEntry | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  
  // Filters
  filters: EntriesFilter;
  
  // Actions
  fetchEntries: (page?: number, filters?: EntriesFilter) => Promise<void>;
  fetchEntry: (id: string) => Promise<ReadingEntry | null>;
  fetchEntriesByBook: (bookId: string) => Promise<ReadingEntry[]>;
  createEntry: (entry: CreateEntryRequest) => Promise<ReadingEntry>;
  updateEntry: (entry: UpdateEntryRequest) => Promise<ReadingEntry>;
  deleteEntry: (id: string) => Promise<void>;
  
  // UI Actions
  setCurrentEntry: (entry: ReadingEntry | null) => void;
  setFilters: (filters: Partial<EntriesFilter>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  totalCount: 0,
  filters: {},
};

export const useEntriesStore = create<EntriesState>((set, get) => ({
  ...initialState,

  fetchEntries: async (page = 1, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { pageSize } = get();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<ApiResponse<PagedResult<ReadingEntry>>>(
        `/api/reading-entries?${params}`
      );

      if (response.data.success && response.data.data) {
        const pagedResult = response.data.data;
        set({
          entries: pagedResult.items || [],
          totalPages: pagedResult.totalPages || 1,
          totalCount: pagedResult.totalItems || 0,
          currentPage: page,
          filters,
          isLoading: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch entries');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch entries',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchEntry: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ApiResponse<ReadingEntry>>(`/api/reading-entries/${id}`);

      if (response.data.success && response.data.data) {
        const entry = response.data.data;
        set({
          currentEntry: entry,
          isLoading: false,
        });
        return entry;
      } else {
        throw new Error(response.data.message || 'Failed to fetch entry');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch entry',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchEntriesByBook: async (bookId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ApiResponse<ReadingEntry[]>>(
        `/api/reading-entries/book/${bookId}`
      );

      if (response.data.success && response.data.data) {
        const entries = response.data.data;
        set({ isLoading: false });
        return entries;
      } else {
        throw new Error(response.data.message || 'Failed to fetch book entries');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch book entries',
        isLoading: false,
      });
      throw error;
    }
  },

  createEntry: async (entryData: CreateEntryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<ReadingEntry>>('/api/reading-entries', entryData);

      if (response.data.success && response.data.data) {
        const newEntry = response.data.data;
        set((state) => ({
          entries: [newEntry, ...state.entries],
          totalCount: state.totalCount + 1,
          isLoading: false,
        }));
        return newEntry;
      } else {
        throw new Error(response.data.message || 'Failed to create entry');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create entry',
        isLoading: false,
      });
      throw error;
    }
  },

  updateEntry: async (entryData: UpdateEntryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<ApiResponse<ReadingEntry>>(
        `/api/reading-entries/${entryData.id}`,
        entryData
      );

      if (response.data.success && response.data.data) {
        const updatedEntry = response.data.data;
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === updatedEntry.id ? updatedEntry : entry
          ),
          currentEntry: state.currentEntry?.id === updatedEntry.id ? updatedEntry : state.currentEntry,
          isLoading: false,
        }));
        return updatedEntry;
      } else {
        throw new Error(response.data.message || 'Failed to update entry');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update entry',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteEntry: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/reading-entries/${id}`);

      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
        currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
        totalCount: Math.max(0, state.totalCount - 1),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete entry',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentEntry: (entry: ReadingEntry | null) => {
    set({ currentEntry: entry });
  },

  setFilters: (newFilters: Partial<EntriesFilter>) => {
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