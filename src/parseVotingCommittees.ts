import fs from "fs";
import path from "path";
import { DelelegateVotingCommittee } from "./delegateVotingCommittee";
import { parseDelegateVotingCommitteeFolder } from "./parseDelegateVotingCommitteeFolder";

export async function parseVotingCommittees(
  dvcsFolder: string
): Promise<DelelegateVotingCommittee[]> {

  const pathDvcs = path.join(process.cwd(), dvcsFolder);

  if (!fs.existsSync(pathDvcs)) {
    console.error(pathDvcs, "Delegate Voting Committees folder not found");
    throw new Error("Delegate Voting Committees folder does not exist");
  }

  const allItems = fs.readdirSync(pathDvcs);

  const dvcs = allItems.map((folder) => parseDelegateVotingCommitteeFolder(pathDvcs, folder));


  console.log("Found", dvcs.length, "Delegate Voting Committees");
  
  return Promise.resolve(dvcs);
}
