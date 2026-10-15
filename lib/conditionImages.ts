import "server-only";
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "conditions");
const exts = [".webp", ".avif", ".png", ".jpg", ".jpeg"];

/** Maps condition slug -> public URL of its photo, whatever the file extension is. */
export function conditionImage(slug: string): string | undefined {
  for (const ext of exts) {
    if (fs.existsSync(path.join(dir, slug + ext))) return `/conditions/${slug}${ext}`;
  }
  return undefined;
}
