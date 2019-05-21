import Iframe from '../../src/iframe';
import * as elementClass from '../../src/utils/element-class';
import conditionalStyles from '../../src/styles/embeds/conditional';

const defaultCSS = '* { box-sizing: border-box; }';
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

      it('resolves after one second if web font exists and fontactive does not get called', async () => {
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

    describe('loadFontScript()', () => {
      let createElementSpy;
      let appendChildStub;
      let setTimeoutStub;

      beforeEach(() => {
        createElementSpy = sinon.spy(document, 'createElement');
        appendChildStub = sinon.stub(document.head, 'appendChild');
        setTimeoutStub = sinon.stub(window, 'setTimeout').callsFake((...args) => {
          return args[0]();
        });
        iframe.googleFonts = ['Lato'];
      });

      afterEach(() => {
        createElementSpy.restore();
        appendChildStub.restore();
        setTimeoutStub.restore();
      });

      it('does not create a font script if web font already exists', async () => {
        window.WebFont = {};
        await iframe.loadFontScript();
        assert.notCalled(createElementSpy);
        window.WebFont = null;
      });

      it('creates a script element, attaches web font, then appends it to document head', async () => {
        const webfontScript = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js';
        await iframe.loadFontScript();
        assert.calledOnce(createElementSpy);
        assert.calledWith(createElementSpy, 'script');
        assert.calledOnce(appendChildStub);
        assert.calledWith(appendChildStub, createElementSpy.returnValues[0]);
        assert.equal(createElementSpy.returnValues[0].src, webfontScript);
      });

      it('resolves after half a second if font script did not load', async () => {
        const response = await iframe.loadFontScript();
        assert.calledOnce(setTimeoutStub);
        assert.equal(setTimeoutStub.getCall(0).args[1], 500);
        assert.isUndefined(response);
      });
    });

    describe('setWidth()', () => {
      it('sets max width of parent to width param', () => {
        iframe.setWidth('200px');
        assert.equal(iframe.parent.style['max-width'], '200px');
      });
    });

    describe('addClass()', () => {
      it('adds className param to parent element', () => {
        const addClassToElementStub = sinon.stub(elementClass, 'addClassToElement');
        iframe.addClass('class-name');
        assert.calledOnce(addClassToElementStub);
        assert.calledWith(addClassToElementStub, 'class-name', iframe.parent);
        addClassToElementStub.restore();
      });
    });

    describe('removeClass()', () => {
      it('removes className param from parent element', () => {
        const removeClassFromElementStub = sinon.stub(elementClass, 'removeClassFromElement');
        iframe.removeClass('class-name');
        assert.calledOnce(removeClassFromElementStub);
        assert.calledWith(removeClassFromElementStub, 'class-name', iframe.parent);
        removeClassFromElementStub.restore();
      });
    });

    describe('setName()', () => {
      it('sets name attribute of element to name param', () => {
        iframe.setName('iframe-name');
        assert.equal(iframe.el.getAttribute('name'), 'iframe-name');
      });
    });

    describe('updateStyles()', () => {
      let loadFontsStub;
      const customStyles = {height: '20px'};
      const googleFonts = ['OpenSans'];

      beforeEach(() => {
        loadFontsStub = sinon.stub(iframe, 'loadFonts').resolves();
        iframe.styleTag = document.createElement('style');
        iframe = Object.defineProperty(iframe, 'css', {
          value: 'width: 20px',
        });
      });

      afterEach(() => {
        loadFontsStub.restore();
      });

      it('sets iframe\'s google fonts to google fonts param', () => {
        iframe.updateStyles(customStyles, googleFonts);
        assert.equal(iframe.googleFonts, googleFonts);
      });

      it('loads fonts', () => {
        iframe.updateStyles(customStyles, googleFonts);
        assert.calledOnce(loadFontsStub);
      });

      it('sets custom styles hash to custom styles params and inner html to element\'s css', async () => {
        await iframe.updateStyles(customStyles, googleFonts);
        assert.equal(iframe.customStylesHash, customStyles);
        assert.equal(iframe.styleTag.innerHTML, iframe.css);
      });
    });

    describe('appendStyleTag()', () => {
      let headAppendChildSpy;
      let styleTagAppendChildStub;
      let createElementStub;
      let createTextNodeStub;
      let styleTag;
      let textNode;

      beforeEach(() => {
        iframe = Object.defineProperty(iframe, 'css', {
          value: 'width: 20px',
        });
        styleTag = document.createElement('style');
        textNode = document.createTextNode(iframe.css);
        styleTagAppendChildStub = sinon.stub(styleTag, 'appendChild');
        headAppendChildSpy = sinon.spy();
        createElementStub = sinon.stub().returns(styleTag);
        createTextNodeStub = sinon.stub().returns(textNode);
        iframe = Object.defineProperty(iframe, 'document', {
          writable: true,
          value: {
            createElement: createElementStub,
            createTextNode: createTextNodeStub,
            head: {
              appendChild: headAppendChildSpy,
            },
          },
        });
      });

      afterEach(() => {
        styleTagAppendChildStub.restore();
      });

      it('does not create a style tag if document head does not exist', () => {
        iframe.document.head = null;
        iframe.styleTag = null;
        iframe.appendStyleTag();
        assert.equal(iframe.styleTag, null);
      });

      it('creates a style tag and appends it to document head if document head exists', () => {
        iframe.appendStyleTag();
        assert.equal(iframe.styleTag, styleTag);
        assert.calledOnce(createElementStub);
        assert.calledWith(createElementStub, 'style');
        assert.calledOnce(headAppendChildSpy);
        assert.calledWith(headAppendChildSpy, iframe.styleTag);
      });

      it('sets the css text in the style tag\'s stylesheet to the iframe\'s css if the stylesheet exists', () => {
        styleTag.styleSheet = {};
        createElementStub = sinon.stub().returns(styleTag);
        iframe.document.createElement = createElementStub;
        iframe.appendStyleTag();
        assert.equal(iframe.styleTag.styleSheet.cssText, iframe.css);
      });

      it('appends a css text node to style tag if the stylesheet does not exist', () => {
        styleTag.styleSheet = null;
        createElementStub = sinon.stub().returns(styleTag);
        iframe.document.createElement = createElementStub;
        iframe.appendStyleTag();
        assert.calledOnce(styleTagAppendChildStub);
        assert.calledWith(styleTagAppendChildStub, textNode);
        assert.calledOnce(createTextNodeStub);
        assert.calledWith(createTextNodeStub, iframe.css);
      });
    });

    describe('getters', () => {
      describe('width', () => {
        it('returns max width of parent', () => {
          iframe.parent.style['max-width'] = '60px';
          assert.equal(iframe.width, '60px');
        });
      });

      describe('document', () => {
        it('returns element\'s content window\'s document if the content window body exists', () => {
          iframe.el = {
            contentWindow: {document: {body: {}}},
            document: {body: {}},
            contentDocument: {body: {}},
          };
          assert.equal(iframe.document, iframe.el.contentWindow.document);
        });

        it('returns element\'s document if the document body exists', () => {
          iframe.el = {
            contentWindow: null,
            document: {body: {}},
            contentDocument: {body: {}},
          };
          assert.equal(iframe.document, iframe.el.document);
        });

        it('returns element\'s content document if the content document body exists', () => {
          iframe.el = {
            contentWindow: null,
            document: null,
            contentDocument: {body: {}},
          };
          assert.equal(iframe.document, iframe.el.contentDocument);
        });

        it('returns undefined if there is no content window document body, document body, or content document body', () => {
          iframe.el = {
            contentWindow: null,
            document: null,
            contentDocument: null,
          };
          assert.isUndefined(iframe.document);
        });
      });

      describe('conditionalCSS', () => {
        it('returns empty string if browser features include transition, transform, and animation', () => {
          iframe.browserFeatures = {
            transition: true,
            transform: true,
            animation: true,
          };
          assert.equal(iframe.conditionalCSS, '');
        });

        it('returns conditionalStyles if browser features does not include transition', () => {
          iframe.browserFeatures.transition = false;
          assert.equal(iframe.conditionalCSS, conditionalStyles);
        });

        it('returns conditionalStyles if browser features does not include transform', () => {
          iframe.browserFeatures.transform = false;
          assert.equal(iframe.conditionalCSS, conditionalStyles);
        });

        it('returns conditionalStyles if browser features does not include animation', () => {
          iframe.browserFeatures.animation = false;
          assert.equal(iframe.conditionalCSS, conditionalStyles);
        });
      });

      describe('css', () => {
        it('returns properly formatted CSS', () => {
          const expectedCSS = iframe.css;
          const customCSS = '@media (max-width: 100px) { .product { background: blue; }  } .product:hover .btn { background: orange; } .btn:hover { color: green; } .btn { color: red; }';
          assert.include(expectedCSS, iframe.stylesheet);
          assert.include(expectedCSS, iframe.conditionalCSS);
          assert.include(expectedCSS, customCSS);
        });
      });
    });
  });
});
