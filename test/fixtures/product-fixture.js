const testProduct = {
  title: 'test',
  id: 123,
  selectedVariant: {
    id: 12345,
    productId: 123,
    title: 'sloth / small',
    attrs: {
      variant: {
        available: true,
      },
    },
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
      attrs: {
        variant: {
          available: true,
        },
      },
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
      attrs: {
        variant: {
          available: true,
        },
      },
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
      attrs: {
        variant: {
          available: true,
        },
      },
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
      title: 'shark / large',
      attrs: {
        variant: {
          available: false,
        },
      },
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
