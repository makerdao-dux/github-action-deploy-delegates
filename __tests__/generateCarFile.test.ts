import {expect, test} from '@jest/globals'
import { parseDelegates } from '../src/parseDelegates';
import { parseVotingCommittees } from '../src/parseVotingCommittees';
import { filePathToCar } from '../src/uploadIPFS';
import { promises as fs } from 'fs';
import { CarReader } from '@ipld/car';

test('generate car file from file', async () => {
  const delegates = await parseDelegates('__tests__/delegates', '__tests__/delegates/tags.json');
  const votingCommittees = await parseVotingCommittees('__tests__/voting-committees');
  const fileContents = JSON.stringify(
    {
      delegates,
      votingCommittees
    },
    null,
    2
  );
  const testFileName = 'testFile';
  await fs.writeFile(testFileName, fileContents);
  const carFile = await filePathToCar(testFileName);
  console.log('carFile', carFile);
    //expect this to be CarReader type
});
