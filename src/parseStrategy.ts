import fs from "fs";

import fm from "front-matter";
import { Strategy } from "./delegateVotingCommittee";

export function parseStrategy(strategyFilePath: string): Strategy {
  const strategyContent = fs.readFileSync(strategyFilePath, "utf8");
  const {
    body,
    attributes: {
      name,
      delegates
    },
  } = fm<any>(strategyContent);

  return {
    name,
    description: body,
    delegates
  };
}
