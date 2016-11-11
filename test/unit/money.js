import formatMoney from '../../src/utils/money';

describe('formatMoney', () => {
  it("#format properly formats cents", () => {
    assert.equal('0.00', formatMoney(0, '{{ amount }}'))
    assert.equal('0.10', formatMoney(0.10, '{{ amount }}'))
    assert.equal('10.10', formatMoney(10.10, '{{ amount }}'))
    assert.equal('10,10', formatMoney(10.10, '{{ amount_with_comma_separator }}'))
    assert.equal('10', formatMoney(10.10, '{{ amount_no_decimals }}'))
  });

  it("#format properly formats thousand separators", () => {
    assert.equal('1,010.55', formatMoney(1010.55, '{{ amount }}'))
    assert.equal('1,010,555,523.22', formatMoney(1010555523.22, '{{ amount }}'))
    assert.equal('1.010.555.523,22', formatMoney(1010555523.22, '{{ amount_with_comma_separator }}'))
  });

  it("#format with amount_no_decimals_with_comma_separator", () => {
    assert.equal('1.000', formatMoney(1000.00, '{{ amount_no_decimals_with_comma_separator }}'))
  });

  it("#format with amount_no_decimals_with_space_separator", () => {
    assert.equal('1 000', formatMoney(1000.00, '{{ amount_no_decimals_with_space_separator }}'))
  });

  it("#format will fail softly by using default format", () => {
    assert.equal('1,010.55', formatMoney(1010.55, '{{ unknown_format }}'))
  });

  it("#format with empty value", () => {
    assert.equal('0.00', formatMoney(null, '{{ amount }}'))
  });

  it("#format with bad shop money format doesn't break", () => {
    assert.equal('$123.00', formatMoney(123.00, '${amount}'));
  });
});

