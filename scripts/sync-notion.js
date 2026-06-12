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

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

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

    // 프론트매터 생성
    const frontmatter = `---
emoji: ${emoji}
title: ${title}
date: '${date}'
author: Jamie
tags: ${tags}
categories: ${category}
---

`;

    // content/{slug}/index.md 저장
    const dir = path.join('content', slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.md'), frontmatter + mdContent.parent);

    console.log(`📝 완료: [${category}] ${title} → content/${slug}/index.md`);
  }

  console.log('\n🎉 동기화 완료!');
}

syncNotion().catch((err) => {
  console.error('❌ 오류 발생:', err.message);
  process.exit(1);
});
