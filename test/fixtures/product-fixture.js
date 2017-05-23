const testProduct = {
  title: 'test',
  id: 123,
  images: [
    {
      id: 1,
      src: 'https://cdn.shopify.com/s/image-one.jpg.jpg',
      variants: [
        {
          name: 'pico',
          src: 'https://cdn.shopify.com/s/image-one.jpg_pico.jpg',
        },
        {
          name: 'small',
          src: 'https://cdn.shopify.com/s/image-one.jpg_small.jpg',
        },
        {
          name: 'medium',
          src: 'https://cdn.shopify.com/s/image-one.jpg_medium.jpg',
        },
        {
          name: 'large',
          src: 'https://cdn.shopify.com/s/image-one.jpg_large.jpg',
        },
      ],
    },
    {
      id: 2,
      src: 'https://cdn.shopify.com/s/image-two.jpg.jpg',
      variants: [
        {
          name: 'pico',
          src: 'https://cdn.shopify.com/s/image-two.jpg_pico.jpg',
        },
        {
          name: 'small',
          src: 'https://cdn.shopify.com/s/image-two.jpg_small.jpg',
        },
        {
          name: 'medium',
          src: 'https://cdn.shopify.com/s/image-two.jpg_medium.jpg',
        },
        {
          name: 'large',
          src: 'https://cdn.shopify.com/s/image-two.jpg_large.jpg',
        },
      ],
    },
    {
      id: 3,
      src: 'https://cdn.shopify.com/s/image-three.jpg.jpg',
      variants: [
        {
          name: 'pico',
          src: 'https://cdn.shopify.com/s/image-three.jpg_pico.jpg',
        },
        {
          name: 'small',
          src: 'https://cdn.shopify.com/s/image-three.jpg_small.jpg',
        },
        {
          name: 'medium',
          src: 'https://cdn.shopify.com/s/image-three.jpg_medium.jpg',
        },
        {
          name: 'large',
          src: 'https://cdn.shopify.com/s/image-three.jpg_large.jpg',
        },
      ],
    },
    {
      id: 4,
      src: 'https://cdn.shopify.com/s/image-four.jpg.jpg',
      variants: [
        {
          name: 'pico',
          src: 'https://cdn.shopify.com/s/image-four.jpg_pico.jpg',
        },
        {
          name: 'small',
          src: 'https://cdn.shopify.com/s/image-four.jpg_small.jpg',
        },
        {
          name: 'medium',
          src: 'https://cdn.shopify.com/s/image-four.jpg_medium.jpg',
        },
        {
          name: 'large',
          src: 'https://cdn.shopify.com/s/image-four.jpg_large.jpg',
        },
      ],
    },
  ],
  selectedVariant: {
    id: 12345,
    productId: 123,
    title: 'sloth / small',
    available: true,
    image: {
      id: 200,
      src: "https://cdn.shopify.com/s/image-two.jpg"
    },
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
  },
  selectedVariantImage: {
    img: 'http://test.com/test.jpg'
  },
  options: [
    {
      name: 'Print',
      values: [
        { value: 'sloth' },
        { value: 'shark' },
        { value: 'cat' },
      ]
    },
    {
      name: 'Size',
      selected: 'small',
      values: [
        { value: 'small' },
        { value: 'large' }
      ]
    }
  ],
  variants: [
    {
      id: 12345,
      productId: 123,
      price: '123.00',
      title: 'sloth / small',
      available: true,
      image: {
        id: 100,
        src: "https://cdn.shopify.com/s/image-two.jpg"
      },
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
      price: '1.00',
      title: 'shark / small',
      available: true,
      image: {
        id: 200,
        src: "https://cdn.shopify.com/s/image-two.jpg"
      },
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
      price: '999.99',
      title: 'shark / large',
      available: true,
      image: {
        id: 300,
        src: "https://cdn.shopify.com/s/image-three.jpg"
      },
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
      price: '0.00',
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
