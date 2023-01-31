"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProfile = void 0;
const fs_1 = __importDefault(require("fs"));
const front_matter_1 = __importDefault(require("front-matter"));
function parseProfile(profileFilePath) {
    const profileContent = fs_1.default.readFileSync(profileFilePath, "utf8");
    const { body, attributes: { name, tags, external_profile_url } } = (0, front_matter_1.default)(profileContent);
    return {
        name,
        tags,
        description: body,
        externalProfileURL: external_profile_url
    };
}
exports.parseProfile = parseProfile;
