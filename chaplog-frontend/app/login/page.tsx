'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      toast({
        title: 'ログイン成功',
        description: 'ダッシュボードへリダイレクトしています...',
      });
      // Force navigation for immediate redirect
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'メールアドレスまたはパスワードが正しくありません';
      let errorTitle = 'ログインエラー';

      if (error.response?.data) {
        const responseData = error.response.data;
        
        // Handle API response with validation errors
        if (responseData.errors && typeof responseData.errors === 'object') {
          const validationErrors = Object.entries(responseData.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
          errorMessage = validationErrors;
          errorTitle = '入力エラー';
        }
        // Handle API response with message
        else if (responseData.message) {
          errorMessage = responseData.message;
        }
      }
      // Handle network errors
      else if (error.message) {
        if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
          errorMessage = 'サーバーに接続できません。しばらくしてから再試行してください。';
          errorTitle = '接続エラー';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'リクエストがタイムアウトしました。もう一度お試しください。';
          errorTitle = 'タイムアウト';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">ChapLog ログイン</CardTitle>
          <CardDescription className="text-center">
            読書記録の管理を始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                ログイン
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            アカウントをお持ちでない方は{' '}
            <Link href="/register" className="text-primary hover:underline">
              新規登録
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}