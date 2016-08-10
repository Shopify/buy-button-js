import chai from 'chai';
import sinon from 'sinon';

window.chai = chai;
window.sinon = sinon;

window.assert = chai.assert;

sinon.assert.expose(chai.assert, {prefix: ''});

import './unit/shopify-buy-ui';
import './unit/ui';
import './unit/template';
import './unit/iframe';
import './unit/component';
import './unit/product';
import './unit/cart';
import './unit/checkout';
import './unit/product-set';
import './unit/modal';
import './unit/toggle';
import './unit/legacy';

import './unit/merge';
import './integration/shopify-buy-ui';
