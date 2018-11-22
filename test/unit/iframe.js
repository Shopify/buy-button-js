import Iframe from '../../src/iframe';

const defaultCSS = '* { box-sizing: border-box; }';
// const customCSS = '@media (max-width: 100px) { .product { background: blue; }  } .product:hover .btn { background: orange; } .btn:hover { color: green; } .btn { color: red; }';
const configObject = {
  classes: {
    product: {
      button: 'btn',
      product: 'product',
    },
  },
  customStyles: {
    product: {
      product: {
        '@media (max-width: 100px)': {
          background: 'blue',
        },
        ':hover': {
          button: {
            background: 'orange',
          },
        },
      },
      button: {
        color: 'red',
        ':hover': {
          color: 'green',
        },
      },
    },
  },
  stylesheet: defaultCSS,
  browserFeatures: {
    transition: true,
    animation: true,
    transform: true,
  },
  name: 'frame-product',
};

describe('Iframe class', () => {
  let parent;

  beforeEach(() => {
    parent = document.createElement('div');
    parent.setAttribute('id', 'fixture');
    document.body.appendChild(parent);
  });

  afterEach(() => {
    document.body.removeChild(parent);
  });

  describe('constructor', () => {
    let iframe;
    let createElementSpy;
    let setWidthStub;
    let constructorConfig;

    beforeEach(() => {
      constructorConfig = Object.assign({}, configObject, {
        googleFonts: ['Arial', 'Calibri'],
        width: '200px',
      });
      createElementSpy = sinon.spy(document, 'createElement');
      setWidthStub = sinon.stub(Iframe.prototype, 'setWidth');
    });

    afterEach(() => {
      createElementSpy.restore();
      setWidthStub.restore();
    });

    it('creates an iframe element', () => {
      iframe = new Iframe(parent, constructorConfig);
      assert.calledWith(createElementSpy, 'iframe');
      assert.equal(iframe.el, createElementSpy.returnValues[0]);
    });

    it('sets passed in node as parent', () => {
      iframe = new Iframe(parent, constructorConfig);
      assert.equal(iframe.parent, parent);
    });

    it('sets stylesheet, customStylesHash, classes, browserFeatures, googleFonts, and name from config', () => {
      iframe = new Iframe(parent, constructorConfig);
      assert.equal(iframe.stylesheet, constructorConfig.stylesheet);
      assert.equal(iframe.customStylesHash, constructorConfig.customStyles);
      assert.equal(iframe.classes, constructorConfig.classes);
      assert.equal(iframe.browserFeatures, constructorConfig.browserFeatures);
      assert.equal(iframe.googleFonts, constructorConfig.googleFonts);
      assert.equal(iframe.name, constructorConfig.name);
    });

    it('sets customStylesHash to an empty object if config does not have customStyles', () => {
      constructorConfig.customStyles = null;
      iframe = new Iframe(parent, constructorConfig);
      assert.deepEqual(iframe.customStylesHash, {});
    });

    it('sets googleFonts to an empty array if config does not have googleFonts', () => {
      constructorConfig.googleFonts = null;
      iframe = new Iframe(parent, constructorConfig);
      assert.deepEqual(iframe.googleFonts, []);
    });

    it('does not call setWidth() if there is no width in the config', () => {
      constructorConfig.width = null;
      iframe = new Iframe(parent, constructorConfig);
      assert.notCalled(setWidthStub);
    });

    it('calls setWidth() if width is in the config', () => {
      iframe = new Iframe(parent, constructorConfig);
      assert.calledOnce(setWidthStub);
      assert.calledWith(setWidthStub, constructorConfig.width);
    });

    it('sets width to 100%, overflow to hidden, and border to none in iframe\'s style', () => {
      iframe = new Iframe(parent, constructorConfig);
      assert.equal(iframe.el.style.width, '100%');
      assert.equal(iframe.el.style.overflow, 'hidden');
      assert.include(iframe.el.style.border, 'none');
    });

    it('disables scrolling, allows transparency, and removes border in iframe\'s attributes', () => {
      iframe = new Iframe(parent, constructorConfig);
      assert.equal(iframe.el.getAttribute('horizontalscrolling'), 'no');
      assert.equal(iframe.el.getAttribute('verticalscrolling'), 'no');
      assert.equal(iframe.el.getAttribute('allowTransparency'), 'true');
      assert.equal(iframe.el.getAttribute('frameBorder'), '0');
      assert.equal(iframe.el.getAttribute('scrolling'), 'no');
    });

    it('sets element name to name in config', () => {
      assert.equal(iframe.el.getAttribute('name'), constructorConfig.name);
    });

    it('sets styleTag to null', () => {
      iframe = new Iframe(parent, constructorConfig);
      assert.equal(iframe.styleTag = null);
    });
  });

  describe('prototype methods', () => {
    let iframe;

    beforeEach(() => {
      iframe = new Iframe(parent, configObject);
    });

    describe('load()', () => {
      let loadFontsStub;
      let appendStyleTagStub;

      beforeEach(() => {
        loadFontsStub = sinon.stub(iframe, 'loadFonts').resolves();
        appendStyleTagStub = sinon.stub(iframe, 'appendStyleTag');
      });

      afterEach(() => {
        loadFontsStub.restore();
        appendStyleTagStub.restore();
      });

      it('appends a single iframe to parent', async () => {
        await iframe.load();
        assert.equal(parent.children.length, 1);
        assert.equal(parent.children[0].tagName, 'IFRAME');
      });

      it('loads fonts then append style tag on iframe load', async () => {
        await iframe.load();
        assert.calledOnce(loadFontsStub);
        assert.calledOnce(appendStyleTagStub);
      });
    });

    describe('loadFonts()', () => {
      let loadFontScriptStub;
      let setTimeoutStub;
      let loadSpy;

      beforeEach(() => {
        loadSpy = sinon.spy();
        loadFontScriptStub = sinon.stub(iframe, 'loadFontScript').resolves();
        setTimeoutStub = sinon.stub(window, 'setTimeout').callsFake((...args) => {
          return args[0]();
        });
        iframe.googleFonts = ['Lato'];
        window.WebFont = {
          load: loadSpy,
        };
      });

      afterEach(() => {
        loadFontScriptStub.restore();
        setTimeoutStub.restore();
      });

      it('returns true if there are no google fonts', async () => {
        iframe.googleFonts = [];
        assert.equal(await iframe.loadFonts(), true);
      });

      it('calls loadFontScript if there are google fonts', async () => {
        await iframe.loadFonts();
        assert.calledOnce(loadFontScriptStub);
      });

      it('resolves without timeout if there is no web font', async () => {
        window.WebFont = null;
        const response = await iframe.loadFonts();
        assert.notCalled(setTimeoutStub);
        assert.isUndefined(response);
      });

      it('times out after one second if web font exists and fontactive does not get called', async () => {
        const response = await iframe.loadFonts();
        assert.calledOnce(setTimeoutStub);
        assert.equal(setTimeoutStub.getCall(0).args[1], 1000);
        assert.isUndefined(response);
      });

      it('loads WebFont with google fonts, a function on font render, and content window', async () => {
        iframe.el = {contentWindow: {}};
        await iframe.loadFonts();
        const webFontLoadObj = loadSpy.getCall(0).args[0];
        assert.deepEqual(webFontLoadObj.google, {families: iframe.googleFonts});
        assert.instanceOf(webFontLoadObj.fontactive, Function);
        assert.isUndefined(webFontLoadObj.fontactive());
        assert.equal(webFontLoadObj.context, iframe.el.contentWindow);
      });

      it('sets web font context to frame if content window does not exist', async () => {
        iframe.el = {contentWindow: null};
        frames[iframe.name] = {};
        await iframe.loadFonts();
        assert.equal(loadSpy.getCall(0).args[0].context, frames[iframe.name]);
      });
    });

    // describe('loadFontScript', () => {
    //   let scriptTags;
    //   beforeEach(() => {
    //     scriptTags = document.head.getElementsByTagName('script').length;
    //     iframe.googleFonts = ['Lato'];
    //     return iframe.load();
    //   });

    //   it('appends a script tag', () => {
    //     const newScriptTags = document.head.getElementsByTagName('script');
    //     assert.equal(newScriptTags.length, scriptTags + 1);
    //   });
    // });

    // describe('getters', () => {
    //   describe('css', () => {
    //     it('returns properly formatted CSS', () => {
    //       return iframe.load().then(() => {
    //         assert.include(iframe.css, defaultCSS, 'css is formatted correctly');
    //         assert.include(iframe.css, customCSS, 'appends custom css');
    //       });
    //     });
    //   });
    // });
  });
});
