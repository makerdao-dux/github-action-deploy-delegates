import { create } from "ipfs-http-client";
import { Credentials } from "./credentials";
import fs from "fs";
// For more information about the IPFS API, see: https://www.npmjs.com/package/ipfs-http-client
function getClient(credentials: Credentials) {
  const auth =
    "Basic " +
    Buffer.from(
      credentials.INFURA_ID + ":" + credentials.INFURA_SECRET_KEY
    ).toString("base64");

  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  return client;
}
export async function uploadFileIPFS(
  filePath: string,
  credentials: Credentials
): Promise<string> {
  const client = getClient(credentials);
  /* upload the file */
  console.log("Uploading file to IPFS...", filePath);
  const file = fs.readFileSync(filePath);
  const added = await client.add(file);
  console.log("File uploaded to IPFS:", added.path);

  return added.path;
}

export async function uploadTextIPFS(
  text: string,
  credentials: Credentials
): Promise<string> {
  const client = getClient(credentials);
  /* upload the file */
  console.log("Uploading text to IPFS...", text.substring(0, 100) + "...");
  const added = await client.add(text, {
    pin: true,
    
  });
  console.log("Text uploaded to IPFS:", added.path);
  return added.path;
}
