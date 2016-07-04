const testProduct = {
  title: 'test',
  id: 123,
  selectedVariant: {
    id: 12345
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
        'shark'
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
  ]
}

export default testProduct;
