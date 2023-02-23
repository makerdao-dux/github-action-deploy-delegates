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
exports.parseVotingCommittees = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const parseDelegateVotingCommitteeFolder_1 = require("./parseDelegateVotingCommitteeFolder");
function parseVotingCommittees(dvcsFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const pathDvcs = path_1.default.join(process.cwd(), dvcsFolder);
        if (!fs_1.default.existsSync(pathDvcs)) {
            console.error(pathDvcs, "Delegate Voting Committees folder not found");
            throw new Error("Delegate Voting Committees folder does not exist");
        }
        const allItems = fs_1.default.readdirSync(pathDvcs);
        const dvcs = allItems.map((folder) => (0, parseDelegateVotingCommitteeFolder_1.parseDelegateVotingCommitteeFolder)(pathDvcs, folder));
        console.log("Found", dvcs.length, "Delegate Voting Committees");
        return Promise.resolve(dvcs);
    });
}
exports.parseVotingCommittees = parseVotingCommittees;
