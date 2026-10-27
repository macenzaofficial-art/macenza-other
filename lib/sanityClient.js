import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: 'hcm6ufrb',
  dataset: 'production',
  apiVersion: '2026-08-11', // Match current date
  useCdn: true, // Set to true for fast cached responses, false for instant drafts/updates
});

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source) {
  return builder.image(source);
}
