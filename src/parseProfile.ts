import {  Profile } from "./delegate";
import fs from "fs";

import fm from "front-matter";

export function parseProfile(profileFilePath: string): Profile {
  const profileContent = fs.readFileSync(profileFilePath, "utf8");
  const {
    body,
    attributes: { name,  tags, external_profile_url }
  } = fm<any>(profileContent);

  return {
    name,
    tags,
    description: body,
    externalProfileURL: external_profile_url
  };
}
