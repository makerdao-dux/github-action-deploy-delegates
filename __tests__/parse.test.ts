
import {expect, test} from '@jest/globals'
import { parse } from '../src/parse';

test('Finds the tags file', async () => {
  const result = await parse('__tests__/delegates', '__tests__/delegates/tags.json');

  expect(result).toBeDefined();

  if (result) {
    expect(result.tags.length).toBeGreaterThan(0);
    expect(result.tags[0].id).toBeDefined();
    expect(result.tags[0].description).toBeDefined();
  }else {
    throw new Error('Result is undefined');
  }
});


test('Finds the delegates and parses them correctly', async () => {
  const result = await parse('__tests__/delegates', '__tests__/delegates/tags.json');
  expect(result).toBeDefined();

  if (result) {
    expect(result.delegates.length).toBeGreaterThan(0);
    expect(result.delegates[0].voteDelegateAddress).toBeDefined();
    expect(result.delegates[0].profile).toBeDefined();
    expect(result.delegates[0].metrics).toBeDefined();
    expect(result.delegates[0].image).toBeDefined();
    expect(result.delegates[0].cuMember).toBe(true);
    expect(result.delegates[0].profile.name).toBeDefined();
    expect(result.delegates[0].profile.description).toBeDefined();
    expect(result.delegates[0].profile.tags).toBeDefined();
    expect(result.delegates[0].profile.externalProfileURL).toBeDefined();
    expect(result.delegates[0].metrics.combinedParticipation).toBeDefined();
    expect(result.delegates[0].metrics.communication).toBeDefined();
    expect(result.delegates[0].metrics.executiveParticipation).toBeDefined();
    expect(result.delegates[0].metrics.pollParticipation).toBeDefined();
  } else {
    throw new Error('Result is undefined');
  }
});

test('Throws an error if the delegates folder does not exist', async () => {
  await expect(parse('does-not-exist', '__tests__/delegates/tags.json')).rejects.toThrowError();
});

test('Throws an error if the tags file does not exist', async () => {
  await expect(parse('__tests__/delegates', 'does-not-exist')).rejects.toThrowError();
});