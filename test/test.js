import chai from 'chai';
import sinon from 'sinon';
import './unit/buybutton';
import './unit/ui';
import './unit/template';
import './unit/iframe';
import './unit/component';
import './unit/updater';
import './unit/view';
import './unit/product/product-component';
import './unit/product/product-updater';
import './unit/product/product-view';
import './unit/modal/modal-component';
import './unit/modal/modal-updater';
import './unit/toggle/toggle-view';
import './unit/cart';
import './unit/checkout';
import './unit/product-set';
import './unit/toggle';
import './unit/tracker';
import './unit/merge';
import './unit/money';
import './unit/normalize-config';

window.chai = chai;
window.sinon = sinon;

window.assert = chai.assert;

sinon.assert.expose(chai.assert, {prefix: ''});
