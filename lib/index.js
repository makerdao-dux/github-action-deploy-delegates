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
const core = __importStar(require("@actions/core"));
const parseDelegates_1 = require("./parseDelegates");
const uploadIPFS_1 = require("./uploadIPFS");
const fs_1 = __importDefault(require("fs"));
const parseVotingCommittees_1 = require("./parseVotingCommittees");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const delegatesFolder = core.getInput("delegates-folder");
            const delegateVotingCommitteesFolder = core.getInput("voting-committees-folder");
            const tagsPath = core.getInput("tags-file");
            const INFURA_ID = core.getInput("infura-id");
            const INFURA_SECRET_KEY = core.getInput("infura-secret");
            const credentials = {
                INFURA_ID,
                INFURA_SECRET_KEY,
            };
            const data = yield (0, parseDelegates_1.parseDelegates)(delegatesFolder, tagsPath);
            if (!data) {
                throw new Error("No data found");
            }
            // Upload all the images to IPFS
            const delegates = yield Promise.all(data.delegates.map((delegate) => __awaiter(this, void 0, void 0, function* () {
                const image = delegate.image;
                try {
                    if (image) {
                        const hashImage = yield (0, uploadIPFS_1.uploadFileIPFS)(image, credentials);
                        delegate.image = hashImage;
                    }
                }
                catch (e) {
                    console.error('Error uploading image', image, e.message);
                    delegate.image = '';
                }
                return delegate;
            })));
            console.log('Reading voting committees');
            const votingCommittees = yield (0, parseVotingCommittees_1.parseVotingCommittees)(delegateVotingCommitteesFolder);
            console.log('Uploading voting committees images to ipfs');
            const votingCommitteesWithImages = yield Promise.all(votingCommittees.map((votingCommittee) => __awaiter(this, void 0, void 0, function* () {
                const image = votingCommittee.image;
                try {
                    if (image) {
                        const hashImage = yield (0, uploadIPFS_1.uploadFileIPFS)(image, credentials);
                        votingCommittee.image = hashImage;
                    }
                }
                catch (e) {
                    console.error('Error uploading image', image, e.message);
                    votingCommittee.image = '';
                }
                return votingCommittee;
            })));
            console.log('All images uploaded');
            const fileContents = JSON.stringify({
                delegates,
                tags: data.tags,
                votingCommittees: votingCommitteesWithImages
            }, null, 2);
            const uploadedHash = yield (0, uploadIPFS_1.uploadTextIPFS)(fileContents, credentials);
            console.log("Uploaded hash", uploadedHash);
            core.setOutput("hash", uploadedHash);
            const outputFile = core.getInput("output-file");
            if (outputFile) {
                fs_1.default.writeFileSync(outputFile, fileContents);
            }
            // Get the JSON webhook payload for the event that triggered the workflow
            // const payload = JSON.stringify(github.context.payload, undefined, 2);
            // console.log(`The event payload: ${payload}`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
