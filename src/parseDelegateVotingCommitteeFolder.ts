import fs from "fs";
import path from "path";
import { parseProfile } from "./parseProfile";
import { DelelegateVotingCommittee } from "./delegateVotingCommittee";
import { parseStrategy } from "./parseStrategy";

export function parseDelegateVotingCommitteeFolder(
  dvcsFolderPath: string,
  folder: string
): DelelegateVotingCommittee {
  const contents = fs.readdirSync(path.join(dvcsFolderPath, folder));

  // Search for the image file
  const image = contents.find((item) => item.startsWith("avatar"));
  const imageFilePath = image
    ? path.join(dvcsFolderPath, folder, image)
    : "";

  // Search for the profile file
  const profileFilePath = path.join(dvcsFolderPath, folder, "profile.md");


  const strategiesFolder = path.join(
    dvcsFolderPath,
    folder,
    "strategies"
  );

  if (!fs.existsSync(profileFilePath)) {
    console.error(profileFilePath, "Profile file not found");
    throw new Error("Profile file does not exist for delegate " + folder);
  }

  if (!fs.existsSync(strategiesFolder)) {
    console.error(strategiesFolder, "Strategies folder not found");
    throw new Error("Strategies folder does not exist for DVC: " + folder);
  }


  // Read all files inside the strategies folder
  const strategies = fs.readdirSync(strategiesFolder)
    // filter ending by .md
    .filter((strategyFile) => strategyFile.endsWith(".md"))
    .map((strategyFile) => {
      const strategyFilePath = path.join(strategiesFolder, strategyFile);
      // Parse the markdown file
      const strategy = parseStrategy(strategyFilePath);

      return strategy;
    });


  const profile = parseProfile(profileFilePath);

  return {
    name: profile.name,
    image: imageFilePath,
    externalProfileURL: profile.externalProfileURL,
    description: profile.description,
    strategies
  };
}
