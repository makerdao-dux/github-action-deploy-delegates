"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMetrics = void 0;
const fs_1 = __importDefault(require("fs"));
const front_matter_1 = __importDefault(require("front-matter"));
function parseMetrics(metricsFilePath) {
    const metricsContent = fs_1.default.readFileSync(metricsFilePath, "utf8");
    const { attributes: { combined_participation, poll_participation, exec_participation, communication, }, } = (0, front_matter_1.default)(metricsContent);
    return {
        combinedParticipation: combined_participation,
        pollParticipation: poll_participation,
        executiveParticipation: exec_participation,
        communication: communication,
    };
}
exports.parseMetrics = parseMetrics;
