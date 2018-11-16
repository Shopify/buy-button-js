const testProduct = {
  title: 'test',
  id: 123,
  storefrontId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw==',
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
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ==',
      productId: 123,
      price: '123.00',
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
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Ng==',
      productId: 123,
      price: '1.00',
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
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Nw==',
      productId: 123,
      price: '999.99',
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
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0OA==',
      productId: 123,
      price: '0.00',
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