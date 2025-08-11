# ChapLog - 読書記録アプリ

ChapLogは、読書の進捗と感想を日記形式で記録し、学びを蓄積・振り返りできるWebアプリケーションです。

## 🚀 技術スタック

### バックエンド
- **.NET 9.0** - 最新の.NETフレームワーク
- **ASP.NET Core** - Web API
- **Entity Framework Core** - ORM
- **.NET Aspire 9.4** - コンテナオーケストレーション
- **PostgreSQL** - データベース
- **Redis** - キャッシュ
- **Seq** - 構造化ログ管理

### フロントエンド
- **Next.js 15** - Reactフレームワーク (App Router)
- **TypeScript** - 型安全性
- **Tailwind CSS + shadcn/ui** - スタイリング
- **Zustand** - 状態管理
- **TanStack Query** - サーバー状態管理
- **React Hook Form + Zod** - フォーム管理・バリデーション

### テスト
- **xUnit** - 単体テスト・結合テスト
- **.NET Aspire Testing** - 分散アプリケーションテスト
- **Playwright** - E2Eテスト

## 📁 プロジェクト構造

```
ChapLog/
├── ChapLog.Api/              # Web API プロジェクト
├── ChapLog.Core/             # ドメインモデル・インターフェース
├── ChapLog.Infrastructure/   # インフラストラクチャ層
├── ChapLog.MigrationService/ # データベースマイグレーションサービス
├── ChapLog.ServiceDefaults/  # 共通サービス設定
├── ChapLog.AppHost/          # .NET Aspire ホスト
├── ChapLog.Tests/            # テストプロジェクト
│   ├── ChapLog.UnitTests/
│   ├── ChapLog.IntegrationTests/
│   └── ChapLog.E2ETests/
├── chaplog-frontend/         # Next.js フロントエンド
└── docs/                     # 設計書・ドキュメント
```

## 📋 主な機能

### ✅ 実装予定の機能

#### ユーザー管理
- [x] ユーザー登録・ログイン
- [x] JWT認証
- [x] ロールベース認可（User/Admin）

#### 書籍管理
- [x] 書籍の手動登録
- [x] 書籍一覧表示・検索
- [x] ステータス管理（未読/読書中/読了）

#### 読書日記
- [x] 日別読書記録の作成
- [x] 感想・学びの記録
- [x] 進捗管理（ページ数）

#### レビュー機能
- [x] 読了後の総合レビュー
- [x] 評価・おすすめ度

#### 統計・分析
- [x] 読書統計の表示
- [x] 月別・ジャンル別分析

#### 管理機能
- [x] 管理者によるユーザー管理

## 🛠️ 開発環境のセットアップ

### 必要な環境
- .NET SDK 9.0
- Node.js 20.x
- Docker Desktop

### ローカル実行

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd ChapLog
   ```

2. **依存関係の復元**
   ```bash
   dotnet restore
   cd chaplog-frontend && npm install
   ```

3. **アプリケーションの起動**
   ```bash
   # .NET Aspire でフルスタック起動 (推奨)
   dotnet run --project ChapLog.AppHost
   
   # または個別に起動
   # バックエンド API
   dotnet run --project ChapLog.Api
   
   # フロントエンド（別ターミナル）
   cd chaplog-frontend && npm run dev
   ```

4. **アクセス**
   - **Aspire Dashboard**: http://localhost:15175
   - **API**: http://localhost:5000
   - **Frontend**: http://localhost:3000
   - **Swagger UI**: http://localhost:5000/swagger

## 🧪 テスト実行

```bash
# 全テスト実行
dotnet test

# 単体テストのみ
dotnet test ChapLog.Tests/ChapLog.UnitTests

# 結合テストのみ (.NET Aspire使用)
dotnet test ChapLog.Tests/ChapLog.IntegrationTests

# E2Eテストのみ
dotnet test ChapLog.Tests/ChapLog.E2ETests

# カバレッジ付きテスト
dotnet test --collect:"XPlat Code Coverage"
```

## 📚 ドキュメント

詳細な設計書は `docs/` ディレクトリに格納されています：

- [要件定義書](docs/requirements.md)
- [システム設計書](docs/system-design.md)
- [API設計書](docs/api-design.md)
- [データベース設計書](docs/database-design.md)
- [マイグレーションサービス設計書](docs/migration-service-design.md)
- [テスト設計書](docs/test-design.md)

## 🚦 開発状況

**🎉 バックエンド実装完了！** フル機能の読書記録APIが稼働中です。

### Phase 1: プロジェクト基盤 ✅
- [x] .NETプロジェクト構造の作成
- [x] 設計書の作成
- [x] テスト構造の準備

### Phase 2: バックエンド実装 ✅ **完了**
- [x] **エンティティ・DTOの実装** (25+ DTOs with validation)
- [x] **データベースコンテキスト・マイグレーション** (PostgreSQL + EF Core)
- [x] **リポジトリ・サービス層** (6 repositories, 6 services)
- [x] **API エンドポイント** (30+ REST endpoints across 7 controllers)
- [x] **認証・認可機能** (JWT + refresh tokens, role-based auth)
- [x] **Aspire オーケストレーション** (PostgreSQL, Redis, Seq)
- [x] **ミドルウェア** (例外処理, ログ記録, レート制限)

### Phase 3: フロントエンド基盤 ✅ **構造完成**
- [x] **Next.js 15 セットアップ** (App Router, TypeScript)
- [x] **UI コンポーネント** (shadcn/ui, Tailwind CSS)
- [x] **ページ構造** (14 pages: ダッシュボード, 書籍管理, 読書記録, レビュー, 統計)
- [x] **状態管理** (Zustand, React Hook Form, TanStack Query)
- [ ] **コンポーネント実装** (実際のUI実装)

### Phase 4: テスト・品質保証 📋
- [x] テストプロジェクト構造
- [ ] 単体テストの実装
- [ ] 結合テストの実装 (.NET Aspire Testing)
- [ ] E2Eテストの実装 (Playwright)
- [ ] パフォーマンス最適化

## 🏗️ 実装成果

### ✅ 完成したバックエンド (50+ files)
- **5つのエンティティ**: User, Book, ReadingEntry, BookReview, RefreshToken
- **25+ DTOs**: バリデーション付き完全なデータ転送オブジェクト
- **6つのリポジトリ**: ジェネリック基底パターンによるデータアクセス層
- **6つのサービス**: 認証, 書籍, 読書記録, レビュー, 統計, 管理機能
- **7つのコントローラ**: RESTful API エンドポイント
- **完全な認証システム**: JWT + リフレッシュトークン + ロールベース認可
- **本格運用対応**: 例外処理, ログ, レート制限, ヘルスチェック

### ✅ ビルド状況
```bash
dotnet build
# ✅ Build succeeded (1 warning, 0 errors)
# 全プロジェクトが正常にコンパイル
```

### 🎯 次のステップ

バックエンドAPIが完成しているため、以下の順番で開発を継続できます：

1. **フロントエンド実装** - UI コンポーネントの実装とAPIとの連携
2. **テスト実装** - 単体・結合・E2Eテストの追加
3. **高度な機能** - 通知, インポート/エクスポート, ソーシャル機能
4. **パフォーマンス最適化** - キャッシュ戦略とスケーリング
5. **本番デプロイ** - コンテナ化と CI/CD パイプライン

## 📈 API エンドポイント

完全に実装されたREST APIエンドポイント：

- **認証**: `/api/auth/*` - 登録, ログイン, トークンリフレッシュ
- **書籍管理**: `/api/books/*` - CRUD操作, ステータス管理
- **読書記録**: `/api/reading-entries/*` - 日別記録の作成・更新
- **レビュー**: `/api/book-reviews/*` - 読了後のレビュー管理
- **統計**: `/api/statistics/*` - 読書データの統計・分析
- **管理**: `/api/admin/*` - ユーザー管理機能

詳細は Swagger UI (http://localhost:5000/swagger) で確認できます。

## 🤝 貢献

バックエンドが完成しているため、フロントエンド実装やテスト追加での貢献を歓迎します。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。