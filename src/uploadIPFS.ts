import { create } from "ipfs-http-client";
import { Credentials } from "./credentials";
import fs from "fs";
import { packToFs } from 'ipfs-car/pack/fs';
import { FsBlockStore } from 'ipfs-car/blockstore/fs';
import { Web3Storage } from 'web3.storage';
import { CarReader } from '@ipld/car';
import { createReadStream } from 'fs';
import { NFTStorage } from 'nft.storage';

//todo: move to type file
type API_TOKENS = {
  WEB3_STORAGE_TOKEN?: string,
  NFT_STORAGE_TOKEN?: string
}

// For more information about the IPFS API, see: https://www.npmjs.com/package/ipfs-http-client
// function getClient(credentials: Credentials) {
//   const auth =
//     "Basic " +
//     Buffer.from(
//       credentials.INFURA_ID + ":" + credentials.INFURA_SECRET_KEY
//     ).toString("base64");

//   const client = create({
//     host: "ipfs.infura.io",
//     port: 5001,
//     protocol: "https",
//     headers: {
//       authorization: auth,
//     },
//   });

//   return client;
// }

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
  return CarReader.fromIterable(inStream);
}

//upload car file to both web3.storage and nft.storage
async function uploadCarFileIPFS(car: CarReader, tokens: API_TOKENS){
  //if no tokens, throw error

  const localCID = (await car.getRoots()).toString();

  //web3.storage
  if (tokens.WEB3_STORAGE_TOKEN){
    const web3StorageClient = new Web3Storage({ token: tokens.WEB3_STORAGE_TOKEN });
    const web3StorageCID = await web3StorageClient.putCar(car);
    if (localCID === web3StorageCID ) {
      console.log('web3Storage CID equals CID created locally: ', web3StorageCID);
    } else {
      throw new Error(`web3Storage CID differs from locally generated CID. Local: ${localCID}. Web3Storage: ${web3StorageCID}`);
    }
  }

  //nft.storage
  if (tokens.NFT_STORAGE_TOKEN){
    const nftStorageClient = new NFTStorage({ token: tokens.NFT_STORAGE_TOKEN })
    const nftStorageCID = await nftStorageClient.storeCar(car);
    if (localCID === nftStorageCID ) {
      console.log('nftStorage CID equals CID created locally: ', nftStorageCID);
    } else {
      throw new Error('nftStorage CID differs from locally generated CID')
    }
  }

  //update to return CID
  return localCID;
}


export async function uploadFileIPFS(
  filePath: string,
  tokens: API_TOKENS,
  retries: number = 3
): Promise<string> {
  try {
    console.log("Uploading file to IPFS...", filePath, 'Retries remaining: ', retries);
    const car = await filePathToCar(filePath);
    return uploadCarFileIPFS(car, tokens);
  } catch(e) {
    if (retries > 0) {
      console.log('Retrying upload', retries);
      return uploadFileIPFS(filePath, tokens, retries - 1);
    } else {
      throw e;
    }
  }
}

export async function uploadTextIPFS(
  text: string,
  tokens: API_TOKENS, 
): Promise<string> {
  //const client = getClient(credentials);
  const textFile = 'textFile';
  fs.writeFileSync(textFile, text);
  const car = await filePathToCar(textFile);
  return uploadCarFileIPFS(car, tokens);
}
