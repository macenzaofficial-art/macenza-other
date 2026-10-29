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
  const explicitSlug = post.slug?.current
    ? generateSlug(post.slug.current)
    : typeof post.slug === 'string'
      ? generateSlug(post.slug)
      : '';

  return explicitSlug || generateSlug(post.title) || post._id || '';
};
