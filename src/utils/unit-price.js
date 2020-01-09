function getUnitString(unitEnum) {
  if(unitEnum === 'L') {
    return 'L';
  } else if (unitEnum === 'M3') {
    return 'm³';
  } else if (unitEnum === 'M2') {
    return 'm²';
  } else {
    return unitEnum.toLowerCase();
  }
}

function getUnitPriceBaseUnit(referenceValue, referenceUnit) {
  const unitString = getUnitString(referenceUnit);
  if (referenceValue === 1) {
    return `${unitString}`;
  }

  return `${referenceValue}${unitString}`;
}


export default getUnitPriceBaseUnit;