import './sourcemap-register.cjs';/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

var __createBinding = (undefined && undefined.__createBinding) || (Object.create ? (function(o, m, k, k2) {
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
var __setModuleDefault = (undefined && undefined.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (undefined && undefined.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const parse_1 = require("./parse");
const uploadIPFS_1 = require("./uploadIPFS");
try {
    const delegatesFolder = core.getInput("delegates-folder");
    const tagsPath = core.getInput("tags-file");
    const INFURA_ID = core.getInput("infura-id");
    const INFURA_SECRET_KEY = core.getInput("infura-secret");
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
        core.setOutput("hash", uploadedHash);
        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2);
        // console.log(`The event payload: ${payload}`);
    }))
        .catch((error) => {
        core.setFailed(error.message);
    });
}
catch (error) {
    core.setFailed(error.message);
}


//# sourceMappingURL=index.js.map