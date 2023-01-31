"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDelegateFolder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const parseProfile_1 = require("./parseProfile");
const parseMetrics_1 = require("./parseMetrics");
function parseDelegateFolder(delegatesFolderPath, folder) {
    const contents = fs_1.default.readdirSync(path_1.default.join(delegatesFolderPath, folder));
    const image = contents.find(item => item.startsWith('avatar'));
    const profileFilePath = path_1.default.join(delegatesFolderPath, folder, 'profile.md');
    const metricsFilePath = path_1.default.join(delegatesFolderPath, folder, 'metrics.md');
    const imageFilePath = image ? path_1.default.join(delegatesFolderPath, folder, image) : '';
    if (!fs_1.default.existsSync(profileFilePath)) {
        console.error(profileFilePath, "Profile file not found");
        throw new Error("Profile file does not exist for delegate " + folder);
    }
    if (!fs_1.default.existsSync(metricsFilePath)) {
        console.error(metricsFilePath, "Metrics file not found");
        throw new Error("Metrics file does not exist for delegate " + folder);
    }
    const profile = (0, parseProfile_1.parseProfile)(profileFilePath);
    const metrics = (0, parseMetrics_1.parseMetrics)(metricsFilePath);
    // TODO: Upload image to IPFS and return the hash
    return {
        voteDelegateAddress: folder,
        profile,
        image: imageFilePath,
        metrics
    };
}
exports.parseDelegateFolder = parseDelegateFolder;
