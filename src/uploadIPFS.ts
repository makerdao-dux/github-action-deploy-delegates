import { create } from "ipfs-http-client";
import { Credentials } from "./credentials";
import fs from "fs";
import { packToFs } from 'ipfs-car/pack/fs';
import { FsBlockStore } from 'ipfs-car/blockstore/fs';
import { Web3Storage } from 'web3.storage';
import { CarReader } from '@ipld/car';
import { createReadStream } from 'fs';

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

//we use this function to generate the IPFS CID before
//uploading the data to the pinning services.
//This way we ensure the CID is the same across different pinning
//services, and as the CID generated locally.
//see more info here: https://web3.storage/docs/how-tos/work-with-car-files/
export async function filePathToCar(filePath: string): Promise<CarReader> {
  const carFileName = `${filePath}.car`;
  await packToFs({
    input: filePath,
    output: carFileName,
    blockstore: new FsBlockStore()
  });
  const inStream = createReadStream(carFileName);
  const carReader = await CarReader.fromIterable(inStream);
  console.log(`CID generated locally from ${carFileName}: `,
    (await carReader.getRoots()).toString());
  return carReader;
}


export async function uploadFileIPFS(
  filePath: string,
  token: string, 
  retries: number = 3
): Promise<string> {
  try {
    const client = new Web3Storage({ token });
    //const client = getClient(credentials);
    /* upload the file */
    console.log("Uploading file to IPFS...", filePath, 'Retries remaining: ', retries);
    const car = await filePathToCar(filePath);
    const added = await client.putCar(car);
    console.log("File uploaded to IPFS:", added);

    return added;
  } catch(e) {
    if (retries > 0) {
      console.log('Retrying upload', retries);
      return uploadFileIPFS(filePath, token, retries - 1);
    } else {
      throw e;
    }
  }
}

export async function uploadTextIPFS(
  text: string,
  token: string,
): Promise<string> {
  const client = new Web3Storage({ token });
  //const client = getClient(credentials);
  const textFile = 'textFile';
  fs.writeFileSync(textFile, text);
  const car = await filePathToCar(textFile);
  const added = await client.putCar(car);
  console.log('Text uploaded to IPFS: ', added);
  return added;
}
