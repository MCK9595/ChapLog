'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, TrendingUp, Clock, Star, Plus, Calendar } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Book {
  id: string;
  title: string;
  author: string; 
  status: 'unread' | 'reading' | 'completed';
  currentPage: number;
  totalPages?: number;
  coverImageUrl?: string;
  createdAt: string;
}

interface Statistics {
  totalBooks: number;
  completedBooks: number;
  readingBooks: number;
  unreadBooks: number;
  totalPagesRead: number;
  averageRating: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalBooks: 0,
    completedBooks: 0,
    readingBooks: 0,
    unreadBooks: 0,
    totalPagesRead: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent books
      const booksResponse = await apiClient.get('/api/books?pageSize=5&page=1');
      console.log('Books API response:', booksResponse.data);
      // APIレスポンスはApiResponse<PagedResult<BookDto>>でラップされている
      if (booksResponse.data?.data) {
        // data.dataからitemsを取得
        setBooks(booksResponse.data.data.items || []);
      }

      // Fetch statistics summary
      const statsResponse = await apiClient.get('/api/statistics/summary');
      console.log('Statistics API response:', statsResponse.data);
      // APIレスポンスはApiResponse<StatisticsSummaryDto>でラップされている
      if (statsResponse.data?.data) {
        const stats = statsResponse.data.data;
        // StatisticsSummaryDtoのプロパティ名に合わせて変換
        setStatistics({
          totalBooks: stats.totalBooks || 0,
          completedBooks: stats.completedBooks || 0,
          readingBooks: stats.readingBooks || 0,
          unreadBooks: stats.unreadBooks || 0,
          totalPagesRead: stats.totalPagesRead || 0,
          averageRating: stats.averageRating || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">完読</Badge>;
      case 'reading':
        return <Badge className="bg-blue-500 hover:bg-blue-600">読書中</Badge>;
      case 'unread':
        return <Badge variant="secondary">未読</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (currentPage: number, totalPages?: number) => {
    if (!totalPages || totalPages === 0) return 0;
    return Math.round((currentPage / totalPages) * 100);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
            <p className="text-muted-foreground mt-2">
              こんにちは、{user?.userName || 'ユーザー'}さん。今日も読書を楽しみましょう！
            </p>
          </div>
          <Button onClick={() => router.push('/books/new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新しい本を追加
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総書籍数</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalBooks}</div>
              <p className="text-xs text-muted-foreground">登録済みの書籍</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">読書中</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.readingBooks}</div>
              <p className="text-xs text-muted-foreground">現在読んでいる本</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">完読済み</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.completedBooks}</div>
              <p className="text-xs text-muted-foreground">完了した本</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総ページ数</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalPagesRead}</div>
              <p className="text-xs text-muted-foreground">読んだページ数</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Books */}
        <Card>
          <CardHeader>
            <CardTitle>最近の本</CardTitle>
            <CardDescription>最近追加された本や読書中の本を表示します</CardDescription>
          </CardHeader>
          <CardContent>
            {books.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">まだ本が登録されていません</p>
                <p className="mb-4">最初の本を追加して読書記録を始めましょう！</p>
                <Button onClick={() => router.push('/books/new')}>
                  最初の本を追加
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {books.map((book) => (
                  <div key={book.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{book.title}</h3>
                        {getStatusBadge(book.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                      
                      {book.status === 'reading' && book.totalPages && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{book.currentPage}ページ / {book.totalPages}ページ</span>
                            <span>{calculateProgress(book.currentPage, book.totalPages)}%</span>
                          </div>
                          <Progress value={calculateProgress(book.currentPage, book.totalPages)} className="h-2" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/books/${book.id}`)}>
                        詳細
                      </Button>
                      {book.status === 'reading' && (
                        <Button size="sm" onClick={() => router.push(`/entries/new?bookId=${book.id}`)}>
                          記録追加
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => router.push('/books')}>
                    すべての本を見る
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}