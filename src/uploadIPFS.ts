import { Web3Storage } from 'web3.storage';
import { NFTStorage, CarReader, Blob } from 'nft.storage';
import { ApiTokens } from './apiTokens';
import fs from 'fs';

const RETRY_DELAY = 10 * 1000; //10 seconds

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function checkCIDs(localCID: string, remoteCID: string, remoteServiceName: string){
  if (localCID === remoteCID ) {
    console.log(`${remoteServiceName} CID equals CID created locally: ${localCID}`);
  } else {
    throw new Error(`${remoteServiceName} CID differs from locally generated CID. Local: ${localCID}. ${remoteServiceName}: ${remoteCID}`);
  }
}

//we use this function to generate the IPFS CID before
//uploading the data to the pinning services.
//This way we ensure the CID is the same across different pinning
//services, and as the CID generated locally.
//see more info here: https://web3.storage/docs/how-tos/work-with-car-files/
export async function dataToCar(data: Buffer): Promise<CarReader> {
  const someData = new Blob([data]);
  const { car } = await NFTStorage.encodeBlob(someData);
  return car;
}

//upload car file to both web3.storage and nft.storage
//throws error if any CID doesn't match
async function uploadCarFileIPFS(car: CarReader, tokens: ApiTokens){
  const localCID = (await car.getRoots()).toString();

  //web3.storage
  if (tokens.WEB3_STORAGE_TOKEN){
    const web3StorageClient = new Web3Storage({ token: tokens.WEB3_STORAGE_TOKEN });
    const web3StorageCID = await web3StorageClient.putCar(car);
    checkCIDs(localCID, web3StorageCID, 'web3.storage');
  }

  //nft.storage
  if (tokens.NFT_STORAGE_TOKEN){
    const nftStorageClient = new NFTStorage({ token: tokens.NFT_STORAGE_TOKEN })
    const nftStorageCID = await nftStorageClient.storeCar(car);
    checkCIDs(localCID, nftStorageCID, 'nft.storage');
  }

  return localCID;
}


export async function uploadFileIPFS(
  filePath: string,
  tokens: ApiTokens,
  retries: number = 3
): Promise<string> {
  let car;
  try {
    console.log("Uploading file to IPFS...", filePath, 'Retries remaining: ', retries);
    const fileContents = fs.readFileSync(filePath);
    car = await dataToCar(fileContents);
    return uploadCarFileIPFS(car, tokens);
  } catch(e) {
    if (retries > 0) {
      console.log('Retrying upload', retries);
      await sleep(RETRY_DELAY);
      return uploadFileIPFS(filePath, tokens, retries - 1);
    } else {
      if (car) {
        console.error('error uploading file', filePath, e);
        const localCID = (await car.getRoots()).toString();
        console.error('using locally generated CID: ', localCID);
        return localCID;
      } else {
        throw e;
      }
    }
  }
}

export async function uploadTextIPFS(
  text: string,
  tokens: ApiTokens,
): Promise<string> {
  console.log("Uploading text: ", text);
  const car = await dataToCar(Buffer.from(text));
  return uploadCarFileIPFS(car, tokens);
}
