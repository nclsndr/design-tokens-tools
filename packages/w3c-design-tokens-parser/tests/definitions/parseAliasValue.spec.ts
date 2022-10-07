import { describe, it, expect } from 'vitest';

import { parseAliasValue } from '../../src/parser/alias/parseAliasValue';

describe.concurrent('parseAliasValue', () => {
  it('should parse a valid alias string value', () => {
    const result = parseAliasValue('{my.alias}', {
      varName: 'alias',
      valuePath: [],
      path: ['my', 'alias'],
    });

    expect(result.isOk()).toBe(true);
    expect(result.isOk() && result.get()).toBe('{my.alias}');
  });
  it('should fail to parse without heading brace', () => {
    const result = parseAliasValue('my.alias}', {
      varName: 'Value',
      valuePath: [],
      path: ['my', 'alias'],
    });

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toBe(
      'Value must be wrapped in curly braces to form an alias reference, like: "{my.alias}". Got "my.alias}".',
    );
  });
  it('should fail to parse without trailing brace', () => {
    const result = parseAliasValue('{my.alias', {
      varName: 'Value',
      valuePath: [],
      path: ['my', 'alias'],
    });

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toBe(
      'Value must be wrapped in curly braces to form an alias reference, like: "{my.alias}". Got "{my.alias".',
    );
  });
});
