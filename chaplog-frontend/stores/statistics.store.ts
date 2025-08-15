import { create } from 'zustand';
import apiClient, { ApiResponse } from '@/lib/api-client';

export interface StatisticsSummary {
  totalBooks: number;
  completedBooks: number;
  readingBooks: number;
  unreadBooks: number;
  totalPagesRead: number;
  averageRating: number;
  readingStreak: number;
  booksThisMonth: number;
  pagesThisMonth: number;
  booksThisYear: number;
  pagesThisYear: number;
}

export interface MonthlyStatistics {
  month: string;
  booksCompleted: number;
  pagesRead: number;
  entriesCount: number;
  averageRating: number;
}

export interface GenreStatistics {
  genre: string;
  count: number;
  percentage: number;
  averageRating: number;
}

export interface UserActivity {
  date: string;
  booksRead: number;
  pagesRead: number;
  entriesCreated: number;
}

export interface DailyReadingHeatmap {
  date: string;
  pagesRead: number;
  entriesCount: number;
  bookTitles: string[];
  hasReading: boolean;
}

export interface MonthlyHeatmapData {
  year: number;
  month: number;
  monthName: string;
  dailyData: DailyReadingHeatmap[];
  totalPagesMonth: number;
  totalEntriesMonth: number;
  averagePagesPerDay: number;
  maxPagesDay: number;
  daysWithReading: number;
}

export interface StatisticsState {
  // State
  summary: StatisticsSummary | null;
  monthlyStats: MonthlyStatistics[];
  genreStats: GenreStatistics[];
  activityData: UserActivity[];
  heatmapData: MonthlyHeatmapData | null;
  
  // Loading states
  isLoadingSummary: boolean;
  isLoadingMonthly: boolean;
  isLoadingGenre: boolean;
  isLoadingActivity: boolean;
  isLoadingHeatmap: boolean;
  
  // Error states
  summaryError: string | null;
  monthlyError: string | null;
  genreError: string | null;
  activityError: string | null;
  heatmapError: string | null;
  
  // Actions
  fetchSummary: () => Promise<void>;
  fetchMonthlyStatistics: (year?: number) => Promise<void>;
  fetchGenreStatistics: () => Promise<void>;
  fetchUserActivity: (days?: number) => Promise<void>;
  fetchHeatmapData: (year: number, month: number) => Promise<void>;
  
  // UI Actions
  clearErrors: () => void;
  reset: () => void;
}

const initialState = {
  summary: null,
  monthlyStats: [],
  genreStats: [],
  activityData: [],
  heatmapData: null,
  isLoadingSummary: false,
  isLoadingMonthly: false,
  isLoadingGenre: false,
  isLoadingActivity: false,
  isLoadingHeatmap: false,
  summaryError: null,
  monthlyError: null,
  genreError: null,
  activityError: null,
  heatmapError: null,
};

export const useStatisticsStore = create<StatisticsState>((set, get) => ({
  ...initialState,

  fetchSummary: async () => {
    set({ isLoadingSummary: true, summaryError: null });
    try {
      const response = await apiClient.get<ApiResponse<StatisticsSummary>>('/api/statistics/summary');

      if (response.data.success && response.data.data) {
        set({
          summary: response.data.data,
          isLoadingSummary: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch summary statistics');
      }
    } catch (error: any) {
      set({
        summaryError: error.response?.data?.message || error.message || 'Failed to fetch summary statistics',
        isLoadingSummary: false,
      });
      throw error;
    }
  },

  fetchMonthlyStatistics: async (year?: number) => {
    set({ isLoadingMonthly: true, monthlyError: null });
    try {
      const params = new URLSearchParams();
      if (year) {
        params.append('year', year.toString());
      }

      const response = await apiClient.get<ApiResponse<MonthlyStatistics[]>>(
        `/api/statistics/monthly?${params}`
      );

      if (response.data.success && response.data.data) {
        set({
          monthlyStats: response.data.data,
          isLoadingMonthly: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch monthly statistics');
      }
    } catch (error: any) {
      set({
        monthlyError: error.response?.data?.message || error.message || 'Failed to fetch monthly statistics',
        isLoadingMonthly: false,
      });
      throw error;
    }
  },

  fetchGenreStatistics: async () => {
    set({ isLoadingGenre: true, genreError: null });
    try {
      const response = await apiClient.get<ApiResponse<GenreStatistics[]>>('/api/statistics/genre');

      if (response.data.success && response.data.data) {
        set({
          genreStats: response.data.data,
          isLoadingGenre: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch genre statistics');
      }
    } catch (error: any) {
      set({
        genreError: error.response?.data?.message || error.message || 'Failed to fetch genre statistics',
        isLoadingGenre: false,
      });
      throw error;
    }
  },

  fetchUserActivity: async (days = 30) => {
    set({ isLoadingActivity: true, activityError: null });
    try {
      const response = await apiClient.get<ApiResponse<UserActivity[]>>(
        `/api/statistics/activity?days=${days}`
      );

      if (response.data.success && response.data.data) {
        set({
          activityData: response.data.data,
          isLoadingActivity: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch user activity');
      }
    } catch (error: any) {
      set({
        activityError: error.response?.data?.message || error.message || 'Failed to fetch user activity',
        isLoadingActivity: false,
      });
      throw error;
    }
  },

  fetchHeatmapData: async (year: number, month: number) => {
    set({ isLoadingHeatmap: true, heatmapError: null });
    try {
      const response = await apiClient.get<ApiResponse<MonthlyHeatmapData>>(
        `/api/statistics/heatmap?year=${year}&month=${month}`
      );

      if (response.data.success && response.data.data) {
        set({
          heatmapData: response.data.data,
          isLoadingHeatmap: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch heatmap data');
      }
    } catch (error: any) {
      set({
        heatmapError: error.response?.data?.message || error.message || 'Failed to fetch heatmap data',
        isLoadingHeatmap: false,
      });
      throw error;
    }
  },

  clearErrors: () => {
    set({
      summaryError: null,
      monthlyError: null,
      genreError: null,
      activityError: null,
      heatmapError: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));