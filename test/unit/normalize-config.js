import normalizeConfig from '../../src/utils/normalize-config';

describe('normalizeConfig', () => {
  it('adapts a single ID to a hashed product gid', () => {
    const id = 12345;
    const config = normalizeConfig({id});

    assert.deepEqual(config, {
      id,
      storefrontId: btoa(`gid://shopify/Product/${id}`),
    });
  });

  it('doesn\'t clobber existing storefront IDs', () => {
    const storefrontId = btoa('gid://shopify/Product/12345');
    const config = normalizeConfig({storefrontId});

    assert.deepEqual(config, {
      storefrontId,
    });
  });

  it('adapts a variantId to a hashed ProductVariant gid', () => {
    const variantId = 12345;
    const config = normalizeConfig({variantId});

    assert.deepEqual(config, {
      variantId,
      storefrontVariantId: btoa(`gid://shopify/ProductVariant/${variantId}`),
    });
  });

  it('doesn\'t clobber existing storefront variant IDs', () => {
    const storefrontVariantId = btoa('gid://shopify/ProductVariant/12345');
    const config = normalizeConfig({storefrontVariantId});

    assert.deepEqual(config, {
      storefrontVariantId,
    });
  });

  it('adapts a list of product IDs to an array of hashed Product gids', () => {
    const id = [12345, 34567];
    const config = normalizeConfig({id});

    assert.deepEqual(config, {
      id,
      storefrontId: [
        btoa(`gid://shopify/Product/${id[0]}`),
        btoa(`gid://shopify/Product/${id[1]}`),
      ],
    });
  });

  it('adapts other types of base ids to gids', () => {
    const id = 12345;
    const config = normalizeConfig({id}, 'Collection');

    assert.deepEqual(config, {
      id,
      storefrontId: btoa(`gid://shopify/Collection/${id}`),
    });
  });
});
