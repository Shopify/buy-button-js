import ProductSet from './product-set';

export default class Collection extends ProductSet {
  fetchData() {
    const client = this.props.client;
    // eslint-disable-next-line camelcase
    const collectionQuery = {collection_id: this.id};

    return Promise.all([
      client.fetchCollection(this.id),
      client.fetchQueryProducts(collectionQuery),
    ]).then((resolvedPromises) => {
      const [collection, products] = resolvedPromises;
      return {
        collection,
        products,
      };
    });
  }
}
