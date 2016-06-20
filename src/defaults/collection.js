import productDefaults from '../defaults/product';

const collectionDefaults = {
  className: 'collection',
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  iframe: true,
  classes: {
    data: 'collection'
  },
  productConfig: Object.assign({}, productDefaults, {
    iframe: false
  })
}

export default collectionDefaults;
