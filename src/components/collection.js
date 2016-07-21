import ProductSet from './product-set';

export default class Collection extends ProductSet {
  fetchData() {
    const client = this.props.client;

    return client.fetchCollection(this.id).then((collection) => {
      // eslint-disable-next-line camelcase
      return client.fetchQueryProducts({collection_id: this.id}).then((products) => {
        return {
          products,
          collection,
        };
      });
    });
  }
}
