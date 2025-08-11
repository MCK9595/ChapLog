"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Search, Filter } from "lucide-react";
import apiClient, { ApiResponse, PagedResult } from "@/lib/api-client";

interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  status: 'unread' | 'reading' | 'completed';
  currentPage: number;
  totalPages?: number;
  genre?: string;
  coverImageUrl?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

// Use the common PagedResult type from api-client
type BooksResponse = PagedResult<Book>;

export default function BooksPage() {
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      fetchBooks();
    } else {
      // Check if we have tried to load user but still no user
      const token = localStorage.getItem('chaplog_token');
      if (!token) {
        console.log('No authentication token found, redirecting to login');
        router.push('/login');
      }
    }
  }, [user, currentPage, statusFilter]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      console.log('Fetching books...', { currentPage, statusFilter, searchQuery });
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await apiClient.get<ApiResponse<BooksResponse>>(`/api/books?${params}`);
      
      console.log('Books API response data:', response.data);
      
      if (response.data.success && response.data.data) {
        const booksData = response.data.data;
        setBooks(booksData.items || []);
        setTotalPages(booksData.totalPages || 1);
      } else {
        throw new Error(response.data.message || 'Failed to fetch books');
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      // Show error to user instead of silent failure
      alert(`書籍の読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBooks();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
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
            <h1 className="text-3xl font-bold">書籍管理</h1>
            <p className="text-muted-foreground mt-2">あなたの読書コレクションを管理しましょう</p>
          </div>
          <Button onClick={() => router.push('/books/new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新しい本を追加
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="タイトルや著者で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>検索</Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="unread">未読</SelectItem>
                    <SelectItem value="reading">読書中</SelectItem>
                    <SelectItem value="completed">完読</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books Grid */}
        {books.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">本が見つかりませんでした</p>
                <p className="mb-4">検索条件を変更するか、新しい本を追加してみてください</p>
                <Button onClick={() => router.push('/books/new')}>
                  新しい本を追加
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                    {getStatusBadge(book.status)}
                  </div>
                  <CardDescription className="text-sm">{book.author}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {book.publisher && (
                      <p className="text-xs text-muted-foreground">{book.publisher}</p>
                    )}
                    
                    {book.genre && (
                      <Badge variant="outline" className="text-xs">{book.genre}</Badge>
                    )}

                    {book.status === 'reading' && book.totalPages && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{book.currentPage}ページ</span>
                          <span>{book.totalPages}ページ</span>
                        </div>
                        <Progress value={calculateProgress(book.currentPage, book.totalPages)} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground">
                          {calculateProgress(book.currentPage, book.totalPages)}% 完了
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      登録日: {formatDate(book.createdAt)}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/books/${book.id}`)}
                      >
                        詳細
                      </Button>
                      {book.status === 'reading' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => router.push(`/entries/new?bookId=${book.id}`)}
                        >
                          記録
                        </Button>
                      )}
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