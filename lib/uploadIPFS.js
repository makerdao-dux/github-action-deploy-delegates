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
const ipfs_http_client_1 = require("ipfs-http-client");
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("ipfs-car/pack/fs");
const fs_3 = require("ipfs-car/blockstore/fs");
const web3_storage_1 = require("web3.storage");
const car_1 = require("@ipld/car");
const fs_4 = require("fs");
// For more information about the IPFS API, see: https://www.npmjs.com/package/ipfs-http-client
function getClient(credentials) {
    const auth = "Basic " +
        Buffer.from(credentials.INFURA_ID + ":" + credentials.INFURA_SECRET_KEY).toString("base64");
    const client = (0, ipfs_http_client_1.create)({
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
function filePathToCar(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const carFileName = `${filePath}.car`;
        yield (0, fs_2.packToFs)({
            input: filePath,
            output: carFileName,
            blockstore: new fs_3.FsBlockStore()
        });
        const inStream = (0, fs_4.createReadStream)(carFileName);
        const carReader = yield car_1.CarReader.fromIterable(inStream);
        console.log(`CID generated locally from ${carFileName}: `, (yield carReader.getRoots()).toString());
        return carReader;
    });
}
exports.filePathToCar = filePathToCar;
function uploadFileIPFS(filePath, token, retries = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = new web3_storage_1.Web3Storage({ token });
            //const client = getClient(credentials);
            /* upload the file */
            console.log("Uploading file to IPFS...", filePath, 'Retries remaining: ', retries);
            const car = yield filePathToCar(filePath);
            const added = yield client.putCar(car);
            console.log("File uploaded to IPFS:", added);
            return added;
        }
        catch (e) {
            if (retries > 0) {
                console.log('Retrying upload', retries);
                return uploadFileIPFS(filePath, token, retries - 1);
            }
            else {
                throw e;
            }
        }
    });
}
exports.uploadFileIPFS = uploadFileIPFS;
function uploadTextIPFS(text, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new web3_storage_1.Web3Storage({ token });
        //const client = getClient(credentials);
        const textFile = 'textFile';
        fs_1.default.writeFileSync(textFile, text);
        const car = yield filePathToCar(textFile);
        const added = yield client.putCar(car);
        console.log('Text uploaded to IPFS: ', added);
        return added;
    });
}
exports.uploadTextIPFS = uploadTextIPFS;
