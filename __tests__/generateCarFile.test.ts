import {expect, test} from '@jest/globals'
import { parseDelegates } from '../src/parseDelegates';
import { parseVotingCommittees } from '../src/parseVotingCommittees';
import { filePathToCarBuffer, contentToCarBlob } from '../src/uploadIPFS';
import { promises as fs } from 'fs';

test('generate car buffer from file', async () => {
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
  const carFile = await filePathToCarBuffer(testFileName);
  expect(Buffer.isBuffer(carFile)).toBe(true);
});

test('generate car blob and cid from json', async () => {
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
  const { cid, car } = await contentToCarBlob(fileContents);
  console.log({ cid, car });
  expect(typeof cid === 'string' && cid.length > 0).toBe(true);
  expect(car instanceof Blob).toBe(true);
});