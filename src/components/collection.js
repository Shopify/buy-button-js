import ProductSet from './product-set';

export default class Collection extends ProductSet {
  fetchData() {

    /* eslint-disable camelcase */
    return this.props.client.fetchCollection(this.id).then((collection) => {
      return this.props.client.fetchQueryProducts({collection_id: this.id}).then((products) => {
        return {
          products,
          collection,
        };
      });
    });

    /* eslint-enable camelcase */
  }
}
