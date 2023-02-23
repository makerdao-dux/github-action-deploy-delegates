"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDelegateVotingCommitteeFolder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const parseProfile_1 = require("./parseProfile");
const parseStrategy_1 = require("./parseStrategy");
function parseDelegateVotingCommitteeFolder(dvcsFolderPath, folder) {
    const contents = fs_1.default.readdirSync(path_1.default.join(dvcsFolderPath, folder));
    // Search for the image file
    const image = contents.find((item) => item.startsWith("avatar"));
    const imageFilePath = image
        ? path_1.default.join(dvcsFolderPath, folder, image)
        : "";
    // Search for the profile file
    const profileFilePath = path_1.default.join(dvcsFolderPath, folder, "profile.md");
    const strategiesFolder = path_1.default.join(dvcsFolderPath, folder, "strategies");
    if (!fs_1.default.existsSync(profileFilePath)) {
        console.error(profileFilePath, "Profile file not found");
        throw new Error("Profile file does not exist for delegate " + folder);
    }
    if (!fs_1.default.existsSync(strategiesFolder)) {
        console.error(strategiesFolder, "Strategies folder not found");
        throw new Error("Strategies folder does not exist for DVC: " + folder);
    }
    // Read all files inside the strategies folder
    const strategies = fs_1.default.readdirSync(strategiesFolder)
        // filter ending by .md
        .filter((strategyFile) => strategyFile.endsWith(".md"))
        .map((strategyFile) => {
        const strategyFilePath = path_1.default.join(strategiesFolder, strategyFile);
        // Parse the markdown file
        const strategy = (0, parseStrategy_1.parseStrategy)(strategyFilePath);
        return strategy;
    });
    const profile = (0, parseProfile_1.parseProfile)(profileFilePath);
    return {
        name: profile.name,
        image: imageFilePath,
        externalProfileURL: profile.externalProfileURL,
        description: profile.description,
        strategies
    };
}
exports.parseDelegateVotingCommitteeFolder = parseDelegateVotingCommitteeFolder;
