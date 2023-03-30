import * as core from "@actions/core";
import { parseDelegates } from "./parseDelegates";
import { uploadFileIPFS, uploadTextIPFS } from "./uploadIPFS";
import fs from 'fs';
import { parseVotingCommittees } from "./parseVotingCommittees";

async function run() {
  try {
    const delegatesFolder = core.getInput("delegates-folder");
    const delegateVotingCommitteesFolder = core.getInput("voting-committees-folder");
    const tagsPath = core.getInput("tags-file");
    const WEB3_STORAGE_TOKEN = core.getInput("web3-storage-token");
    const NFT_STORAGE_TOKEN = core.getInput("nft-storage-token");
    
    const tokens =  { WEB3_STORAGE_TOKEN, NFT_STORAGE_TOKEN };

    const data = await parseDelegates(delegatesFolder, tagsPath);
    const votingCommittees = await parseVotingCommittees(delegateVotingCommitteesFolder);

    if (!data) {
      throw new Error("No data found");
    }

    const totalNumFileUploads = data.delegates.length + votingCommittees.length;
    const numRetries = 2 + Math.ceil(totalNumFileUploads / 30); //ensure at least 3 retries. Currently rate limit triggers after 30 requests within 10 seconds, so scale up retries as we hit more rate limits
    console.log('max retries:', numRetries);

    // Upload all the images to IPFS
    const delegatesResults = await Promise.allSettled(
      data.delegates.map(async (delegate) => {
        const image = delegate.image;

        try {
          if (image) {
            const hashImage = await uploadFileIPFS(image, tokens, numRetries);
            delegate.image = hashImage;
          }
        } catch (e: any) {
          console.error('Error uploading image', image, e.message);
          delegate.image = '';
        }

        return delegate;
      })
    );
    const delegates = delegatesResults.
      filter(d => d.status === 'fulfilled')
      // @ts-ignore
      .map(d => d.value);
    console.log('Reading voting committees');

    console.log('Uploading voting committees images to ipfs');
    const votingCommitteesWithImages = await Promise.all(
      votingCommittees.map(async (votingCommittee) => {
        const image = votingCommittee.image;

        try {

          if (image) {
            const hashImage = await uploadFileIPFS(image, tokens, numRetries);
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
