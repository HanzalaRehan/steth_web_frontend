import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'STETH';
const SITE_ORIGIN = 'https://stethset.com';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.jpg`;

const SEO = ({
  title,
  description,
  canonicalPath = '/',
  ogImage = DEFAULT_OG_IMAGE,
  type = 'website',
  jsonLd = [],
}) => {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd.map((entry, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
