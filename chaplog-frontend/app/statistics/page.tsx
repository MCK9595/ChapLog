"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuthStore } from "@/stores/auth.store";
import apiClient, { ApiResponse } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReadingHeatmap } from "@/components/ui/reading-heatmap";
import { 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Star,
  Clock,
  Target,
  Award,
  BarChart3
} from "lucide-react";

interface Statistics {
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

interface MonthlyData {
  month: string;
  booksCompleted: number;
  pagesRead: number;
  entriesCount: number;
}

interface GenreData {
  genre: string;
  count: number;
  percentage: number;
}

interface RecentActivity {
  date: string;
  type: 'book_added' | 'book_updated' | 'entry_added' | 'review_added';
  description: string;
  bookTitle?: string;
  bookId?: string;
  pagesRead?: number;
  chapter?: string;
  rating?: number;
}

interface DailyReadingData {
  date: string;
  pagesRead: number;
  entriesCount: number;
  bookTitles: string[];
  hasReading: boolean;
}

interface DailyReadingHeatmap {
  year: number;
  month: number;
  monthName: string;
  dailyData: DailyReadingData[];
  totalPagesMonth: number;
  totalEntriesMonth: number;
  averagePagesPerDay: number;
  maxPagesDay: number;
  daysWithReading: number;
}

export default function StatisticsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [statistics, setStatistics] = useState<Statistics>({
    totalBooks: 0,
    completedBooks: 0,
    readingBooks: 0,
    unreadBooks: 0,
    totalPagesRead: 0,
    averageRating: 0,
    readingStreak: 0,
    booksThisMonth: 0,
    pagesThisMonth: 0,
    booksThisYear: 0,
    pagesThisYear: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [heatmapData, setHeatmapData] = useState<DailyReadingHeatmap | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchStatistics();
  }, [isAuthenticated, router]);

  const fetchHeatmapData = async (year: number, month: number) => {
    try {
      const heatmapResponse = await apiClient.get<ApiResponse<DailyReadingHeatmap>>(`/api/statistics/daily-heatmap/${year}/${month}`);
      if (heatmapResponse.data.success && heatmapResponse.data.data) {
        setHeatmapData(heatmapResponse.data.data);
      } else {
        setHeatmapData(null);
      }
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
      setHeatmapData(null);
    }
  };

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    fetchHeatmapData(year, month);
  };

  const fetchStatistics = async () => {
    try {
      // Fetch basic statistics
      try {
        const statsResponse = await apiClient.get<ApiResponse<Statistics>>('/api/statistics/summary');
        if (statsResponse.data.success && statsResponse.data.data) {
          setStatistics(statsResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch statistics summary:', error);
      }

      // Fetch monthly data
      try {
        const currentYear = new Date().getFullYear();
        const monthlyResponse = await apiClient.get<ApiResponse<{year: number, monthlyData: MonthlyData[]}>>(`/api/statistics/monthly/${currentYear}`);
        if (monthlyResponse.data.success && monthlyResponse.data.data && monthlyResponse.data.data.monthlyData) {
          setMonthlyData(monthlyResponse.data.data.monthlyData);
        } else {
          setMonthlyData([]);
        }
      } catch (error) {
        console.error('Failed to fetch monthly statistics:', error);
        setMonthlyData([]);
      }

      // Fetch genre distribution
      try {
        const genreResponse = await apiClient.get<ApiResponse<{genreData: GenreData[]}>>('/api/statistics/genres');
        if (genreResponse.data.success && genreResponse.data.data && genreResponse.data.data.genreData) {
          setGenreData(genreResponse.data.data.genreData);
        } else {
          setGenreData([]);
        }
      } catch (error) {
        console.error('Failed to fetch genre statistics:', error);
        setGenreData([]);
      }

      // Fetch recent activities
      try {
        const activitiesResponse = await apiClient.get<ApiResponse<RecentActivity[]>>('/api/statistics/activities?limit=20');
        if (activitiesResponse.data.success && activitiesResponse.data.data) {
          setRecentActivity(activitiesResponse.data.data);
        } else {
          setRecentActivity([]);
        }
      } catch (error) {
        console.error('Failed to fetch recent activities:', error);
        setRecentActivity([]);
      }

      // Fetch initial heatmap data
      fetchHeatmapData(currentYear, currentMonth);
      
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      // Ensure all arrays are set even on error
      setMonthlyData([]);
      setGenreData([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionRate = () => {
    if (statistics.totalBooks === 0) return 0;
    return Math.round((statistics.completedBooks / statistics.totalBooks) * 100);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'book_added':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'book_updated':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'entry_added':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'review_added':
        return <Star className="h-4 w-4 text-green-500" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-8">読み込み中...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">統計・分析</h1>
          <p className="text-muted-foreground mt-2">あなたの読書習慣を詳しく分析しましょう</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総書籍数</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalBooks}</div>
              <p className="text-xs text-muted-foreground">
                完読率: {calculateCompletionRate()}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総読書ページ数</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalPagesRead}</div>
              <p className="text-xs text-muted-foreground">
                今月: {statistics.pagesThisMonth}ページ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均評価</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageRating.toFixed(1)}</div>
              <div className="flex mt-1">{renderStars(Math.round(statistics.averageRating))}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">読書継続日数</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.readingStreak}</div>
              <p className="text-xs text-muted-foreground">日間継続中</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="monthly">月次推移</TabsTrigger>
            <TabsTrigger value="genres">ジャンル分析</TabsTrigger>
            <TabsTrigger value="activity">活動履歴</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reading Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>読書進捗</CardTitle>
                  <CardDescription>書籍のステータス別分布</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>完読済み</span>
                      <span>{statistics.completedBooks}冊</span>
                    </div>
                    <Progress 
                      value={statistics.totalBooks > 0 ? (statistics.completedBooks / statistics.totalBooks) * 100 : 0} 
                      className="h-2 mb-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>読書中</span>
                      <span>{statistics.readingBooks}冊</span>
                    </div>
                    <Progress 
                      value={statistics.totalBooks > 0 ? (statistics.readingBooks / statistics.totalBooks) * 100 : 0} 
                      className="h-2 mb-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>未読</span>
                      <span>{statistics.unreadBooks}冊</span>
                    </div>
                    <Progress 
                      value={statistics.totalBooks > 0 ? (statistics.unreadBooks / statistics.totalBooks) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* This Year's Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>今年の読書実績</CardTitle>
                  <CardDescription>2024年の読書データ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">完読した本</p>
                      <p className="text-2xl font-bold">{statistics.booksThisYear}冊</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">読んだページ数</p>
                      <p className="text-2xl font-bold">{statistics.pagesThisYear}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      1日平均: {Math.round(statistics.pagesThisYear / Math.max(1, new Date().getDayOfYear()))}ページ
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            {heatmapData ? (
              <ReadingHeatmap
                year={heatmapData.year}
                month={heatmapData.month}
                monthName={heatmapData.monthName}
                dailyData={heatmapData.dailyData}
                totalPagesMonth={heatmapData.totalPagesMonth}
                totalEntriesMonth={heatmapData.totalEntriesMonth}
                averagePagesPerDay={heatmapData.averagePagesPerDay}
                maxPagesDay={heatmapData.maxPagesDay}
                daysWithReading={heatmapData.daysWithReading}
                onMonthChange={handleMonthChange}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>読書ヒートマップ</CardTitle>
                  <CardDescription>日単位の読書活動を可視化</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>読書データがありません</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="genres" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ジャンル別分析</CardTitle>
                <CardDescription>読書傾向をジャンル別に分析</CardDescription>
              </CardHeader>
              <CardContent>
                {!Array.isArray(genreData) || genreData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>ジャンルデータがありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {genreData.map((data, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{data.genre}</span>
                          <span className="text-sm text-muted-foreground">
                            {data.count}冊 ({data.percentage}%)
                          </span>
                        </div>
                        <Progress value={data.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>最近の活動</CardTitle>
                <CardDescription>直近の読書活動履歴</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>活動履歴がありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          {activity.bookTitle && (
                            <p className="text-xs text-muted-foreground mt-1">
                              「{activity.bookTitle}」
                            </p>
                          )}
                          {activity.pagesRead && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.pagesRead}ページ読了
                            </p>
                          )}
                          {activity.chapter && (
                            <p className="text-xs text-muted-foreground mt-1">
                              章: {activity.chapter}
                            </p>
                          )}
                          {activity.rating && (
                            <div className="flex mt-1">{renderStars(activity.rating)}</div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

// Helper function to get day of year
declare global {
  interface Date {
    getDayOfYear(): number;
  }
}

Date.prototype.getDayOfYear = function() {
  const start = new Date(this.getFullYear(), 0, 0);
  const diff = this.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};