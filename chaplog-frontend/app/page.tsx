'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, BarChart3, PenTool, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loadUser, router]);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              ChapLog
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              読書の進捗と感想を記録する、シンプルで使いやすい読書管理アプリ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  無料で始める
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  ログイン
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ChapLogの特徴
            </h2>
            <p className="text-lg text-gray-600">
              読書体験をより豊かにする機能が揃っています
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">書籍管理</h3>
              <p className="text-gray-600">
                読みたい本、読書中、完読した本を簡単に管理
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <PenTool className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">読書記録</h3>
              <p className="text-gray-600">
                日々の読書進捗と感想を記録して振り返り
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Star className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">レビュー機能</h3>
              <p className="text-gray-600">
                完読後の総合評価と詳細なレビューを保存
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">読書統計</h3>
              <p className="text-gray-600">
                読書傾向や進捗を可視化して分析
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            今すぐ読書記録を始めよう
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            無料で利用できます。クレジットカードは不要です。
          </p>
          <Link href="/register">
            <Button size="lg">
              アカウントを作成する
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 ChapLog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
