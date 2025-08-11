# ChapLog - データベース設計書

## 1. データベース概要

### 1.1 基本情報
- **DBMS**: PostgreSQL 16
- **文字コード**: UTF-8
- **照合順序**: ja_JP.UTF-8
- **タイムゾーン**: Asia/Tokyo

### 1.2 命名規則
- **テーブル名**: PascalCase（例: Users, Books）
- **カラム名**: PascalCase（例: CreatedAt, BookTitle）
- **主キー**: Id
- **外部キー**: {参照テーブル名}Id（例: UserId, BookId）
- **インデックス**: IX_{テーブル名}_{カラム名}
- **制約**: CK_{テーブル名}_{制約内容}

## 2. ER図

```mermaid
erDiagram
    Users ||--o{ Books : "owns"
    Users ||--o{ ReadingEntries : "creates"
    Books ||--o{ ReadingEntries : "has"
    Books ||--o| BookReviews : "has"
    Users ||--o| BookReviews : "writes"
    Users ||--o{ RefreshTokens : "has"
    
    Users {
        uuid Id PK "主キー"
        string Email UK "メールアドレス"
        string NormalizedEmail UK "正規化メールアドレス"
        string UserName "ユーザー名"
        string NormalizedUserName "正規化ユーザー名"
        string PasswordHash "パスワードハッシュ"
        string SecurityStamp "セキュリティスタンプ"
        string ConcurrencyStamp "同時実行スタンプ"
        boolean EmailConfirmed "メール確認済み"
        boolean LockoutEnabled "ロックアウト有効"
        timestamp LockoutEnd "ロックアウト終了日時"
        int AccessFailedCount "アクセス失敗回数"
        string Role "ロール(User/Admin)"
        timestamp CreatedAt "作成日時"
        timestamp UpdatedAt "更新日時"
    }
    
    Books {
        uuid Id PK "主キー"
        uuid UserId FK "ユーザーID"
        string Title "タイトル"
        string Author "著者"
        string Publisher "出版社"
        int PublicationYear "出版年"
        int TotalPages "総ページ数"
        string Genre "ジャンル"
        string CoverImageUrl "表紙画像URL"
        string Status "ステータス(unread/reading/completed)"
        text Notes "メモ"
        int CurrentPage "現在のページ"
        timestamp StartedAt "読書開始日"
        timestamp CompletedAt "読了日"
        timestamp CreatedAt "作成日時"
        timestamp UpdatedAt "更新日時"
    }
    
    ReadingEntries {
        uuid Id PK "主キー"
        uuid BookId FK "書籍ID"
        uuid UserId FK "ユーザーID"
        date ReadingDate "読書日"
        int StartPage "開始ページ"
        int EndPage "終了ページ"
        string Chapter "章・セクション"
        text Impression "感想"
        json Learnings "学び（JSON配列）"
        int Rating "評価(1-5)"
        timestamp CreatedAt "作成日時"
        timestamp UpdatedAt "更新日時"
    }
    
    BookReviews {
        uuid Id PK "主キー"
        uuid BookId FK UK "書籍ID"
        uuid UserId FK "ユーザーID"
        date CompletedDate "読了日"
        text OverallImpression "全体の感想"
        json KeyLearnings "主な学び（JSON配列）"
        int OverallRating "総合評価(1-5)"
        int RecommendationLevel "おすすめ度(1-5)"
        timestamp CreatedAt "作成日時"
        timestamp UpdatedAt "更新日時"
    }
    
    RefreshTokens {
        uuid Id PK "主キー"
        uuid UserId FK "ユーザーID"
        string Token UK "トークン"
        timestamp ExpiresAt "有効期限"
        timestamp CreatedAt "作成日時"
        string CreatedByIp "作成元IP"
        timestamp RevokedAt "無効化日時"
        string RevokedByIp "無効化元IP"
        string ReplacedByToken "置換先トークン"
    }
```

## 3. テーブル定義

### 3.1 Users（ユーザー）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| Id | UUID | NO | gen_random_uuid() | 主キー |
| Email | VARCHAR(256) | NO | - | メールアドレス |
| NormalizedEmail | VARCHAR(256) | NO | - | 正規化メールアドレス |
| UserName | VARCHAR(256) | NO | - | ユーザー名 |
| NormalizedUserName | VARCHAR(256) | NO | - | 正規化ユーザー名 |
| PasswordHash | TEXT | NO | - | パスワードハッシュ |
| SecurityStamp | VARCHAR(256) | YES | - | セキュリティスタンプ |
| ConcurrencyStamp | VARCHAR(256) | YES | - | 同時実行スタンプ |
| EmailConfirmed | BOOLEAN | NO | false | メール確認済み |
| LockoutEnabled | BOOLEAN | NO | true | ロックアウト有効 |
| LockoutEnd | TIMESTAMPTZ | YES | - | ロックアウト終了日時 |
| AccessFailedCount | INT | NO | 0 | アクセス失敗回数 |
| Role | VARCHAR(50) | NO | 'User' | ロール |
| CreatedAt | TIMESTAMPTZ | NO | CURRENT_TIMESTAMP | 作成日時 |
| UpdatedAt | TIMESTAMPTZ | NO | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- IX_Users_Email (UNIQUE)
- IX_Users_NormalizedEmail (UNIQUE)
- IX_Users_NormalizedUserName

**制約**:
- CK_Users_Role: Role IN ('User', 'Admin')

### 3.2 Books（書籍）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| Id | UUID | NO | gen_random_uuid() | 主キー |
| UserId | UUID | NO | - | ユーザーID（FK） |
| Title | VARCHAR(500) | NO | - | タイトル |
| Author | VARCHAR(500) | NO | - | 著者 |
| Publisher | VARCHAR(256) | YES | - | 出版社 |
| PublicationYear | INT | YES | - | 出版年 |
| TotalPages | INT | YES | - | 総ページ数 |
| Genre | VARCHAR(100) | YES | - | ジャンル |
| CoverImageUrl | TEXT | YES | - | 表紙画像URL |
| Status | VARCHAR(20) | NO | 'unread' | ステータス |
| Notes | TEXT | YES | - | メモ |
| CurrentPage | INT | NO | 0 | 現在のページ |
| StartedAt | TIMESTAMPTZ | YES | - | 読書開始日 |
| CompletedAt | TIMESTAMPTZ | YES | - | 読了日 |
| CreatedAt | TIMESTAMPTZ | NO | CURRENT_TIMESTAMP | 作成日時 |
| UpdatedAt | TIMESTAMPTZ | NO | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- IX_Books_UserId
- IX_Books_Status
- IX_Books_CreatedAt
- IX_Books_Title_Author (複合インデックス)

**制約**:
- FK_Books_Users: UserId → Users.Id (CASCADE DELETE)
- CK_Books_Status: Status IN ('unread', 'reading', 'completed')
- CK_Books_CurrentPage: CurrentPage >= 0
- CK_Books_TotalPages: TotalPages > 0

### 3.3 ReadingEntries（読書日記）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| Id | UUID | NO | gen_random_uuid() | 主キー |
| BookId | UUID | NO | - | 書籍ID（FK） |
| UserId | UUID | NO | - | ユーザーID（FK） |
| ReadingDate | DATE | NO | - | 読書日 |
| StartPage | INT | NO | - | 開始ページ |
| EndPage | INT | NO | - | 終了ページ |
| Chapter | VARCHAR(256) | YES | - | 章・セクション |
| Impression | TEXT | YES | - | 感想 |
| Learnings | JSONB | YES | '[]' | 学び（JSON配列） |
| Rating | INT | NO | - | 評価 |
| CreatedAt | TIMESTAMPTZ | NO | CURRENT_TIMESTAMP | 作成日時 |
| UpdatedAt | TIMESTAMPTZ | NO | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- IX_ReadingEntries_BookId
- IX_ReadingEntries_UserId
- IX_ReadingEntries_ReadingDate
- IX_ReadingEntries_BookId_ReadingDate (複合インデックス)

**制約**:
- FK_ReadingEntries_Books: BookId → Books.Id (CASCADE DELETE)
- FK_ReadingEntries_Users: UserId → Users.Id (CASCADE DELETE)
- CK_ReadingEntries_Rating: Rating BETWEEN 1 AND 5
- CK_ReadingEntries_Pages: StartPage <= EndPage AND StartPage > 0

### 3.4 BookReviews（書籍レビュー）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| Id | UUID | NO | gen_random_uuid() | 主キー |
| BookId | UUID | NO | - | 書籍ID（FK） |
| UserId | UUID | NO | - | ユーザーID（FK） |
| CompletedDate | DATE | NO | - | 読了日 |
| OverallImpression | TEXT | NO | - | 全体の感想 |
| KeyLearnings | JSONB | YES | '[]' | 主な学び（JSON配列） |
| OverallRating | INT | NO | - | 総合評価 |
| RecommendationLevel | INT | NO | - | おすすめ度 |
| CreatedAt | TIMESTAMPTZ | NO | CURRENT_TIMESTAMP | 作成日時 |
| UpdatedAt | TIMESTAMPTZ | NO | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- IX_BookReviews_BookId (UNIQUE)
- IX_BookReviews_UserId

**制約**:
- FK_BookReviews_Books: BookId → Books.Id (CASCADE DELETE)
- FK_BookReviews_Users: UserId → Users.Id (CASCADE DELETE)
- CK_BookReviews_OverallRating: OverallRating BETWEEN 1 AND 5
- CK_BookReviews_RecommendationLevel: RecommendationLevel BETWEEN 1 AND 5

### 3.5 RefreshTokens（リフレッシュトークン）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| Id | UUID | NO | gen_random_uuid() | 主キー |
| UserId | UUID | NO | - | ユーザーID（FK） |
| Token | VARCHAR(256) | NO | - | トークン |
| ExpiresAt | TIMESTAMPTZ | NO | - | 有効期限 |
| CreatedAt | TIMESTAMPTZ | NO | CURRENT_TIMESTAMP | 作成日時 |
| CreatedByIp | VARCHAR(45) | YES | - | 作成元IP |
| RevokedAt | TIMESTAMPTZ | YES | - | 無効化日時 |
| RevokedByIp | VARCHAR(45) | YES | - | 無効化元IP |
| ReplacedByToken | VARCHAR(256) | YES | - | 置換先トークン |

**インデックス**:
- IX_RefreshTokens_Token (UNIQUE)
- IX_RefreshTokens_UserId
- IX_RefreshTokens_ExpiresAt

**制約**:
- FK_RefreshTokens_Users: UserId → Users.Id (CASCADE DELETE)

## 4. ビューとストアドプロシージャ

### 4.1 ビュー

#### V_UserBookStatistics（ユーザー書籍統計）
```sql
CREATE VIEW V_UserBookStatistics AS
SELECT 
    u.Id AS UserId,
    u.UserName,
    COUNT(DISTINCT b.Id) AS TotalBooks,
    COUNT(DISTINCT CASE WHEN b.Status = 'completed' THEN b.Id END) AS CompletedBooks,
    COUNT(DISTINCT CASE WHEN b.Status = 'reading' THEN b.Id END) AS ReadingBooks,
    COUNT(DISTINCT CASE WHEN b.Status = 'unread' THEN b.Id END) AS UnreadBooks,
    COALESCE(SUM(b.TotalPages), 0) AS TotalPages,
    COALESCE(SUM(CASE WHEN b.Status = 'completed' THEN b.TotalPages ELSE b.CurrentPage END), 0) AS ReadPages,
    COUNT(DISTINCT re.Id) AS TotalEntries,
    AVG(br.OverallRating) AS AverageRating
FROM Users u
LEFT JOIN Books b ON u.Id = b.UserId
LEFT JOIN ReadingEntries re ON b.Id = re.BookId
LEFT JOIN BookReviews br ON b.Id = br.BookId
GROUP BY u.Id, u.UserName;
```

#### V_MonthlyReadingStats（月別読書統計）
```sql
CREATE VIEW V_MonthlyReadingStats AS
SELECT 
    b.UserId,
    DATE_TRUNC('month', b.CompletedAt) AS Month,
    COUNT(DISTINCT b.Id) AS CompletedBooks,
    SUM(b.TotalPages) AS ReadPages,
    COUNT(DISTINCT re.Id) AS Entries,
    AVG(br.OverallRating) AS AverageRating
FROM Books b
INNER JOIN BookReviews br ON b.Id = br.BookId
LEFT JOIN ReadingEntries re ON b.Id = re.BookId 
    AND DATE_TRUNC('month', re.ReadingDate) = DATE_TRUNC('month', b.CompletedAt)
WHERE b.Status = 'completed' AND b.CompletedAt IS NOT NULL
GROUP BY b.UserId, DATE_TRUNC('month', b.CompletedAt);
```

### 4.2 ストアドプロシージャ

#### SP_UpdateBookStatus（書籍ステータス更新）
```sql
CREATE OR REPLACE PROCEDURE SP_UpdateBookStatus(
    p_BookId UUID,
    p_Status VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Books 
    SET 
        Status = p_Status,
        StartedAt = CASE 
            WHEN p_Status = 'reading' AND StartedAt IS NULL 
            THEN CURRENT_TIMESTAMP 
            ELSE StartedAt 
        END,
        CompletedAt = CASE 
            WHEN p_Status = 'completed' 
            THEN CURRENT_TIMESTAMP 
            ELSE CompletedAt 
        END,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE Id = p_BookId;
END;
$$;
```

#### SP_CalculateReadingProgress（読書進捗計算）
```sql
CREATE OR REPLACE FUNCTION FN_CalculateReadingProgress(
    p_BookId UUID
) RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_CurrentPage INT;
    v_TotalPages INT;
    v_LastEntryPage INT;
BEGIN
    -- 書籍情報取得
    SELECT CurrentPage, TotalPages 
    INTO v_CurrentPage, v_TotalPages
    FROM Books 
    WHERE Id = p_BookId;
    
    -- 最新の日記エントリから進捗を取得
    SELECT MAX(EndPage) 
    INTO v_LastEntryPage
    FROM ReadingEntries 
    WHERE BookId = p_BookId;
    
    -- 進捗を更新
    IF v_LastEntryPage IS NOT NULL AND v_LastEntryPage > v_CurrentPage THEN
        UPDATE Books 
        SET CurrentPage = v_LastEntryPage, UpdatedAt = CURRENT_TIMESTAMP
        WHERE Id = p_BookId;
        
        RETURN v_LastEntryPage;
    END IF;
    
    RETURN v_CurrentPage;
END;
$$;
```

## 5. インデックス設計

### 5.1 パフォーマンス向上のためのインデックス

```sql
-- 書籍検索用（部分一致検索）
CREATE INDEX IX_Books_Title_gin ON Books USING gin(Title gin_trgm_ops);
CREATE INDEX IX_Books_Author_gin ON Books USING gin(Author gin_trgm_ops);

-- 日付範囲検索用
CREATE INDEX IX_ReadingEntries_ReadingDate_brin ON ReadingEntries USING brin(ReadingDate);
CREATE INDEX IX_Books_CreatedAt_brin ON Books USING brin(CreatedAt);

-- 統計クエリ用
CREATE INDEX IX_Books_UserId_Status ON Books(UserId, Status) INCLUDE (TotalPages, CurrentPage);
CREATE INDEX IX_ReadingEntries_BookId_ReadingDate ON ReadingEntries(BookId, ReadingDate DESC);
```

## 6. パーティショニング戦略

### 6.1 ReadingEntries テーブルのパーティショニング

```sql
-- 年単位でパーティショニング
CREATE TABLE ReadingEntries_2024 PARTITION OF ReadingEntries
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE ReadingEntries_2025 PARTITION OF ReadingEntries
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

## 7. バックアップとリカバリ

### 7.1 バックアップ戦略
- **フルバックアップ**: 週1回（日曜日深夜）
- **差分バックアップ**: 毎日深夜
- **トランザクションログ**: 連続アーカイブ

### 7.2 バックアップスクリプト
```bash
#!/bin/bash
# 日次バックアップスクリプト
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup/chaplog"
DB_NAME="chaplogdb"

pg_dump -h localhost -U postgres -d $DB_NAME -Fc -f "$BACKUP_DIR/chaplog_$DATE.dump"

# 7日以上前のバックアップを削除
find $BACKUP_DIR -name "chaplog_*.dump" -mtime +7 -delete
```

## 8. セキュリティ設計

### 8.1 ロールとアクセス権限

```sql
-- アプリケーションユーザー作成
CREATE ROLE chaplog_app WITH LOGIN PASSWORD 'secure_password';

-- 権限付与
GRANT CONNECT ON DATABASE chaplogdb TO chaplog_app;
GRANT USAGE ON SCHEMA public TO chaplog_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO chaplog_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO chaplog_app;

-- 管理者ロール
CREATE ROLE chaplog_admin WITH LOGIN PASSWORD 'admin_password';
GRANT ALL PRIVILEGES ON DATABASE chaplogdb TO chaplog_admin;
```

### 8.2 行レベルセキュリティ

```sql
-- 行レベルセキュリティを有効化
ALTER TABLE Books ENABLE ROW LEVEL SECURITY;
ALTER TABLE ReadingEntries ENABLE ROW LEVEL SECURITY;
ALTER TABLE BookReviews ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（ユーザーは自分のデータのみアクセス可能）
CREATE POLICY books_policy ON Books
    FOR ALL TO chaplog_app
    USING (UserId = current_setting('app.current_user_id')::UUID);

CREATE POLICY entries_policy ON ReadingEntries
    FOR ALL TO chaplog_app
    USING (UserId = current_setting('app.current_user_id')::UUID);
```

## 9. 監視とメンテナンス

### 9.1 監視項目
- 接続数
- クエリ実行時間
- デッドロック発生数
- ディスク使用率
- インデックス使用率

### 9.2 定期メンテナンス

```sql
-- 週次メンテナンススクリプト
-- 統計情報の更新
ANALYZE;

-- インデックスの再構築
REINDEX DATABASE chaplogdb;

-- 不要な領域の回収
VACUUM FULL ANALYZE;
```

## 10. 移行スクリプト

### 10.1 初期セットアップ

```sql
-- データベース作成
CREATE DATABASE chaplogdb
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'ja_JP.UTF-8'
    LC_CTYPE = 'ja_JP.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### 10.2 Entity Framework Core マイグレーション

#### 10.2.1 開発時のマイグレーション管理
```bash
# 初期マイグレーション作成
dotnet ef migrations add InitialCreate -p ChapLog.Infrastructure -s ChapLog.Api

# マイグレーション適用（開発環境）
dotnet ef database update -p ChapLog.Infrastructure -s ChapLog.Api

# マイグレーションの削除（必要な場合）
dotnet ef migrations remove -p ChapLog.Infrastructure -s ChapLog.Api
```

#### 10.2.2 本番環境でのマイグレーション
本番環境では、ChapLog.MigrationService が自動的にマイグレーションを実行します。

```csharp
// ChapLogDbContext.cs の設定例
public class ChapLogDbContext : DbContext
{
    public ChapLogDbContext(DbContextOptions<ChapLogDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<ReadingEntry> ReadingEntries => Set<ReadingEntry>();
    public DbSet<BookReview> BookReviews => Set<BookReview>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // インデックスの設定
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Book>()
            .HasIndex(b => new { b.UserId, b.Status });

        modelBuilder.Entity<ReadingEntry>()
            .HasIndex(e => new { e.BookId, e.ReadingDate });

        // 制約の設定
        modelBuilder.Entity<Book>()
            .HasCheckConstraint("CK_Books_Status", 
                "Status IN ('unread', 'reading', 'completed')");

        modelBuilder.Entity<ReadingEntry>()
            .HasCheckConstraint("CK_ReadingEntries_Rating", 
                "Rating BETWEEN 1 AND 5");
    }
}
```

#### 10.2.3 マイグレーションサービスのメリット
- アプリケーション起動前に自動的にデータベースを最新状態に更新
- 複数のインスタンスが同時に起動してもマイグレーションは1回のみ実行
- ログによるマイグレーション実行の追跡が可能
- 初期データのシーディングも統合管理