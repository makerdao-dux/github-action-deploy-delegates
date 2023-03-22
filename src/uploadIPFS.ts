import fs from "fs";
import { packToFs } from 'ipfs-car/pack/fs';
import { FsBlockStore } from 'ipfs-car/blockstore/fs';
import { Web3Storage } from 'web3.storage';
import { CarReader } from '@ipld/car';
import { createReadStream } from 'fs';
import { NFTStorage } from 'nft.storage';
import { API_TOKENS } from './apiTokens';
import { packToBlob } from 'ipfs-car/pack/blob';
import { MemoryBlockStore } from 'ipfs-car/blockstore/memory';

//we use this function to generate the IPFS CID before
//uploading the data to the pinning services.
//This way we ensure the CID is the same across different pinning
//services, and as the CID generated locally.
//see more info here: https://web3.storage/docs/how-tos/work-with-car-files/
export async function dataToCar(filePath: string): Promise<CarReader> {
  const { car } = await packToBlob({
    input: filePath,
    blockstore: new MemoryBlockStore()
  });
  const arrayBuffer = await car.arrayBuffer();
  const array = new Uint8Array(arrayBuffer);
  return CarReader.fromBytes(array);
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

  return localCID;
}


export async function uploadFileIPFS(
  filePath: string,
  tokens: API_TOKENS,
  retries: number = 3
): Promise<string> {
  try {
    console.log("Uploading file to IPFS...", filePath, 'Retries remaining: ', retries);
    //update below
    const car = await dataToCar(filePath);
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
  const car = await dataToCar(text);
  return uploadCarFileIPFS(car, tokens);
}
