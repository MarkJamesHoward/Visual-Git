import * as fs from "fs";
import * as path from "path";
import type { Tag } from "./types";

export function readTags(gitDir: string): Tag[] {
  const tagPath = path.join(gitDir, "refs", "tags");
  const tags: Tag[] = [];

  if (!fs.existsSync(tagPath)) return tags;

  const files = fs.readdirSync(tagPath);
  for (const file of files) {
    const filePath = path.join(tagPath, file);
    if (!fs.statSync(filePath).isFile()) continue;
    const hash = fs.readFileSync(filePath, "utf-8").trim().substring(0, 4);
    tags.push({ name: file, hash });
  }

  return tags;
}
