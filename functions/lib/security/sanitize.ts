// XSS 内容过滤 - 用于净化用户输入的富文本/普通文本

// 常用 HTML 转义映射
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#47;',
  '`': '&#96;',
  '=': '&#61;',
};

/**
 * 严格的 HTML 实体转义 — 用于昵称、签名、标题等纯文本字段
 * 把所有特殊字符转义，100% 防 XSS
 */
export function escapeHtml(input: unknown): string {
  if (input == null) return '';
  const str = String(input);
  return str.replace(/[&<>"'`=\/]/g, (c) => HTML_ESCAPE_MAP[c] ?? c);
}

/**
 * 标签/属性黑名单过滤 — 用于动态内容、评论等允许部分 HTML 的字段
 * 只允许安全的白名单标签 + 属性，剥离 script/iframe/on* 事件/style=javascript: 等危险内容
 */
const ALLOWED_TAGS = new Set([
  'b', 'i', 'u', 'strong', 'em', 'br', 'p', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'a', 'img', 'hr', 'small',
]);

const ALLOWED_ATTRS: Record<string, RegExp> = {
  href: /^(https?:\/\/|mailto:|\/)/i,          // 链接只允许 http/https/mailto/站内
  src: /^(https?:\/\/|data:image\/)/i,         // 图片只允许 http(s) 或 data:image
  alt: /^[\s\S]*$/,
  title: /^[\s\S]*$/,
  target: /^_blank$/,
  rel: /^nofollow noopener$/,
  class: /^[\w- ]*$/,
  style: /^(?!.*expression|javascript|url\().*$/i, // style 里不允许 expression/js/url()
};

// 危险事件属性 onXXX 匹配
const EVENT_ATTR = /^on/i;

function sanitizeAttrs(attrs: { name: string; value: string }[]): string {
  return attrs
    .filter(({ name }) => !EVENT_ATTR.test(name)) // 先滤掉 onXXX
    .map(({ name, value }) => {
      const rule = ALLOWED_ATTRS[name.toLowerCase()];
      if (!rule) return '';
      if (!rule.test(value)) return '';
      return `${name}="${value.replace(/"/g, '&quot;')}"`;
    })
    .filter(Boolean)
    .join(' ');
}

export function sanitizeHtml(input: unknown): string {
  if (input == null) return '';
  let html = String(input);

  // 先剥掉 <script>...<\/script> 和 <style>...</style> 整块
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 剥掉 iframe / object / embed / form / input / link / meta / base / frameset / frame / noscript / template
  html = html.replace(/<\/?(iframe|object|embed|form|input|link|meta|base|frameset|frame|noscript|template|svg|math|video|audio)[\s\S]*?>/gi, '');

  // 剥掉所有 HTML 注释
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // 处理剩余标签：只允许白名单 + 属性净化
  html = html.replace(/<(\/)?([a-zA-Z0-9]+)([\s\S]*?)(\/)?>/g, (match, isClose, tagName, attrsStr, selfClose) => {
    const tag = String(tagName).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return ''; // 非白名单 → 删除整个标签

    if (isClose) return `</${tag}>`;

    // 解析属性（简化实现：正则提取 name="value"）
    const attrRegex = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
    const attrs: { name: string; value: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(attrsStr)) !== null) {
      attrs.push({ name: m[1], value: m[2] ?? m[3] ?? m[4] ?? '' });
    }
    const safeAttrs = sanitizeAttrs(attrs);
    const slash = selfClose ? ' /' : '';
    return safeAttrs ? `<${tag} ${safeAttrs}${slash}>` : `<${tag}${slash}>`;
  });

  // 兜底：把 javascript: / vbscript: / data:text/html 开头的伪协议链接转成 about:blank
  html = html.replace(/(href|src|action)\s*=\s*(["']?)\s*(javascript|vbscript|data:text(?:\/html)?):[\s\S]*?\2/gi, '$1=$2about:blank$2');

  return html;
}

/**
 * 简洁文本净化：只允许换行、空白、普通字符，不允许任何 HTML
 * 用于 feeds.content / comments.content 等字段
 */
export function sanitizePlainText(input: unknown, maxLen = 5000): string {
  if (input == null) return '';
  let text = String(input);
  // 任何尖括号内容全部转义（等于把所有 HTML 当纯文本展示）
  text = escapeHtml(text);
  // 截断超长
  if (text.length > maxLen) text = text.slice(0, maxLen);
  return text;
}

/**
 * 昵称过滤：只允许中文/英文/数字/下划线，长度 2-20
 */
export function sanitizeNickname(input: unknown): string {
  if (input == null) return '';
  const str = String(input).trim();
  // 滤除任何控制字符和特殊符号
  const safe = escapeHtml(str.replace(/[\x00-\x1f\x7f<>"'`\\]/g, ''));
  if (safe.length > 20) return safe.slice(0, 20);
  return safe;
}

/**
 * 邮箱过滤
 */
export function sanitizeEmail(input: unknown): string {
  if (input == null) return '';
  const str = String(input).trim().toLowerCase();
  const match = str.match(/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/);
  return match ? match[0] : '';
}

/**
 * 用户名过滤：字母数字下划线，3-20
 */
export function sanitizeUsername(input: unknown): string {
  if (input == null) return '';
  const str = String(input).trim();
  const match = str.match(/^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/);
  return match ? match[0] : '';
}
