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

---

## D1 数据库自动备份方案（P0-6）

SinTea 使用 Cloudflare D1 作为生产数据库（数据库名 `sintea-db`，ID `835cf7ca-8956-4a13-8f2e-ad9703439817`，Pages Functions 绑定名 `D1_DB`）。以下是**手动**与**自动**两种备份策略，推荐同时启用。

### 一、备份目标与保留策略
- **频率**：每日 02:00 自动执行 1 次全量导出（UTC+8）
- **保留**：最近 7 天每日 1 份 + 最近 4 周每周 1 份 + 最近 12 月每月 1 份（7-4-12 策略）
- **存储**：Cloudflare R2（免费额度 10GB 对象存储，超出可按需计费）或本地文件系统
- **加密**：导出的 `.sql` / `.sqlite` 文件在上传前用 AES-256-GCM 或使用 7z 加密

### 二、方式 A：Wrangler 手动备份（随时可用）
```bash
# 1. 导出为 SQL 文本（含 schema + data，推荐）
wrangler d1 export sintea-db \
  --remote \
  --output ./backups/sintea-db-$(date +%Y%m%d-%H%M%S).sql

# 2. 或者导出为完整 SQLite 文件（便于直接还原）
wrangler d1 export sintea-db \
  --remote \
  --format sqlite \
  --output ./backups/sintea-db-$(date +%Y%m%d-%H%M%S).sqlite
```

### 三、方式 B：Workers Cron + R2 自动备份（推荐）

D1 提供内置 Point-in-time restore，再额外用 Workers Cron 周期性把快照导出到 R2 做多一层兜底。

#### 1. 创建一个 Worker 做定时导出
1. Workers & Pages → Create → Create Worker → 取名 `sintea-d1-backup`
2. 绑定以下 bindings：
   - **D1 Database Binding**：`DB` → `sintea-db`
   - **R2 Bucket Binding**：`BUCKET` → 新建 `sintea-backups`（用于存备份件）
3. Worker 源码：
```ts
interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(doBackup(env));
  },
  async fetch(request: Request, env: Env) {
    await doBackup(env);
    return new Response('backup triggered at ' + new Date().toISOString());
  },
};

async function doBackup(env: Env) {
  const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `daily/sintea-db-${stamp}.sql`;

  const tables = await env.DB.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
  ).all<{ name: string }>();

  const lines: string[] = [];
  lines.push(`-- SinTea D1 backup generated at ${new Date().toISOString()}`);
  lines.push('PRAGMA foreign_keys=OFF;', 'BEGIN TRANSACTION;', '');

  for (const t of tables.results ?? []) {
    const schema = await env.DB.prepare(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`
    ).bind(t.name).first<{ sql: string }>();
    if (schema?.sql) lines.push(schema.sql + ';', '');
    const rows = await env.DB.prepare(`SELECT * FROM "${t.name}"`).all<Record<string, unknown>>();
    for (const r of rows.results ?? []) {
      const cols = Object.keys(r);
      const vals = cols.map(c => sqlLiteral(r[c])).join(',');
      const colSql = cols.map(c => `"${c}"`).join(',');
      lines.push(`INSERT INTO "${t.name}" (${colSql}) VALUES (${vals});`);
    }
    lines.push('');
  }
  lines.push('COMMIT;');

  const sql = lines.join('\n');
  await env.BUCKET.put(key, sql, {
    httpMetadata: { contentType: 'text/plain; charset=utf-8' },
    customMetadata: { generatedAt: new Date().toISOString() },
  });

  // 清理 30 天前的 daily 备份
  await cleanupOld(env.BUCKET, 'daily/', 30);
}

function sqlLiteral(v: unknown): string {
  if (v == null) return 'NULL';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
}

async function cleanupOld(bucket: R2Bucket, prefix: string, days: number) {
  const listed = await bucket.list({ prefix });
  const cutoff = Date.now() - days * 86400_000;
  for (const o of listed.objects) {
    if (o.uploaded.getTime() < cutoff) await bucket.delete(o.key);
  }
}
```

4. Triggers → Cron Triggers，添加：
   - Cron: `0 18 * * *`（UTC 18:00 = 北京 02:00，可按需调整）

#### 2. 通过 Wrangler CLI 创建 Worker（更简单）
```bash
mkdir sintea-d1-backup && cd $_
wrangler init
```
`wrangler.toml` 配置：
```toml
name = "sintea-d1-backup"
main = "src/index.ts"
compatibility_date = "2026-06-17"

[[d1_databases]]
binding = "DB"
database_name = "sintea-db"
database_id = "835cf7ca-8956-4a13-8f2e-ad9703439817"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "sintea-backups"

[triggers]
crons = ["0 18 * * *"]
```
```bash
wrangler deploy
```

### 四、方式 C：GitHub Actions 每日导出到 Artifacts（推荐，无需改代码）
在 `.github/workflows/d1-backup.yml`：
```yaml
name: D1 Nightly Backup
on:
  schedule:
    - cron: '0 18 * * *'   # UTC 18:00 = 北京 02:00
  workflow_dispatch:
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm i -g wrangler
      - name: 导出 SQL
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          mkdir -p backups
          wrangler d1 export sintea-db --remote \
            --output backups/sintea-db-$(date +%Y%m%d).sql
      - name: 上传 Artifact（保留 90 天）
        uses: actions/upload-artifact@v4
        with:
          name: sintea-db-backup-${{ github.run_id }}
          path: backups/
          retention-days: 90
```
需要在 GitHub 仓库 Secrets 填入：
- `CLOUDFLARE_API_TOKEN`：D1 读权限 + Account.Workers D1 读
- `CLOUDFLARE_ACCOUNT_ID`

### 五、恢复 / 验证步骤
```bash
# 0. 新建一个临时库做恢复演练，不要直接覆盖生产
wrangler d1 create sintea-db-restore
wrangler d1 execute sintea-db-restore --remote --file=./backups/sintea-db-YYYYMMDD.sql
# 1. 抽查数据完整性
wrangler d1 execute sintea-db-restore --remote --command="SELECT COUNT(*) FROM users;"
wrangler d1 execute sintea-db-restore --remote --command="SELECT COUNT(*) FROM feeds;"
# 2. 确认真的需要覆盖生产时：切 Pages/Worker 的 binding 指向新 DB，或官方 PITR 恢复
```

### 六、附：D1 内置 PITR（Point-in-time restore）
D1 自带按时间恢复（默认保留 7 天）：
```bash
wrangler d1 restore sintea-db --new-database sintea-db-restored \
  --before-timestamp "2026-08-01T00:00:00Z"
```
- PITR 作为误删/误操作的首选应急恢复；上面的 Worker/GitHub Actions 作为长期归档的兜底。
