import {expect, test} from '@jest/globals'
import { parseDelegates } from '../src/parseDelegates';
import { parseVotingCommittees } from '../src/parseVotingCommittees';
import { dataToCar } from '../src/uploadIPFS';
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
  const car = await dataToCar(fileContents);
  const CID = (await car.getRoots()).toString();
  expect(CID.length > 45).toBe(true);
});
