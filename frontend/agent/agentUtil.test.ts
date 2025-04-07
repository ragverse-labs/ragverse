import { Plugin } from '@/types/agent';

import { stripQuotes } from './agentUtil';

import { describe, expect, it } from 'vitest';

describe('stripQuotes', () => {
  it('should strip quotes', () => {
    expect(stripQuotes('"some text"')).toEqual('some text');
    expect(stripQuotes('"some\' \'text"')).toEqual("some' 'text");
  });
});
