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
const core_1 = __importDefault(require("@actions/core"));
const parse_1 = require("./parse");
const uploadIPFS_1 = require("./uploadIPFS");
try {
    const delegatesFolder = core_1.default.getInput("delegates-folder");
    const tagsPath = core_1.default.getInput("tags-file");
    const INFURA_ID = core_1.default.getInput("infura-id");
    const INFURA_SECRET_KEY = core_1.default.getInput("infura-secret");
    const credentials = {
        INFURA_ID,
        INFURA_SECRET_KEY,
    };
    (0, parse_1.parse)(delegatesFolder, tagsPath)
        .then((data) => __awaiter(void 0, void 0, void 0, function* () {
        if (!data) {
            throw new Error("No data found");
        }
        // Upload all the images to IPFS
        const delegates = data.delegates.map((delegate) => __awaiter(void 0, void 0, void 0, function* () {
            const image = delegate.image;
            if (image) {
                const hashImage = yield (0, uploadIPFS_1.uploadFileIPFS)(image, credentials);
                delegate.image = hashImage;
            }
            return delegate;
        }));
        const uploadedHash = (0, uploadIPFS_1.uploadTextIPFS)(JSON.stringify({
            delegates,
            tags: data.tags,
        }, null, 2), credentials);
        console.log("Uploaded hash", uploadedHash);
        core_1.default.setOutput("hash", uploadedHash);
        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2);
        // console.log(`The event payload: ${payload}`);
    }))
        .catch((error) => {
        core_1.default.setFailed(error.message);
    });
}
catch (error) {
    core_1.default.setFailed(error.message);
}
