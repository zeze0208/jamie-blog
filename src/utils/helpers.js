export const getUniqueCategories = (posts) => {
  const categorySet = new Set();
  posts.forEach(({ categories }) => categories.forEach((category) => categorySet.add(category)));
  return [...categorySet].sort((a, b) => {
    if (a === 'featured') return -1;
    if (b === 'featured') return 1;
    return 0;
  });
};

// 현재 글과 태그/카테고리가 겹치는 글을 관련도 순으로 추천하고,
// 개수가 부족하면 최신 글(allPosts는 날짜 내림차순으로 정렬되어 있다고 가정)로 채운다.
export const getRelatedPosts = (currentPost, allPosts, count = 4) => {
  const candidates = allPosts.filter((post) => post.id !== currentPost.id);

  const scored = candidates.map((post) => {
    const sharedCategories = post.categories.filter((category) =>
      currentPost.categories.includes(category),
    ).length;
    const sharedTags = post.tags.filter((tag) => currentPost.tags.includes(tag)).length;
    return { post, score: sharedCategories * 3 + sharedTags * 2 };
  });

  const related = scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);

  if (related.length >= count) return related.slice(0, count);

  const usedIds = new Set([currentPost.id, ...related.map((post) => post.id)]);
  const latestFallback = candidates.filter((post) => !usedIds.has(post.id));

  return [...related, ...latestFallback].slice(0, count);
};
