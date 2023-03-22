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
exports.uploadTextIPFS = exports.uploadFileIPFS = exports.filePathToCar = void 0;
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("ipfs-car/pack/fs");
const fs_3 = require("ipfs-car/blockstore/fs");
const web3_storage_1 = require("web3.storage");
const car_1 = require("@ipld/car");
const fs_4 = require("fs");
const nft_storage_1 = require("nft.storage");
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
function filePathToCar(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const carFileName = `${filePath}.car`;
        yield (0, fs_2.packToFs)({
            input: filePath,
            output: carFileName,
            blockstore: new fs_3.FsBlockStore()
        });
        const inStream = (0, fs_4.createReadStream)(carFileName);
        return car_1.CarReader.fromIterable(inStream);
    });
}
exports.filePathToCar = filePathToCar;
//upload car file to both web3.storage and nft.storage
function uploadCarFileIPFS(car, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        //if no tokens, throw error
        const localCID = (yield car.getRoots()).toString();
        //web3.storage
        if (tokens.WEB3_STORAGE_TOKEN) {
            const web3StorageClient = new web3_storage_1.Web3Storage({ token: tokens.WEB3_STORAGE_TOKEN });
            const web3StorageCID = yield web3StorageClient.putCar(car);
            if (localCID === web3StorageCID) {
                console.log('web3Storage CID equals CID created locally: ', web3StorageCID);
            }
            else {
                throw new Error(`web3Storage CID differs from locally generated CID. Local: ${localCID}. Web3Storage: ${web3StorageCID}`);
            }
        }
        //nft.storage
        if (tokens.NFT_STORAGE_TOKEN) {
            const nftStorageClient = new nft_storage_1.NFTStorage({ token: tokens.NFT_STORAGE_TOKEN });
            const nftStorageCID = yield nftStorageClient.storeCar(car);
            if (localCID === nftStorageCID) {
                console.log('nftStorage CID equals CID created locally: ', nftStorageCID);
            }
            else {
                throw new Error('nftStorage CID differs from locally generated CID');
            }
        }
        //update to return CID
        return localCID;
    });
}
function uploadFileIPFS(filePath, tokens, retries = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Uploading file to IPFS...", filePath, 'Retries remaining: ', retries);
            const car = yield filePathToCar(filePath);
            return uploadCarFileIPFS(car, tokens);
        }
        catch (e) {
            if (retries > 0) {
                console.log('Retrying upload', retries);
                return uploadFileIPFS(filePath, tokens, retries - 1);
            }
            else {
                throw e;
            }
        }
    });
}
exports.uploadFileIPFS = uploadFileIPFS;
function uploadTextIPFS(text, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        //const client = getClient(credentials);
        const textFile = 'textFile';
        fs_1.default.writeFileSync(textFile, text);
        const car = yield filePathToCar(textFile);
        return uploadCarFileIPFS(car, tokens);
    });
}
exports.uploadTextIPFS = uploadTextIPFS;
