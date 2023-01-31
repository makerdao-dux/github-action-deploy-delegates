import { Metrics } from "./delegate";
import fs from "fs";

import fm from "front-matter";

export function parseMetrics(metricsFilePath: string): Metrics {
  const metricsContent = fs.readFileSync(metricsFilePath, "utf8");
  const {
    attributes: {
      combined_participation,
      poll_participation,
      exec_participation,
      communication,
    },
  } = fm<any>(metricsContent);

  return {
    combinedParticipation: combined_participation,
    pollParticipation: poll_participation,
    executiveParticipation: exec_participation,
    communication: communication,
  };
}
