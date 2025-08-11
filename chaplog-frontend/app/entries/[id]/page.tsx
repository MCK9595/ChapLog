"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Edit, 
  Trash2,
  Star,
  TrendingUp,
  FileText
} from "lucide-react";
import apiClient, { ApiResponse } from "@/lib/api-client";

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
  updatedAt: string;
}

export default function ReadingEntryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<ReadingEntry | null>(null);

  const entryId = params.id as string;

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user && entryId) {
      fetchEntryData();
    } else if (!user) {
      const token = localStorage.getItem('chaplog_token');
      if (!token) {
        router.push('/login');
        return;
      }
    }
  }, [user, entryId]);

  const fetchEntryData = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get<ApiResponse<ReadingEntry>>(`/api/reading-entries/${entryId}`);
      
      if (response.data.success && response.data.data) {
        setEntry(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch entry data');
      }
    } catch (error) {
      console.error('Failed to fetch entry data:', error);
      toast({
        title: "エラー",
        description: "読書記録の読み込みに失敗しました。",
        variant: "destructive",
      });
      router.push('/entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entry || !confirm('この読書記録を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/api/reading-entries/${entryId}`);
      
      if (response.data.success) {
        toast({
          title: "成功",
          description: "読書記録が削除されました。",
        });
        router.push('/entries');
      } else {
        throw new Error(response.data.message || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "読書記録の削除に失敗しました。",
        variant: "destructive",
      });
    }
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
        className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
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

  if (!entry) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p>読書記録が見つかりませんでした。</p>
          <Button onClick={() => router.push('/entries')} className="mt-4">
            読書記録一覧に戻る
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <div>
              <h1 className="text-3xl font-bold">読書記録詳細</h1>
              <p className="text-muted-foreground mt-2">{formatDate(entry.readingDate)}の記録</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/entries/${entryId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEntry}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          </div>
        </div>

        {/* Book Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              読書書籍
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <h3 
                  className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => router.push(`/books/${entry.book.id}`)}
                >
                  {entry.book.title}
                </h3>
                <p className="text-muted-foreground">{entry.book.author}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/books/${entry.book.id}`)}
              >
                書籍詳細
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entry Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reading Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                読書情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">読書日</Label>
                <p className="text-lg">{formatDate(entry.readingDate)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">読書範囲</Label>
                <p className="text-lg">
                  {entry.startPage}〜{entry.endPage}ページ
                </p>
                <Badge variant="outline" className="mt-1">
                  {calculatePagesRead(entry.startPage, entry.endPage)}ページ読了
                </Badge>
              </div>

              {entry.chapter && (
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">章・セクション</Label>
                  <Badge variant="secondary">{entry.chapter}</Badge>
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold text-muted-foreground">評価</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{renderStars(entry.rating)}</div>
                  <span className="text-sm text-muted-foreground">
                    {entry.rating}/5
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                記録情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">作成日時</Label>
                <p className="text-sm">{formatDate(entry.createdAt)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">最終更新</Label>
                <p className="text-sm">{formatDate(entry.updatedAt)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">記録ID</Label>
                <p className="text-xs font-mono text-muted-foreground">{entry.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Impression */}
          {entry.impression && (
            <Card>
              <CardHeader>
                <CardTitle>感想・印象</CardTitle>
                <CardDescription>この日の読書で感じたことや印象に残ったこと</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {entry.impression}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learnings */}
          {entry.learnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  学び・気づき
                </CardTitle>
                <CardDescription>この日の読書で得られた学びや新しい発見</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entry.learnings.map((learning, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{learning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {entry.notes && (
            <Card>
              <CardHeader>
                <CardTitle>メモ・備考</CardTitle>
                <CardDescription>追加のメモや備考事項</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {entry.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/books/${entry.book.id}`)}
                className="flex-1"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                書籍詳細を見る
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/entries')}
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                読書記録一覧
              </Button>
              <Button
                onClick={() => router.push(`/entries/new?bookId=${entry.book.id}`)}
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                この本の新しい記録
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

// Helper component for labels
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      {children}
    </label>
  );
}