"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuthStore } from "@/stores/auth.store";
import apiClient, { ApiResponse, PagedResult } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookReviewWithBook {
  id: string;
  bookId: string;
  completedDate: string;
  overallImpression: string;
  keyLearnings: string[];
  overallRating: number;
  recommendationLevel: number;
  createdAt: string;
  updatedAt: string;
  bookTitle: string;
  bookAuthor: string;
  bookGenre: string;
  bookTotalPages: number;
  bookImageUrl?: string;
}

export default function ReviewsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<BookReviewWithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchReviews();
  }, [isAuthenticated, router, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ApiResponse<PagedResult<BookReviewWithBook>>>(
        `/api/book-reviews?page=${currentPage}&pageSize=${pageSize}`
      );

      if (response.data.success && response.data.data) {
        const pagedResult = response.data.data;
        setReviews(pagedResult.items);
        setTotalPages(pagedResult.totalPages);
        setTotalCount(pagedResult.totalItems);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (bookId: string) => {
    if (!confirm('このレビューを削除してもよろしいですか？')) {
      return;
    }

    try {
      await apiClient.delete(`/api/book-reviews/book/${bookId}`);
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('レビューの削除に失敗しました');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getRecommendationBadge = (level: number) => {
    const badges = [
      { text: '推薦しない', variant: 'destructive' as const },
      { text: 'あまり推薦しない', variant: 'secondary' as const },
      { text: '普通', variant: 'outline' as const },
      { text: '推薦する', variant: 'default' as const },
      { text: '強く推薦する', variant: 'default' as const },
    ];
    return badges[level - 1] || badges[2];
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
            <h1 className="text-3xl font-bold">書籍レビュー</h1>
            <p className="text-muted-foreground mt-2">
              読了した本のレビュー一覧 ({totalCount}件)
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">レビューがありません</h3>
              <p className="text-muted-foreground mb-4">
                完読した書籍のレビューを書いてみましょう
              </p>
              <Button asChild>
                <Link href="/books">
                  <BookOpen className="h-4 w-4 mr-2" />
                  書籍一覧へ
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Reviews Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {review.bookTitle}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {review.bookAuthor} • {review.bookGenre}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/reviews/new?bookId=${review.bookId}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              編集
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteReview(review.bookId)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex">{renderStars(review.overallRating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {review.overallRating}/5
                      </span>
                    </div>

                    {/* Recommendation Level */}
                    <div>
                      <Badge variant={getRecommendationBadge(review.recommendationLevel).variant}>
                        {getRecommendationBadge(review.recommendationLevel).text}
                      </Badge>
                    </div>

                    {/* Overall Impression */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">総合的な感想</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {review.overallImpression}
                      </p>
                    </div>

                    {/* Key Learnings */}
                    {review.keyLearnings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">重要な学び・気づき</h4>
                        <div className="space-y-1">
                          {review.keyLearnings.slice(0, 2).map((learning, index) => (
                            <p key={index} className="text-sm text-muted-foreground line-clamp-1">
                              • {learning}
                            </p>
                          ))}
                          {review.keyLearnings.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              他 {review.keyLearnings.length - 2} 項目
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Book Info & Dates */}
                    <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>完読日</span>
                        <span>{formatDate(review.completedDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>レビュー投稿</span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>総ページ数</span>
                        <span>{review.bookTotalPages}ページ</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/books/${review.bookId}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          書籍詳細を見る
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {totalCount}件中 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)}件を表示
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    前へ
                  </Button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    次へ
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}