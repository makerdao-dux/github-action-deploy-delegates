"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStrategy = void 0;
const fs_1 = __importDefault(require("fs"));
const front_matter_1 = __importDefault(require("front-matter"));
function parseStrategy(strategyFilePath) {
    const strategyContent = fs_1.default.readFileSync(strategyFilePath, "utf8");
    const { body, attributes: { name, delegates }, } = (0, front_matter_1.default)(strategyContent);
    return {
        name,
        description: body,
        delegates
    };
}
exports.parseStrategy = parseStrategy;
