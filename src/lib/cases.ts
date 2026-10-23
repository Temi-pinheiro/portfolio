// A case study's address under /mariposa, from its name ("WellNest" →
// "wellnest"). The page, the sitemap and the modal's link all use this.
export const caseSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
