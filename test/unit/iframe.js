import Iframe from '../../src/iframe';

const defaultCSS = '* { box-sizing: border-box; }';
const customCSS = '.btn { color: red; } .btn:hover { color: green; }';

let iframe;
let parent;

describe('Iframe class', () => {
  beforeEach(() => {
    parent = document.createElement('div');
    parent.setAttribute('id', 'fixture');
    document.body.appendChild(parent);
    iframe = new Iframe(parent, {
      classes: {
        product: {
          button: 'btn',
        }
      },
      customStyles: {
        product: {
          button: {
            'color': 'red',
            ':hover': {
              'color': 'green'
            }
          }
        }
      },
      stylesheet: defaultCSS,
      browserFeatures: {
        transition: true,
        animation: true,
        transform: true,
      }
    });
  });

  afterEach(() => {
    iframe = null;
    document.body.removeChild(parent);
    parent = null;
  });

  describe('load', () => {
    beforeEach((done) => {
      iframe.load().then(() => {
        done();
      }).catch((e) => {
        done(e)
      });
    });

    it('appends an iframe', () => {
      assert.equal('IFRAME', parent.children[0].tagName);
    });

    it('appends style tag to head', () => {
      const styleTags = iframe.document.head.getElementsByTagName('style');
      assert.equal(styleTags.length, 1);
    });
  });

  describe('get css', () => {
    it('returns properly formatted CSS', (done) => {
      iframe.load().then(() => {
        assert.include(iframe.css, defaultCSS, 'css is formatted correctly');
        assert.include(iframe.css, customCSS, 'appends custom css');
        done();
      });
    });
  });
});
