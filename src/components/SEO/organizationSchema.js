// Organization JSON-LD - rendered once, on the homepage, since that's the
// canonical representation of the site entity (not repeated per-route).
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'STETH',
  url: 'https://stethset.com',
  logo: 'https://stethset.com/logo.png',
  // No confirmed social profile URLs yet - left empty rather than invented.
  sameAs: [],
};

export default organizationSchema;
