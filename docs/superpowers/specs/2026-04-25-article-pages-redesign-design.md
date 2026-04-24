# 文章列表与详情页重新设计

## 概述

重新设计文章列表页（`/news`）和详情页（`/news/:id`），采用简约商务风格，解决现有页面的三个核心问题：
1. 使用硬编码颜色（`text-gray-900`, `bg-white`）而非语义化 token
2. 不支持暗色模式
3. 渲染逻辑内联在页面文件中，缺乏组件拆分

## 技术栈

- Nuxt 4 + Vue 3 + TypeScript
- shadcn-vue (new-york style)
- Tailwind CSS v4（oklch 色彩空间，语义化 CSS 变量）
- Tiptap（详情页富文本只读渲染）
- 字体：Cormorant Garamond（display）、DM Sans（body）

## 列表页设计（`/news`）

### 页面结构

1. **页面标题区** — 居中，英文小标签 `NEWS & INSIGHTS`（`text-xs uppercase tracking-widest text-muted-foreground`）+ 中文标题"最新动态"（`text-2xl font-semibold`）+ 短分割线（`w-10 h-0.5 bg-primary mx-auto mt-2`）
2. **搜索栏** — 单行搜索框居中，一个 Input + 一个搜索 Button。去掉现有的标题/作者双字段搜索和清空按钮。Input 内使用清除图标（`@iconify` lucide x）
3. **三列卡片网格** — `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`。每张卡片：封面图（16:9，`aspect-video`）+ 日期 + 标题（`line-clamp-2`）+ 摘要（`line-clamp-2`）。桌面三列，平板两列，移动单列
4. **空状态** — 图标 + "暂无文章"
5. **分页** — 底部居中，保持现有 shadcn Pagination 组件

### 卡片设计（ArticleCard.vue）

```
┌──────────────────────┐
│    封面图 (16:9)       │  ← aspect-video, object-cover, bg-muted (占位)
├──────────────────────┤
│ 2024-03-15           │  ← text-sm text-muted-foreground
│ 文章标题两行截断        │  ← text-base font-semibold text-foreground line-clamp-2
│ 摘要内容两行截断...     │  ← text-sm text-muted-foreground line-clamp-2
└──────────────────────┘
```

- 卡片容器：`bg-card rounded-lg border border-border overflow-hidden`，hover 时 `hover:shadow-md transition-shadow`
- 点击整个卡片跳转 `/news/:id`
- 无封面图时显示占位（柔和背景色 + 图标）

### 组件拆分

- `app/components/article/ArticleCard.vue` — 单张文章卡片

### 搜索简化

- 去掉作者搜索字段
- 去掉清空按钮，改为 Input 内置清除图标
- 搜索参数仍使用 `title` 字段传给 API

## 详情页设计（`/news/:id`）

### 页面结构

1. **面包屑** — 居中，`首页 > 最新动态 > 文章标题`
2. **标题区** — 居中，大标题 `text-3xl md:text-4xl font-bold text-foreground`，下方作者信息行：作者名 · 发布日期 · 状态 badge，使用 `text-muted-foreground`
3. **封面图** — 居中，`max-w-3xl mx-auto`，圆角 `rounded-lg`，保持比例
4. **正文区** — 居中，`max-w-3xl mx-auto`，Tiptap 只读渲染
5. **返回链接** — 底部 `← 返回列表`，链接到 `/news`

### 组件拆分

- `app/components/article/ArticleHeader.vue` — 标题 + 作者/日期信息
- `app/components/article/ArticleContent.vue` — Tiptap 正文渲染 + ProseMirror 深度样式

## 样式规范

### 颜色 token 替换

| 旧值 | 新值 |
|------|------|
| `text-gray-900` | `text-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-400` | `text-muted-foreground` |
| `bg-white` | `bg-card` |
| `bg-gray-200` | `bg-muted` |
| `border-gray-*` | `border-border` |
| `#e5e7eb` | `hsl(var(--border))` |
| `#f3f4f6` | `hsl(var(--muted))` |
| `#3b82f6`（链接色） | `text-primary` |
| `#6b7280`（引用色） | `text-muted-foreground` |
| `#1f2937`（代码块背景） | `bg-muted` |
| `#f9fafb`（代码块文字） | `text-foreground` |

### ProseMirror 样式

所有 `:deep(.ProseMirror)` 样式改用语义化 token：
- 边框：`border: 1px solid hsl(var(--border))`
- 背景：`background: hsl(var(--card))`
- 文字：`color: hsl(var(--foreground))`
- 链接：`color: hsl(var(--primary))`
- 引用边框：`border-left-color: hsl(var(--border))`
- 引用文字：`color: hsl(var(--muted-foreground))`
- 代码背景：`background: hsl(var(--muted))`
- 代码块：`background: hsl(var(--muted))`，`color: hsl(var(--foreground))`

## 不变的部分

- API 层（`api/article.ts`）不变
- 数据类型（`types/article.ts`）不变
- 路由结构不变（`/news`、`/news/:id`）
- 图片路径处理逻辑（`processArticleContent`）不变
- SEO 逻辑（`useHead`）不变
- Breadcrumb 组件不变
- 分页逻辑不变

## 文件变更清单

| 操作 | 文件 |
|------|------|
| 新建 | `app/components/article/ArticleCard.vue` |
| 新建 | `app/components/article/ArticleHeader.vue` |
| 新建 | `app/components/article/ArticleContent.vue` |
| 重写 | `app/pages/news/index.vue` |
| 重写 | `app/pages/news/[id]/index.vue` |
