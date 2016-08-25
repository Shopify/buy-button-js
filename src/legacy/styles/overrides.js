export const productStyles = {
  img: {
    'margin-bottom': '0px',
  },
  title: {
    'margin-top': '10px',
    'margin-bottom': '20px',
  },
  button: {},
  variantTitle: {},
  options: {
    'margin-bottom': '0px',
  },
  price: {
  },
  prices: {
    display: 'inline-block',
    'margin-left': '10px',
  },
  wrapper: {
    width: '450px',
  },
  description: {},
};

export const productSetStyles = {
  product: {
    width: '450px',
    padding: '2px 6px 3px',
  },
};

export const modalProductStyles = {
  button: {},
  product: {
    'padding': 0
  },
  title: {
    'padding-top': '10px',
    'margin': 0,
    'font-size': '18px',
    'font-weight': '400',
    'text-align': 'left',
  },
  imgWrapper: {
    'width': 'auto',
    'max-width': '100%',
    'float': 'none',
  },
  img: {
    'height': '100%',
  },
  description: {
    'margin-bottom': '20px',
  },
  price: {
    'margin-left': 0,
    'text-align': 'left',
    'margin-top': 0,
    'padding-top': 0,
    'color': '#767676',
    'font-size': '16px'
  },
  compareAt: {
    display: 'none',
  },
  options: {
    'margin': '0 0 20px',
  },
  quantity: {
    '@media (max-width: 800px)': {
      'margin-left': '20px',
      background: '#fff',
    },
    '@media (min-width: 801px)': {
      'padding-left': '20px',
      width: '110px',
      background: '#fff',
    },
  },
  button: {
    'margin': 0,
    'width': '100%',
  },
  buttonBesideQty: {
    '@media (max-width: 800px)': {
      width: 'calc(100% - 140px)',
      display: 'block',
    },
    '@media (min-width: 801px)': {
      'margin-left': 0,
      float: 'left',
      width: 'calc(100% - 140px)',
    },
  },
};

export const modalStyles = {
  button: {},
  img: {
    '@media (max-width: 800px)': {
      'border-bottom': '1px solid rgba(170,170,170,0.3)',
      'height': '40%',
      'max-height': '570px',
    },
    '@media (min-width: 801px)': {
      'border-right': '1px solid rgba(170,170,170,0.3)',
      'width': '60%'
    },
  },
  footer: {
    padding: '20px',
    position: 'absolute',
    bottom: 0,
    'background-image': 'linear-gradient(to bottom,  rgba(256, 255, 255, 0.93) 0%,rgba(255, 255, 255, 1) 100%)',
    '@media (max-width: 800px)': {
      left: 0,
      width: '100%',
    },
    '@media (min-width: 801px)': {
      width: '100%',
      position: 'absolute',
      bottom: '0',
      'background-image': 'linear-gradient(to bottom,  rgba(256, 255, 255, 0.93) 0%,rgba(255, 255, 255, 1) 100%)',
      'padding-top': '20px',
    },
  },
  contents: {
    '@media (max-width: 800px)': {
      position: 'relative',
      height: '60%',
    },
    '@media (min-width: 801px)': {
      height: '100%',
      position: 'absolute',
      right: '0',
      top: '0',
    }
  },
  contentsWithImg: {
    '@media (min-width: 801px)': {
      float: 'right',
      width: '40%',
    },
  },
  footerWithImg: {
    '@media (min-width: 801px)': {
      width: '40%',
      bottom: '0',
      left: '60%',
    },
  },
  scrollContents: {
    'line-height': '1.4',
    'font-size': '14px',
    padding: '20px 20px 90px',
    position: 'absolute',
    height: '100%',
    width: '100%',
    overflow: 'auto',
    '-webkit-overflow-scrolling': 'touch',
  },
  close: {
    'top': 0,
    'font-weight': 300,
    'right': '8px',
    '@media (max-width: 800px)': {
      position: 'fixed',
    },
  },
  modal: {
    '@media (max-width: 800px)': {
      'height': '100%',
    },
  },
  wrapper: {
    '@media (max-width: 800px)': {
      'height': '100%',
    },
    '@media (min-width: 801px)': {
      margin: '-285px auto 0 auto',
      top: '50%',
      'max-height': '570px',
    },
  },
};

export const cartStyles = {
  button: {},
  header: {},
  title: {},
  lineItems: {},
  subtotal: {},
  cart: {},
  footer: {},
  close: {},
};

export const lineItemStyles = {
  variantTitle: {},
  quantity: {},
  quantityInput: {},
  quantityButton: {},
};

export const toggleStyles = {
  toggle: {},
  icon: {},
};

export const optionStyles = {
  label: {
    display: 'none',
  }
}
