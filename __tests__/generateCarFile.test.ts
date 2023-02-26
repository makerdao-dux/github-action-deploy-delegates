import {expect, test} from '@jest/globals'
import { parseDelegates } from '../src/parseDelegates';
import { parseVotingCommittees } from '../src/parseVotingCommittees';
import { generateCarFile } from '../src/uploadIPFS';

test('Finds the tags file', async () => {
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
  const car = generateCarFile(fileContents);
});