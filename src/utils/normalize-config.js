function normalizeId(type, databaseKey) {
  return btoa(`gid://shopify/${type}/${databaseKey}`);
}

function getNormalizedIdFromConfig(type, config, databaseKey, storefrontKey) {
  const denormalizedValue = config[databaseKey];
  const normalizedValue = config[storefrontKey];

  if (normalizedValue) {
    return normalizedValue;
  } else if (denormalizedValue) {
    if (Array.isArray(denormalizedValue)) {
      return denormalizedValue.map((value) => {
        return normalizeId(type, value);
      });
    } else {
      return normalizeId(type, denormalizedValue);
    }
  } else {
    return null;
  }
}

function normalizeConfig(config, baseResourceType = 'Product') {
  if (config.id || config.storefrontId) {
    config.storefrontId = getNormalizedIdFromConfig(baseResourceType, config, 'id', 'storefrontId');
  }

  if (config.variantId || config.storefrontVariantId) {
    config.storefrontVariantId = getNormalizedIdFromConfig('ProductVariant', config, 'variantId', 'storefrontVariantId');
  }

  return config;
}

export default normalizeConfig;
