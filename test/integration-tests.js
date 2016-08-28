import chai from 'chai';
import sinon from 'sinon';

window.chai = chai;
window.sinon = sinon;

window.assert = chai.assert;

sinon.assert.expose(chai.assert, {prefix: ''});

import './integration/shopify-buy-ui';
