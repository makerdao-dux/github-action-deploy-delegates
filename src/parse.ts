import fs from "fs";
import { Delegate, Tag } from "./delegate";
import path from "path";
import { parseDelegateFolder } from "./parseDelegatesFolder";

export async function parse(
  delegatesFolder: string,
  tagsPath: string
): Promise<
  | {
      delegates: Delegate[];
      tags: Tag[];
    }
  | undefined
> {
  const pathDelegates = path.join(process.cwd(), delegatesFolder);
  const pathTags = path.join(process.cwd(), tagsPath);

  if (!fs.existsSync(pathDelegates)) {
    console.error(pathDelegates, "Delegates folder not found");
    throw new Error("Delegates folder does not exist");
  }
  if (!fs.existsSync(pathTags)) {
    console.error(pathTags, "Tags file not found");
    throw new Error("Tags file does not exist");
  }

  const allItems = fs.readdirSync(delegatesFolder);

  // Filter delegates, only get items that start by 0x
  const delegates = allItems.filter((item) => item.startsWith("0x")).map((folder) => parseDelegateFolder(pathDelegates, folder));

  const tagsRaw = fs.readFileSync(tagsPath, "utf8");
  const tags = JSON.parse(tagsRaw);

  console.log(delegates, tags);

  return Promise.resolve({
    tags,
    delegates,
  });
}
