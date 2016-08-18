export const modalProductStyles = {
  title: {
    'padding-top': '20px',
    'font-size': '18px',
    'font-weight': '400',
  },
  description: {
    'margin-bottom': '20px',
  },
  price: {
    'margin-left': 0,
  },
  compareAt: {
    'display': 'none',
  },
  options: {
    'margin-bottom': '20px',
  },
  quantity: {
    '@media (max-width: 800px)': {
      'margin-left': '20px',
      'background': '#fff',
    },
    '@media (min-width: 801px)': {
      'padding-left': '20px',
      'width': '110px',
      'background': '#fff',
    }
  },
  buttonBesideQty: {
    '@media (max-width: 800px)': {
      'width': 'calc(100% - 140px)',
      'display': 'block',
    },
    '@media (min-width: 801px)': {
      'margin-left': 0,
      'float': 'left',
      'width': 'calc(100% - 140px)',
    }
  }
}

export const modalStyles = {
  image: {
    '@media (max-width: 800px)': {
      'border-bottom': '1px solid rgba(170,170,170,0.3)',
      'max-height': '570px',
    }
  },
  footer: {
    'padding': '20px',
    'position': 'absolute',
    'bottom': 0,
    'background-image': 'linear-gradient(to bottom,  rgba(256, 255, 255, 0.93) 0%,rgba(255, 255, 255, 1) 100%)',
    '@media (max-width: 800px)': {
      'left': 0,
      'width': '100%'
    },
    '@media (min-width: 801px)': {
      'width': '100%',
      'position': 'absolute',
      'bottom': '0',
      'background-image': 'linear-gradient(to bottom,  rgba(256, 255, 255, 0.93) 0%,rgba(255, 255, 255, 1) 100%)',
      'padding-top': '20px',
    }
  },
  contents: {
    'position': 'relative',
  },
  scrollContents: {
    'line-height': '1.4',
    'font-size': '14px',
    'padding': '20px 20px 90px',
    'position': 'absolute',
    'height': '100%',
    'width': '100%',
    'overflow': 'auto',
    '-webkit-overflow-scrolling': 'touch',
  },
  close: {
    '@media (max-width: 800px)': {
      'position': 'fixed'
    }
  },
  footerWithImg: {
    '@media (min-width: 801px)': {
      'left': '60%',
      'bottom': '0',
      'width': '40%',
    }
  },
  imgWithImg: {
    '@media (min-width: 801px)': {
      'border-right': '1px solid rgba(170,170,170,0.3)',
    }
  },
  wrapper: {
    '@media (min-width: 801px)': {
      'margin': '-285px auto 0 auto',
      'top': '50%',
      'max-height': '570px',
    }
  }
}
