"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Search, BookOpen, Star, TrendingUp } from "lucide-react";
import apiClient, { ApiResponse, PagedResult } from "@/lib/api-client";

interface ReadingEntry {
  id: string;
  bookId: string;
  book: {
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
}

// Use the common PagedResult type from api-client
type EntriesResponse = PagedResult<ReadingEntry>;

export default function EntriesPage() {
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      // Check if we have tried to load user but still no user
      const token = localStorage.getItem('chaplog_token');
      if (!token) {
        console.log('No authentication token found, redirecting to login');
        router.push('/login');
      }
    }
  }, [user, currentPage, sortBy]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      console.log('Fetching reading entries...', { currentPage, sortBy, searchQuery });
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await apiClient.get<ApiResponse<EntriesResponse>>(`/api/reading-entries?${params}`);
      
      console.log('Reading entries API response data:', response.data);
      
      if (response.data.success && response.data.data) {
        const entriesData = response.data.data;
        setEntries(entriesData.items || []);
        setTotalPages(entriesData.totalPages || 1);
      } else {
        throw new Error(response.data.message || 'Failed to fetch reading entries');
      }
    } catch (error) {
      console.error('Failed to fetch reading entries:', error);
      // Show error to user instead of silent failure
      alert(`読書記録の読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchEntries();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const calculatePagesRead = (startPage: number, endPage: number) => {
    return endPage - startPage + 1;
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
            <h1 className="text-3xl font-bold">読書記録</h1>
            <p className="text-muted-foreground mt-2">あなたの読書の軌跡を振り返りましょう</p>
          </div>
          <Button onClick={() => router.push('/entries/new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新しい記録を追加
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="本のタイトルや感想で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>検索</Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">新しい順</SelectItem>
                    <SelectItem value="date-asc">古い順</SelectItem>
                    <SelectItem value="rating-desc">評価高い順</SelectItem>
                    <SelectItem value="rating-asc">評価低い順</SelectItem>
                    <SelectItem value="pages-desc">ページ数多い順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">総記録数</p>
                    <p className="text-2xl font-bold">{entries.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">総読書ページ数</p>
                    <p className="text-2xl font-bold">
                      {entries.reduce((sum, entry) => sum + calculatePagesRead(entry.startPage, entry.endPage), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">平均評価</p>
                    <p className="text-2xl font-bold">
                      {(entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length).toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">読書記録が見つかりませんでした</p>
                <p className="mb-4">検索条件を変更するか、新しい記録を追加してみてください</p>
                <Button onClick={() => router.push('/entries/new')}>
                  最初の記録を追加
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {formatDate(entry.readingDate)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => router.push(`/books/${entry.book.id}`)}
                        >
                          {entry.book.title}
                        </span>
                        <span className="text-xs">by {entry.book.author}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">{renderStars(entry.rating)}</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Page Info */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{entry.startPage}〜{entry.endPage}ページ</span>
                      <Badge variant="outline">
                        {calculatePagesRead(entry.startPage, entry.endPage)}ページ読了
                      </Badge>
                      {entry.chapter && (
                        <Badge variant="secondary">{entry.chapter}</Badge>
                      )}
                    </div>

                    {/* Impression */}
                    {entry.impression && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">感想・印象</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {entry.impression}
                        </p>
                      </div>
                    )}

                    {/* Learnings */}
                    {entry.learnings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">学び・気づき</h4>
                        <div className="space-y-1">
                          {entry.learnings.slice(0, 2).map((learning, index) => (
                            <p key={index} className="text-sm text-muted-foreground flex items-start">
                              <TrendingUp className="h-3 w-3 mr-2 mt-1 flex-shrink-0 text-blue-500" />
                              {learning}
                            </p>
                          ))}
                          {entry.learnings.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              他 {entry.learnings.length - 2} 件の学び
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {entry.notes && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">メモ</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {entry.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        記録日: {new Date(entry.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/books/${entry.book.id}`)}
                        >
                          本の詳細
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/entries/${entry.id}`)}
                        >
                          詳細
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              前へ
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                if (pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              次へ
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}