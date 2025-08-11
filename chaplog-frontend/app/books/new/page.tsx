"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/hooks/use-toast";
import { ArrowLeft, BookPlus } from "lucide-react";
import apiClient from "@/lib/api-client";

interface CreateBookRequest {
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

export default function NewBookPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateBookRequest>({
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

  const handleInputChange = (field: keyof CreateBookRequest, value: string | number) => {
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

    setLoading(true);

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

      console.log('Creating book with data:', submitData);

      const response = await apiClient.post('/api/books', submitData);
      
      if (response.data) {
        const book = response.data;
        toast({
          title: "成功",
          description: "本が正常に追加されました。",
        });
        router.push(`/books/${book.id}`);
      }
    } catch (error: any) {
      console.error('Failed to create book:', error);
      
      let errorMessage = "本の追加に失敗しました。";
      let errorTitle = "エラー";

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold">新しい本を追加</h1>
            <p className="text-muted-foreground mt-2">読書記録に新しい本を追加しましょう</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookPlus className="h-5 w-5" />
              基本情報
            </CardTitle>
            <CardDescription>本の基本的な情報を入力してください</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    タイトル <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="本のタイトルを入力"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">
                    著者 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="著者名を入力"
                    required
                  />
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publisher">出版社</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher || ""}
                    onChange={(e) => handleInputChange('publisher', e.target.value)}
                    placeholder="出版社名を入力"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="publicationYear">出版年</Label>
                  <Input
                    id="publicationYear"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.publicationYear || ""}
                    onChange={(e) => handleInputChange('publicationYear', parseInt(e.target.value))}
                    placeholder="例: 2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">ジャンル</Label>
                  <Input
                    id="genre"
                    value={formData.genre || ""}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    placeholder="例: 小説、ビジネス、技術書"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalPages">総ページ数</Label>
                  <Input
                    id="totalPages"
                    type="number"
                    min="1"
                    value={formData.totalPages || ""}
                    onChange={(e) => handleInputChange('totalPages', parseInt(e.target.value))}
                    placeholder="例: 300"
                  />
                </div>
              </div>

              {/* Reading Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">読書状況</Label>
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
                
                {formData.status === 'reading' && (
                  <div className="space-y-2">
                    <Label htmlFor="currentPage">現在のページ数</Label>
                    <Input
                      id="currentPage"
                      type="number"
                      min="0"
                      max={formData.totalPages || undefined}
                      value={formData.currentPage || 0}
                      onChange={(e) => handleInputChange('currentPage', parseInt(e.target.value))}
                      placeholder="現在読んでいるページ"
                    />
                  </div>
                )}
              </div>

              {/* Cover Image URL */}
              <div className="space-y-2">
                <Label htmlFor="coverImageUrl">カバー画像URL（オプション）</Label>
                <Input
                  id="coverImageUrl"
                  type="url"
                  value={formData.coverImageUrl || ""}
                  onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="この本についてのメモや感想を自由に記入してください"
                  rows={4}
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
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "追加中..." : "本を追加"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}