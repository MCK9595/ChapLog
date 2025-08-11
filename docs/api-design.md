# ChapLog - API設計書

## 1. API概要

### 1.1 基本情報
- **Base URL**: `https://api.chaplog.local`
- **API Version**: v1
- **Protocol**: HTTPS only
- **Format**: JSON
- **Authentication**: JWT Bearer Token

### 1.2 共通仕様

#### リクエストヘッダー
```http
Content-Type: application/json
Authorization: Bearer {token}
Accept: application/json
```

#### レスポンス形式
```json
{
  "data": {},
  "success": true,
  "message": "Success",
  "errors": []
}
```

#### エラーレスポンス
```json
{
  "data": null,
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

#### HTTPステータスコード
- `200 OK`: 正常処理
- `201 Created`: リソース作成成功
- `204 No Content`: 正常処理（レスポンスボディなし）
- `400 Bad Request`: リクエストエラー
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 権限エラー
- `404 Not Found`: リソースが見つからない
- `422 Unprocessable Entity`: バリデーションエラー
- `500 Internal Server Error`: サーバーエラー

## 2. 認証API

### 2.1 ユーザー登録
**POST** `/api/v1/auth/register`

#### Request
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "userName": "John Doe"
}
```

#### Response (201 Created)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "userName": "John Doe",
    "role": "User",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "success": true,
  "message": "User registered successfully"
}
```

### 2.2 ログイン
**POST** `/api/v1/auth/login`

#### Request
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### Response (200 OK)
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "expiresIn": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "userName": "John Doe",
      "role": "User"
    }
  },
  "success": true,
  "message": "Login successful"
}
```

### 2.3 トークンリフレッシュ
**POST** `/api/v1/auth/refresh`

#### Request
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

#### Response (200 OK)
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "bmV3IHJlZnJlc2ggdG9rZW4...",
    "expiresIn": 3600
  },
  "success": true,
  "message": "Token refreshed successfully"
}
```

### 2.4 ログアウト
**POST** `/api/v1/auth/logout`

#### Request
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

#### Response (204 No Content)

## 3. 書籍管理API

### 3.1 書籍一覧取得
**GET** `/api/v1/books`

#### Query Parameters
- `status`: フィルタリング（unread/reading/completed）
- `search`: 検索キーワード（タイトル・著者）
- `sortBy`: ソート項目（createdAt/updatedAt/title/status）
- `sortOrder`: ソート順（asc/desc）
- `page`: ページ番号（デフォルト: 1）
- `pageSize`: ページサイズ（デフォルト: 20）

#### Response (200 OK)
```json
{
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "プログラミングの心理学",
        "author": "ジェラルド・M・ワインバーグ",
        "publisher": "技術評論社",
        "publicationYear": 2020,
        "totalPages": 300,
        "genre": "技術書",
        "coverImageUrl": "https://example.com/cover.jpg",
        "status": "reading",
        "currentPage": 150,
        "progress": 50,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z"
      }
    ],
    "totalCount": 50,
    "pageCount": 3,
    "currentPage": 1,
    "pageSize": 20
  },
  "success": true,
  "message": "Books retrieved successfully"
}
```

### 3.2 書籍詳細取得
**GET** `/api/v1/books/{id}`

#### Response (200 OK)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "プログラミングの心理学",
    "author": "ジェラルド・M・ワインバーグ",
    "publisher": "技術評論社",
    "publicationYear": 2020,
    "totalPages": 300,
    "genre": "技術書",
    "coverImageUrl": "https://example.com/cover.jpg",
    "status": "reading",
    "notes": "プログラミングにおける人間的側面について",
    "currentPage": 150,
    "progress": 50,
    "startedAt": "2024-01-16T09:00:00Z",
    "completedAt": null,
    "entryCount": 5,
    "lastEntryDate": "2024-01-20T15:00:00Z",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  },
  "success": true,
  "message": "Book retrieved successfully"
}
```

### 3.3 書籍登録
**POST** `/api/v1/books`

#### Request
```json
{
  "title": "プログラミングの心理学",
  "author": "ジェラルド・M・ワインバーグ",
  "publisher": "技術評論社",
  "publicationYear": 2020,
  "totalPages": 300,
  "genre": "技術書",
  "coverImageUrl": "https://example.com/cover.jpg",
  "notes": "プログラミングにおける人間的側面について"
}
```

#### Response (201 Created)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "プログラミングの心理学",
    "author": "ジェラルド・M・ワインバーグ",
    "status": "unread",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "success": true,
  "message": "Book created successfully"
}
```

### 3.4 書籍更新
**PUT** `/api/v1/books/{id}`

#### Request
```json
{
  "title": "プログラミングの心理学 第2版",
  "author": "ジェラルド・M・ワインバーグ",
  "publisher": "技術評論社",
  "publicationYear": 2021,
  "totalPages": 320,
  "genre": "技術書",
  "coverImageUrl": "https://example.com/cover-v2.jpg",
  "notes": "第2版では新章が追加"
}
```

#### Response (200 OK)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "プログラミングの心理学 第2版",
    "updatedAt": "2024-01-20T16:00:00Z"
  },
  "success": true,
  "message": "Book updated successfully"
}
```

### 3.5 書籍削除
**DELETE** `/api/v1/books/{id}`

#### Response (204 No Content)

### 3.6 書籍ステータス更新
**PATCH** `/api/v1/books/{id}/status`

#### Request
```json
{
  "status": "completed"
}
```

#### Response (200 OK)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "completed",
    "completedAt": "2024-01-25T10:00:00Z"
  },
  "success": true,
  "message": "Book status updated successfully"
}
```

## 4. 読書日記API

### 4.1 日記エントリ一覧取得
**GET** `/api/v1/books/{bookId}/entries`

#### Query Parameters
- `page`: ページ番号
- `pageSize`: ページサイズ

#### Response (200 OK)
```json
{
  "data": {
    "items": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "bookId": "550e8400-e29b-41d4-a716-446655440001",
        "readingDate": "2024-01-20",
        "startPage": 100,
        "endPage": 150,
        "chapter": "第5章 プログラマーの心理",
        "impression": "プログラマーの思考プロセスについて深い洞察を得た",
        "learnings": [
          "コードレビューの重要性",
          "ペアプログラミングの効果"
        ],
        "rating": 5,
        "createdAt": "2024-01-20T15:00:00Z"
      }
    ],
    "totalCount": 5,
    "currentPage": 1,
    "pageSize": 20
  },
  "success": true,
  "message": "Entries retrieved successfully"
}
```

### 4.2 日記エントリ詳細取得
**GET** `/api/v1/entries/{id}`

#### Response (200 OK)
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "bookId": "550e8400-e29b-41d4-a716-446655440001",
    "bookTitle": "プログラミングの心理学",
    "readingDate": "2024-01-20",
    "startPage": 100,
    "endPage": 150,
    "chapter": "第5章 プログラマーの心理",
    "impression": "プログラマーの思考プロセスについて深い洞察を得た",
    "learnings": [
      "コードレビューの重要性",
      "ペアプログラミングの効果"
    ],
    "rating": 5,
    "createdAt": "2024-01-20T15:00:00Z",
    "updatedAt": "2024-01-20T15:00:00Z"
  },
  "success": true,
  "message": "Entry retrieved successfully"
}
```

### 4.3 日記エントリ作成
**POST** `/api/v1/books/{bookId}/entries`

#### Request
```json
{
  "readingDate": "2024-01-20",
  "startPage": 100,
  "endPage": 150,
  "chapter": "第5章 プログラマーの心理",
  "impression": "プログラマーの思考プロセスについて深い洞察を得た",
  "learnings": [
    "コードレビューの重要性",
    "ペアプログラミングの効果"
  ],
  "rating": 5
}
```

#### Response (201 Created)
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "bookId": "550e8400-e29b-41d4-a716-446655440001",
    "readingDate": "2024-01-20",
    "createdAt": "2024-01-20T15:00:00Z"
  },
  "success": true,
  "message": "Entry created successfully"
}
```

### 4.4 日記エントリ更新
**PUT** `/api/v1/entries/{id}`

#### Request
```json
{
  "readingDate": "2024-01-20",
  "startPage": 100,
  "endPage": 160,
  "chapter": "第5章 プログラマーの心理",
  "impression": "プログラマーの思考プロセスについて深い洞察を得た。特にデバッグ時の心理状態が興味深い。",
  "learnings": [
    "コードレビューの重要性",
    "ペアプログラミングの効果",
    "デバッグ時の心理的アプローチ"
  ],
  "rating": 5
}
```

#### Response (200 OK)
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "updatedAt": "2024-01-20T16:00:00Z"
  },
  "success": true,
  "message": "Entry updated successfully"
}
```

### 4.5 日記エントリ削除
**DELETE** `/api/v1/entries/{id}`

#### Response (204 No Content)

## 5. レビューAPI

### 5.1 レビュー取得
**GET** `/api/v1/books/{bookId}/review`

#### Response (200 OK)
```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "bookId": "550e8400-e29b-41d4-a716-446655440001",
    "completedDate": "2024-01-25",
    "overallImpression": "プログラミングの技術的側面だけでなく、人間的側面を深く理解できる素晴らしい本",
    "keyLearnings": [
      "プログラミングは単なる技術ではなく、人間の活動である",
      "チーム開発における心理的安全性の重要性",
      "コードの可読性と心理的負荷の関係"
    ],
    "overallRating": 5,
    "recommendationLevel": 5,
    "createdAt": "2024-01-25T10:00:00Z",
    "updatedAt": "2024-01-25T10:00:00Z"
  },
  "success": true,
  "message": "Review retrieved successfully"
}
```

### 5.2 レビュー作成
**POST** `/api/v1/books/{bookId}/review`

#### Request
```json
{
  "completedDate": "2024-01-25",
  "overallImpression": "プログラミングの技術的側面だけでなく、人間的側面を深く理解できる素晴らしい本",
  "keyLearnings": [
    "プログラミングは単なる技術ではなく、人間の活動である",
    "チーム開発における心理的安全性の重要性",
    "コードの可読性と心理的負荷の関係"
  ],
  "overallRating": 5,
  "recommendationLevel": 5
}
```

#### Response (201 Created)
```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "bookId": "550e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2024-01-25T10:00:00Z"
  },
  "success": true,
  "message": "Review created successfully"
}
```

### 5.3 レビュー更新
**PUT** `/api/v1/books/{bookId}/review`

#### Request
(同じ形式)

#### Response (200 OK)
```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "updatedAt": "2024-01-25T11:00:00Z"
  },
  "success": true,
  "message": "Review updated successfully"
}
```

## 6. 統計API

### 6.1 統計サマリー取得
**GET** `/api/v1/statistics/summary`

#### Response (200 OK)
```json
{
  "data": {
    "totalBooks": 50,
    "completedBooks": 20,
    "readingBooks": 5,
    "unreadBooks": 25,
    "totalPages": 15000,
    "readPages": 6000,
    "averageRating": 4.2,
    "thisMonthCompleted": 3,
    "thisYearCompleted": 20,
    "favoriteGenre": "技術書",
    "readingStreak": 15
  },
  "success": true,
  "message": "Statistics retrieved successfully"
}
```

### 6.2 月別統計取得
**GET** `/api/v1/statistics/monthly`

#### Query Parameters
- `year`: 年（デフォルト: 今年）

#### Response (200 OK)
```json
{
  "data": {
    "year": 2024,
    "months": [
      {
        "month": 1,
        "completedBooks": 3,
        "readPages": 900,
        "entries": 25
      },
      {
        "month": 2,
        "completedBooks": 2,
        "readPages": 600,
        "entries": 18
      }
    ]
  },
  "success": true,
  "message": "Monthly statistics retrieved successfully"
}
```

### 6.3 ジャンル別統計取得
**GET** `/api/v1/statistics/genres`

#### Response (200 OK)
```json
{
  "data": {
    "genres": [
      {
        "name": "技術書",
        "count": 20,
        "percentage": 40,
        "completedCount": 10,
        "averageRating": 4.5
      },
      {
        "name": "ビジネス書",
        "count": 15,
        "percentage": 30,
        "completedCount": 8,
        "averageRating": 4.0
      }
    ]
  },
  "success": true,
  "message": "Genre statistics retrieved successfully"
}
```

## 7. 管理者API

### 7.1 ユーザー一覧取得
**GET** `/api/v1/admin/users`

#### Query Parameters
- `search`: 検索キーワード
- `page`: ページ番号
- `pageSize`: ページサイズ

#### Response (200 OK)
```json
{
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "userName": "John Doe",
        "role": "User",
        "bookCount": 50,
        "lastActive": "2024-01-25T15:00:00Z",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "totalCount": 100,
    "currentPage": 1,
    "pageSize": 20
  },
  "success": true,
  "message": "Users retrieved successfully"
}
```

### 7.2 ユーザー詳細取得
**GET** `/api/v1/admin/users/{id}`

#### Response (200 OK)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "userName": "John Doe",
    "role": "User",
    "statistics": {
      "totalBooks": 50,
      "completedBooks": 20,
      "totalEntries": 150,
      "totalReviews": 20
    },
    "lastActive": "2024-01-25T15:00:00Z",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  "success": true,
  "message": "User retrieved successfully"
}
```

### 7.3 ユーザー削除
**DELETE** `/api/v1/admin/users/{id}`

#### Response (204 No Content)

## 8. API利用例

### 8.1 認証フロー
```javascript
// 1. ログイン
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!'
  })
});
const { data: { accessToken } } = await loginResponse.json();

// 2. 認証が必要なAPIの呼び出し
const booksResponse = await fetch('/api/v1/books', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 8.2 ページネーション処理
```javascript
// ページネーション付きリスト取得
const response = await fetch('/api/v1/books?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data } = await response.json();
console.log(`Total: ${data.totalCount}, Pages: ${data.pageCount}`);
```

### 8.3 エラーハンドリング
```javascript
try {
  const response = await fetch('/api/v1/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(bookData)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 422) {
      // バリデーションエラー
      error.errors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
      });
    } else {
      console.error(error.message);
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## 9. 開発者向けツール

### 9.1 Swagger UI
開発環境では以下のURLでSwagger UIが利用可能:
```
http://localhost:5000/swagger
```

### 9.2 OpenAPI仕様
OpenAPI 3.0仕様のJSONファイル:
```
http://localhost:5000/swagger/v1/swagger.json
```