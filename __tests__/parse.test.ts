
import {expect, test} from '@jest/globals'
import { parse } from '../src/parse';

test('Finds the tags file', async () => {
  const result = await parse('__tests__/delegates', '__tests__/delegates/tags.json');
  console.log(result);

  expect(result).toBeDefined();

  if (result) {
    expect(result.tags.length).toBeGreaterThan(0);
    expect(result.tags[0].id).toBeDefined();
    expect(result.tags[0].description).toBeDefined();
  }else {
    throw new Error('Result is undefined');
  }
});


test('Throws an error if the delegates folder does not exist', async () => {
  await expect(parse('does-not-exist', '__tests__/delegates/tags.json')).rejects.toThrowError();
});

test('Throws an error if the tags file does not exist', async () => {
  await expect(parse('__tests__/delegates', 'does-not-exist')).rejects.toThrowError();
});