import getUnitPriceBaseUnit from '../../src/utils/unit-price';

describe('getUnitPriceBaseUnit', () => {
  it('returns only the formatted unit if the value is 1', () => {
    assert.equal(getUnitPriceBaseUnit(1, 'ML'), 'ml');
  });

  it('returns the value and formatted unit if the value is not 1', () => {
    assert.equal(getUnitPriceBaseUnit(2, 'ML'), '2ml');
  });

  it('returns the correctly formatted unit if the reference unit is L', () => {
    assert.equal(getUnitPriceBaseUnit(2, 'L'), '2L');
  });

  it('returns the correctly formatted unit if the reference unit is M2', () => {
    assert.equal(getUnitPriceBaseUnit(2, 'M2'), '2m²');
  });

  it('returns the correctly formatted unit if the  reference unit is M3', () => {
    assert.equal(getUnitPriceBaseUnit(2, 'M3'), '2m³');
  });
});
