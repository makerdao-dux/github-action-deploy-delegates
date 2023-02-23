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
exports.parseDelegates = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const parseDelegateFolder_1 = require("./parseDelegateFolder");
function parseDelegates(delegatesFolder, tagsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const pathDelegates = path_1.default.join(process.cwd(), delegatesFolder);
        const pathTags = path_1.default.join(process.cwd(), tagsPath);
        if (!fs_1.default.existsSync(pathDelegates)) {
            console.error(pathDelegates, "Delegates folder not found");
            throw new Error("Delegates folder does not exist");
        }
        if (!fs_1.default.existsSync(pathTags)) {
            console.error(pathTags, "Tags file not found");
            throw new Error("Tags file does not exist");
        }
        const allItems = fs_1.default.readdirSync(delegatesFolder);
        // Filter delegates, only get items that start by 0x
        const delegates = allItems.filter((item) => item.startsWith("0x")).map((folder) => (0, parseDelegateFolder_1.parseDelegateFolder)(pathDelegates, folder));
        const tagsRaw = fs_1.default.readFileSync(tagsPath, "utf8");
        const tags = JSON.parse(tagsRaw);
        console.log("Found", delegates.length, "delegates");
        return Promise.resolve({
            tags,
            delegates,
        });
    });
}
exports.parseDelegates = parseDelegates;
