import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

config();

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
const API_KEY = process.env.VITE_FIREBASE_API_KEY;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function fetchDoc(collection: string, docId: string): Promise<Record<string, string>> {
  if (!PROJECT_ID || !API_KEY) return {};
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json() as { fields?: Record<string, Record<string, string>> };
    const fields = data.fields || {};
    const out: Record<string, string> = {};
    for (const [key, val] of Object.entries(fields)) {
      out[key] = val.stringValue ?? val.integerValue ?? '';
    }
    return out;
  } catch {
    return {};
  }
}

function replace(html: string, selector: string, value: string): string {
  if (!value) return html;
  return html.replace(selector, value);
}

async function main() {
  console.log('🔍 Prerendering meta tags from Firebase...');

  const global = await fetchDoc('settings', 'global');

  const title = global.title || '';
  const description = global.description || '';
  const ogTitle = global.ogTitle || title;
  const ogDescription = global.ogDescription || description;
  const ogImage = global.ogImageUrl || '';
  const domain = (global.primaryDomain || '').replace(/\/$/, '');

  const htmlPath = resolve(process.cwd(), 'dist/index.html');
  let html = readFileSync(htmlPath, 'utf-8');

  // Title
  html = html.replace(/(<title>)(<\/title>)/, `$1${escapeHtml(title)}$2`);

  // Meta description
  html = html.replace(
    /(<meta name="description" content=")(")/,
    `$1${escapeHtml(description)}$2`
  );

  // OG tags
  html = html.replace(/(<meta property="og:title" content=")(")/,       `$1${escapeHtml(ogTitle)}$2`);
  html = html.replace(/(<meta property="og:description" content=")(")/,  `$1${escapeHtml(ogDescription)}$2`);
  html = html.replace(/(<meta property="og:url" content=")(")/,          `$1${escapeHtml(domain)}$2`);
  html = html.replace(/(<meta property="og:image" content=")(")/,        `$1${escapeHtml(ogImage)}$2`);

  // Twitter Card
  html = html.replace(/(<meta name="twitter:title" content=")(")/,       `$1${escapeHtml(ogTitle)}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")(")/,  `$1${escapeHtml(ogDescription)}$2`);
  html = html.replace(/(<meta name="twitter:image" content=")(")/,        `$1${escapeHtml(ogImage)}$2`);

  writeFileSync(htmlPath, html, 'utf-8');

  console.log('✓ Meta tags prerendered:');
  if (title)         console.log(`  title:       ${title}`);
  if (description)   console.log(`  description: ${description.substring(0, 60)}...`);
  if (ogImage)       console.log(`  og:image:    ${ogImage.substring(0, 60)}...`);
  if (domain)        console.log(`  og:url:      ${domain}`);
}

main().catch((err) => {
  console.warn('⚠️  Prerender skipped:', err.message);
  process.exit(0);
});
