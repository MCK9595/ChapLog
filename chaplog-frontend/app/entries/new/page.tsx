"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/hooks/use-toast";
import { ArrowLeft, BookOpen, Calendar, Star, Plus, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import apiClient, { ApiResponse, PagedResult } from "@/lib/api-client";

interface Book {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages?: number;
}

interface CreateReadingEntryRequest {
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

export default function NewEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<CreateReadingEntryRequest>({
    bookId: "",
    readingDate: new Date().toISOString().split('T')[0],
    startPage: 1,
    endPage: 1,
    chapter: "",
    rating: 5,
    impression: "",
    notes: "",
    learnings: [],
  });
  const [newLearning, setNewLearning] = useState("");

  const preselectedBookId = searchParams.get('bookId');

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      fetchReadingBooks();
    } else {
      const token = localStorage.getItem('chaplog_token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [user]);

  useEffect(() => {
    if (preselectedBookId && books.length > 0) {
      const book = books.find(b => b.id === preselectedBookId);
      if (book) {
        setSelectedBook(book);
        setFormData(prev => ({
          ...prev,
          bookId: book.id,
          startPage: book.currentPage + 1,
          endPage: book.currentPage + 1,
        }));
      }
    }
  }, [preselectedBookId, books]);

  const fetchReadingBooks = async () => {
    try {
      // Fetch both reading and unread books
      const params = new URLSearchParams();
      // Don't filter by status - get all books
      
      const response = await apiClient.get<ApiResponse<PagedResult<Book>>>(`/api/books?pageSize=100`);
      
      if (response.data.success && response.data.data) {
        // Filter for reading and unread books on client side
        const allBooks = response.data.data.items || [];
        const availableBooks = allBooks.filter((book: any) => 
          book.status === 'reading' || book.status === 'unread'
        );
        setBooks(availableBooks);
      } else {
        throw new Error(response.data.message || 'Failed to fetch books');
      }
    } catch (error) {
      console.error('Failed to fetch reading books:', error);
      toast({
        title: "エラー",
        description: "書籍の読み込みに失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof CreateReadingEntryRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === "" ? (field === 'chapter' || field === 'impression' || field === 'notes' ? undefined : value) : value
    }));
  };

  const handleBookSelect = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setFormData(prev => ({
        ...prev,
        bookId: book.id,
        startPage: book.currentPage + 1,
        endPage: book.currentPage + 1,
      }));
    }
  };

  const addLearning = () => {
    if (newLearning.trim()) {
      setFormData(prev => ({
        ...prev,
        learnings: [...prev.learnings, newLearning.trim()]
      }));
      setNewLearning("");
    }
  };

  const removeLearning = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learnings: prev.learnings.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bookId) {
      toast({
        title: "入力エラー",
        description: "本を選択してください。",
        variant: "destructive",
      });
      return;
    }

    if (formData.startPage > formData.endPage) {
      toast({
        title: "入力エラー",
        description: "開始ページは終了ページ以下である必要があります。",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Remove bookId from submitData - it will be in the URL
      const { bookId, ...entryData } = formData;
      
      const submitData = {
        ...entryData,
        chapter: entryData.chapter?.trim() || undefined,
        impression: entryData.impression?.trim() || undefined,
        notes: entryData.notes?.trim() || undefined,
      };

      const response = await apiClient.post<ApiResponse<any>>(`/api/reading-entries/book/${bookId}`, submitData);
      
      console.log('Create entry response:', response);
      console.log('Response data:', response.data);

      if (response.data.success) {
        toast({
          title: "成功",
          description: "読書記録が正常に追加されました。",
        });
        router.push(`/books/${bookId}`);
      } else {
        throw new Error(response.data.message || "読書記録の追加に失敗しました。");
      }
    } catch (error) {
      console.error('Failed to create reading entry:', error);
      toast({
        title: "エラー",
        description: "ネットワークエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i}
        className={`h-6 w-6 cursor-pointer transition-colors ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
        }`}
        onClick={() => onRatingChange?.(i + 1)}
      />
    ));
  };

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
            <h1 className="text-3xl font-bold">読書記録を追加</h1>
            <p className="text-muted-foreground mt-2">今日の読書記録を追加しましょう</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              読書記録
            </CardTitle>
            <CardDescription>読んだページや感想を記録してください</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Book Selection */}
              <div className="space-y-2">
                <Label htmlFor="book">
                  本を選択 <span className="text-red-500">*</span>
                </Label>
                {books.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>選択できる本がありません。</p>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => router.push('/books/new')}
                    >
                      新しい本を追加
                    </Button>
                  </div>
                ) : (
                  <Select value={formData.bookId} onValueChange={handleBookSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="本を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} - {book.author}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedBook && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{selectedBook.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    現在のページ: {selectedBook.currentPage}ページ
                    {selectedBook.totalPages && ` / ${selectedBook.totalPages}ページ`}
                  </p>
                </div>
              )}

              {/* Reading Date */}
              <div className="space-y-2">
                <Label htmlFor="readingDate">
                  読書日 <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="readingDate"
                    type="date"
                    value={formData.readingDate}
                    onChange={(e) => handleInputChange('readingDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Page Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startPage">
                    開始ページ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startPage"
                    type="number"
                    min="1"
                    max={selectedBook?.totalPages}
                    value={formData.startPage}
                    onChange={(e) => handleInputChange('startPage', parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endPage">
                    終了ページ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endPage"
                    type="number"
                    min={formData.startPage}
                    max={selectedBook?.totalPages}
                    value={formData.endPage}
                    onChange={(e) => handleInputChange('endPage', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* Chapter */}
              <div className="space-y-2">
                <Label htmlFor="chapter">章・セクション</Label>
                <Input
                  id="chapter"
                  value={formData.chapter || ""}
                  onChange={(e) => handleInputChange('chapter', e.target.value)}
                  placeholder="例: 第3章、序論"
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>
                  評価 <span className="text-red-500">*</span>
                </Label>
                <div className="flex space-x-1">
                  {renderStars(formData.rating, (rating) => handleInputChange('rating', rating))}
                </div>
                <p className="text-sm text-muted-foreground">
                  今日読んだ部分の満足度を1〜5で評価してください
                </p>
              </div>

              {/* Impression */}
              <div className="space-y-2">
                <Label htmlFor="impression">感想・印象</Label>
                <Textarea
                  id="impression"
                  value={formData.impression || ""}
                  onChange={(e) => handleInputChange('impression', e.target.value)}
                  placeholder="今日読んだ部分の感想や印象を記入してください"
                  rows={4}
                />
              </div>

              {/* Learnings */}
              <div className="space-y-2">
                <Label>学び・気づき</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newLearning}
                      onChange={(e) => setNewLearning(e.target.value)}
                      placeholder="学んだことや気づいたことを入力"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearning())}
                    />
                    <Button type="button" onClick={addLearning} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.learnings.length > 0 && (
                    <div className="space-y-2">
                      {formData.learnings.map((learning, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                          <span className="flex-1 text-sm">{learning}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLearning(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="その他のメモがあれば記入してください"
                  rows={3}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.bookId}
                  className="flex-1"
                >
                  {loading ? "記録中..." : "記録を追加"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}