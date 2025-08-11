"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/hooks/use-toast";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import apiClient, { ApiResponse } from "@/lib/api-client";

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

interface UpdateBookRequest {
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

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<UpdateBookRequest>({
    title: "",
    author: "",
    publisher: "",
    publicationYear: undefined,
    genre: "",
    totalPages: undefined,
    status: "unread",
    currentPage: 0,
    notes: "",
    coverImageUrl: "",
  });

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
      
      const response = await apiClient.get<ApiResponse<Book>>(`/api/books/${bookId}`);
      
      if (response.data.success && response.data.data) {
        const bookData = response.data.data;
        setBook(bookData);
        
        // Initialize form with book data
        setFormData({
          title: bookData.title,
          author: bookData.author,
          publisher: bookData.publisher || "",
          publicationYear: bookData.publicationYear,
          genre: bookData.genre || "",
          totalPages: bookData.totalPages,
          status: bookData.status,
          currentPage: bookData.currentPage,
          notes: bookData.notes || "",
          coverImageUrl: bookData.coverImageUrl || "",
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch book data');
      }
    } catch (error) {
      console.error('Failed to fetch book data:', error);
      toast({
        title: "エラー",
        description: "書籍データの読み込みに失敗しました。",
        variant: "destructive",
      });
      router.push('/books');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateBookRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === "" ? undefined : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.author.trim()) {
      toast({
        title: "入力エラー",
        description: "タイトルと著者は必須項目です。",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Clean up form data
      const submitData = {
        ...formData,
        title: formData.title.trim(),
        author: formData.author.trim(),
        publisher: formData.publisher?.trim() || undefined,
        genre: formData.genre?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        coverImageUrl: formData.coverImageUrl?.trim() || undefined,
      };

      // Set currentPage to 0 if status is unread
      if (submitData.status === 'unread') {
        submitData.currentPage = 0;
      }

      console.log('Updating book with data:', submitData);

      const response = await apiClient.put<ApiResponse<Book>>(`/api/books/${bookId}`, submitData);
      
      if (response.data.success && response.data.data) {
        toast({
          title: "成功",
          description: "書籍情報が正常に更新されました。",
        });
        router.push(`/books/${bookId}`);
      } else {
        throw new Error(response.data.message || 'Failed to update book');
      }
    } catch (error: any) {
      console.error('Failed to update book:', error);
      
      let errorMessage = "書籍の更新に失敗しました。";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
          <p>書籍が見つかりませんでした。</p>
          <Button onClick={() => router.push('/books')} className="mt-4">
            書籍一覧に戻る
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <div>
            <h1 className="text-3xl font-bold">書籍編集</h1>
            <p className="text-muted-foreground mt-2">書籍情報を編集してください</p>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              書籍情報の編集
            </CardTitle>
            <CardDescription>
              書籍の詳細情報を編集できます
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">基本情報</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="title">タイトル *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="書籍のタイトルを入力してください"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="author">著者 *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => handleInputChange('author', e.target.value)}
                      placeholder="著者名を入力してください"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="publisher">出版社</Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) => handleInputChange('publisher', e.target.value)}
                      placeholder="出版社名を入力してください"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="publicationYear">出版年</Label>
                    <Input
                      id="publicationYear"
                      type="number"
                      min="1000"
                      max={new Date().getFullYear()}
                      value={formData.publicationYear || ""}
                      onChange={(e) => handleInputChange('publicationYear', e.target.value ? parseInt(e.target.value) : "")}
                      placeholder="出版年を入力してください"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">ジャンル</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) => handleInputChange('genre', e.target.value)}
                      placeholder="ジャンルを入力してください"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="totalPages">総ページ数</Label>
                    <Input
                      id="totalPages"
                      type="number"
                      min="1"
                      value={formData.totalPages || ""}
                      onChange={(e) => handleInputChange('totalPages', e.target.value ? parseInt(e.target.value) : "")}
                      placeholder="総ページ数を入力してください"
                    />
                  </div>
                </div>
              </div>

              {/* Reading Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">読書状況</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">読書ステータス</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unread">未読</SelectItem>
                        <SelectItem value="reading">読書中</SelectItem>
                        <SelectItem value="completed">完読</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(formData.status === 'reading' || formData.status === 'completed') && (
                    <div>
                      <Label htmlFor="currentPage">現在のページ</Label>
                      <Input
                        id="currentPage"
                        type="number"
                        min="0"
                        max={formData.totalPages || undefined}
                        value={formData.currentPage || 0}
                        onChange={(e) => handleInputChange('currentPage', parseInt(e.target.value) || 0)}
                        placeholder="現在読んでいるページ"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">追加情報</h3>
                
                <div>
                  <Label htmlFor="coverImageUrl">表紙画像URL</Label>
                  <Input
                    id="coverImageUrl"
                    type="url"
                    value={formData.coverImageUrl}
                    onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                    placeholder="表紙画像のURLを入力してください"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">メモ・備考</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="この本についてのメモや備考を入力してください"
                    rows={4}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.title.trim() || !formData.author.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      更新中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      更新
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}