import * as core from "@actions/core";
// import github from "@actions/github";
import { Credentials } from "./credentials";
import { parse } from "./parse";
import { uploadFileIPFS, uploadTextIPFS } from "./uploadIPFS";
import fs from 'fs';

async function run() {
  try {
    const delegatesFolder = core.getInput("delegates-folder");
    const tagsPath = core.getInput("tags-file");
    const INFURA_ID = core.getInput("infura-id");
    const INFURA_SECRET_KEY = core.getInput("infura-secret");
    const credentials: Credentials = {
      INFURA_ID,
      INFURA_SECRET_KEY,
    };

    const data = await parse(delegatesFolder, tagsPath);
    if (!data) {
      throw new Error("No data found");
    }
    // Upload all the images to IPFS
    const delegates = await Promise.all(
      data.delegates.map(async (delegate) => {
        const image = delegate.image;

        try {
          if (image) {
            const hashImage = await uploadFileIPFS(image, credentials);
            delegate.image = hashImage;
          }
        } catch(e: any) {
          console.error('Error uploading image', image, e.message);
          delegate.image = '';
        }
        
        return delegate;
      })
    );

    console.log('All images uploaded');
    const fileContents = JSON.stringify(
      {
        delegates,
        tags: data.tags,
      },
      null,
      2
    );

    const uploadedHash = await uploadTextIPFS(
      fileContents,
      credentials
    );
    console.log("Uploaded hash", uploadedHash);

    core.setOutput("hash", uploadedHash);

    const outputFile = core.getInput("output-file");

    if(outputFile) {
      fs.writeFileSync(outputFile, fileContents)
    }

    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
