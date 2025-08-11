"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/hooks/use-toast";
import { useAuthStore } from "@/stores/auth.store";
import apiClient, { ApiResponse, PagedResult } from "@/lib/api-client";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Edit, 
  Plus, 
  Trash2,
  Star,
  TrendingUp 
} from "lucide-react";

interface Book {
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

interface ReadingEntry {
  id: string;
  bookId: string;
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

interface BookReview {
  id: string;
  bookId: string;
  completedDate: string;
  overallRating: number;
  recommendationLevel: number;
  overallImpression: string;
  keyLearnings: string[];
  createdAt: string;
}

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user, loadUser } = useAuthStore();
  const [book, setBook] = useState<Book | null>(null);
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [review, setReview] = useState<BookReview | null>(null);
  const [loading, setLoading] = useState(true);

  const bookId = params.id as string;

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user && bookId) {
      fetchBookData();
    } else if (!user) {
      const token = localStorage.getItem('chaplog_token');
      if (!token) {
        router.push('/login');
        return;
      }
    }
  }, [user, bookId]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      
      // Fetch book details
      const bookResponse = await apiClient.get<ApiResponse<Book>>(`/api/books/${bookId}`);
      
      if (bookResponse.data.success && bookResponse.data.data) {
        const bookData = bookResponse.data.data;
        setBook(bookData);

        // Fetch reading entries for this book
        const entriesResponse = await apiClient.get<ApiResponse<PagedResult<ReadingEntry>>>(`/api/reading-entries/book/${bookId}`);
        
        if (entriesResponse.data.success && entriesResponse.data.data) {
          setEntries(entriesResponse.data.data.items || []);
        }

        // Fetch book review if completed
        if (bookData.status === 'completed') {
          try {
            const reviewResponse = await apiClient.get<ApiResponse<BookReview>>(`/api/book-reviews/book/${bookId}`);
            
            if (reviewResponse.data.success && reviewResponse.data.data) {
              setReview(reviewResponse.data.data);
            }
          } catch (reviewError) {
            // Review not found is ok - don't show error
            console.log('No review found for this book (expected for books without reviews)');
          }
        }
      } else {
        throw new Error(bookResponse.data.message || 'Failed to fetch book data');
      }
    } catch (error) {
      console.error('Failed to fetch book data:', error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "本の情報を取得できませんでした。",
        variant: "destructive",
      });
      // Don't redirect on error - let user stay and retry
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!book || !confirm(`「${book.title}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/api/books/${bookId}`);
      
      if (response.data.success) {
        toast({
          title: "成功",
          description: "本が削除されました。",
        });
        router.push('/books');
      } else {
        throw new Error(response.data.message || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "本の削除に失敗しました。",
        variant: "destructive",
      });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-8">読み込み中...</div>
      </MainLayout>
    );
  }

  if (!book) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p>本が見つかりませんでした。</p>
          <Button onClick={() => router.push('/books')} className="mt-4">
            書籍一覧に戻る
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <p className="text-muted-foreground mt-2">{book.author}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/books/${bookId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBook}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          </div>
        </div>

        {/* Book Info Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {book.title}
                </CardTitle>
                <CardDescription>{book.author}</CardDescription>
              </div>
              {getStatusBadge(book.status)}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">基本情報</h4>
                  <div className="space-y-2 text-sm">
                    {book.publisher && (
                      <div>
                        <span className="text-muted-foreground">出版社: </span>
                        {book.publisher}
                      </div>
                    )}
                    {book.publicationYear && (
                      <div>
                        <span className="text-muted-foreground">出版年: </span>
                        {book.publicationYear}年
                      </div>
                    )}
                    {book.genre && (
                      <div>
                        <span className="text-muted-foreground">ジャンル: </span>
                        <Badge variant="outline">{book.genre}</Badge>
                      </div>
                    )}
                    {book.totalPages && (
                      <div>
                        <span className="text-muted-foreground">総ページ数: </span>
                        {book.totalPages}ページ
                      </div>
                    )}
                  </div>
                </div>

                {book.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">メモ</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {book.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {book.status === 'reading' && book.totalPages && (
                  <div>
                    <h4 className="font-semibold mb-2">読書進捗</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{book.currentPage}ページ</span>
                        <span>{book.totalPages}ページ</span>
                      </div>
                      <Progress value={calculateProgress(book.currentPage, book.totalPages)} className="h-3" />
                      <p className="text-center text-sm text-muted-foreground">
                        {calculateProgress(book.currentPage, book.totalPages)}% 完了
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">日付情報</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">登録日: </span>
                      {formatDate(book.createdAt)}
                    </div>
                    {book.startedAt && (
                      <div>
                        <span className="text-muted-foreground">開始日: </span>
                        {formatDate(book.startedAt)}
                      </div>
                    )}
                    {book.completedAt && (
                      <div>
                        <span className="text-muted-foreground">完了日: </span>
                        {formatDate(book.completedAt)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {(book.status === 'reading' || book.status === 'unread') && (
                    <Button
                      onClick={() => router.push(`/entries/new?bookId=${bookId}`)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      記録追加
                    </Button>
                  )}
                  {book.status === 'completed' && !review && (
                    <Button
                      onClick={() => router.push(`/reviews/new?bookId=${bookId}`)}
                      className="flex-1"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      レビュー作成
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Entries and Review */}
        <Tabs defaultValue="entries" className="w-full">
          <TabsList>
            <TabsTrigger value="entries">読書記録 ({entries.length})</TabsTrigger>
            <TabsTrigger value="review">レビュー</TabsTrigger>
          </TabsList>
          
          <TabsContent value="entries">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>読書記録</CardTitle>
                    <CardDescription>日々の読書記録を確認できます</CardDescription>
                  </div>
                  {(book.status === 'reading' || book.status === 'unread') && (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/entries/new?bookId=${bookId}`)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      記録を追加
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">まだ読書記録がありません</p>
                    <p className="mb-4">読書を始めて記録を追加しましょう！</p>
                    {(book.status === 'reading' || book.status === 'unread') && (
                      <Button onClick={() => router.push(`/entries/new?bookId=${bookId}`)}>
                        最初の記録を追加
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">
                              {formatDate(entry.readingDate)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {entry.startPage}〜{entry.endPage}ページ
                              {entry.chapter && ` (${entry.chapter})`}
                            </p>
                          </div>
                          <div className="flex">
                            {renderStars(entry.rating)}
                          </div>
                        </div>
                        
                        {entry.impression && (
                          <p className="text-sm mb-2">{entry.impression}</p>
                        )}
                        
                        {entry.learnings.length > 0 && (
                          <div className="mb-2">
                            <h5 className="text-sm font-semibold mb-1">学び・気づき:</h5>
                            <ul className="text-sm text-muted-foreground">
                              {entry.learnings.map((learning, index) => (
                                <li key={index} className="ml-4">• {learning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="review">
            <Card>
              <CardHeader>
                <CardTitle>書籍レビュー</CardTitle>
                <CardDescription>完読後の総合的な感想とレビュー</CardDescription>
              </CardHeader>
              <CardContent>
                {review ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold mb-2">総合評価</h4>
                        <div className="flex space-x-4">
                          <div>
                            <p className="text-sm text-muted-foreground">評価</p>
                            <div className="flex">{renderStars(review.overallRating)}</div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">おすすめ度</p>
                            <div className="flex">{renderStars(review.recommendationLevel)}</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">総合的な感想</h4>
                      <p className="text-sm whitespace-pre-wrap">{review.overallImpression}</p>
                    </div>
                    
                    {review.keyLearnings.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">重要な学び・気づき</h4>
                        <ul className="space-y-1">
                          {review.keyLearnings.map((learning, index) => (
                            <li key={index} className="text-sm flex items-start">
                              <TrendingUp className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                              {learning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : book.status === 'completed' ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">まだレビューがありません</p>
                    <p className="mb-4">完読した感想をレビューとして記録しましょう！</p>
                    <Button onClick={() => router.push(`/reviews/new?bookId=${bookId}`)}>
                      レビューを作成
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>本を完読するとレビューを作成できます。</p>
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