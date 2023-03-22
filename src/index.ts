import * as core from "@actions/core";
// import github from "@actions/github";
// import { Credentials } from "./credentials";
import { parseDelegates } from "./parseDelegates";
import { uploadFileIPFS, uploadTextIPFS } from "./uploadIPFS";
import fs from 'fs';
import { parseVotingCommittees } from "./parseVotingCommittees";

async function run() {
  try {
    const delegatesFolder = core.getInput("delegates-folder");
    const delegateVotingCommitteesFolder = core.getInput("voting-committees-folder");
    const tagsPath = core.getInput("tags-file");
    const INFURA_ID = core.getInput("infura-id");
    const INFURA_SECRET_KEY = core.getInput("infura-secret");
    const WEB3_STORAGE_TOKEN = core.getInput("web3-storage-token");
    const NFT_STORAGE_TOKEN = core.getInput("nft-storage-token");
    
    const tokens =  { WEB3_STORAGE_TOKEN, NFT_STORAGE_TOKEN };

    const data = await parseDelegates(delegatesFolder, tagsPath);

    if (!data) {
      throw new Error("No data found");
    }

    // Upload all the images to IPFS
    const delegates = await Promise.all(
      data.delegates.map(async (delegate) => {
        const image = delegate.image;

        try {
          if (image) {
            const hashImage = await uploadFileIPFS(image, tokens);
            delegate.image = hashImage;
          }
        } catch (e: any) {
          console.error('Error uploading image', image, e.message);
          delegate.image = '';
        }

        return delegate;
      })
    );

    console.log('Reading voting committees');
    const votingCommittees = await parseVotingCommittees(delegateVotingCommitteesFolder);

    console.log('Uploading voting committees images to ipfs');
    const votingCommitteesWithImages = await Promise.all(
      votingCommittees.map(async (votingCommittee) => {
        const image = votingCommittee.image;

        try {

          if (image) {
            const hashImage = await uploadFileIPFS(image, tokens);
            votingCommittee.image = hashImage;
          }
        } catch (e: any) {
          console.error('Error uploading image', image, e.message);
          votingCommittee.image = '';
        }

        return votingCommittee;
      })
    );

    console.log('All images uploaded');
    const fileContents = JSON.stringify(
      {
        delegates,
        tags: data.tags,
        votingCommittees: votingCommitteesWithImages
      },
      null,
      2
    );

    const uploadedHash = await uploadTextIPFS(
      fileContents,
      tokens,
    );
    console.log("Uploaded hash", uploadedHash);

    core.setOutput("hash", uploadedHash);

    const outputFile = core.getInput("output-file");

    if (outputFile) {
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
