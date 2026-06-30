/**
 * Notion → Jamie Blog 동기화 스크립트
 *
 * 사용법:
 *   NOTION_TOKEN=xxx NOTION_DATABASE_ID=xxx node scripts/sync-notion.js
 *
 * 필요한 환경변수:
 *   NOTION_TOKEN        - Notion Integration 시크릿 토큰
 *   NOTION_DATABASE_ID  - Jamie Blog 글 목록 데이터베이스 ID
 */

const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 이미지 다운로드 함수
function downloadImage(imageUrl, destPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(imageUrl);
    const client = url.protocol === 'https:' ? https : http;
    const file = fs.createWriteStream(destPath);
    client.get(imageUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

// 마크다운에서 이미지 URL 추출 후 로컬 저장, 캡션/크기 처리
// 노션 캡션 규칙:
//   "캡션 텍스트"         → 이미지 아래 캡션 표시
//   "캡션 텍스트|500"     → 너비 500px + 캡션
//   "|500"               → 너비 500px만 지정 (캡션 없음)
async function localizeImages(markdown, dir) {
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const downloads = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    const [full, alt, imageUrl] = match;
    try {
      const urlObj = new URL(imageUrl);
      const ext = path.extname(urlObj.pathname).split('?')[0] || '.png';
      const filename = `image-${downloads.length + 1}${ext}`;
      downloads.push({ full, alt, imageUrl, filename });
    } catch {
      // 유효하지 않은 URL은 스킵
    }
  }

  for (const item of downloads) {
    const destPath = path.join(dir, item.filename);
    try {
      await downloadImage(item.imageUrl, destPath);

      // 캡션과 너비 파싱: "캡션|500" 또는 "캡션" 또는 "|500"
      let caption = item.alt.trim();
      let width = null;
      const widthMatch = caption.match(/\|(\d+)$/);
      if (widthMatch) {
        width = widthMatch[1];
        caption = caption.slice(0, caption.lastIndexOf('|')).trim();
      }

      let replacement;
      if (width) {
        // 너비 지정: HTML img 태그 사용
        const captionHtml = caption
          ? `\n<p style="text-align:center;font-style:italic;font-size:15px;color:#6a737d">${caption}</p>`
          : '';
        replacement = `<img src="./${item.filename}" width="${width}" alt="${caption}" style="display:block;margin:0 auto">${captionHtml}`;
      } else if (caption) {
        // 캡션만 있을 때: 마크다운 이미지 + 이탤릭 캡션
        replacement = `![${caption}](./${item.filename})\n*${caption}*`;
      } else {
        // 캡션/너비 없음: 일반 마크다운
        replacement = `![](./${item.filename})`;
      }

      markdown = markdown.replace(item.full, replacement);
    } catch (err) {
      console.warn(`  ⚠️  이미지 다운로드 실패 (원본 URL 유지): ${item.imageUrl.slice(0, 60)}...`);
    }
  }

  return markdown;
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// notion-to-md@3은 heading_4를 미지원 → 커스텀 변환기 추가
n2m.setCustomTransformer('heading_4', async (block) => {
  const text = (block.heading_4?.rich_text || []).map((t) => t.plain_text).join('');
  return `#### ${text}`;
});

// 노션 빈 단락 → <br> (여러 줄 공백 보존)
n2m.setCustomTransformer('paragraph', async (block) => {
  const richText = block.paragraph?.rich_text || [];
  if (richText.length === 0) return '<br>';
  return false; // 기본 변환기 사용
});

// 노션 이미지 캡션 추출 (캡션을 alt 텍스트로 포함)
n2m.setCustomTransformer('image', async (block) => {
  const imageUrl = block.image?.file?.url || block.image?.external?.url || '';
  if (!imageUrl) return '';
  const caption = (block.image?.caption || []).map((t) => t.plain_text).join('').trim();
  return `![${caption}](${imageUrl})`;
});

async function syncNotion() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId || !process.env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN 또는 NOTION_DATABASE_ID 환경변수가 없습니다.');
    process.exit(1);
  }

  console.log('📥 Notion에서 Published 글을 가져오는 중...');

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Published' },
    },
  });

  if (response.results.length === 0) {
    console.log('⚠️  Published 상태의 글이 없습니다.');
    return;
  }

  console.log(`✅ ${response.results.length}개의 글을 찾았습니다.\n`);

  for (const page of response.results) {
    const props = page.properties;

    const title = props.Title?.title?.[0]?.plain_text || 'Untitled';
    const emoji = props.Emoji?.rich_text?.[0]?.plain_text || '📝';
    const category = props.Category?.select?.name || 'life';
    const tags = props.Tags?.rich_text?.[0]?.plain_text || category;
    const dateRaw = props.Date?.date?.start;
    const date = dateRaw
      ? `${dateRaw} 00:00:00`
      : new Date().toISOString().slice(0, 10) + ' 00:00:00';

    // Slug: 직접 입력한 값 우선, 없으면 제목으로 자동 생성
    const slugRaw = props.Slug?.rich_text?.[0]?.plain_text;
    const slug = slugRaw
      ? slugRaw.trim()
      : title
          .toLowerCase()
          .replace(/[^a-z0-9가-힣\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

    // Notion 페이지 → Markdown 변환
    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const mdContent = n2m.toMarkdownString(mdBlocks);

    // 프론트매터 생성 (title/tags는 따옴표로 감싸서 YAML 특수문자 처리)
    const safeTitle = title.replace(/"/g, '\\"');
    const safeTags = tags.replace(/"/g, '\\"');
    const frontmatter = `---
emoji: ${emoji}
title: "${safeTitle}"
date: '${date}'
author: Jamie
tags: "${safeTags}"
categories: ${category}
---

`;

    // content/{slug}/index.md 저장
    const dir = path.join('content', slug);
    fs.mkdirSync(dir, { recursive: true });

    // 이미지 다운로드 및 경로 교체
    const localizedContent = await localizeImages(mdContent.parent, dir);

    const tocBlock = '\n\n```toc\n```\n';
    fs.writeFileSync(path.join(dir, 'index.md'), frontmatter + localizedContent + tocBlock);

    console.log(`📝 완료: [${category}] ${title} → content/${slug}/index.md`);
  }

  // 노션에 없는 폴더 삭제 (Draft/삭제된 글 반영)
  const publishedSlugs = new Set(response.results.map((page) => {
    const slugRaw = page.properties.Slug?.rich_text?.[0]?.plain_text;
    const title = page.properties.Title?.title?.[0]?.plain_text || 'Untitled';
    return slugRaw
      ? slugRaw.trim()
      : title.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  }));

  const contentDir = path.join('content');
  if (fs.existsSync(contentDir)) {
    const existingFolders = fs.readdirSync(contentDir);
    for (const folder of existingFolders) {
      if (!publishedSlugs.has(folder)) {
        fs.rmSync(path.join(contentDir, folder), { recursive: true, force: true });
        console.log(`🗑️  삭제: content/${folder} (노션에서 제거되거나 비공개 처리됨)`);
      }
    }
  }

  console.log('\n🎉 동기화 완료!');
}

syncNotion().catch((err) => {
  console.error('❌ 오류 발생:', err.message);
  process.exit(1);
});
