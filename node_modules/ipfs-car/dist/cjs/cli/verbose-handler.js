"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printUnixFsContent = void 0;
async function* printUnixFsContent(root) {
    for await (const entry of root) {
        // tslint:disable-next-line:no-console
        console.log(`${entry.cid.toString()} ${entry.path}`);
        yield entry;
    }
}
exports.printUnixFsContent = printUnixFsContent;
