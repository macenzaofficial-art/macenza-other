import React from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULT_IMAGE = 'https://www.macenza.com/hero-robot.webp';
const SITE_NAME = 'Macenza';

const SEO = ({
  title,
  description,
  canonicalPath = '',
  noindex = false,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  schema = null,
}) => {
  const baseUrl = 'https://www.macenza.com';
  const canonicalUrl = `${baseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`.replace(/\/+$/, '') || `${baseUrl}/`;
  const fullTitle = title ? (title.includes('Macenza') ? title : `${title} | Macenza`) : 'Macenza | AI Software Development Company';
  const robotsText = noindex ? 'noindex, nofollow' : 'index, follow';

  // Format schema if provided as object or array
  const schemaArray = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsText} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      {schemaArray.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
