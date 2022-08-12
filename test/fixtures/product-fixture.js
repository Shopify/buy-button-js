const testProduct = {
  title: 'test',
  id: 123,
  storefrontId: 'gid://shopify/Product/123456789',
  images: [
    {
      id: '1',
      src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-one.jpg',
    },
    {
      id: '2',
      src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-two.jpeg',
    },
    {
      id: '3',
      src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-three.jpg',
    },
    {
      id: '4',
      src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-four.jpeg',
    },
  ],
  options: [
    {
      name: 'Print',
      values: [
        {value: 'sloth'},
        {value: 'shark'},
        {value: 'cat'},
      ],
    },
    {
      name: 'Size',
      selected: 'small',
      values: [
        {value: 'small'},
        {value: 'large'},
      ],
    },
  ],
  variants: [
    {
      id: 'gid://shopify/ProductVariant/19667571022088',
      productId: 123,
      price: '123.00',
      priceV2: {
        amount: '123.00',
        currencyCode: 'CAD',
      },
      title: 'sloth / small',
      available: true,
      image: {
        id: 100,
        src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-one.jpg',
      },
      selectedOptions: [
        {
          name: 'Print',
          value: 'sloth',
        },
        {
          name: 'Size',
          value: 'small',
        },
      ],
    },
    {
      id: 'gid://shopify/ProductVariant/19667555522084',
      productId: 123,
      price: '1.00',
      priceV2: {
        amount: '1.00',
        currencyCode: 'CAD',
      },
      title: 'shark / small',
      available: true,
      image: {
        id: 200,
        src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-two.jpeg',
      },
      selectedOptions: [
        {
          name: 'Print',
          value: 'shark',
        },
        {
          name: 'Size',
          value: 'small',
        },
      ],
    },
    {
      id: 'gid://shopify/ProductVariant/19667555522789',
      productId: 123,
      price: '999.99',
      priceV2: {
        amount: '999.99',
        currencyCode: 'CAD',
      },
      title: 'shark / large',
      available: true,
      image: {
        id: 300,
        src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-three.jpg',
      },
      selectedOptions: [
        {
          name: 'Print',
          value: 'shark',
        },
        {
          name: 'Size',
          value: 'large',
        },
      ],
    },
    {
      id: 'gid://shopify/ProductVariant/196675555224567',
      productId: 123,
      price: '0.00',
      priceV2: {
        amount: '0.00',
        currencyCode: 'CAD',
      },
      title: 'cat / small',
      available: false,
      selectedOptions: [
        {
          name: 'Print',
          value: 'cat',
        },
        {
          name: 'Size',
          value: 'small',
        },
      ],
    },
  ],
};

export default testProduct;
