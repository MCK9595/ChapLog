'use client';

import { useState } from 'react';
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
import { useToast } from '@/components/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  userName: z.string().min(3, 'ユーザー名は3文字以上で入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      userName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(values.email, values.userName, values.password);
      toast({
        title: '登録成功',
        description: 'アカウントが作成されました。ダッシュボードへリダイレクトしています...',
      });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'アカウントの作成に失敗しました';
      let errorTitle = '登録エラー';

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
          // Set appropriate title based on status code
          if (error.response.status === 409) {
            errorTitle = '登録エラー';
          }
        }
      }
      // Handle network errors
      else if (error.message) {
        if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
          errorMessage = 'サーバーに接続できません。しばらくしてから再試行してください。';
          errorTitle = '接続エラー';
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
          <CardTitle className="text-2xl font-bold text-center">ChapLog 新規登録</CardTitle>
          <CardDescription className="text-center">
            アカウントを作成して読書記録を始めましょう
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
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ユーザー名</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="読書太郎"
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード（確認）</FormLabel>
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
                アカウント作成
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}