"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Download, 
  Upload, 
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserSettings {
  // Profile
  displayName: string;
  email: string;
  bio: string;
  
  // Reading Preferences
  defaultBookStatus: 'unread' | 'reading' | 'completed';
  booksPerPage: number;
  entriesPerPage: number;
  reviewsPerPage: number;
  
  // Notifications
  emailNotifications: boolean;
  readingReminders: boolean;
  weeklyDigest: boolean;
  reviewReminders: boolean;
  
  // Privacy
  profileVisibility: 'public' | 'private';
  showReadingStats: boolean;
  showCurrentReading: boolean;
  
  // Advanced
  dataExportFormat: 'json' | 'csv';
  autoBackup: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    bio: '',
    defaultBookStatus: 'unread',
    booksPerPage: 10,
    entriesPerPage: 10,
    reviewsPerPage: 10,
    emailNotifications: true,
    readingReminders: true,
    weeklyDigest: false,
    reviewReminders: true,
    profileVisibility: 'private',
    showReadingStats: true,
    showCurrentReading: true,
    dataExportFormat: 'json',
    autoBackup: false,
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Initialize with user data
    if (user) {
      setSettings(prev => ({
        ...prev,
        displayName: user.userName || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, router, user]);

  const handleSettingsChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePasswordChange = (key: keyof typeof passwordForm, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save profile settings
      console.log('Saving profile settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('プロフィール設定を保存しました');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save preferences
      console.log('Saving preferences:', {
        defaultBookStatus: settings.defaultBookStatus,
        booksPerPage: settings.booksPerPage,
        entriesPerPage: settings.entriesPerPage,
        reviewsPerPage: settings.reviewsPerPage,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('読書設定を保存しました');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save notification settings
      console.log('Saving notifications:', {
        emailNotifications: settings.emailNotifications,
        readingReminders: settings.readingReminders,
        weeklyDigest: settings.weeklyDigest,
        reviewReminders: settings.reviewReminders,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('通知設定を保存しました');
    } catch (error) {
      console.error('Failed to save notifications:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新しいパスワードと確認用パスワードが一致しません');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('パスワードは6文字以上で入力してください');
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement API call to change password
      console.log('Changing password');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      alert('パスワードを変更しました');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('パスワードの変更に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // TODO: Implement data export
      console.log('Exporting data in format:', settings.dataExportFormat);
      
      // Simulate export
      const exportData = {
        user: user,
        exportDate: new Date().toISOString(),
        format: settings.dataExportFormat,
        // Would include actual user data here
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chaplog-export-${new Date().toISOString().split('T')[0]}.${settings.dataExportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('データのエクスポートが完了しました');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('データのエクスポートに失敗しました');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion API call
      console.log('Deleting account');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Logout and redirect
      await logout();
      router.push('/');
      
      alert('アカウントを削除しました');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('アカウントの削除に失敗しました');
    }
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
        <div>
          <h1 className="text-3xl font-bold">設定</h1>
          <p className="text-muted-foreground mt-2">
            アカウントと読書設定を管理する
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="preferences">読書設定</TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
            <TabsTrigger value="advanced">詳細設定</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  プロフィール情報
                </CardTitle>
                <CardDescription>
                  基本的なプロフィール情報を編集できます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">表示名</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => handleSettingsChange('displayName', e.target.value)}
                    placeholder="表示名を入力"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingsChange('email', e.target.value)}
                    placeholder="メールアドレス"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">自己紹介</Label>
                  <Textarea
                    id="bio"
                    value={settings.bio}
                    onChange={(e) => handleSettingsChange('bio', e.target.value)}
                    placeholder="読書について、好きなジャンルなど..."
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : 'プロフィールを保存'}
                </Button>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle>パスワード変更</CardTitle>
                <CardDescription>
                  セキュリティのため定期的にパスワードを変更することをお勧めします
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">現在のパスワード</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">新しいパスワード</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={handleChangePassword} 
                  disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                >
                  {saving ? '変更中...' : 'パスワードを変更'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  読書設定
                </CardTitle>
                <CardDescription>
                  読書記録の既定値とページング設定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultStatus">新しい書籍の既定ステータス</Label>
                  <Select 
                    value={settings.defaultBookStatus} 
                    onValueChange={(value: any) => handleSettingsChange('defaultBookStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unread">未読</SelectItem>
                      <SelectItem value="reading">読書中</SelectItem>
                      <SelectItem value="completed">完読済み</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-semibold">ページング設定</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="booksPerPage">書籍一覧の表示件数</Label>
                      <Select 
                        value={settings.booksPerPage.toString()} 
                        onValueChange={(value) => handleSettingsChange('booksPerPage', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5件</SelectItem>
                          <SelectItem value="10">10件</SelectItem>
                          <SelectItem value="20">20件</SelectItem>
                          <SelectItem value="50">50件</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="entriesPerPage">記録一覧の表示件数</Label>
                      <Select 
                        value={settings.entriesPerPage.toString()} 
                        onValueChange={(value) => handleSettingsChange('entriesPerPage', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5件</SelectItem>
                          <SelectItem value="10">10件</SelectItem>
                          <SelectItem value="20">20件</SelectItem>
                          <SelectItem value="50">50件</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reviewsPerPage">レビュー一覧の表示件数</Label>
                      <Select 
                        value={settings.reviewsPerPage.toString()} 
                        onValueChange={(value) => handleSettingsChange('reviewsPerPage', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5件</SelectItem>
                          <SelectItem value="10">10件</SelectItem>
                          <SelectItem value="20">20件</SelectItem>
                          <SelectItem value="50">50件</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleSavePreferences} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '読書設定を保存'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  通知設定
                </CardTitle>
                <CardDescription>
                  受信する通知の種類を選択できます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">メール通知</Label>
                    <p className="text-sm text-muted-foreground">
                      重要な更新をメールで受信する
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">読書リマインダー</Label>
                    <p className="text-sm text-muted-foreground">
                      読書習慣を維持するためのリマインダー
                    </p>
                  </div>
                  <Switch
                    checked={settings.readingReminders}
                    onCheckedChange={(checked) => handleSettingsChange('readingReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">週次ダイジェスト</Label>
                    <p className="text-sm text-muted-foreground">
                      週の読書活動まとめを受信する
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => handleSettingsChange('weeklyDigest', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">レビューリマインダー</Label>
                    <p className="text-sm text-muted-foreground">
                      完読した本のレビュー作成を促す
                    </p>
                  </div>
                  <Switch
                    checked={settings.reviewReminders}
                    onCheckedChange={(checked) => handleSettingsChange('reviewReminders', checked)}
                  />
                </div>
                
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '通知設定を保存'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  プライバシー設定
                </CardTitle>
                <CardDescription>
                  情報の公開範囲を制御できます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">プロフィールの公開設定</Label>
                  <Select 
                    value={settings.profileVisibility} 
                    onValueChange={(value: any) => handleSettingsChange('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">公開</SelectItem>
                      <SelectItem value="private">非公開</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">読書統計を表示</Label>
                    <p className="text-sm text-muted-foreground">
                      読書統計情報をプロフィールに表示する
                    </p>
                  </div>
                  <Switch
                    checked={settings.showReadingStats}
                    onCheckedChange={(checked) => handleSettingsChange('showReadingStats', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">現在読んでいる本を表示</Label>
                    <p className="text-sm text-muted-foreground">
                      読書中の本をプロフィールに表示する
                    </p>
                  </div>
                  <Switch
                    checked={settings.showCurrentReading}
                    onCheckedChange={(checked) => handleSettingsChange('showCurrentReading', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle>データ管理</CardTitle>
                <CardDescription>
                  データのエクスポート・インポート・削除
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exportFormat">エクスポート形式</Label>
                  <Select 
                    value={settings.dataExportFormat} 
                    onValueChange={(value: any) => handleSettingsChange('dataExportFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">自動バックアップ</Label>
                    <p className="text-sm text-muted-foreground">
                      データを定期的に自動バックアップする
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleSettingsChange('autoBackup', checked)}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    データをエクスポート
                  </Button>
                  <Button variant="outline" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    データをインポート
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  危険な操作
                </CardTitle>
                <CardDescription>
                  これらの操作は取り消すことができません
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      アカウントを削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>アカウントを削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消すことができません。すべての読書記録、レビュー、統計データが完全に削除されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        削除する
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}