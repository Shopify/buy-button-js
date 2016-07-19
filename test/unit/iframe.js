import chai from 'chai';
import sinon from 'sinon';

sinon.assert.expose(chai.assert, {prefix: ''});

import Iframe from '../../src/iframe';

const defaultCSS = '* { box-sizing: border-box; }';
const customCSS = '.btn { color: red; } .btn:hover { color: green; }';
const stylesheet = [{"selectors":["*"],"declarations":[{"property":"box-sizing","value":"border-box"}]}];

let iframe;
let parent;

describe('Iframe class', () => {
  beforeEach(() => {
    parent = document.createElement('div');
    parent.setAttribute('id', 'fixture');
    document.body.appendChild(parent);
    iframe = new Iframe(parent, {
      button: 'btn'
    }, {
      button: {
        'color': 'red',
        ':hover': {
          'color': 'green'
        }
      }
    }, stylesheet);
  });

  afterEach(() => {
    iframe = null;
    document.body.removeChild(parent);
    parent = null;
  });

  describe('load', () => {
    it('appends an iframe', (done) => {
      iframe.appendStyleTag = function () {
        chai.assert.isOk(true);
      };

      iframe.load().then(() => {
        chai.assert.equal('IFRAME', parent.children[0].tagName);
        done();
      }).catch((e) => {
        done(e)
      });
    });

    it('adds style tag with valid css', (done) => {
      iframe.load().then(() => {
        const styleTag = iframe.el.contentDocument.head.children[0];
        chai.assert.equal('STYLE', styleTag.tagName);
        chai.assert.include(styleTag.innerHTML, defaultCSS, 'css is formatted correctly');
        chai.assert.include(styleTag.innerHTML, customCSS, 'appends custom css');
        done();
      }).catch((e) => {
        done(e)
      });
    });
  });
});
