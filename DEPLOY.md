# Cloudflare Pages 部署说明

## 方式一：Git 自动部署（推荐）

### 1. 在 Cloudflare Pages 创建项目
1. 访问 https://dash.cloudflare.com/
2. 进入 Workers & Pages → Pages → Create a project
3. 选择 "Connect to Git"
4. 选择你的 `CapQ18/SinTea` 仓库

### 2. 配置构建设置
- **Project name**: `sintea`
- **Production branch**: `main`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Framework preset**: Vite (自动检测)

### 3. 部署
点击 "Save and Deploy"，Cloudflare Pages 会自动：
- 克隆你的仓库
- 安装依赖
- 运行构建
- 部署到全球 CDN

## 方式二：Wrangler CLI 本地部署

### 1. 安装 Wrangler
```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare
```bash
wrangler login
```

### 3. 部署
```bash
wrangler pages deploy dist --project-name sintea
```

## 部署后

部署完成后，你会获得一个类似 `https://sintea.pages.dev` 的域名。

### 绑定自定义域名
1. 在项目设置 → Custom domains
2. 添加你的域名
3. 按照提示配置 DNS 记录

### 配置 SPA 路由
由于使用 React Router，需要在项目设置 → Functions → 配置：
- 添加重定向规则：`/*` → `/index.html` (200)
