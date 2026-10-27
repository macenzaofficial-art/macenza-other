export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getPostSlug = (post) => {
  if (!post) return '';
  if (post.slug?.current) {
    return generateSlug(post.slug.current);
  }
  if (typeof post.slug === 'string') {
    return generateSlug(post.slug);
  }
  return generateSlug(post.title) || post._id || '';
};
