import Iframe from '../../src/iframe';

const defaultCSS = '* { box-sizing: border-box; }';
const customCSS = '@media (max-width: 100px) { .product { background: blue; }  } .product:hover .btn { background: orange; } .btn:hover { color: green; } .btn { color: red; }';

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
          product: 'product',
        }
      },
      customStyles: {
        product: {
          product: {
            '@media (max-width: 100px)': {
              'background': 'blue',
            },
            ':hover': {
              button: {
                'background': 'orange',
              }
            }
          },
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
    beforeEach(() => {
      return iframe.load();
    });

    it('appends an iframe', () => {
      assert.equal('IFRAME', parent.children[0].tagName);
    });

    it('appends style tag to head', () => {
      const styleTags = iframe.document.head.getElementsByTagName('style');
      assert.equal(styleTags.length, 1);
    });
  });

  describe('loadFontScript', () => {
    let scriptTags;
    beforeEach(() => {
      scriptTags = document.head.getElementsByTagName('script').length;
      iframe.googleFonts = ['Lato'];
      return iframe.load();
    });

    it('appends a script tag', () => {
      const newScriptTags = document.head.getElementsByTagName('script');
      assert.equal(newScriptTags.length, scriptTags + 1);
    });
  });

  describe('get css', () => {
    it('returns properly formatted CSS', () => {
      return iframe.load().then(() => {
        assert.include(iframe.css, defaultCSS, 'css is formatted correctly');
        assert.include(iframe.css, customCSS, 'appends custom css');
      });
    });
  });

});
