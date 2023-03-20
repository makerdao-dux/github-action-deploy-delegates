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
exports.uploadTextIPFS = exports.uploadFileIPFS = exports.contentToCarBlob = exports.filePathToCarBuffer = void 0;
const ipfs_http_client_1 = require("ipfs-http-client");
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("ipfs-car/pack/fs");
const fs_3 = require("ipfs-car/blockstore/fs");
const blob_1 = require("ipfs-car/pack/blob");
const memory_1 = require("ipfs-car/blockstore/memory");
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
//we use the below two functions to generate the IPFS CID before
//uploading the data to the pinning services.
//This way we ensure the CID is the same
//across different pinning services
//see more info here: https://web3.storage/docs/how-tos/work-with-car-files/
//takes in filePath, returns car file Buffer
function filePathToCarBuffer(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const carFileName = `${filePath}.car`;
        yield (0, fs_2.packToFs)({
            input: filePath,
            output: carFileName,
            blockstore: new fs_3.FsBlockStore()
        });
        return fs_1.default.readFileSync(carFileName);
    });
}
exports.filePathToCarBuffer = filePathToCarBuffer;
//takes in string, retruns car file blob
function contentToCarBlob(content) {
    return __awaiter(this, void 0, void 0, function* () {
        const { root, car } = yield (0, blob_1.packToBlob)({
            input: content,
            blockstore: new memory_1.MemoryBlockStore()
        });
        return { cid: root.toString(), car };
    });
}
exports.contentToCarBlob = contentToCarBlob;
function uploadFileIPFS(filePath, credentials, retries = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = getClient(credentials);
            /* upload the file */
            console.log("Uploading file to IPFS...", filePath, 'Retries remaining: ', retries);
            const buffer = yield filePathToCarBuffer(filePath);
            const added = yield client.add(buffer);
            console.log("File uploaded to IPFS:", added.path);
            return added.path;
        }
        catch (e) {
            if (retries > 0) {
                console.log('Retrying upload', retries);
                return uploadFileIPFS(filePath, credentials, retries - 1);
            }
            else {
                throw e;
            }
        }
    });
}
exports.uploadFileIPFS = uploadFileIPFS;
function uploadTextIPFS(text, credentials) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = getClient(credentials);
        const { cid, car } = yield contentToCarBlob(text);
        console.log('final CID generated locally:', cid);
        /* upload the file */
        console.log("Uploading text to IPFS...", text.substring(0, 100) + "...");
        const added = yield client.add(car, {
            pin: true,
        });
        console.log("Text uploaded to IPFS:", added.path);
        return added.path;
    });
}
exports.uploadTextIPFS = uploadTextIPFS;
