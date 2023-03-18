"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.uploadTextIPFS = exports.uploadFileIPFS = exports.generateCarFile = void 0;
const ipfs_http_client_1 = require("ipfs-http-client");
const fs_1 = __importDefault(require("fs"));
const IPFS = __importStar(require("ipfs-core"));
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
function generateCarFile(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const ipfs = yield IPFS.create();
        console.log('ipfs', ipfs);
    });
}
exports.generateCarFile = generateCarFile;
function uploadFileIPFS(filePath, credentials, retries = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = getClient(credentials);
            /* upload the file */
            console.log("Uploading file to IPFS...", filePath, 'Retries remaining: ', retries);
            const file = fs_1.default.readFileSync(filePath);
            const added = yield client.add(file);
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
        /* upload the file */
        console.log("Uploading text to IPFS...", text.substring(0, 100) + "...");
        const added = yield client.add(text, {
            pin: true,
        });
        console.log("Text uploaded to IPFS:", added.path);
        return added.path;
    });
}
exports.uploadTextIPFS = uploadTextIPFS;
