"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/hooks/use-toast";
import { ArrowLeft, Star, BookOpen, Plus, Trash2 } from "lucide-react";
import apiClient, { ApiResponse } from "@/lib/api-client";

interface Book {
  id: string;
  title: string;
  author: string;
  status: string;
}

interface CreateReviewRequest {
  completedDate: string; // ISO date string
  overallImpression: string;
  keyLearnings: string[];
  overallRating: number;
  recommendationLevel: number;
}

export default function NewReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<CreateReviewRequest>({
    completedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    overallImpression: "",
    keyLearnings: [""],
    overallRating: 5,
    recommendationLevel: 5,
  });

  const bookId = searchParams.get('bookId');

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
    } else if (!bookId) {
      toast({
        title: "エラー",
        description: "書籍IDが指定されていません。",
        variant: "destructive",
      });
      router.push('/books');
    }
  }, [user, bookId]);

  const fetchBookData = async () => {
    if (!bookId) return;
    
    try {
      setLoading(true);
      
      const response = await apiClient.get<ApiResponse<Book>>(`/api/books/${bookId}`);
      
      if (response.data.success && response.data.data) {
        const bookData = response.data.data;
        
        // Check if book is completed
        if (bookData.status !== 'completed') {
          toast({
            title: "エラー",
            description: "完読していない書籍にはレビューを作成できません。",
            variant: "destructive",
          });
          router.push(`/books/${bookId}`);
          return;
        }
        
        setBook(bookData);
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

  const handleInputChange = (field: keyof CreateReviewRequest, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLearningChange = (index: number, value: string) => {
    const newLearnings = [...formData.keyLearnings];
    newLearnings[index] = value;
    setFormData(prev => ({
      ...prev,
      keyLearnings: newLearnings
    }));
  };

  const addLearning = () => {
    setFormData(prev => ({
      ...prev,
      keyLearnings: [...prev.keyLearnings, ""]
    }));
  };

  const removeLearning = (index: number) => {
    if (formData.keyLearnings.length > 1) {
      const newLearnings = formData.keyLearnings.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        keyLearnings: newLearnings
      }));
    }
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onRatingChange(i + 1)}
        className={`h-8 w-8 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
      >
        <Star className={`h-full w-full ${i < rating ? 'fill-current' : ''}`} />
      </button>
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.overallImpression.trim()) {
      toast({
        title: "入力エラー",
        description: "全体の感想は必須項目です。",
        variant: "destructive",
      });
      return;
    }

    if (!bookId) return;

    setSubmitting(true);

    try {
      // Clean up form data
      const submitData = {
        completedDate: formData.completedDate,
        overallImpression: formData.overallImpression.trim(),
        keyLearnings: formData.keyLearnings.filter(learning => learning.trim() !== "").map(learning => learning.trim()),
        overallRating: formData.overallRating,
        recommendationLevel: formData.recommendationLevel,
      };

      console.log('Creating review with data:', submitData);

      const response = await apiClient.post<ApiResponse<any>>(`/api/book-reviews/book/${bookId}`, submitData);
      
      if (response.data.success) {
        toast({
          title: "成功",
          description: "レビューが正常に作成されました。",
        });
        router.push(`/books/${bookId}`);
      } else {
        throw new Error(response.data.message || 'Failed to create review');
      }
    } catch (error: any) {
      console.error('Failed to create review:', error);
      
      let errorMessage = "レビューの作成に失敗しました。";
      
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
            <h1 className="text-3xl font-bold">レビュー作成</h1>
            <p className="text-muted-foreground mt-2">完読した書籍のレビューを作成してください</p>
          </div>
        </div>

        {/* Book Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              レビュー対象の書籍
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-muted-foreground">{book.author}</p>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>レビュー情報</CardTitle>
            <CardDescription>
              完読した感想とレビューを記録してください
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Completion Date */}
              <div>
                <Label htmlFor="completedDate">完読日 *</Label>
                <Input
                  id="completedDate"
                  type="date"
                  value={formData.completedDate}
                  onChange={(e) => handleInputChange('completedDate', e.target.value)}
                  required
                />
              </div>

              {/* Ratings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">評価</h3>
                
                <div>
                  <Label>総合評価 *</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {renderStars(formData.overallRating, (rating) => handleInputChange('overallRating', rating))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {formData.overallRating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <Label>おすすめ度 *</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {renderStars(formData.recommendationLevel, (rating) => handleInputChange('recommendationLevel', rating))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {formData.recommendationLevel}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Impression */}
              <div>
                <Label htmlFor="overallImpression">全体の感想 *</Label>
                <Textarea
                  id="overallImpression"
                  value={formData.overallImpression}
                  onChange={(e) => handleInputChange('overallImpression', e.target.value)}
                  placeholder="書籍を読んだ全体的な感想を記入してください"
                  rows={6}
                  required
                />
              </div>

              {/* Key Learnings */}
              <div>
                <Label>重要な学び・気づき</Label>
                <div className="space-y-3 mt-2">
                  {formData.keyLearnings.map((learning, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={learning}
                        onChange={(e) => handleLearningChange(index, e.target.value)}
                        placeholder={`学び・気づき ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.keyLearnings.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeLearning(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLearning}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    学び・気づきを追加
                  </Button>
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
                  disabled={submitting || !formData.overallImpression.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      作成中...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      レビュー作成
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