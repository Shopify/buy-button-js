const testProduct = {
  title: 'test',
  id: 123,
  images: [
    {
      id: 1,
      src: 'https://cdn.shopify.com/image-one.jpg',
      variants: [
        {
          name: 'pico',
          src: 'https://cdn.shopify.com/image-one_pico.jpg',
        },
        {
          name: 'small',
          src: 'https://cdn.shopify.com/image-one_small.jpg',
        },
        {
          name: 'medium',
          src: 'https://cdn.shopify.com/image-one_medium.jpg',
        },
        {
          name: 'large',
          src: 'https://cdn.shopify.com/image-one_large.jpg',
        },
      ],
    },
    {
      id: 2,
      src: 'https://cdn.shopify.com/image-two.jpg',
      variants: [
        {
          name: 'pico',
          src: 'https://cdn.shopify.com/image-two_pico.jpg',
        },
        {
          name: 'small',
          src: 'https://cdn.shopify.com/image-two_small.jpg',
        },
        {
          name: 'medium',
          src: 'https://cdn.shopify.com/image-two_medium.jpg',
        },
        {
          name: 'large',
          src: 'https://cdn.shopify.com/image-two_large.jpg',
        },
      ],
    },
    {
      id: 3,
      src: 'https://cdn.shopify.com/image-three.jpg',
      variants: [
        {
          name: 'pico',
          src: 'https://cdn.shopify.com/image-three_pico.jpg',
        },
        {
          name: 'small',
          src: 'https://cdn.shopify.com/image-three_small.jpg',
        },
        {
          name: 'medium',
          src: 'https://cdn.shopify.com/image-three_medium.jpg',
        },
        {
          name: 'large',
          src: 'https://cdn.shopify.com/image-three_large.jpg',
        },
      ],
    },
    {
      id: 4,
      src: 'https://cdn.shopify.com/image-four.jpg',
      variants: [
        {
          name: 'pico',
          src: 'https://cdn.shopify.com/image-four_pico.jpg',
        },
        {
          name: 'small',
          src: 'https://cdn.shopify.com/image-four_small.jpg',
        },
        {
          name: 'medium',
          src: 'https://cdn.shopify.com/image-four_medium.jpg',
        },
        {
          name: 'large',
          src: 'https://cdn.shopify.com/image-four_large.jpg',
        },
      ],
    },
  ],
  selectedVariant: {
    id: 12345,
    productId: 123,
    title: 'sloth / small',
    available: true,
    selectedOptions: [
      {
        name: 'Print',
        value: 'sloth'
      },
      {
        name: 'Size',
        value: 'small'
      }
    ],
    image: {
      id: 666,
      src: 'https://cdn.shopify.com/image-one.jpg',
      variants: [
        {
          name: 'pico',
          dimension: '16x16',
          src: 'https://cdn.shopify.com/image-one_pico.jpg'
        },
        {
          name: 'small',
          dimension: '100x100',
          src: 'https://cdn.shopify.com/image-one_small.jpg'
        },
        {
          name: 'medium',
          dimension: '240x240',
          src: 'https://cdn.shopify.com/image-one_medium.jpg'
        },
        {
          name: 'large',
          dimension: '480x480',
          src: 'https://cdn.shopify.com/image-one_large.jpg'
        },
        {
          name: 'grande',
          dimension: '600x600',
          src: 'https://cdn.shopify.com/image-one_grande.jpg'
        },
        {
          name: '1024x1025',
          dimension: '1024x1024',
          src: 'https://cdn.shopify.com/image-one_1024x1024.jpg'
        },
      ],
    },
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
          src: 'https://cdn.shopify.com/image-one_small.jpg'
        },
        {
          name: 'medium',
          dimension: '240x240',
          src: 'https://cdn.shopify.com/image-one_medium.jpg'
        },
        {
          name: 'large',
          dimension: '480x480',
          src: 'https://cdn.shopify.com/image-one_large.jpg'
        },
      ],
      selectedOptions: [
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
          src: 'https://cdn.shopify.com/image-one_small.jpg'
        },
        {
          name: 'medium',
          dimension: '240x240',
          src: 'https://cdn.shopify.com/image-one_medium.jpg'
        },
        {
          name: 'large',
          dimension: '480x480',
          src: 'https://cdn.shopify.com/image-one_large.jpg'
        },
      ],
      selectedOptions: [
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
          src: 'https://cdn.shopify.com/image-one_small.jpg'
        },
        {
          name: 'medium',
          dimension: '240x240',
          src: 'https://cdn.shopify.com/image-one_medium.jpg'
        },
        {
          name: 'large',
          dimension: '480x480',
          src: 'https://cdn.shopify.com/image-one_large.jpg'
        },
      ],
      selectedOptions: [
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
      selectedOptions: [
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
