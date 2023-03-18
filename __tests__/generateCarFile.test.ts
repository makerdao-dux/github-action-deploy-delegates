import {expect, test} from '@jest/globals'
import { parseDelegates } from '../src/parseDelegates';
import { parseVotingCommittees } from '../src/parseVotingCommittees';
import { getCarFile } from '../src/uploadIPFS';
import { promises as fs } from 'fs';

test('generate car file', async () => {
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
  const testFileName = 'testFile.txt';
  await fs.writeFile(testFileName, fileContents);
  const carFile = await getCarFile(testFileName);
  expect(Buffer.isBuffer(carFile)).toBe(true);
});