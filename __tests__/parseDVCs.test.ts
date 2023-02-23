
import {expect, test} from '@jest/globals'
import { parseVotingCommittees } from '../src/parseVotingCommittees';




test('Finds the DVCS and parses them correctly', async () => {
  const result = await parseVotingCommittees('__tests__/voting-committees');
  expect(result).toBeDefined();

  if (result) {
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBeDefined();
    expect(result[0].description).toBeDefined();
    expect(result[0].externalProfileURL).toBeDefined();
    expect(result[0].image).toBeDefined();
    expect(result[0].strategies.length).toBe(2);
    expect(result[0].strategies[0].name).toBeDefined();
    expect(result[0].strategies[0].description).toBeDefined();
    expect(result[0].strategies[0].delegates.length).toBeGreaterThan(0);
  } else {
    throw new Error('Result is undefined');
  }
});

test('Throws an error if the DVCS folder does not exist', async () => {
  await expect(parseVotingCommittees('does-not-exist')).rejects.toThrowError();
});

