import * as core from '@actions/core'
// import github from "@actions/github";
import { Credentials } from "./credentials";
import { parse } from "./parse";
import { uploadFileIPFS, uploadTextIPFS } from "./uploadIPFS";
import fs from 'fs';

try {
  const delegatesFolder = core.getInput("delegates-folder");
  const tagsPath = core.getInput("tags-file");
  const INFURA_ID = core.getInput("infura-id");
  const INFURA_SECRET_KEY = core.getInput("infura-secret");
  const credentials: Credentials = {
    INFURA_ID,
    INFURA_SECRET_KEY,
  };

  const allItemsCWD = fs.readdirSync(process.cwd());
  core.setCommandEcho(true);
  core.info(allItemsCWD.join(', '));
  console.log(allItemsCWD)

  parse(delegatesFolder, tagsPath)
    .then(async (data) => {
      if (!data) {
        throw new Error("No data found");
      }
      // Upload all the images to IPFS
      const delegates = data.delegates.map(async (delegate) => {
        const image = delegate.image;

        if (image) {
          const hashImage = await uploadFileIPFS(image, credentials);
          delegate.image = hashImage;
        }
        return delegate;
      });

      const uploadedHash = uploadTextIPFS(
        JSON.stringify(
          {
            delegates,
            tags: data.tags,
          },
          null,
          2
        ),
        credentials
      );
      console.log("Uploaded hash", uploadedHash);

      core.setOutput("hash", uploadedHash);

      // Get the JSON webhook payload for the event that triggered the workflow
      // const payload = JSON.stringify(github.context.payload, undefined, 2);
      // console.log(`The event payload: ${payload}`);
    })
    .catch((error: any) => {
      core.setFailed(error.message);
    });
} catch (error: any) {
  core.setFailed(error.message);
}
