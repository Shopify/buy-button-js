const testProduct = {
  title: 'test',
  id: 123,
  selectedVariant: {
    id: 12345,
    productId: 123,
    title: 'sloth / small',
    available: true,
    optionValues: [
      {
        name: 'Print',
        value: 'sloth'
      },
      {
        name: 'Size',
        value: 'small'
      }
    ],
    imageVariants: [
      {
        name: 'pico',
        dimension: '16x16',
        src: 'https://cdn.shopify.com/image-two_pico.jpg'
      },
      {
        name: 'small',
        dimension: '100x100',
        src: 'https://cdn.shopify.com/image-two_small.jpg'
      },
      {
        name: 'medium',
        dimension: '240x240',
        src: 'https://cdn.shopify.com/image-two_medium.jpg'
      },
      {
        name: 'large',
        dimension: '480x480',
        src: 'https://cdn.shopify.com/image-two_large.jpg'
      },
      {
        name: 'grande',
        dimension: '600x600',
        src: 'https://cdn.shopify.com/image-two_grande.jpg'
      },
      {
        name: '1024x1025',
        dimension: '1024x1024',
        src: 'https://cdn.shopify.com/image-two_1024x1024.jpg'
      },
    ],
  },
  selectedVariantImage: {
    img: 'http://test.com/test.jpg'
  },
  selections: ['sloth', 'small'],
  options: [
    {
      name: 'Print',
      selected: 'sloth',
      values: [
        'sloth',
        'shark',
        'cat',
      ]
    },
    {
      name: 'Size',
      selected: 'small',
      values: [
        'small',
        'large'
      ]
    }
  ],
  variants: [
    {
      id: 12345,
      productId: 123,
      title: 'sloth / small',
      available: true,
      imageVariants: [
        {
          name: 'small',
          dimension: '100x100',
          src: 'https://cdn.shopify.com/image-two_small.jpg'
        },
        {
          name: 'medium',
          dimension: '240x240',
          src: 'https://cdn.shopify.com/image-two_medium.jpg'
        },
        {
          name: 'large',
          dimension: '480x480',
          src: 'https://cdn.shopify.com/image-two_large.jpg'
        },
      ],
      optionValues: [
        {
          name: 'Print',
          value: 'sloth'
        },
        {
          name: 'Size',
          value: 'small'
        }
      ]
    },
    {
      id: 12346,
      productId: 123,
      title: 'shark / small',
      available: true,
      imageVariants: [
        {
          name: 'small',
          dimension: '100x100',
          src: 'https://cdn.shopify.com/image-two_small.jpg'
        },
        {
          name: 'medium',
          dimension: '240x240',
          src: 'https://cdn.shopify.com/image-two_medium.jpg'
        },
        {
          name: 'large',
          dimension: '480x480',
          src: 'https://cdn.shopify.com/image-two_large.jpg'
        },
      ],
      optionValues: [
        {
          name: 'Print',
          value: 'shark'
        },
        {
          name: 'Size',
          value: 'small'
        }
      ]
    },
    {
      id: 12347,
      productId: 123,
      title: 'shark / large',
      available: true,
      imageVariants: [
        {
          name: 'small',
          dimension: '100x100',
          src: 'https://cdn.shopify.com/image-two_small.jpg'
        },
        {
          name: 'medium',
          dimension: '240x240',
          src: 'https://cdn.shopify.com/image-two_medium.jpg'
        },
        {
          name: 'large',
          dimension: '480x480',
          src: 'https://cdn.shopify.com/image-two_large.jpg'
        },
      ],
      optionValues: [
        {
          name: 'Print',
          value: 'shark'
        },
        {
          name: 'Size',
          value: 'large'
        }
      ]
    },
    {
      id: 12348,
      productId: 123,
      title: 'cat / small',
      available: false,
      optionValues: [
        {
          name: 'Print',
          value: 'cat'
        },
        {
          name: 'Size',
          value: 'small'
        }
      ]
    },
  ]
}

export default testProduct;
