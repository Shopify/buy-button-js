export function simpleNormalizeId(type, databaseKey) {
  return btoa(`gid://shopify/${type}/${databaseKey}`);
}

export function getNormalizedIdFromConfig(type, config, databaseKey, storefrontKey) {
  if (config[storefrontKey]) {
    return config[storefrontKey];
  } else if (config[databaseKey]) {
    return simpleNormalizeId(type, config[databaseKey]);
  } else {
    return null;
  }
}

function normalizeConfig(config) {
  if (config.id || config.storefrontId) {
    config.storefrontId = getNormalizedIdFromConfig('Product', config, 'id', 'storefrontId');
  }

  if (config.variantId || config.storefrontVariantId) {
    config.storefrontVariantId = getNormalizedIdFromConfig('ProductVariant', config, 'variantId', 'storefrontVariantId');
  }

  return config;
}

export default normalizeConfig;
