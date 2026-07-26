/** 估算中文阅读时长（分钟）：CJK 字符 + 西文单词，按每分钟 400 字计 */
export function readingTime(body: string): number {
  const { cjk, words } = countText(body);
  return Math.max(1, Math.round((cjk + words) / 400));
}

/** 字数统计（CJK 字符 + 西文单词） */
export function wordCount(body: string): number {
  const { cjk, words } = countText(body);
  return cjk + words;
}

function countText(body: string) {
  const text = stripMarkdown(body);
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const words = (text.match(/[a-zA-Z0-9]+/g) || []).length;
  return { cjk, words };
}

/** YYYY-MM-DD */
export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 从正文提取纯文本摘要 */
export function excerpt(body: string, len = 160): string {
  const text = stripMarkdown(body).replace(/\s+/g, ' ').trim();
  return text.length > len ? text.slice(0, len) + ' …' : text;
}

function stripMarkdown(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~|]/g, ' ');
}
