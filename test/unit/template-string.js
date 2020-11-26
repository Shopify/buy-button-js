import { assert } from 'chai';
import parseTemplateString from '../../src/utils/template-string';

describe('parseTemplateString', () => {
  it('returns the string if no placeholders are found', () => {
    const string = 'string without templates';
    assert.equal(parseTemplateString(string), string);
  });

  it('returns a string with the placeholders replaced', () => {
    const string = 'string with ${placeholder} templates';
    assert.equal(parseTemplateString(string, {placeholder: 'awesome'}), 'string with awesome templates');
  });
});
