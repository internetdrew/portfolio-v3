const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/['"\.,!?:;@#&\[\]\(\)\{\}]/g, "") // Remove punctuation and apostrophes
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Trim leading/trailing hyphens
    .replace(/-+/g, "-"); // Collapse multiple hyphens
};

export { slugify };
