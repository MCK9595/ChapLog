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
   # .NET Aspire でバックエンドサービスを起動
   dotnet run --project ChapLog.AppHost
   
   # フロントエンド（別ターミナル）
   cd chaplog-frontend && npm run dev
   ```

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

現在、プロジェクト構造の作成が完了しました。次のフェーズで実装を開始予定です。

### Phase 1: プロジェクト作成 ✅
- [x] .NETプロジェクト構造の作成
- [x] 設計書の作成
- [x] テスト構造の準備

### Phase 2: 実装 🔄
- [ ] エンティティ・DTOの実装
- [ ] データベースコンテキスト・マイグレーション
- [ ] リポジトリ・サービス層
- [ ] API エンドポイント
- [ ] フロントエンド UI
- [ ] 認証・認可機能

### Phase 3: テスト・品質保証 📋
- [ ] 単体テストの実装
- [ ] 結合テストの実装
- [ ] E2Eテストの実装
- [ ] パフォーマンス最適化

## 🤝 貢献

このプロジェクトは開発中です。貢献に関するガイドラインは後日追加予定です。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。