import { describe, expect, it } from 'vitest';
import { Json } from 'design-tokens-format-module';
import { TokenNameFormatOptions } from '../../../src/exporter/internals/FormatOptions';

import { formatTokenName } from '../../../src/exporter/internals/formatTokenName';

describe.concurrent('formatTokenName', () => {
  it('should fail when both template and joinWith are defined', () => {
    const path: Json.ValuePath = ['token', 'name'];
    const format: TokenNameFormatOptions = {
      template: 'template',
      joinWith: '-',
    };
    expect(() => formatTokenName(path, format)).toThrow(
      'Cannot use both `template` and `joinWith` options to format token name',
    );
  });
  it('formats using mustache template: {{name}}', () => {
    const path: Json.ValuePath = ['color', 'blue', '500'];
    const format: TokenNameFormatOptions = {
      template: '{{name}}',
    };
    const result = formatTokenName(path, format);
    expect(result).toBe('500');
  });
  it('formats using mustache template: {{#groups}}{{.}}-{{/groups}}', () => {
    const path: Json.ValuePath = ['semantic', 'status', 'danger', 'foreground'];
    const format: TokenNameFormatOptions = {
      template: '{{#groups}}{{.}}-{{/groups}}',
    };
    const result = formatTokenName(path, format);
    expect(result).toBe('semantic-status-danger-');
  });
  it('formats using mustache template: {{group.first}}-{{group.second}}', () => {
    const path: Json.ValuePath = ['semantic', 'status', 'danger', 'foreground'];
    const format: TokenNameFormatOptions = {
      template: '{{group.first}}-{{group.second}}',
    };
    const result = formatTokenName(path, format);
    expect(result).toBe('semantic-status');
  });
  it('formats using mustache template: {{parent.second}}-{{parent.first}}', () => {
    const path: Json.ValuePath = ['semantic', 'status', 'danger', 'foreground'];
    const format: TokenNameFormatOptions = {
      template: '{{parent.second}}-{{parent.first}}',
    };
    const result = formatTokenName(path, format);
    expect(result).toBe('status-danger');
  });
  it('joins path with default separator when joinWith is undefined', () => {
    const path: Json.ValuePath = ['token', 'name'];
    const format: TokenNameFormatOptions = {};
    const result = formatTokenName(path, format);
    expect(result).toBe('token.name');
  });
  it('joins path with custom separator when joinWith is defined', () => {
    const path: Json.ValuePath = ['token', 'name'];
    const format: TokenNameFormatOptions = { joinWith: '-' };
    const result = formatTokenName(path, format);
    expect(result).toBe('token-name');
  });
  it('changes case of joined path when toCase is defined', () => {
    const path: Json.ValuePath = ['token', 'name'];
    const format: TokenNameFormatOptions = { toCase: 'constantCase' };
    const result = formatTokenName(path, format);
    expect(result).toBe('TOKEN_NAME');
  });
  it('joins path with custom separator and changes case when both joinWith and toCase are defined', () => {
    const path: Json.ValuePath = ['token', 'name'];
    const format: TokenNameFormatOptions = {
      joinWith: '--',
      toCase: 'constantCase',
    };
    const result = formatTokenName(path, format);
    expect(result).toBe('TOKEN--NAME');
  });
});
