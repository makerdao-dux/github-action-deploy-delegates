import { create } from "ipfs-http-client";
import { Credentials } from "./credentials";
import fs from "fs";
import { packToFs } from 'ipfs-car/pack/fs';
import { FsBlockStore } from 'ipfs-car/blockstore/fs';
import { packToBlob } from 'ipfs-car/pack/blob';
import { MemoryBlockStore } from 'ipfs-car/blockstore/memory';

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

//we use the below two functions to generate the IPFS CID before
//uploading the data to the pinning services.
//This way we ensure the CID is the same
//across different pinning services
//see more info here: https://web3.storage/docs/how-tos/work-with-car-files/

//takes in filePath, returns car file Buffer
export async function filePathToCarBuffer(filePath: string) {
  const carFileName = `${filePath}.car`;
  await packToFs({
    input: filePath,
    output: carFileName,
    blockstore: new FsBlockStore()
  });
  return fs.readFileSync(carFileName);
}

//takes in string, retruns car file blob
export async function contentToCarBlob(content: string) {
  const { root, car } = await packToBlob({
    input: content,
    blockstore: new MemoryBlockStore()
  });
  return { cid: root.toString(), car };
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
    const buffer = await filePathToCarBuffer(filePath);
    const added = await client.add(buffer);
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
  const {cid, car} = await contentToCarBlob(text);
  console.log('final CID generated locally:', cid);
  /* upload the file */
  console.log("Uploading text to IPFS...", text.substring(0, 100) + "...");
  const added = await client.add(car, {
    pin: true,
  });
  console.log("Text uploaded to IPFS:", added.path);
  return added.path;
}
