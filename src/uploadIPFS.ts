import { create } from "ipfs-http-client";
import { Credentials } from "./credentials";
import fs from "fs";
import { packToFs } from 'ipfs-car/pack/fs';
import { FsBlockStore } from 'ipfs-car/blockstore/fs';

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

//takes in filePath, returns car file
export async function getCarFile(filePath: string) {
  const carFileName = "carFile.car";
  await packToFs({
    input: filePath,
    output: carFileName,
    blockstore: new FsBlockStore()
  });
  return fs.readFileSync(carFileName);
}


export async function uploadFileIPFS(
  filePath: string,
  credentials: Credentials, 
  retries: number = 3
): Promise<string> {
  try {
    const client = getClient(credentials);
    /* upload the file */
    console.log("Uploading file to IPFS...", filePath, 'Retries remaining: ', retries);
    const file = await getCarFile(filePath);
    const added = await client.add(file);
    console.log("File uploaded to IPFS:", added.path);

    return added.path;
  } catch(e) {
    if (retries > 0) {
      console.log('Retrying upload', retries);
      return uploadFileIPFS(filePath, credentials, retries - 1);
    } else {
      throw e;
    }
  }
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
