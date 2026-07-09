export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[\s/]+/g, "-");
}
