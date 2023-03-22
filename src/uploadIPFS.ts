import { Web3Storage } from 'web3.storage';
//import { CarReader } from '@ipld/car';
import { NFTStorage, CarReader, Blob } from 'nft.storage';
import { ApiTokens } from './apiTokens';

//we use this function to generate the IPFS CID before
//uploading the data to the pinning services.
//This way we ensure the CID is the same across different pinning
//services, and as the CID generated locally.
//see more info here: https://web3.storage/docs/how-tos/work-with-car-files/
export async function dataToCar(data: string): Promise<CarReader> {
  const someData = new Blob([data]);
  const { car } = await NFTStorage.encodeBlob(someData);
  return car;
}

//upload car file to both web3.storage and nft.storage
async function uploadCarFileIPFS(car: CarReader, tokens: ApiTokens){
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
  tokens: ApiTokens,
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
  tokens: ApiTokens,
): Promise<string> {
  console.log("Uploading text: ", text);
  const car = await dataToCar(text);
  return uploadCarFileIPFS(car, tokens);
}
