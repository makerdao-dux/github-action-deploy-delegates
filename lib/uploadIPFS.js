"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTextIPFS = exports.uploadFileIPFS = exports.dataToCar = void 0;
const web3_storage_1 = require("web3.storage");
const nft_storage_1 = require("nft.storage");
const fs_1 = __importDefault(require("fs"));
const RETRY_DELAY = 60 * 1000; //60 seconds
let rateLimitted = false;
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function checkCIDs(localCID, remoteCID, remoteServiceName) {
    if (localCID === remoteCID) {
        console.log(`${remoteServiceName} CID equals CID created locally: ${localCID}`);
    }
    else {
        throw new Error(`${remoteServiceName} CID differs from locally generated CID. Local: ${localCID}. ${remoteServiceName}: ${remoteCID}`);
    }
}
//we use this function to generate the IPFS CID before
//uploading the data to the pinning services.
//This way we ensure the CID is the same across different pinning
//services, and as the CID generated locally.
//see more info here: https://web3.storage/docs/how-tos/work-with-car-files/
function dataToCar(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const someData = new nft_storage_1.Blob([data]);
        const { car } = yield nft_storage_1.NFTStorage.encodeBlob(someData);
        return car;
    });
}
exports.dataToCar = dataToCar;
//Upload car file to both web3.storage and nft.storage.
function uploadCarFileIPFS(car, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        if (rateLimitted) {
            yield sleep(RETRY_DELAY);
            rateLimitted = false;
        }
        let localCID = '';
        try {
            localCID = (yield car.getRoots()).toString();
            //web3.storage
            if (tokens.WEB3_STORAGE_TOKEN) {
                const web3StorageClient = new web3_storage_1.Web3Storage({ token: tokens.WEB3_STORAGE_TOKEN });
                const web3StorageCID = yield web3StorageClient.putCar(car);
                checkCIDs(localCID, web3StorageCID, 'web3.storage');
            }
            //nft.storage
            if (tokens.NFT_STORAGE_TOKEN) {
                const nftStorageClient = new nft_storage_1.NFTStorage({ token: tokens.NFT_STORAGE_TOKEN });
                const nftStorageCID = yield nftStorageClient.storeCar(car);
                checkCIDs(localCID, nftStorageCID, 'nft.storage');
            }
            return { ipfsHash: localCID };
        }
        catch (e) {
            rateLimitted = true;
            console.log('error uploading car file:', e);
            return { ipfsHash: localCID, error: e };
        }
    });
}
function uploadFileIPFS(filePath, tokens, retries = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Uploading file to IPFS....", filePath, 'Retries remaining: ', retries);
        const fileContents = fs_1.default.readFileSync(filePath);
        const car = yield dataToCar(fileContents);
        const { ipfsHash, error } = yield uploadCarFileIPFS(car, tokens);
        if (!error)
            return ipfsHash;
        if (retries > 0) {
            return uploadFileIPFS(filePath, tokens, retries - 1);
        }
        else {
            console.log('No retries left. Returning locally generated CID');
            return ipfsHash;
        }
    });
}
exports.uploadFileIPFS = uploadFileIPFS;
function uploadTextIPFS(text, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        const car = yield dataToCar(Buffer.from(text));
        const { ipfsHash, error } = yield uploadCarFileIPFS(car, tokens);
        if (error)
            throw new Error('error uploading text to IPFS');
        return ipfsHash;
    });
}
exports.uploadTextIPFS = uploadTextIPFS;
