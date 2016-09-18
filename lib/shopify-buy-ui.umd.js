(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ShopifyBuy = factory());
}(this, function () { 'use strict';

	/* eslint no-undefined: 0 */

	var assign = void 0;

	if (typeof Object.assign === 'function') {
	  assign = Object.assign;
	} else {
	  assign = function assign(target) {
	    if (target === undefined || target === null) {
	      throw new TypeError('Cannot convert undefined or null to object');
	    }

	    var output = Object(target);

	    var propertyObjects = [].slice.call(arguments, 1);

	    if (propertyObjects.length > 0) {
	      propertyObjects.forEach(function (source) {
	        if (source !== undefined && source !== null) {
	          var nextKey = void 0;

	          for (nextKey in source) {
	            if (source.hasOwnProperty(nextKey)) {
	              output[nextKey] = source[nextKey];
	            }
	          }
	        }
	      });
	    }

	    return output;
	  };
	}

	var assign$1 = assign;

	var includes = void 0;

	if (!Array.prototype.includes) {
	  includes = function includes(array, searchElement) {
	    var ObjectifiedArray = Object(array);
	    var length = parseInt(ObjectifiedArray.length, 10) || 0;

	    if (length === 0) {
	      return false;
	    }

	    var startIndex = parseInt(arguments[1], 10) || 0;
	    var index = void 0;

	    if (startIndex >= 0) {
	      index = startIndex;
	    } else {
	      index = length + startIndex;

	      if (index < 0) {
	        index = 0;
	      }
	    }

	    while (index < length) {
	      var currentElement = ObjectifiedArray[index];

	      /* eslint no-self-compare:0 */
	      if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
	        // NaN !== NaN
	        return true;
	      }
	      index++;
	    }

	    return false;
	  };
	} else {
	  includes = function includes(array) {
	    var args = [].slice.call(arguments, 1);

	    return Array.prototype.includes.apply(array, args);
	  };
	}

	var includes$1 = includes;

	function wrap(func, superFunc) {
	  function superWrapper() {
	    var originalSuper = this.super;

	    this.super = function () {
	      return superFunc.apply(this, arguments);
	    };

	    var ret = func.apply(this, arguments);

	    this.super = originalSuper;

	    return ret;
	  }

	  superWrapper.wrappedFunction = func;

	  return superWrapper;
	}

	function defineProperties(names, proto, destination) {
	  var parentProto = Object.getPrototypeOf(destination);

	  names.forEach(function (name) {
	    var descriptor = Object.getOwnPropertyDescriptor(proto, name);
	    var parentDescriptor = parentProto.hasOwnProperty(name) && Object.getOwnPropertyDescriptor(parentProto, name);

	    if (typeof parentDescriptor.value === 'function' && typeof descriptor.value === 'function') {
	      var wrappedFunction = wrap(descriptor.value, parentDescriptor.value);

	      Object.defineProperty(destination, name, { value: wrappedFunction });
	    } else {
	      Object.defineProperty(destination, name, descriptor);
	    }
	  });
	}

	function createClass(props) {
	  var parent = arguments.length <= 1 || arguments[1] === undefined ? Object : arguments[1];

	  var Constructor = wrap(props.constructor, parent);
	  var instancePropertyNames = Object.getOwnPropertyNames(props).filter(function (key) {
	    return !includes$1(['constructor', 'static'], key);
	  });

	  assign$1(Constructor, parent);

	  Constructor.prototype = Object.create(parent.prototype);
	  defineProperties(instancePropertyNames, props, Constructor.prototype);
	  Constructor.prototype.constructor = Constructor;

	  var staticProps = props.static;

	  if (staticProps) {
	    var staticPropertyNames = Object.getOwnPropertyNames(staticProps);

	    defineProperties(staticPropertyNames, staticProps, Constructor);
	  }

	  return Constructor;
	}

	var CoreObject = createClass({
	  constructor: function constructor() {},


	  static: {
	    extend: function extend(subClassProps) {
	      return createClass(subClassProps, this);
	    }
	  }
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	};

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass$1 = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	var defineProperty = function (obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	};

	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	var inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	var possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	var slicedToArray = function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;

	    try {
	      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);

	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }

	    return _arr;
	  }

	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if (Symbol.iterator in Object(arr)) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	}();

	var toConsumableArray = function (arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

	    return arr2;
	  } else {
	    return Array.from(arr);
	  }
	};

	function wrapConsole(logCommand) {
	  var logMethod = function logMethod() {
	    var log = void 0;

	    /* eslint-disable no-console */
	    if (console[logCommand]) {
	      log = Function.prototype.bind.call(console[logCommand], console);
	    } else {
	      log = Function.prototype.bind.call(console.log, console);
	    }
	    log.apply(undefined, arguments);
	    /* eslint-enable no-console */
	  };

	  return function () {
	    var args = [].concat(Array.prototype.slice.call(arguments));

	    args.unshift('[JS-BUY-SDK]: ');
	    logMethod.apply(undefined, toConsumableArray(args));
	  };
	}

	var Logger = CoreObject.extend({
	  /**
	   * Wrapper around the console log so in the future we can have better dev output.
	   * Also allows us to disable output in production.
	   * @class Logger
	   * @constructor
	   */
	  constructor: function constructor() {},

	  debug: wrapConsole('debug'),
	  info: wrapConsole('info'),
	  warn: wrapConsole('warn'),
	  error: wrapConsole('error')
	});

	var logger = new Logger();

	/**
	 * @module shopify-buy
	 * @submodule config
	 */

	var Config = CoreObject.extend({
	  /**
	   * @class Config
	   * @constructor
	   * @param {Object} attrs An object of required config data.
	   * @param {String} attrs.apiKey Your api client's public token
	   * @param {String} attrs.appId The app whose listings the client will be
	   * using. If you are just modifying a buy button, the buy-button's app id is
	   * 6. Otherwise, obtain the app id of the app you're modifying or extending.
	   * @param {String} attrs.domain Your shop's full domain. (i.e. `craftedgoods.myshopify.com`)
	   */
	  constructor: function constructor(attrs) {
	    var _this = this;

	    Object.keys(this.deprecatedProperties).forEach(function (key) {
	      if (attrs.hasOwnProperty(key)) {
	        var transformName = _this.deprecatedProperties[key];
	        var transform = _this[transformName];

	        transform(attrs[key], attrs);
	      }
	    });
	    this.requiredProperties.forEach(function (key) {
	      if (!attrs.hasOwnProperty(key)) {
	        throw new Error('new Config() requires the option \'' + key + '\'');
	      } else {
	        _this[key] = attrs[key];
	      }
	    });
	  },


	  /**
	   * An object with keys for deprecated properties and values as functions that
	   * will transform the value into a usable value. A depracation transform should
	   * have the value signature function(deprecated_value, config_to_be_transformed)
	   * @attribute deprecatedProperties
	   * @default { myShopifyDomain: this.transformMyShopifyDomain }
	   * @type Object
	   * @private
	   */
	  deprecatedProperties: {
	    myShopifyDomain: 'transformMyShopifyDomain'
	  },

	  /**
	   * Transform the myShopifyDomain config to a domain config.
	   * @method transformMyShopifyDomain
	   * @static
	   * @private
	   * @param {String} subdomain The original subdomain on myshopify.com
	   * @param {Object} attrs. The config attributes to be transformed to a
	   * non-deprecated state.
	   * @return {Object} the transformed config attributes.
	   */
	  transformMyShopifyDomain: function transformMyShopifyDomain(subdomain, attrs) {
	    logger.warn('Config - ', 'myShopifyDomain is deprecated, please use domain and provide the full shop domain.');
	    attrs.domain = subdomain + '.myshopify.com';
	  },


	  /**
	   * Properties that must be set on initializations
	   * @attribute requiredProperties
	   * @default ['apiKey', 'appId', 'myShopifyDomain']
	   * @type Array
	   * @private
	   */
	  requiredProperties: ['apiKey', 'appId', 'domain'],

	  /**
	   * The apiKey for authenticating against shopify. This is your api client's
	   * public api token. Not the shared secret. Set during initialation.
	   * @attribute apiKey
	   * @default ''
	   * @type String
	   * @public
	   */
	  apiKey: '',

	  /**
	   * @attribute appId
	   * @default ''
	   * @type String
	   * @public
	   */
	  appId: '',

	  /**
	   * The domain that all the api requests will go to
	   * @attribute domain
	   * @default ''
	   * @type String
	   * @public
	   */
	  domain: '',

	  /**
	   * The subdomain of myshopify.io that all the api requests will go to
	   * @attribute myShopifyDomain
	   * @default ''
	   * @type String
	   * @public
	   * @deprecated Use `config.domain` instead.
	   */
	  myShopifyDomain: ''
	});

	var version = '{{versionString}}';

	var BaseModel = CoreObject.extend({
	  constructor: function constructor() {
	    var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var metaAttrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    this.attrs = attrs;

	    assign$1(this, metaAttrs);
	  },

	  attrs: null,
	  serializer: null,
	  adapter: null,
	  shopClient: null
	});

	/**
	  * Class for product option
	  * @class Option
	  * @constructor
	*/
	var ProductOptionModel = BaseModel.extend({
	  constructor: function constructor() {
	    this.super.apply(this, arguments);

	    this.selected = this.values[0];
	  },


	  /**
	    * name of option (ex. "Size", "Color")
	    * @property name
	    * @type String
	  */
	  get name() {
	    return this.attrs.name;
	  },

	  /**
	    * possible values for selection
	    * @property values
	    * @type Array
	  */
	  get values() {
	    return this.attrs.values;
	  },

	  /**
	    * get/set selected option value (ex. "Large"). Setting this will update the
	    * selected value on the model. Throws {Error} if setting selected to value that does not exist for option
	    * @property selected
	    * @type String
	  */
	  get selected() {
	    return this._selected;
	  },

	  set selected(value) {
	    if (includes$1(this.values, value)) {
	      this._selected = value;
	    } else {
	      throw new Error('Invalid option selection for ' + this.name + '.');
	    }

	    return value;
	  }
	});

	/**
	  * Model for product variant
	  * @class ProductVariantModel
	  * @constructor
	*/
	var ProductVariantModel = BaseModel.extend({
	  constructor: function constructor() {
	    this.super.apply(this, arguments);
	  },


	  /**
	    * Variant unique ID
	    * @property id
	    * @type {String}
	  */
	  get id() {
	    return this.attrs.variant.id;
	  },

	  /**
	    * ID of product variant belongs to
	    * @property productId
	    * @type {String}
	  */
	  get productId() {
	    return this.attrs.product.id;
	  },

	  /**
	    * Title of variant
	    * @property title
	    * @type {String}
	  */
	  get title() {
	    return this.attrs.variant.title;
	  },

	  /**
	    * Title of product variant belongs to
	    * @property productTitle
	    * @type {String}
	  */
	  get productTitle() {
	    return this.attrs.product.title;
	  },

	  /**
	    * <a href="https://docs.shopify.com/manual/products/promoting-marketing/sales">
	    * Compare at</a> price for variant formatted as currency.
	    * @property compareAtPrice
	    * @type {String}
	  */
	  get compareAtPrice() {
	    return this.attrs.variant.compare_at_price;
	  },

	  /**
	    * Price of variant, formatted as currency
	    * @property price
	    * @type {String}
	  */
	  get price() {
	    return this.attrs.variant.price;
	  },

	  /**
	    * Variant weight in grams
	    * @property grams
	    * @type {Number}
	  */
	  get grams() {
	    return this.attrs.variant.grams;
	  },

	  /**
	    * Option values associated with this variant, ex {name: "color", value: "Blue"}
	    * @property optionValues
	    * @type {Array|Object}
	  */
	  get optionValues() {
	    return this.attrs.variant.option_values;
	  },

	  /**
	    * Variant in stock (always true if inventory tracking is disabled)
	    * @property available
	    * @type {Boolean}
	  */
	  get available() {
	    return this.attrs.variant.available;
	  },

	  /**
	    * Image for variant
	    * @property image
	    * @type {Object}
	  */
	  get image() {
	    var id = this.id;
	    var images = this.attrs.product.images;

	    var primaryImage = images[0];
	    var variantImage = images.filter(function (image) {
	      return image.variant_ids.indexOf(id) !== -1;
	    })[0];

	    return variantImage || primaryImage;
	  },

	  /**
	    * Image variants available for a variant, ex [ {"name":"pico","dimension":"16x16","src":"https://cdn.shopify.com/image-two_pico.jpg"} ]
	    * See <a href="https://help.shopify.com/themes/liquid/filters/url-filters#size-parameters"> for list of available variants.</a>
	    * @property imageVariant
	    * @type {Array}
	  */
	  get imageVariants() {
	    var image = this.image;

	    if (!image) {
	      return [];
	    }

	    var src = this.image.src;
	    var extensionIndex = src.lastIndexOf('.');
	    var pathAndBasename = src.slice(0, extensionIndex);
	    var extension = src.slice(extensionIndex);
	    var variants = [{ name: 'pico', dimension: '16x16' }, { name: 'icon', dimension: '32x32' }, { name: 'thumb', dimension: '50x50' }, { name: 'small', dimension: '100x100' }, { name: 'compact', dimension: '160x160' }, { name: 'medium', dimension: '240x240' }, { name: 'large', dimension: '480x480' }, { name: 'grande', dimension: '600x600' }, { name: '1024x1024', dimension: '1024x1024' }, { name: '2048x2048', dimension: '2048x2048' }];

	    variants.forEach(function (variant) {
	      variant.src = pathAndBasename + '_' + variant.name + extension;
	    });

	    return variants;
	  },

	  /**
	    * Checkout URL for purchasing variant with quantity.
	    * @method checkoutUrl
	    * @param {Number} [quantity = 1] quantity of variant
	    * @public
	    * @return {String} Checkout URL
	  */
	  checkoutUrl: function checkoutUrl() {
	    var quantity = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

	    var config = this.config;
	    var baseUrl = 'https://' + config.domain + '/cart';

	    var variantPath = this.id + ':' + parseInt(quantity, 10);

	    var query = 'api_key=' + config.apiKey;

	    return baseUrl + '/' + variantPath + '?' + query;
	  }
	});

	function uniq (array) {
	  return array.reduce(function (uniqueArray, item) {
	    if (uniqueArray.indexOf(item) < 0) {
	      uniqueArray.push(item);
	    }

	    return uniqueArray;
	  }, []);
	}

	var NO_IMAGE_URI = 'https://widgets.shopifyapps.com/assets/no-image.svg';

	/**
	   * Class for products returned by fetch('product')
	   * @class ProductModel
	   * @constructor
	 */
	var ProductModel = BaseModel.extend({
	  constructor: function constructor() {
	    this.super.apply(this, arguments);
	  },


	  /**
	    * Product unique ID
	    * @property id
	    * @type {String}
	  */
	  get id() {
	    return this.attrs.product_id;
	  },

	  /**
	    * Product title
	    * @property title
	    * @type {String}
	  */
	  get title() {
	    return this.attrs.title;
	  },

	  /**
	    * Product description. The exposes the `body_html` property on the listings API
	    * @property description
	    * @type {String}
	  */
	  get description() {
	    return this.attrs.body_html;
	  },

	  /**
	    * All images associated with product.
	    * @property images
	    * @type {Array} array of image objects.
	  */
	  get images() {
	    return this.attrs.images;
	  },

	  get memoized() {
	    this._memoized = this._memoized || {};

	    return this._memoized;
	  },

	  /**
	     *  Get array of options with nested values. Useful for creating UI for selecting options.
	     *
	     * ```javascript
	     *  var elements = product.options.map(function(option) {
	     *    return '<select name="' + option.name + '">' + option.values.map(function(value) {
	     *      return '<option value="' + value + '">' + value + '</option>';
	     *    }) + '</select>';
	     *  });
	     * ```
	     *
	     * @attribute options
	     * @type {Array|Option}
	   */
	  get options() {
	    if (this.memoized.options) {
	      return this.memoized.options;
	    }

	    var baseOptions = this.attrs.options;
	    var variants = this.variants;

	    this.memoized.options = baseOptions.map(function (option) {
	      var name = option.name;

	      var dupedValues = variants.reduce(function (valueList, variant) {
	        var optionValueForOption = variant.optionValues.filter(function (optionValue) {
	          return optionValue.name === option.name;
	        })[0];

	        valueList.push(optionValueForOption.value);

	        return valueList;
	      }, []);

	      var values = uniq(dupedValues);

	      return new ProductOptionModel({ name: name, values: values });
	    });

	    return this.memoized.options;
	  },

	  /**
	    * All variants of a product.
	    * @property variants
	    * @type {Array|ProductVariantModel} array of ProductVariantModel instances.
	  */
	  get variants() {
	    var _this = this;

	    return this.attrs.variants.map(function (variant) {
	      return new ProductVariantModel({ variant: variant, product: _this }, { config: _this.config });
	    });
	  },

	  /**
	    * Retrieve currently selected option values.
	    * @attribute selections
	    * @type {Option}
	  */
	  get selections() {
	    return this.options.map(function (option) {
	      return option.selected;
	    });
	  },

	  /**
	    * Retrieve variant for currently selected options
	    * @attribute selectedVariant
	    * @type {Object}
	  */
	  get selectedVariant() {
	    var variantTitle = this.selections.join(' / ');

	    return this.variants.filter(function (variant) {
	      return variant.title === variantTitle;
	    })[0] || null;
	  },

	  /**
	    * Retrieve image for currently selected variantImage
	    * @attribute selectedVariantImage
	    * @type {Object}
	  */
	  get selectedVariantImage() {
	    if (!this.selectedVariant) {
	      return null;
	    }

	    return this.selectedVariant.image;
	  }
	});

	var ListingsSerializer = CoreObject.extend({
	  constructor: function constructor(config) {
	    this.config = config;
	  },
	  rootKeyForType: function rootKeyForType(type) {
	    return type.slice(0, -1) + '_listing';
	  },


	  models: {
	    collections: BaseModel,
	    products: ProductModel
	  },

	  modelForType: function modelForType(type) {
	    return this.models[type];
	  },
	  deserializeSingle: function deserializeSingle(type) {
	    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	    var modelAttrs = singlePayload[this.rootKeyForType(type)];
	    var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

	    return model;
	  },
	  deserializeMultiple: function deserializeMultiple(type) {
	    var _this = this;

	    var collectionPayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	    var models = collectionPayload[this.rootKeyForType(type) + 's'];

	    return models.map(function (attrs) {
	      var model = _this.modelFromAttrs(type, attrs, metaAttrs);

	      return model;
	    });
	  },
	  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
	    var Model = this.modelForType(type);

	    metaAttrs.config = this.config;

	    return new Model(attrs, metaAttrs);
	  }
	});

	function authToUrl(url, opts) {
	  var authorization = void 0;

	  if (opts.headers) {
	    Object.keys(opts.headers).forEach(function (key) {
	      if (key.toLowerCase() === 'authorization') {
	        authorization = opts.headers[key];
	      }
	    });
	  }

	  if (authorization) {
	    var hashedKey = authorization.split(' ').slice(-1)[0];

	    try {
	      var plainKey = atob(hashedKey);

	      var newUrl = void 0;

	      if (url.indexOf('?') > -1) {
	        newUrl = url + '&_x_http_authorization=' + plainKey;
	      } else {
	        newUrl = url + '?_x_http_authorization=' + plainKey;
	      }

	      return newUrl;
	    } catch (e) {
	      // atob choked on non-encoded data. Therefore, not a form of auth we
	      // support.
	      //
	      // NOOP
	      //
	    }
	  }

	  /* eslint newline-before-return: 0 */
	  return url;
	}

	function ie9Ajax(method, url, opts) {
	  return new Promise(function (resolve, reject) {
	    var xdr = new XDomainRequest();

	    xdr.onload = function () {
	      try {
	        var json = JSON.parse(xdr.responseText);

	        resolve({ json: json, originalResponse: xdr, isJSON: true });
	      } catch (e) {
	        resolve({ text: xdr.responseText, originalResponse: xdr, isText: true });
	      }
	    };

	    function handleError() {
	      reject(new Error('There was an error with the XDR'));
	    }

	    xdr.onerror = handleError;
	    xdr.ontimeout = handleError;

	    xdr.open(method, authToUrl(url, opts));
	    xdr.send(opts.data);
	  });
	}

	function checkStatus(response) {
	  if (response.status >= 200 && response.status < 300) {
	    return response;
	  }

	  var error = new Error(response.statusText);

	  error.status = response.status;
	  error.response = response;
	  throw error;
	}

	function parseResponse(response) {
	  return response.json().then(function (json) {
	    return { json: json, originalResponse: response, isJSON: true };
	  }).catch(function () {
	    var responseClone = response.clone();

	    return responseClone.text().then(function (text) {
	      return { text: text, originalResponse: responseClone, isText: true };
	    });
	  });
	}

	function ajax(method, url) {
	  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	  var xhr = new XMLHttpRequest();

	  if (!('withCredentials' in xhr)) {
	    return ie9Ajax.apply(undefined, arguments);
	  }

	  opts.method = method;
	  opts.mode = 'cors';

	  return fetch(url, opts).then(checkStatus).then(parseResponse);
	}

	var ListingsAdapter = CoreObject.extend({
	  ajax: ajax,

	  constructor: function constructor(config) {
	    this.config = config;
	  },


	  get base64ApiKey() {
	    return btoa(this.config.apiKey);
	  },

	  get baseUrl() {
	    var _config = this.config;
	    var domain = _config.domain;
	    var appId = _config.appId;


	    return 'https://' + domain + '/api/apps/' + appId;
	  },

	  get headers() {
	    return {
	      Authorization: 'Basic ' + this.base64ApiKey,
	      'Content-Type': 'application/json',
	      'X-SDK-Variant': 'javascript',
	      'X-SDK-Version': version

	    };
	  },

	  pathForType: function pathForType(type) {
	    return '/' + type.slice(0, -1) + '_listings';
	  },
	  buildUrl: function buildUrl(singleOrMultiple, type, idOrQuery) {
	    switch (singleOrMultiple) {
	      case 'multiple':
	        return this.buildMultipleUrl(type, idOrQuery);
	      case 'single':
	        return this.buildSingleUrl(type, idOrQuery);
	      default:
	        return '';
	    }
	  },
	  buildMultipleUrl: function buildMultipleUrl(type) {
	    var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var url = '' + this.baseUrl + this.pathForType(type);
	    var paramNames = Object.keys(query);

	    if (paramNames.length > 0) {
	      var queryString = paramNames.map(function (key) {
	        var value = void 0;

	        if (Array.isArray(query[key])) {
	          value = query[key].join(',');
	        } else {
	          value = query[key];
	        }

	        return key + '=' + encodeURIComponent(value);
	      }).join('&');

	      return url + '?' + queryString;
	    }

	    return url;
	  },
	  buildSingleUrl: function buildSingleUrl(type, id) {
	    return '' + this.baseUrl + this.pathForType(type) + '/' + id;
	  },
	  fetchMultiple: function fetchMultiple() /* type, [query] */{
	    var url = this.buildUrl.apply(this, ['multiple'].concat(Array.prototype.slice.call(arguments)));

	    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
	      return response.json;
	    });
	  },
	  fetchSingle: function fetchSingle() /* type, id */{
	    var url = this.buildUrl.apply(this, ['single'].concat(Array.prototype.slice.call(arguments)));

	    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
	      return response.json;
	    });
	  }
	});

	/* eslint no-undefined: 0 complexity: 0 */

	var GUID_KEY = 'shopify-buy-uuid';

	var GUID_PREFIX = 'shopify-buy.' + Date.now();

	var GUID_DESC = {
	  writable: true,
	  configurable: true,
	  enumerable: true,
	  value: null
	};

	var uuidSeed = 0;

	function uuid() {
	  return ++uuidSeed;
	}

	var numberCache = {};
	var stringCache = {};

	function setGuidFor(obj) {
	  if (obj && obj[GUID_KEY]) {
	    return obj[GUID_KEY];
	  }

	  if (obj === undefined) {
	    return '(undefined)';
	  }

	  if (obj === null) {
	    return '(null)';
	  }

	  var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
	  var id = void 0;

	  switch (type) {
	    case 'number':
	      id = numberCache[obj];

	      if (!id) {
	        id = numberCache[obj] = 'nu' + obj;
	      }

	      break;

	    case 'string':
	      id = stringCache[obj];

	      if (!id) {
	        id = stringCache[obj] = 'st' + uuid();
	      }

	      break;

	    case 'boolean':
	      if (obj) {
	        id = '(true)';
	      } else {
	        id = '(false)';
	      }

	      break;

	    default:
	      if (obj === Object) {
	        id = '(Object)';
	        break;
	      }

	      if (obj === Array) {
	        id = '(Array)';
	        break;
	      }

	      id = GUID_PREFIX + '.' + uuid();

	      if (obj[GUID_KEY] === null) {
	        obj[GUID_KEY] = id;
	      } else {
	        GUID_DESC.value = id;
	        Object.defineProperty(obj, GUID_KEY, GUID_DESC);
	      }
	  }

	  return id;
	}

	var CartLineItem = BaseModel.extend({
	  constructor: function constructor() {
	    this.super.apply(this, arguments);
	  },


	  get id() {
	    return this.attrs[GUID_KEY];
	  },

	  get variant_id() {
	    return this.attrs.variant_id;
	  },

	  get product_id() {
	    return this.attrs.product_id;
	  },

	  get image() {
	    return this.attrs.image;
	  },

	  get title() {
	    return this.attrs.title;
	  },

	  get quantity() {
	    return this.attrs.quantity;
	  },

	  set quantity(value) {
	    var parsedValue = parseInt(value, 10);

	    if (parsedValue < 0) {
	      throw new Error('Quantities must be positive');
	    } else if (parsedValue !== parseFloat(value)) {
	      /* incidentally, this covers all NaN values, because NaN !== Nan */
	      throw new Error('Quantities must be whole numbers');
	    }

	    this.attrs.quantity = parsedValue;

	    return this.attrs.quantity;
	  },

	  get properties() {
	    return this.attrs.properties || {};
	  },

	  set properties(value) {
	    this.attrs.properties = value || {};

	    return value;
	  },

	  get variant_title() {
	    return this.attrs.variant_title;
	  },

	  get price() {
	    return this.attrs.price;
	  },

	  get compare_at_price() {
	    return this.attrs.compare_at_price;
	  },

	  get line_price() {
	    return (this.quantity * parseFloat(this.price)).toFixed(2);
	  },

	  get grams() {
	    return this.attrs.grams;
	  }
	});

	/* global global */

	var globalNamespace = void 0;

	if (typeof global === 'undefined') {
	  globalNamespace = window;
	} else {
	  globalNamespace = global;
	}

	var global$1 = globalNamespace;

	function objectsEqual(one, two) {
	  if (one === two) {
	    return true;
	  }

	  return Object.keys(one).every(function (key) {
	    if (one[key] instanceof Date) {
	      return one[key].toString() === two[key].toString();
	    } else if (_typeof(one[key]) === 'object') {
	      return objectsEqual(one[key], two[key]);
	    }

	    return one[key] === two[key];
	  });
	}

	var CartModel = BaseModel.extend({

	  /**
	    * Class for cart model
	    * @class CartModel
	    * @constructor
	  */
	  constructor: function constructor() {
	    this.super.apply(this, arguments);
	  },


	  /**
	    * get ID for current cart
	    * @property id
	    * @type {String}
	  */
	  get id() {
	    return this.attrs[GUID_KEY];
	  },

	  /**
	    * Get current line items for cart
	    * @property lineItems
	    * @type {Array}
	  */
	  get lineItems() {
	    return (this.attrs.line_items || []).map(function (item) {
	      return new CartLineItem(item);
	    });
	  },

	  /**
	    * Gets the sum quantity of each line item
	    * @property lineItemCount
	    * @type {Number}
	  */
	  get lineItemCount() {
	    return this.lineItems.reduce(function (total, item) {
	      return total + item.quantity;
	    }, 0);
	  },

	  /**
	    * Get current subtotal price for all line items
	    * @property subtotal
	    * @type {String}
	  */
	  get subtotal() {
	    var subtotal = this.lineItems.reduce(function (runningTotal, lineItem) {
	      return runningTotal + parseFloat(lineItem.line_price);
	    }, 0);

	    return subtotal.toFixed(2);
	  },

	  /**
	    * Get checkout URL for current cart
	    * @property checkoutUrl
	    * @type {String}
	  */
	  get checkoutUrl() {
	    var config = this.config;
	    var baseUrl = 'https://' + config.domain + '/cart';

	    var variantPath = this.lineItems.map(function (item) {
	      return item.variant_id + ':' + item.quantity;
	    });

	    var query = 'api_key=' + config.apiKey;

	    if (typeof global$1.ga === 'function') {
	      var linkerParam = void 0;

	      global$1.ga(function (tracker) {
	        linkerParam = tracker.get('linkerParam');
	      });

	      if (linkerParam) {
	        query += '&' + linkerParam;
	      }
	    }

	    return baseUrl + '/' + variantPath + '?' + query;
	  },

	  /**
	    * Add items to cart. Updates cart's `lineItems`
	    * ```javascript
	    * cart.addVariants({variant: variantObject, quantity: 1}).then(cart => {
	    *   // do things with the updated cart.
	    * });
	    * ```
	    * @method addVariants
	    * @param {Object} item - One or more variants
	    * @param {Object} item.variant - variant object
	    * @param {Number} item.quantity - quantity
	    * @param {Object} [nextItem...] - further lineItems may be passed
	    * @public
	    * @return {Promise|CartModel} - updated cart instance.
	  */
	  addVariants: function addVariants() {
	    var newLineItems = [].concat(Array.prototype.slice.call(arguments)).map(function (item) {
	      var lineItem = {
	        image: item.variant.image,
	        variant_id: item.variant.id,
	        product_id: item.variant.productId,
	        title: item.variant.productTitle,
	        quantity: parseInt(item.quantity, 10),
	        properties: item.properties || {},
	        variant_title: item.variant.title,
	        price: item.variant.price,
	        compare_at_price: item.variant.compareAtPrice,
	        grams: item.variant.grams
	      };

	      setGuidFor(lineItem);

	      return lineItem;
	    });
	    var existingLineItems = this.attrs.line_items;

	    existingLineItems.push.apply(existingLineItems, toConsumableArray(newLineItems));

	    var dedupedLineItems = existingLineItems.reduce(function (itemAcc, item) {
	      var matchingItem = itemAcc.filter(function (existingItem) {
	        return existingItem.variant_id === item.variant_id && objectsEqual(existingItem.properties, item.properties);
	      })[0];

	      if (matchingItem) {
	        matchingItem.quantity = matchingItem.quantity + item.quantity;
	      } else {
	        itemAcc.push(item);
	      }

	      return itemAcc;
	    }, []);

	    // Users may pass negative numbers and remove items. This ensures there's no
	    // item with a quantity of zero or less.
	    this.attrs.line_items = dedupedLineItems.reduce(function (itemAcc, item) {
	      if (item.quantity >= 1) {
	        itemAcc.push(item);
	      }

	      return itemAcc;
	    }, []);

	    return this.updateModel();
	  },


	  /**
	    * Update line item quantity
	    * ```javascript
	    * cart.updateLineItem(123, 2).then(cart => {
	    *   // do things with the updated cart.
	    * });
	    * ```
	    * @method updateLineItem
	    * @param {Number} id - line item ID
	    * @param {Number} quantity - new quantity for line item
	    * @throws {Error} if line item with ID is not in cart.
	    * @public
	    * @return {Promise|CartModel} - updated cart instance
	  */
	  updateLineItem: function updateLineItem(id, quantity) {
	    if (quantity < 1) {
	      return this.removeLineItem(id);
	    }

	    var lineItem = this.lineItems.filter(function (item) {
	      return item.id === id;
	    })[0];

	    if (lineItem) {
	      lineItem.quantity = quantity;

	      return this.updateModel();
	    }

	    return new Promise(function (resolve, reject) {
	      reject(new Error('line item with id: ' + id + ' not found in cart#' + this.id));
	    });
	  },


	  /**
	    * Remove line item from cart
	    * @method removeLineItem
	    * @param {Number} id - line item ID
	    * @throws {Error} if line item with ID is not in cart.
	    * @public
	    * @return {Promise|CartModel} - updated cart instance
	  */
	  removeLineItem: function removeLineItem(id) {
	    var oldLength = this.lineItems.length;
	    var newLineItems = this.lineItems.filter(function (item) {
	      return item.id !== id;
	    });
	    var newLength = newLineItems.length;

	    if (newLength < oldLength) {
	      this.attrs.line_items = newLineItems.map(function (item) {
	        return item.attrs;
	      });

	      return this.updateModel();
	    }

	    return new Promise(function (resolve, reject) {
	      reject(new Error('line item with id: ' + id + ' not found in cart#' + this.id));
	    });
	  },


	  /**
	    * Remove all line items from cart
	    * @method clearLineItems
	    * @public
	    * @return {Promise|CartModel} - updated cart instance
	  */
	  clearLineItems: function clearLineItems() {
	    this.attrs.line_items = [];

	    return this.updateModel();
	  },


	  /**
	    * force update of cart model on server
	    * @method updateModel
	    * @public
	    * @return {Promise|CartModel} - updated cart instance
	  */
	  updateModel: function updateModel() {
	    var _this = this;

	    return this.shopClient.update('carts', this).then(function (updateCart) {
	      assign$1(_this.attrs, updateCart.attrs);

	      return _this;
	    });
	  }
	});

	var CartSerializer = CoreObject.extend({
	  constructor: function constructor(config) {
	    this.config = config;
	  },
	  rootKeyForType: function rootKeyForType(type) {
	    return type.slice(0, -1);
	  },
	  modelForType: function modelForType() /* type */{
	    return CartModel;
	  },
	  deserializeSingle: function deserializeSingle(type) {
	    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	    var modelAttrs = singlePayload[this.rootKeyForType(type)];
	    var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

	    return model;
	  },
	  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
	    var Model = this.modelForType(type);

	    metaAttrs.config = this.config;

	    return new Model(attrs, metaAttrs);
	  },
	  serialize: function serialize(type, model) {
	    var root = this.rootKeyForType(type);
	    var payload = {};
	    var attrs = assign$1({}, model.attrs);

	    payload[root] = attrs;

	    delete attrs.attributes;

	    Object.keys(attrs).forEach(function (key) {
	      var value = attrs[key];

	      if (value === null || typeof value === 'string' && value.length === 0) {
	        delete attrs[key];
	      }
	    });

	    return payload;
	  }
	});

	var ReferenceModel = BaseModel.extend({

	  /**
	    * Class for reference model
	    * @class ReferenceModel
	    * @constructor
	  */
	  constructor: function constructor(attrs) {
	    if (Object.keys(attrs).indexOf('referenceId') < 0) {
	      throw new Error('Missing key referenceId of reference. References to null are not allowed');
	    }

	    this.super.apply(this, arguments);
	  },


	  /**
	    * get the ID for current reference (not what it refers to, but its own unique identifier)
	    * @property id
	    * @type {String}
	  */
	  get id() {
	    return this.attrs[GUID_KEY];
	  },

	  get referenceId() {
	    return this.attrs.referenceId;
	  },
	  set referenceId(value) {
	    this.attrs.referenceId = value;

	    return value;
	  }

	});

	var ReferenceSerializer = CoreObject.extend({
	  constructor: function constructor(config) {
	    this.config = config;
	  },
	  modelForType: function modelForType() /* type */{
	    return ReferenceModel;
	  },
	  deserializeSingle: function deserializeSingle(type) {
	    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	    var Model = this.modelForType(type);

	    return new Model(singlePayload, metaAttrs);
	  },
	  serialize: function serialize(type, model) {
	    var attrs = assign$1({}, model.attrs);

	    return attrs;
	  }
	});

	var Store = CoreObject.extend({
	  constructor: function constructor() {
	    this.localStorageAvailable = this.storageAvailable('localStorage');
	    this.cache = {};
	  },
	  setItem: function setItem(key, value) {
	    if (this.localStorageAvailable) {
	      localStorage.setItem(key, JSON.stringify(value));
	    } else {
	      this.cache[key] = value;
	    }

	    return value;
	  },
	  getItem: function getItem(key) {
	    if (this.localStorageAvailable) {
	      var stringValue = localStorage.getItem(key);

	      try {
	        return JSON.parse(stringValue);
	      } catch (e) {
	        return null;
	      }
	    } else {
	      return this.cache[key] || null;
	    }
	  },
	  storageAvailable: function storageAvailable(type) {
	    try {
	      var storage = global$1[type];
	      var x = '__storage_test__';

	      storage.setItem(x, x);
	      storage.removeItem(x);

	      return true;
	    } catch (e) {
	      return false;
	    }
	  }
	});

	var LocalStorageAdapter = CoreObject.extend({
	  constructor: function constructor() {
	    this.store = new Store();
	  },
	  idKeyForType: function idKeyForType() /* type */{
	    return GUID_KEY;
	  },
	  fetchSingle: function fetchSingle(type, id) {
	    var _this = this;

	    return new Promise(function (resolve, reject) {
	      var value = _this.store.getItem(_this.storageKey(type, id));

	      if (value === null) {
	        reject(new Error(type + '#' + id + ' not found'));

	        return;
	      }

	      resolve(value);
	    });
	  },
	  create: function create(type, payload) {
	    var _this2 = this;

	    return new Promise(function (resolve) {
	      var id = _this2.identify(payload);

	      _this2.store.setItem(_this2.storageKey(type, id), payload);
	      resolve(payload);
	    });
	  },
	  update: function update(type, id, payload) {
	    var _this3 = this;

	    return new Promise(function (resolve) {
	      _this3.store.setItem(_this3.storageKey(type, id), payload);
	      resolve(payload);
	    });
	  },
	  storageKey: function storageKey(type, id) {
	    return type + '.' + id;
	  },
	  identify: function identify(payload) {
	    var keys = Object.keys(payload);

	    if (keys.length === 1 && _typeof(payload[keys[0]]) === 'object') {
	      return setGuidFor(payload[keys[0]]);
	    }

	    return setGuidFor(payload);
	  }
	});

	/**
	 * @module shopify-buy
	 * @submodule shop-client
	 */

	function fetchFactory(fetchType, type) {
	  var func = void 0;

	  switch (fetchType) {
	    case 'all':
	      func = function func() {
	        return this.fetchAll(type);
	      };
	      break;
	    case 'one':
	      func = function func() {
	        return this.fetch.apply(this, [type].concat(Array.prototype.slice.call(arguments)));
	      };
	      break;
	    case 'query':
	      func = function func() {
	        return this.fetchQuery.apply(this, [type].concat(Array.prototype.slice.call(arguments)));
	      };
	      break;
	  }

	  return func;
	}

	var ShopClient = CoreObject.extend({
	  /**
	   * @class ShopClient
	   * @constructor
	   * @param {Config} [config] Config data to be used throughout all API
	   * interaction
	   */
	  constructor: function constructor(config) {
	    this.config = config;

	    this.serializers = {
	      products: ListingsSerializer,
	      collections: ListingsSerializer,
	      carts: CartSerializer,
	      references: ReferenceSerializer
	    };

	    this.adapters = {
	      products: ListingsAdapter,
	      collections: ListingsAdapter,
	      carts: LocalStorageAdapter,
	      references: LocalStorageAdapter
	    };
	  },


	  config: null,

	  /**
	   * @attribute
	   * @default {
	   *  products: ListingsAdapter,
	   *  collections: ListingsAdapter,
	   *  carts: CartAdapter
	   * }
	   * @type Object
	   * @protected
	   */
	  // Prevent leaky state
	  get serializers() {
	    return assign$1({}, this.shadowedSerializers);
	  },

	  set serializers(values) {
	    this.shadowedSerializers = assign$1({}, values);
	  },

	  get adapters() {
	    return assign$1({}, this.shadowedAdapters);
	  },

	  set adapters(values) {
	    this.shadowedAdapters = assign$1({}, values);
	  },

	  /**
	   * Fetch all of a `type`, returning a promise.
	   *
	   * ```javascript
	   * client.fetchAll('products').then(products => {
	   *   // do things with products
	   * });
	   * ```
	   *
	   * @method fetchAll
	   * @private
	   * @param {String} type The pluralized name of the type, in lower case.
	   * @return {Promise|Array} a promise resolving with an array of `type`
	   */
	  fetchAll: function fetchAll(type) {
	    var _this = this;

	    var adapter = new this.adapters[type](this.config);

	    return adapter.fetchMultiple(type).then(function (payload) {
	      return _this.deserialize(type, payload, adapter, null, { multiple: true });
	    });
	  },


	  /**
	   * Fetch one of a `type`, returning a promise.
	   *
	   * ```javascript
	   * client.fetch('products', 123).then(product => {
	   *   // do things with the product
	   * });
	   * ```
	   *
	   * @method fetch
	   * @private
	   * @param {String} type The pluralized name of the type, in lower case.
	   * @param {String|Number} id a unique identifier
	   * @return {Promise|BaseModel} a promise resolving with a single instance of
	   * `type` expressed as a `BaseModel`.
	   */
	  fetch: function fetch(type, id) {
	    var _this2 = this;

	    var adapter = new this.adapters[type](this.config);

	    return adapter.fetchSingle(type, id).then(function (payload) {
	      return _this2.deserialize(type, payload, adapter, null, { single: true });
	    });
	  },


	  /**
	   * Fetch many of a `type`, that match `query`
	   *
	   * ```javascript
	   * client.fetchQuery('products', { collection_id: 456 }).then(products => {
	   *   // do things with the products
	   * });
	   * ```
	   *
	   * @method fetchQuery
	   * @private
	   * @param {String} type The pluralized name of the type, in lower case.
	   * @param {Object} query a query sent to the api server.
	   * @return {Promise|Array} a promise resolving with an array of `type`.
	   */
	  fetchQuery: function fetchQuery(type, query) {
	    var _this3 = this;

	    var adapter = new this.adapters[type](this.config);

	    return adapter.fetchMultiple(type, query).then(function (payload) {
	      return _this3.deserialize(type, payload, adapter, null, { multiple: true });
	    });
	  },


	  /**
	   * Create an instance of `type`, optionally including `modelAttrs`.
	   *
	   * ```javascript
	   * client.create('carts', { line_items: [ ... ] }).then(cart => {
	   *   // do things with the cart.
	   * });
	   * ```
	   *
	   * @method create
	   * @private
	   * @param {String} type The pluralized name of the type, in lower case.
	   * @param {Object} [modelAttrs={}] attributes representing the internal state
	   * of the model to be persisted.
	   * @return {Promise|CartModel} a promise resolving with a single instance of
	   * `type`
	   */
	  create: function create(type) {
	    var _this4 = this;

	    var modelAttrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var adapter = new this.adapters[type](this.config);
	    var serializer = new this.serializers[type](this.config);
	    var Model = serializer.modelForType(type);
	    var model = new Model(modelAttrs, { shopClient: this });
	    var attrs = serializer.serialize(type, model);

	    return adapter.create(type, attrs).then(function (payload) {
	      return _this4.deserialize(type, payload, adapter, serializer, { single: true });
	    });
	  },


	  /**
	   * Create an instance of `type`, optionally including `attrs`.
	   *
	   * ```javascript
	   * client.create('carts', { line_items: [ ... ] }).then(cart => {
	   *   // do things with the cart.
	   * });
	   * ```
	   *
	   * @method update
	   * @private
	   * @param {String} type The pluralized name of the type, in lower case.
	   * @param {BaseModel} updatedModel The model that represents new state to
	   * to persist.
	   * @return {Promise|CartModel} a promise resolving with a single instance of
	   * `type`
	   */
	  update: function update(type, updatedModel) {
	    var _this5 = this;

	    var adapter = updatedModel.adapter;
	    var serializer = updatedModel.serializer;
	    var serializedModel = serializer.serialize(type, updatedModel);
	    var id = updatedModel.attrs[adapter.idKeyForType(type)];

	    return adapter.update(type, id, serializedModel).then(function (payload) {
	      return _this5.deserialize(type, payload, adapter, serializer, { single: true });
	    });
	  },


	  /**
	   * Proxy to serializer's deserialize.
	   *
	   * @method deserialize
	   * @private
	   * @param {String} type The pluralized name of the type, in lower case.
	   * @param {Object} payload The raw payload returned by the adapter.
	   * @param {BaseAdapter} adapter The adapter that yielded the payload.
	   * @param {BaseSerializer} existingSerializer The serializer to attach. If
	   * none is passed, then `this.deserialize` will create one for the type.
	   * @param {Object} opts Options that determine which deserialization method to
	   * use.
	   * @param {Boolean} opts.multiple true when the payload represents multiple
	   * models
	   * @param {Boolean} opts.single true when the payload represents one model.
	   * @return {BaseModel} an instance of `type` reified into a model.
	   */
	  deserialize: function deserialize(type, payload, adapter, existingSerializer) {
	    var opts = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

	    var serializer = existingSerializer || new this.serializers[type](this.config);
	    var meta = { shopClient: this, adapter: adapter, serializer: serializer, type: type };
	    var serializedPayload = void 0;

	    if (opts.multiple) {
	      serializedPayload = serializer.deserializeMultiple(type, payload, meta);
	    } else {
	      serializedPayload = serializer.deserializeSingle(type, payload, meta);
	    }

	    return serializedPayload;
	  },


	  /**
	    * Creates a {{#crossLink "CartModel"}}CartModel{{/crossLink}} instance, optionally including `attrs`.
	    *
	    * ```javascript
	    * client.createCart().then(cart => {
	    *   // do something with cart
	    * });
	    * ```
	    *
	    * @param {Object}[attrs={}] attributes representing the internal state of the cart to be persisted to localStorage.
	    * @method createCart
	    * @public
	    * @return {Promise|CartModel} - new cart instance.
	  */
	  createCart: function createCart() {
	    var userAttrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    var baseAttrs = {
	      line_items: []
	    };
	    var attrs = {};

	    assign$1(attrs, baseAttrs);
	    assign$1(attrs, userAttrs);

	    return this.create('carts', attrs);
	  },


	  /**
	    * Updates an existing {{#crossLink "CartModel"}}CartModel{{/crossLink}} instance and persists it to localStorage.
	    *
	    * ```javascript
	    * client.createCart().then(cart => {
	    *   cart.lineItems = [
	    *     // ...
	    *   ];
	    *   client.updateCart(cart);
	    * });
	    * ```
	    *
	    * @param {Object}[attrs={}] attributes representing the internal state of the cart to be persisted to localStorage.
	    * @method updateCart
	    * @public
	    * @return {Promise|CartModel} - updated cart instance.
	  */
	  updateCart: function updateCart(updatedCart) {
	    return this.update('carts', updatedCart);
	  },


	  /**
	   * Retrieve a previously created cart by its key.
	   *
	   * ```javascript
	   * client.fetchCart('shopify-buy.1459804699118.2').then(cart => {
	   *   console.log(cart); // The retrieved cart
	   * });
	   *
	   * @method fetchCart
	   * @public
	   * @param {String} id The cart's unique identifier
	   * @return {Promise|CartModel} The cart model.
	   *
	   */
	  fetchCart: fetchFactory('one', 'carts'),

	  /**
	   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
	   * {{/crossLink}}. Equivalent to:
	   *
	   * ```javascript
	   * client.fetchAll('products');
	   * ```
	   *
	   * @method fetchAllProducts
	   * @private
	   * @return {Promise|Array} The product models.
	   */
	  fetchAllProducts: fetchFactory('all', 'products'),

	  /**
	   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
	   * {{/crossLink}}. Equivalent to:
	   *
	   * ```javascript
	   * client.fetchAll('collections');
	   * ```
	   *
	   * @method fetchAllCollections
	   * @private
	   * @return {Promise|Array} The collection models.
	   */
	  fetchAllCollections: fetchFactory('all', 'collections'),

	  /**
	   * Fetch one product by its ID.
	   *
	   * ```javascript
	   * client.fetchProduct(123).then(product => {
	   *   console.log(product); // The product with an ID of 123
	   * });
	   * ```
	   *
	   * @method fetchProduct
	   * @public
	   * @param {String|Number} id a unique identifier
	   * @return {Promise|BaseModel} The product model with the specified ID.
	   */
	  fetchProduct: fetchFactory('one', 'products'),

	  /**
	   * Fetch one collection by its ID.
	   *
	   * ```javascript
	   * client.fetchCollection(123).then(collection => {
	   *   console.log(collection); // The collection with an ID of 123
	   * });
	   * ```
	   *
	   * @method fetchCollection
	   * @public
	   * @param {String|Number} id a unique identifier
	   * @return {Promise|BaseModel} The collection model with the specified ID.
	   */
	  fetchCollection: fetchFactory('one', 'collections'),

	  /**
	   * Fetches a list of products matching a specified query.
	   *
	   * ```javascript
	   * client.fetchQueryProducts({ collection_id: 123, tag: ['hats'] }).then(products => {
	   *   console.log(products); // An array of products in collection `123` having the tag `hats`
	   * });
	   * ```
	   * @method fetchQueryProducts
	   * @public
	   * @param {Object} query A query sent to the api server containing one or more of:
	   *   @param {String|Number} [query.collection_id] The ID of a collection to retrieve products from
	   *   @param {Array} [query.tag] A list of tags to filter the products by. Accepts up to 10 tags.
	   *   @param {Array} [query.product_ids] A list of product IDs to retrieve
	   *   @param {String|Number} [query.page=1] The page offset number of the current lookup (based on the `limit`)
	   *   @param {String|Number} [query.limit=50] The number of products to retrieve per page
	   *   @param {String} [query.handle] The handle of the product to look up
	   *   @param {String} [query.updated_at_min] Products updated since the supplied timestamp (format: 2008-12-31 03:00)
	   * @return {Promise|Array} The product models.
	   */
	  fetchQueryProducts: fetchFactory('query', 'products'),

	  /**
	   * Fetches a list of collections matching a specified query.
	   *
	   * ```javascript
	   * client.fetchQueryCollections({page: 2, limit: 20}).then(collections => {
	   *   console.log(collections); // An array of collection resources
	   * });
	   * ```
	   *
	   * @method fetchQueryCollections
	   * @public
	   * @param {Object} query a query sent to the api server.
	   *   @param {String|Number} [query.page=1] the page offset number of the current lookup (based on the `limit`)
	   *   @param {String|Number} [query.limit=50] the number of collections to retrieve per page
	   * @return {Promise|Array} The collection models.
	   */
	  fetchQueryCollections: fetchFactory('query', 'collections'),

	  /**
	   * This method looks up a reference in localStorage to the most recent cart.
	   * If one is not found, creates one. If the cart the reference points to
	   * doesn't exist, create one and store the new reference.
	   *
	   * ```javascript
	   * client.fetchRecentCart().then(cart => {
	   *  // do stuff with the cart
	   * });
	   * ```
	   *
	   * @method fetchRecentCart
	   * @public
	   * @return {Promise|CartModel} The cart.
	   */
	  fetchRecentCart: function fetchRecentCart() {
	    var _this6 = this;

	    return this.fetch('references', this.config.domain + '.recent-cart').then(function (reference) {
	      var cartId = reference.referenceId;

	      return _this6.fetchCart(cartId);
	    }).catch(function () {
	      return _this6.createCart().then(function (cart) {
	        var refAttrs = {
	          referenceId: cart.id
	        };

	        refAttrs[GUID_KEY] = _this6.config.domain + '.recent-cart';

	        _this6.create('references', refAttrs);

	        return cart;
	      });
	    });
	  }
	});

	function isNodeLikeEnvironment() {
	  var windowAbsent = typeof window === 'undefined';
	  var requirePresent = typeof require === 'function';

	  return windowAbsent && requirePresent;
	}

	var fetch$1 = global$1.fetch;

	if (!fetch$1 && isNodeLikeEnvironment()) {
	  /* this indirection is needed because babel throws errors when
	   * transpiling require('node-fetch') using `amd` plugin with babel6
	   */
	  var localRequire = require;

	  global$1.fetch = localRequire('node-fetch');
	  global$1.Response = global$1.fetch.Response;
	}

	var btoa$1 = global$1.btoa;

	if (!btoa$1 && isNodeLikeEnvironment()) {
	  global$1.btoa = function (string) {
	    return new Buffer(string).toString('base64');
	  };
	}

	/**
	 * @module shopify-buy
	 * @submodule shopify
	 */

	/**
	 * This namespace contains all globally accessible classes
	 * @class ShopifyBuy
	 * @static
	 */
	var Shopify = {
	  ShopClient: ShopClient,
	  Config: Config,
	  version: version,
	  NO_IMAGE_URI: NO_IMAGE_URI,

	  /**
	   * Create a ShopClient. This is the main entry point to the SDK.
	   *
	   * ```javascript
	   * const client = ShopifyBuy.buildClient({
	   *   apiKey: 'abc123',
	   *   appId: 123456,
	   *   myShopifyDomain: 'myshop',
	   *   domain: 'myshop.myshopify.com'
	   * });
	   * ```
	   *
	   * @method buildClient
	   * @for ShopifyBuy
	   * @static
	   * @public
	   * @param {Object} configAttrs An object of required config data.
	   * @param {String} configAttrs.apiKey Your api client's public token.
	   * @param {String} configAttrs.appId The app whose listings the client will be
	   * using. If you are just modifying a buy button, the buy-button's app id is
	   * 6. Otherwise, obtain the app id of the app you're modifying or extending.
	   * @param {String} configAttrs.domain You shop's full `myshopify.com` domain.
	   * @return {ShopClient} a client for the shop using your api credentials.
	   */
	  buildClient: function buildClient() {
	    var configAttrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    var config = new this.Config(configAttrs);

	    return new this.ShopClient(config);
	  }
	};

	function merge(target) {
	  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    sources[_key - 1] = arguments[_key];
	  }

	  sources.forEach(function (source) {
	    if (source) {
	      Object.keys(source).forEach(function (key) {
	        if (Object.prototype.toString.call(source[key]) === '[object Object]') {
	          target[key] = merge(target[key] || {}, source[key]);
	        } else {
	          target[key] = source[key];
	        }
	      });
	    }
	  });
	  return target;
	}

	function interopDefault(ex) {
		return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var index = createCommonjsModule(function (module) {
	// Create a range object for efficently rendering strings to elements.
	var range;

	var testEl = typeof document !== 'undefined' ? document.body || document.createElement('div') : {};

	var XHTML = 'http://www.w3.org/1999/xhtml';
	var ELEMENT_NODE = 1;
	var TEXT_NODE = 3;
	var COMMENT_NODE = 8;

	// Fixes <https://github.com/patrick-steele-idem/morphdom/issues/32>
	// (IE7+ support) <=IE7 does not support el.hasAttribute(name)
	var hasAttributeNS;

	if (testEl.hasAttributeNS) {
	    hasAttributeNS = function hasAttributeNS(el, namespaceURI, name) {
	        return el.hasAttributeNS(namespaceURI, name);
	    };
	} else if (testEl.hasAttribute) {
	    hasAttributeNS = function hasAttributeNS(el, namespaceURI, name) {
	        return el.hasAttribute(name);
	    };
	} else {
	    hasAttributeNS = function hasAttributeNS(el, namespaceURI, name) {
	        return !!el.getAttributeNode(name);
	    };
	}

	function empty(o) {
	    for (var k in o) {
	        if (o.hasOwnProperty(k)) {
	            return false;
	        }
	    }
	    return true;
	}

	function toElement(str) {
	    if (!range && document.createRange) {
	        range = document.createRange();
	        range.selectNode(document.body);
	    }

	    var fragment;
	    if (range && range.createContextualFragment) {
	        fragment = range.createContextualFragment(str);
	    } else {
	        fragment = document.createElement('body');
	        fragment.innerHTML = str;
	    }
	    return fragment.childNodes[0];
	}

	var specialElHandlers = {
	    /**
	     * Needed for IE. Apparently IE doesn't think that "selected" is an
	     * attribute when reading over the attributes using selectEl.attributes
	     */
	    OPTION: function OPTION(fromEl, toEl) {
	        fromEl.selected = toEl.selected;
	        if (fromEl.selected) {
	            fromEl.setAttribute('selected', '');
	        } else {
	            fromEl.removeAttribute('selected', '');
	        }
	    },
	    /**
	     * The "value" attribute is special for the <input> element since it sets
	     * the initial value. Changing the "value" attribute without changing the
	     * "value" property will have no effect since it is only used to the set the
	     * initial value.  Similar for the "checked" attribute, and "disabled".
	     */
	    INPUT: function INPUT(fromEl, toEl) {
	        fromEl.checked = toEl.checked;
	        if (fromEl.checked) {
	            fromEl.setAttribute('checked', '');
	        } else {
	            fromEl.removeAttribute('checked');
	        }

	        if (fromEl.value !== toEl.value) {
	            fromEl.value = toEl.value;
	        }

	        if (!hasAttributeNS(toEl, null, 'value')) {
	            fromEl.removeAttribute('value');
	        }

	        fromEl.disabled = toEl.disabled;
	        if (fromEl.disabled) {
	            fromEl.setAttribute('disabled', '');
	        } else {
	            fromEl.removeAttribute('disabled');
	        }
	    },

	    TEXTAREA: function TEXTAREA(fromEl, toEl) {
	        var newValue = toEl.value;
	        if (fromEl.value !== newValue) {
	            fromEl.value = newValue;
	        }

	        if (fromEl.firstChild) {
	            fromEl.firstChild.nodeValue = newValue;
	        }
	    }
	};

	function noop() {}

	/**
	 * Returns true if two node's names and namespace URIs are the same.
	 *
	 * @param {Element} a
	 * @param {Element} b
	 * @return {boolean}
	 */
	var compareNodeNames = function compareNodeNames(a, b) {
	    return a.nodeName === b.nodeName && a.namespaceURI === b.namespaceURI;
	};

	/**
	 * Create an element, optionally with a known namespace URI.
	 *
	 * @param {string} name the element name, e.g. 'div' or 'svg'
	 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
	 * its `xmlns` attribute or its inferred namespace.
	 *
	 * @return {Element}
	 */
	function createElementNS(name, namespaceURI) {
	    return !namespaceURI || namespaceURI === XHTML ? document.createElement(name) : document.createElementNS(namespaceURI, name);
	}

	/**
	 * Loop over all of the attributes on the target node and make sure the original
	 * DOM node has the same attributes. If an attribute found on the original node
	 * is not on the new node then remove it from the original node.
	 *
	 * @param  {Element} fromNode
	 * @param  {Element} toNode
	 */
	function morphAttrs(fromNode, toNode) {
	    var attrs = toNode.attributes;
	    var i;
	    var attr;
	    var attrName;
	    var attrNamespaceURI;
	    var attrValue;
	    var fromValue;

	    for (i = attrs.length - 1; i >= 0; i--) {
	        attr = attrs[i];
	        attrName = attr.name;
	        attrValue = attr.value;
	        attrNamespaceURI = attr.namespaceURI;

	        if (attrNamespaceURI) {
	            attrName = attr.localName || attrName;
	            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
	        } else {
	            fromValue = fromNode.getAttribute(attrName);
	        }

	        if (fromValue !== attrValue) {
	            if (attrNamespaceURI) {
	                fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
	            } else {
	                fromNode.setAttribute(attrName, attrValue);
	            }
	        }
	    }

	    // Remove any extra attributes found on the original DOM element that
	    // weren't found on the target element.
	    attrs = fromNode.attributes;

	    for (i = attrs.length - 1; i >= 0; i--) {
	        attr = attrs[i];
	        if (attr.specified !== false) {
	            attrName = attr.name;
	            attrNamespaceURI = attr.namespaceURI;

	            if (!hasAttributeNS(toNode, attrNamespaceURI, attrNamespaceURI ? attrName = attr.localName || attrName : attrName)) {
	                if (attrNamespaceURI) {
	                    fromNode.removeAttributeNS(attrNamespaceURI, attr.localName);
	                } else {
	                    fromNode.removeAttribute(attrName);
	                }
	            }
	        }
	    }
	}

	/**
	 * Copies the children of one DOM element to another DOM element
	 */
	function moveChildren(fromEl, toEl) {
	    var curChild = fromEl.firstChild;
	    while (curChild) {
	        var nextChild = curChild.nextSibling;
	        toEl.appendChild(curChild);
	        curChild = nextChild;
	    }
	    return toEl;
	}

	function defaultGetNodeKey(node) {
	    return node.id;
	}

	function morphdom(fromNode, toNode, options) {
	    if (!options) {
	        options = {};
	    }

	    if (typeof toNode === 'string') {
	        if (fromNode.nodeName === '#document' || fromNode.nodeName === 'HTML') {
	            var toNodeHtml = toNode;
	            toNode = document.createElement('html');
	            toNode.innerHTML = toNodeHtml;
	        } else {
	            toNode = toElement(toNode);
	        }
	    }

	    // XXX optimization: if the nodes are equal, don't morph them
	    /*
	    if (fromNode.isEqualNode(toNode)) {
	      return fromNode;
	    }
	    */

	    var savedEls = {}; // Used to save off DOM elements with IDs
	    var unmatchedEls = {};
	    var getNodeKey = options.getNodeKey || defaultGetNodeKey;
	    var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
	    var onNodeAdded = options.onNodeAdded || noop;
	    var onBeforeElUpdated = options.onBeforeElUpdated || options.onBeforeMorphEl || noop;
	    var onElUpdated = options.onElUpdated || noop;
	    var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
	    var onNodeDiscarded = options.onNodeDiscarded || noop;
	    var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || options.onBeforeMorphElChildren || noop;
	    var childrenOnly = options.childrenOnly === true;
	    var movedEls = [];

	    function removeNodeHelper(node, nestedInSavedEl) {
	        var id = getNodeKey(node);
	        // If the node has an ID then save it off since we will want
	        // to reuse it in case the target DOM tree has a DOM element
	        // with the same ID
	        if (id) {
	            savedEls[id] = node;
	        } else if (!nestedInSavedEl) {
	            // If we are not nested in a saved element then we know that this node has been
	            // completely discarded and will not exist in the final DOM.
	            onNodeDiscarded(node);
	        }

	        if (node.nodeType === ELEMENT_NODE) {
	            var curChild = node.firstChild;
	            while (curChild) {
	                removeNodeHelper(curChild, nestedInSavedEl || id);
	                curChild = curChild.nextSibling;
	            }
	        }
	    }

	    function walkDiscardedChildNodes(node) {
	        if (node.nodeType === ELEMENT_NODE) {
	            var curChild = node.firstChild;
	            while (curChild) {

	                if (!getNodeKey(curChild)) {
	                    // We only want to handle nodes that don't have an ID to avoid double
	                    // walking the same saved element.

	                    onNodeDiscarded(curChild);

	                    // Walk recursively
	                    walkDiscardedChildNodes(curChild);
	                }

	                curChild = curChild.nextSibling;
	            }
	        }
	    }

	    function removeNode(node, parentNode, alreadyVisited) {
	        if (onBeforeNodeDiscarded(node) === false) {
	            return;
	        }

	        parentNode.removeChild(node);
	        if (alreadyVisited) {
	            if (!getNodeKey(node)) {
	                onNodeDiscarded(node);
	                walkDiscardedChildNodes(node);
	            }
	        } else {
	            removeNodeHelper(node);
	        }
	    }

	    function morphEl(fromEl, toEl, alreadyVisited, childrenOnly) {
	        var toElKey = getNodeKey(toEl);
	        if (toElKey) {
	            // If an element with an ID is being morphed then it is will be in the final
	            // DOM so clear it out of the saved elements collection
	            delete savedEls[toElKey];
	        }

	        if (!childrenOnly) {
	            if (onBeforeElUpdated(fromEl, toEl) === false) {
	                return;
	            }

	            morphAttrs(fromEl, toEl);
	            onElUpdated(fromEl);

	            if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
	                return;
	            }
	        }

	        if (fromEl.nodeName !== 'TEXTAREA') {
	            var curToNodeChild = toEl.firstChild;
	            var curFromNodeChild = fromEl.firstChild;
	            var curToNodeId;

	            var fromNextSibling;
	            var toNextSibling;
	            var savedEl;
	            var unmatchedEl;

	            outer: while (curToNodeChild) {
	                toNextSibling = curToNodeChild.nextSibling;
	                curToNodeId = getNodeKey(curToNodeChild);

	                while (curFromNodeChild) {
	                    var curFromNodeId = getNodeKey(curFromNodeChild);
	                    fromNextSibling = curFromNodeChild.nextSibling;

	                    if (!alreadyVisited) {
	                        if (curFromNodeId && (unmatchedEl = unmatchedEls[curFromNodeId])) {
	                            unmatchedEl.parentNode.replaceChild(curFromNodeChild, unmatchedEl);
	                            morphEl(curFromNodeChild, unmatchedEl, alreadyVisited);
	                            curFromNodeChild = fromNextSibling;
	                            continue;
	                        }
	                    }

	                    var curFromNodeType = curFromNodeChild.nodeType;

	                    if (curFromNodeType === curToNodeChild.nodeType) {
	                        var isCompatible = false;

	                        // Both nodes being compared are Element nodes
	                        if (curFromNodeType === ELEMENT_NODE) {
	                            if (compareNodeNames(curFromNodeChild, curToNodeChild)) {
	                                // We have compatible DOM elements
	                                if (curFromNodeId || curToNodeId) {
	                                    // If either DOM element has an ID then we
	                                    // handle those differently since we want to
	                                    // match up by ID
	                                    if (curToNodeId === curFromNodeId) {
	                                        isCompatible = true;
	                                    }
	                                } else {
	                                    isCompatible = true;
	                                }
	                            }

	                            if (isCompatible) {
	                                // We found compatible DOM elements so transform
	                                // the current "from" node to match the current
	                                // target DOM node.
	                                morphEl(curFromNodeChild, curToNodeChild, alreadyVisited);
	                            }
	                            // Both nodes being compared are Text or Comment nodes
	                        } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
	                            isCompatible = true;
	                            // Simply update nodeValue on the original node to
	                            // change the text value
	                            curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
	                        }

	                        if (isCompatible) {
	                            curToNodeChild = toNextSibling;
	                            curFromNodeChild = fromNextSibling;
	                            continue outer;
	                        }
	                    }

	                    // No compatible match so remove the old node from the DOM
	                    // and continue trying to find a match in the original DOM
	                    removeNode(curFromNodeChild, fromEl, alreadyVisited);
	                    curFromNodeChild = fromNextSibling;
	                }

	                if (curToNodeId) {
	                    if (savedEl = savedEls[curToNodeId]) {
	                        if (compareNodeNames(savedEl, curToNodeChild)) {
	                            morphEl(savedEl, curToNodeChild, true);
	                            // We want to append the saved element instead
	                            curToNodeChild = savedEl;
	                        } else {
	                            delete savedEls[curToNodeId];
	                            onNodeDiscarded(savedEl);
	                        }
	                    } else {
	                        // The current DOM element in the target tree has an ID
	                        // but we did not find a match in any of the
	                        // corresponding siblings. We just put the target
	                        // element in the old DOM tree but if we later find an
	                        // element in the old DOM tree that has a matching ID
	                        // then we will replace the target element with the
	                        // corresponding old element and morph the old element
	                        unmatchedEls[curToNodeId] = curToNodeChild;
	                    }
	                }

	                // If we got this far then we did not find a candidate match for
	                // our "to node" and we exhausted all of the children "from"
	                // nodes. Therefore, we will just append the current "to node"
	                // to the end
	                if (onBeforeNodeAdded(curToNodeChild) !== false) {
	                    fromEl.appendChild(curToNodeChild);
	                    onNodeAdded(curToNodeChild);
	                }

	                if (curToNodeChild.nodeType === ELEMENT_NODE && (curToNodeId || curToNodeChild.firstChild)) {
	                    // The element that was just added to the original DOM may
	                    // have some nested elements with a key/ID that needs to be
	                    // matched up with other elements. We'll add the element to
	                    // a list so that we can later process the nested elements
	                    // if there are any unmatched keyed elements that were
	                    // discarded
	                    movedEls.push(curToNodeChild);
	                }

	                curToNodeChild = toNextSibling;
	                curFromNodeChild = fromNextSibling;
	            }

	            // We have processed all of the "to nodes". If curFromNodeChild is
	            // non-null then we still have some from nodes left over that need
	            // to be removed
	            while (curFromNodeChild) {
	                fromNextSibling = curFromNodeChild.nextSibling;
	                removeNode(curFromNodeChild, fromEl, alreadyVisited);
	                curFromNodeChild = fromNextSibling;
	            }
	        }

	        var specialElHandler = specialElHandlers[fromEl.nodeName];
	        if (specialElHandler) {
	            specialElHandler(fromEl, toEl);
	        }
	    } // END: morphEl(...)

	    var morphedNode = fromNode;
	    var morphedNodeType = morphedNode.nodeType;
	    var toNodeType = toNode.nodeType;

	    if (!childrenOnly) {
	        // Handle the case where we are given two DOM nodes that are not
	        // compatible (e.g. <div> --> <span> or <div> --> TEXT)
	        if (morphedNodeType === ELEMENT_NODE) {
	            if (toNodeType === ELEMENT_NODE) {
	                if (!compareNodeNames(fromNode, toNode)) {
	                    onNodeDiscarded(fromNode);
	                    morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
	                }
	            } else {
	                // Going from an element node to a text node
	                morphedNode = toNode;
	            }
	        } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) {
	            // Text or comment node
	            if (toNodeType === morphedNodeType) {
	                morphedNode.nodeValue = toNode.nodeValue;
	                return morphedNode;
	            } else {
	                // Text node to something else
	                morphedNode = toNode;
	            }
	        }
	    }

	    if (morphedNode === toNode) {
	        // The "to node" was not compatible with the "from node" so we had to
	        // toss out the "from node" and use the "to node"
	        onNodeDiscarded(fromNode);
	    } else {
	        morphEl(morphedNode, toNode, false, childrenOnly);

	        /**
	         * What we will do here is walk the tree for the DOM element that was
	         * moved from the target DOM tree to the original DOM tree and we will
	         * look for keyed elements that could be matched to keyed elements that
	         * were earlier discarded.  If we find a match then we will move the
	         * saved element into the final DOM tree.
	         */
	        var handleMovedEl = function handleMovedEl(el) {
	            var curChild = el.firstChild;
	            while (curChild) {
	                var nextSibling = curChild.nextSibling;

	                var key = getNodeKey(curChild);
	                if (key) {
	                    var savedEl = savedEls[key];
	                    if (savedEl && compareNodeNames(curChild, savedEl)) {
	                        curChild.parentNode.replaceChild(savedEl, curChild);
	                        // true: already visited the saved el tree
	                        morphEl(savedEl, curChild, true);
	                        curChild = nextSibling;
	                        if (empty(savedEls)) {
	                            return false;
	                        }
	                        continue;
	                    }
	                }

	                if (curChild.nodeType === ELEMENT_NODE) {
	                    handleMovedEl(curChild);
	                }

	                curChild = nextSibling;
	            }
	        };

	        // The loop below is used to possibly match up any discarded
	        // elements in the original DOM tree with elemenets from the
	        // target tree that were moved over without visiting their
	        // children
	        if (!empty(savedEls)) {
	            handleMovedElsLoop: while (movedEls.length) {
	                var movedElsTemp = movedEls;
	                movedEls = [];
	                for (var i = 0; i < movedElsTemp.length; i++) {
	                    if (handleMovedEl(movedElsTemp[i]) === false) {
	                        // There are no more unmatched elements so completely end
	                        // the loop
	                        break handleMovedElsLoop;
	                    }
	                }
	            }
	        }

	        // Fire the "onNodeDiscarded" event for any saved elements
	        // that never found a new home in the morphed DOM
	        for (var savedElId in savedEls) {
	            if (savedEls.hasOwnProperty(savedElId)) {
	                var savedEl = savedEls[savedElId];
	                onNodeDiscarded(savedEl);
	                walkDiscardedChildNodes(savedEl);
	            }
	        }
	    }

	    if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
	        // If we had to swap out the from node with a new node because the old
	        // node was not compatible with the target node then we need to
	        // replace the old DOM node in the original DOM tree. This is only
	        // possible if the original DOM node was part of a DOM tree which
	        // we know is the case if it has a parent node.
	        fromNode.parentNode.replaceChild(morphedNode, fromNode);
	    }

	    return morphedNode;
	}

	module.exports = morphdom;
	});

	var morphdom = interopDefault(index);

	function isFunction(obj) {
	  return !!(obj && obj.constructor && obj.call && obj.apply);
	};

	var productTemplate = {
	  img: '<div class="{{data.classes.product.imgWrapper}}"><img class="{{data.classes.product.img}}" src="{{data.currentImage.src}}" /></div>',
	  title: '<h1 class="{{data.classes.product.title}}">{{data.title}}</h1>',
	  variantTitle: '{{#data.hasVariants}}<h2 class="{{data.classes.product.variantTitle}}">{{data.selectedVariant.title}}</h2>{{/data.hasVariants}}',
	  options: '{{#data.hasVariants}}<div class="{{data.classes.product.options}}">{{{data.optionsHtml}}}</div>{{/data.hasVariants}}',
	  price: '<div class="{{data.classes.product.prices}}">\n            {{#data.selectedVariant}}\n            {{#data.selectedVariant.compareAtPrice}}<span class="{{data.classes.product.compareAt}}">${{data.selectedVariant.compareAtPrice}}</span>{{/data.selectedVariant.compareAtPrice}}\n            <span class="{{data.classes.product.price}} {{data.priceClass}}">${{data.selectedVariant.price}}</span>\n            {{/data.selectedVariant}}\n          </div>',
	  description: '<div class="{{data.classes.product.description}}">{{{data.description}}}</div>',
	  button: '<button {{#data.buttonDisabled}}disabled{{/data.buttonDisabled}} class="{{data.classes.product.button}} {{data.buttonClass}}">{{data.buttonText}}</button>',
	  quantity: '<div class="{{data.classes.product.quantity}} {{data.quantityClass}}">\n              {{#data.contents.quantityDecrement}}\n                <button class="{{data.classes.product.quantityButton}} {{data.classes.product.quantityDecrement}}" type="button"><span>-</span><span class="visuallyhidden">Decrement</span></button>\n              {{/data.contents.quantityDecrement}}\n              {{#data.contents.quantityInput}}\n                <input class="{{data.classes.product.quantityInput}}" type="number" min="0" aria-label="Quantity" value="{{data.selectedQuantity}}">\n              {{/data.contents.quantityInput}}\n              {{#data.contents.quantityIncrement}}\n                <button class="{{data.classes.product.quantityButton}} {{data.classes.product.quantityIncrement}}" type="button"><span>+</span><span class="visuallyhidden">Increment</span></button>\n              {{/data.contents.quantityIncrement}}\n             </div>'
	};

	var cartTemplates = {
	  title: "<div class=\"{{data.classes.cart.header}}\">\n            <h2 class=\"{{data.classes.cart.title}}\">{{data.text.title}}</h2>\n            <button class=\"{{data.classes.cart.close}}\">\n              <span aria-role=\"hidden\">×</span>\n              <span class=\"visuallyhidden\">Close</span>\n             </button>\n          </div>",
	  lineItems: "<div class=\"{{data.classes.cart.cartScroll}}\">\n                {{#data.isEmpty}}<p class=\"{{data.classes.cart.emptyCart}}\">{{data.text.empty}}</p>{{/data.isEmpty}}\n                <div class=\"{{data.classes.cart.lineItems}}\">{{{data.lineItemsHtml}}}</div>\n              </div>",
	  footer: "<div class=\"{{data.classes.cart.footer}}\">\n            <p class=\"{{data.classes.cart.subtotalText}}\">{{data.text.total}}</p>\n            <p class=\"{{data.classes.cart.subtotal}}\"><span class=\"{{data.classes.currency}}\"></span>${{data.subtotal}}</p>\n            <p class=\"{{data.classes.cart.notice}}\">{{data.text.notice}}</p>\n            <button class=\"{{data.classes.cart.button}}\" type=\"button\">{{data.text.button}}</button>\n          </div>"
	};

	var optionTemplates = {
	  option: "<div class={{data.classes.option.option}}>\n    <label class=\"{{data.classes.option.label}}\">{{data.name}}</label>\n      <div class=\"{{data.classes.option.wrapper}}\">\n      <select class=\"{{data.classes.option.select}}\" name=\"{{data.name}}\">\n        {{#data.values}}\n          <option {{#disabled}}disabled{{/disabled}} {{#selected}}selected{{/selected}} value={{name}}>{{name}}</option>\n        {{/data.values}}\n      </select>\n      <svg class=\"shopify-select-icon\" viewBox=\"0 0 24 24\"><path d=\"M21 5.176l-9.086 9.353L3 5.176.686 7.647 12 19.382 23.314 7.647 21 5.176z\"></path></svg>\n    </div>\n  </div>"
	};

	var toggleTemplates = {
	  title: '<h5 class="{{data.classes.toggle.title}}">{{data.text.title}}</h5>',
	  icon: '<svg xmlns="http://www.w3.org/2000/svg" class="{{data.classes.toggle.icon}}" viewBox="0 0 25 25" enable-background="new 0 0 25 25"><g class="{{data.classes.toggle.iconPath}}"><path d="M24.6 3.6c-.3-.4-.8-.6-1.3-.6h-18.4l-.1-.5c-.3-1.5-1.7-1.5-2.5-1.5h-1.3c-.6 0-1 .4-1 1s.4 1 1 1h1.8l3 13.6c.2 1.2 1.3 2.4 2.5 2.4h12.7c.6 0 1-.4 1-1s-.4-1-1-1h-12.7c-.2 0-.5-.4-.6-.8l-.2-1.2h12.6c1.3 0 2.3-1.4 2.5-2.4l2.4-7.4v-.2c.1-.5-.1-1-.4-1.4zm-4 8.5v.2c-.1.3-.4.8-.5.8h-13l-1.8-8.1h17.6l-2.3 7.1z"/><circle cx="9" cy="22" r="2"/><circle cx="19" cy="22" r="2"/></g></svg>',
	  count: '<div class="{{data.classes.toggle.count}}">{{data.count}}</div>'
	};

	var lineItemTemplates = {
	  image: '<div class="{{data.classes.lineItem.image}}" style="background-image: url({{data.image.src}})"></div>',
	  variantTitle: '<div class="{{data.classes.lineItem.variantTitle}}">{{data.variant_title}}</div>',

	  title: '<span class="{{data.classes.lineItem.itemTitle}}">{{data.title}}</span>',
	  price: '<span class="{{data.classes.lineItem.price}}">${{data.line_price}}</span>',
	  quantity: '<div class="{{data.classes.lineItem.quantity}}">\n              <button class="{{data.classes.lineItem.quantityButton}} {{data.classes.lineItem.quantityDecrement}}" type="button" data-line-item-id="{{data.id}}"><span>-</span><span class="visuallyhidden">Decrement</span></button>\n              <input class="{{data.classes.lineItem.quantityInput}}" type="number" min="0" aria-label="Quantity" data-line-item-id="{{data.id}}" value="{{data.quantity}}">\n              <button class="{{data.classes.lineItem.quantityButton}} {{data.classes.lineItem.quantityIncrement}}" type="button" data-line-item-id="{{data.id}}"><span>+</span><span class="visuallyhidden">Increment</span></button>\n            </div>'
	};

	var modalTemplates = {
	  contents: "\n              <button class=\"{{data.classes.modal.close}}\">\n                <span aria-role=\"hidden\">×</span>\n                <span class=\"visuallyhidden\">Close</span>\n              </button>\n            "
	};

	var defaults$1 = {
	  product: {
	    iframe: true,
	    buttonDestination: 'cart',
	    layout: 'vertical',
	    manifest: ['product', 'option'],
	    width: '240px',
	    order: ['img', 'title', 'variantTitle', 'price', 'options', 'description', 'quantity', 'button'],
	    contents: {
	      img: true,
	      title: true,
	      variantTitle: false,
	      price: true,
	      options: true,
	      quantity: false,
	      quantityIncrement: false,
	      quantityDecrement: false,
	      quantityInput: true,
	      button: true,
	      description: false
	    },
	    templates: productTemplate,
	    classes: {
	      wrapper: 'product-wrapper',
	      product: 'product',
	      img: 'product__variant-img',
	      imgWrapper: 'product-img-wrapper',
	      blockButton: 'btn--parent',
	      button: 'btn',
	      title: 'product__title',
	      prices: 'product__price',
	      price: 'product__actual-price',
	      compareAt: 'product__compare-price',
	      loweredPrice: 'price--lowered',
	      variantTitle: 'product__variant-title',
	      description: 'product-description',
	      options: 'product__variant-selectors',
	      disabled: 'btn-disabled',
	      buttonBesideQty: 'beside-quantity',
	      quantity: 'quantity-container',
	      quantityInput: 'quantity',
	      quantityButton: 'btn--seamless',
	      quantityIncrement: 'quantity-increment',
	      quantityDecrement: 'quantity-decrement'
	    },
	    text: {
	      button: 'SHOP NOW',
	      outOfStock: 'Out of stock',
	      unavailable: 'Unavailable'
	    }
	  },
	  modalProduct: {
	    iframe: false,
	    layout: 'horizontal',
	    contents: {
	      img: true,
	      title: true,
	      variantTitle: false,
	      price: true,
	      options: true,
	      button: true,
	      quantity: true,
	      quantityIncrement: false,
	      quantityDecrement: false,
	      quantityInput: true,
	      description: true
	    },
	    order: ['img', 'title', 'variantTitle', 'price', 'options', 'quantity', 'button', 'description'],
	    classes: {
	      wrapper: 'modal-product-wrapper',
	      hasImage: 'has-image'
	    },
	    buttonDestination: 'cart',
	    text: {
	      button: 'ADD TO CART'
	    }
	  },
	  modal: {
	    iframe: true,
	    manifest: ['modal', 'product', 'option'],
	    classes: {
	      modal: 'modal',
	      contents: 'modal-contents',
	      close: 'btn--close',
	      wrapper: 'modal-wrapper',
	      product: 'product-modal',
	      img: 'modal-img',
	      footer: 'modal-footer',
	      footerWithImg: 'modal-footer--has-img',
	      imgWithImg: 'modal-img--has-img',
	      contentsWithImg: 'modal-contents--has-img',
	      scrollContents: 'modal-scroll-contents'
	    },
	    contents: {
	      contents: true
	    },
	    order: ['contents'],
	    templates: modalTemplates
	  },
	  productSet: {
	    iframe: true,
	    manifest: ['product', 'option', 'productSet'],
	    contents: {
	      title: false,
	      products: true,
	      pagination: true
	    },
	    order: ['title', 'products', 'pagination'],
	    templates: {
	      title: '<h2 class="{{data.classes.productSet.title}}">{{data.collection.attrs.title}}</h2>',
	      products: '<div class="{{data.classes.productSet.products}}"></div>',
	      pagination: '<button class="{{data.classes.productSet.paginationButton}} {{data.nextButtonClass}}">{{data.text.nextPageButton}}</button>'
	    },
	    classes: {
	      wrapper: 'collection-wrapper',
	      productSet: 'collection',
	      title: 'collection__title',
	      collection: 'collection',
	      products: 'collection-products',
	      paginationButton: 'collection-pagination-button btn'
	    },
	    text: {
	      nextPageButton: 'Next page'
	    }
	  },
	  option: {
	    templates: optionTemplates,
	    contents: {
	      option: true
	    },
	    order: ['option'],
	    classes: {
	      option: 'option-select',
	      wrapper: 'option-select-wrapper',
	      select: 'option-select__select',
	      label: 'option-select__label'
	    }
	  },
	  cart: {
	    iframe: true,
	    templates: cartTemplates,
	    startOpen: false,
	    manifest: ['cart', 'lineItem', 'toggle'],
	    contents: {
	      title: true,
	      lineItems: true,
	      footer: true
	    },
	    order: ['title', 'lineItems', 'footer'],
	    classes: {
	      wrapper: 'cart-wrapper',
	      cart: 'cart',
	      header: 'cart__header',
	      title: 'cart__title',
	      lineItems: 'cart-items',
	      footer: 'cart-bottom',
	      subtotalText: 'cart__subtotal__text',
	      subtotal: 'cart__subtotal__price',
	      notice: 'cart__notice',
	      currency: 'cart__currency',
	      button: 'btn btn--cart-checkout',
	      close: 'btn--close',
	      cartScroll: 'cart-scroll',
	      emptyCart: 'cart-empty-text'
	    },
	    text: {
	      title: 'Cart',
	      empty: 'Your cart is empty.',
	      button: 'Checkout',
	      total: 'Total',
	      currency: 'CAD',
	      notice: 'Shipping and discount codes are added at checkout.'
	    }
	  },
	  lineItem: {
	    templates: lineItemTemplates,
	    contents: {
	      image: true,
	      variantTitle: true,
	      title: true,
	      price: true,
	      quantity: true,
	      quantityIncrement: true,
	      quantityDecrement: true,
	      quantityInput: true
	    },
	    order: ['image', 'variantTitle', 'title', 'price', 'quantity'],
	    classes: {
	      lineItem: 'cart-item',
	      image: 'cart-item__image',
	      variantTitle: 'cart-item__variant-title',
	      itemTitle: 'cart-item__title',
	      price: 'cart-item__price',
	      quantity: 'quantity-container',
	      quantityInput: 'quantity cart-item__quantity-input',
	      quantityButton: 'btn--seamless',
	      quantityIncrement: 'quantity-increment',
	      quantityDecrement: 'quantity-decrement'
	    }
	  },
	  toggle: {
	    templates: toggleTemplates,
	    manifest: ['toggle'],
	    iframe: true,
	    sticky: true,
	    contents: {
	      count: true,
	      icon: true,
	      title: false
	    },
	    order: ['count', 'icon', 'title'],
	    classes: {
	      wrapper: 'cart-toggle-wrapper',
	      toggle: 'cart-toggle',
	      title: 'cart-toggle__title',
	      count: 'cart-toggle__count',
	      icon: 'icon-cart icon-cart--side',
	      iconPath: 'icon-cart__group'
	    },
	    text: {
	      title: 'cart'
	    }
	  },
	  window: {
	    height: 600,
	    width: 600,
	    toolbar: 0,
	    scrollbars: 0,
	    status: 0,
	    resizable: 1,
	    left: 0,
	    top: 0,
	    center: 0,
	    createnew: 1,
	    location: 0,
	    menubar: 0,
	    onUnload: null
	  }
	};

	function wrapConsole$1(logCommand) {
	  var logMethod = function logMethod() {
	    var hostConsole = window.console;
	    var args = Array.prototype.slice.apply(arguments).join(' ');
	    /* eslint-disable no-console */
	    if (hostConsole) {
	      hostConsole[logCommand](args);
	    }
	    /* eslint-enable no-console */
	  };

	  return function () {
	    var args = [].concat(Array.prototype.slice.call(arguments));

	    args.unshift('[SHOPIFY-BUY-UI]: ');
	    logMethod.apply(undefined, toConsumableArray(args));
	  };
	}

	var logger$1 = {
	  debug: wrapConsole$1('debug'),
	  info: wrapConsole$1('info'),
	  warn: wrapConsole$1('warn'),
	  error: wrapConsole$1('error'),
	  log: wrapConsole$1('log')
	};

	function isArray(arg) {
	  return Object.prototype.toString.call(arg) === '[object Array]';
	}

	function logNotFound(component) {
	  var errInfo = '';
	  if (component.id) {
	    if (isArray(component.id)) {
	      errInfo = 'for ids ' + component.id.join(', ') + '.';
	    } else {
	      errInfo = 'for id ' + component.id + '.';
	    }
	  } else if (component.handle) {
	    errInfo = 'for handle "' + component.handle + '".';
	  }
	  var message = 'Not Found: ' + component.typeKey + ' not found ' + errInfo;
	  logger$1.warn(message);
	}

	var compiler = createCommonjsModule(function (module, exports) {
	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */

	(function (Hogan) {
	  // Setup regex  assignments
	  // remove whitespace according to Mustache spec
	  var rIsWhitespace = /\S/,
	      rQuot = /\"/g,
	      rNewline =  /\n/g,
	      rCr = /\r/g,
	      rSlash = /\\/g,
	      rLineSep = /\u2028/,
	      rParagraphSep = /\u2029/;

	  Hogan.tags = {
	    '#': 1, '^': 2, '<': 3, '$': 4,
	    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
	    '{': 10, '&': 11, '_t': 12
	  };

	  Hogan.scan = function scan(text, delimiters) {
	    var len = text.length,
	        IN_TEXT = 0,
	        IN_TAG_TYPE = 1,
	        IN_TAG = 2,
	        state = IN_TEXT,
	        tagType = null,
	        tag = null,
	        buf = '',
	        tokens = [],
	        seenTag = false,
	        i = 0,
	        lineStart = 0,
	        otag = '{{',
	        ctag = '}}';

	    function addBuf() {
	      if (buf.length > 0) {
	        tokens.push({tag: '_t', text: new String(buf)});
	        buf = '';
	      }
	    }

	    function lineIsWhitespace() {
	      var isAllWhitespace = true;
	      for (var j = lineStart; j < tokens.length; j++) {
	        isAllWhitespace =
	          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
	          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
	        if (!isAllWhitespace) {
	          return false;
	        }
	      }

	      return isAllWhitespace;
	    }

	    function filterLine(haveSeenTag, noNewLine) {
	      addBuf();

	      if (haveSeenTag && lineIsWhitespace()) {
	        for (var j = lineStart, next; j < tokens.length; j++) {
	          if (tokens[j].text) {
	            if ((next = tokens[j+1]) && next.tag == '>') {
	              // set indent to token value
	              next.indent = tokens[j].text.toString()
	            }
	            tokens.splice(j, 1);
	          }
	        }
	      } else if (!noNewLine) {
	        tokens.push({tag:'\n'});
	      }

	      seenTag = false;
	      lineStart = tokens.length;
	    }

	    function changeDelimiters(text, index) {
	      var close = '=' + ctag,
	          closeIndex = text.indexOf(close, index),
	          delimiters = trim(
	            text.substring(text.indexOf('=', index) + 1, closeIndex)
	          ).split(' ');

	      otag = delimiters[0];
	      ctag = delimiters[delimiters.length - 1];

	      return closeIndex + close.length - 1;
	    }

	    if (delimiters) {
	      delimiters = delimiters.split(' ');
	      otag = delimiters[0];
	      ctag = delimiters[1];
	    }

	    for (i = 0; i < len; i++) {
	      if (state == IN_TEXT) {
	        if (tagChange(otag, text, i)) {
	          --i;
	          addBuf();
	          state = IN_TAG_TYPE;
	        } else {
	          if (text.charAt(i) == '\n') {
	            filterLine(seenTag);
	          } else {
	            buf += text.charAt(i);
	          }
	        }
	      } else if (state == IN_TAG_TYPE) {
	        i += otag.length - 1;
	        tag = Hogan.tags[text.charAt(i + 1)];
	        tagType = tag ? text.charAt(i + 1) : '_v';
	        if (tagType == '=') {
	          i = changeDelimiters(text, i);
	          state = IN_TEXT;
	        } else {
	          if (tag) {
	            i++;
	          }
	          state = IN_TAG;
	        }
	        seenTag = i;
	      } else {
	        if (tagChange(ctag, text, i)) {
	          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
	                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
	          buf = '';
	          i += ctag.length - 1;
	          state = IN_TEXT;
	          if (tagType == '{') {
	            if (ctag == '}}') {
	              i++;
	            } else {
	              cleanTripleStache(tokens[tokens.length - 1]);
	            }
	          }
	        } else {
	          buf += text.charAt(i);
	        }
	      }
	    }

	    filterLine(seenTag, true);

	    return tokens;
	  }

	  function cleanTripleStache(token) {
	    if (token.n.substr(token.n.length - 1) === '}') {
	      token.n = token.n.substring(0, token.n.length - 1);
	    }
	  }

	  function trim(s) {
	    if (s.trim) {
	      return s.trim();
	    }

	    return s.replace(/^\s*|\s*$/g, '');
	  }

	  function tagChange(tag, text, index) {
	    if (text.charAt(index) != tag.charAt(0)) {
	      return false;
	    }

	    for (var i = 1, l = tag.length; i < l; i++) {
	      if (text.charAt(index + i) != tag.charAt(i)) {
	        return false;
	      }
	    }

	    return true;
	  }

	  // the tags allowed inside super templates
	  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

	  function buildTree(tokens, kind, stack, customTags) {
	    var instructions = [],
	        opener = null,
	        tail = null,
	        token = null;

	    tail = stack[stack.length - 1];

	    while (tokens.length > 0) {
	      token = tokens.shift();

	      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
	        throw new Error('Illegal content in < super tag.');
	      }

	      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
	        stack.push(token);
	        token.nodes = buildTree(tokens, token.tag, stack, customTags);
	      } else if (token.tag == '/') {
	        if (stack.length === 0) {
	          throw new Error('Closing tag without opener: /' + token.n);
	        }
	        opener = stack.pop();
	        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
	          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
	        }
	        opener.end = token.i;
	        return instructions;
	      } else if (token.tag == '\n') {
	        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
	      }

	      instructions.push(token);
	    }

	    if (stack.length > 0) {
	      throw new Error('missing closing tag: ' + stack.pop().n);
	    }

	    return instructions;
	  }

	  function isOpener(token, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].o == token.n) {
	        token.tag = '#';
	        return true;
	      }
	    }
	  }

	  function isCloser(close, open, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].c == close && tags[i].o == open) {
	        return true;
	      }
	    }
	  }

	  function stringifySubstitutions(obj) {
	    var items = [];
	    for (var key in obj) {
	      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
	    }
	    return "{ " + items.join(",") + " }";
	  }

	  function stringifyPartials(codeObj) {
	    var partials = [];
	    for (var key in codeObj.partials) {
	      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
	    }
	    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
	  }

	  Hogan.stringify = function(codeObj, text, options) {
	    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
	  }

	  var serialNo = 0;
	  Hogan.generate = function(tree, text, options) {
	    serialNo = 0;
	    var context = { code: '', subs: {}, partials: {} };
	    Hogan.walk(tree, context);

	    if (options.asString) {
	      return this.stringify(context, text, options);
	    }

	    return this.makeTemplate(context, text, options);
	  }

	  Hogan.wrapMain = function(code) {
	    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
	  }

	  Hogan.template = Hogan.Template;

	  Hogan.makeTemplate = function(codeObj, text, options) {
	    var template = this.makePartials(codeObj);
	    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
	    return new this.template(template, text, this, options);
	  }

	  Hogan.makePartials = function(codeObj) {
	    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
	    for (key in template.partials) {
	      template.partials[key] = this.makePartials(template.partials[key]);
	    }
	    for (key in codeObj.subs) {
	      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
	    }
	    return template;
	  }

	  function esc(s) {
	    return s.replace(rSlash, '\\\\')
	            .replace(rQuot, '\\\"')
	            .replace(rNewline, '\\n')
	            .replace(rCr, '\\r')
	            .replace(rLineSep, '\\u2028')
	            .replace(rParagraphSep, '\\u2029');
	  }

	  function chooseMethod(s) {
	    return (~s.indexOf('.')) ? 'd' : 'f';
	  }

	  function createPartial(node, context) {
	    var prefix = "<" + (context.prefix || "");
	    var sym = prefix + node.n + serialNo++;
	    context.partials[sym] = {name: node.n, partials: {}};
	    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
	    return sym;
	  }

	  Hogan.codegen = {
	    '#': function(node, context) {
	      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
	                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
	                      't.rs(c,p,' + 'function(c,p,t){';
	      Hogan.walk(node.nodes, context);
	      context.code += '});c.pop();}';
	    },

	    '^': function(node, context) {
	      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
	      Hogan.walk(node.nodes, context);
	      context.code += '};';
	    },

	    '>': createPartial,
	    '<': function(node, context) {
	      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
	      Hogan.walk(node.nodes, ctx);
	      var template = context.partials[createPartial(node, context)];
	      template.subs = ctx.subs;
	      template.partials = ctx.partials;
	    },

	    '$': function(node, context) {
	      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
	      Hogan.walk(node.nodes, ctx);
	      context.subs[node.n] = ctx.code;
	      if (!context.inPartial) {
	        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
	      }
	    },

	    '\n': function(node, context) {
	      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
	    },

	    '_v': function(node, context) {
	      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	    },

	    '_t': function(node, context) {
	      context.code += write('"' + esc(node.text) + '"');
	    },

	    '{': tripleStache,

	    '&': tripleStache
	  }

	  function tripleStache(node, context) {
	    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	  }

	  function write(s) {
	    return 't.b(' + s + ');';
	  }

	  Hogan.walk = function(nodelist, context) {
	    var func;
	    for (var i = 0, l = nodelist.length; i < l; i++) {
	      func = Hogan.codegen[nodelist[i].tag];
	      func && func(nodelist[i], context);
	    }
	    return context;
	  }

	  Hogan.parse = function(tokens, text, options) {
	    options = options || {};
	    return buildTree(tokens, '', [], options.sectionTags || []);
	  }

	  Hogan.cache = {};

	  Hogan.cacheKey = function(text, options) {
	    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
	  }

	  Hogan.compile = function(text, options) {
	    options = options || {};
	    var key = Hogan.cacheKey(text, options);
	    var template = this.cache[key];

	    if (template) {
	      var partials = template.partials;
	      for (var name in partials) {
	        delete partials[name].instance;
	      }
	      return template;
	    }

	    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
	    return this.cache[key] = template;
	  }
	})(typeof exports !== 'undefined' ? exports : Hogan);
	});

	var compiler$1 = interopDefault(compiler);


	var require$$1 = Object.freeze({
	  default: compiler$1
	});

	var template = createCommonjsModule(function (module, exports) {
	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */

	var Hogan = {};

	(function (Hogan) {
	  Hogan.Template = function (codeObj, text, compiler, options) {
	    codeObj = codeObj || {};
	    this.r = codeObj.code || this.r;
	    this.c = compiler;
	    this.options = options || {};
	    this.text = text || '';
	    this.partials = codeObj.partials || {};
	    this.subs = codeObj.subs || {};
	    this.buf = '';
	  }

	  Hogan.Template.prototype = {
	    // render: replaced by generated code.
	    r: function (context, partials, indent) { return ''; },

	    // variable escaping
	    v: hoganEscape,

	    // triple stache
	    t: coerceToString,

	    render: function render(context, partials, indent) {
	      return this.ri([context], partials || {}, indent);
	    },

	    // render internal -- a hook for overrides that catches partials too
	    ri: function (context, partials, indent) {
	      return this.r(context, partials, indent);
	    },

	    // ensurePartial
	    ep: function(symbol, partials) {
	      var partial = this.partials[symbol];

	      // check to see that if we've instantiated this partial before
	      var template = partials[partial.name];
	      if (partial.instance && partial.base == template) {
	        return partial.instance;
	      }

	      if (typeof template == 'string') {
	        if (!this.c) {
	          throw new Error("No compiler available.");
	        }
	        template = this.c.compile(template, this.options);
	      }

	      if (!template) {
	        return null;
	      }

	      // We use this to check whether the partials dictionary has changed
	      this.partials[symbol].base = template;

	      if (partial.subs) {
	        // Make sure we consider parent template now
	        if (!partials.stackText) partials.stackText = {};
	        for (key in partial.subs) {
	          if (!partials.stackText[key]) {
	            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
	          }
	        }
	        template = createSpecializedPartial(template, partial.subs, partial.partials,
	          this.stackSubs, this.stackPartials, partials.stackText);
	      }
	      this.partials[symbol].instance = template;

	      return template;
	    },

	    // tries to find a partial in the current scope and render it
	    rp: function(symbol, context, partials, indent) {
	      var partial = this.ep(symbol, partials);
	      if (!partial) {
	        return '';
	      }

	      return partial.ri(context, partials, indent);
	    },

	    // render a section
	    rs: function(context, partials, section) {
	      var tail = context[context.length - 1];

	      if (!isArray(tail)) {
	        section(context, partials, this);
	        return;
	      }

	      for (var i = 0; i < tail.length; i++) {
	        context.push(tail[i]);
	        section(context, partials, this);
	        context.pop();
	      }
	    },

	    // maybe start a section
	    s: function(val, ctx, partials, inverted, start, end, tags) {
	      var pass;

	      if (isArray(val) && val.length === 0) {
	        return false;
	      }

	      if (typeof val == 'function') {
	        val = this.ms(val, ctx, partials, inverted, start, end, tags);
	      }

	      pass = !!val;

	      if (!inverted && pass && ctx) {
	        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
	      }

	      return pass;
	    },

	    // find values with dotted names
	    d: function(key, ctx, partials, returnFound) {
	      var found,
	          names = key.split('.'),
	          val = this.f(names[0], ctx, partials, returnFound),
	          doModelGet = this.options.modelGet,
	          cx = null;

	      if (key === '.' && isArray(ctx[ctx.length - 2])) {
	        val = ctx[ctx.length - 1];
	      } else {
	        for (var i = 1; i < names.length; i++) {
	          found = findInScope(names[i], val, doModelGet);
	          if (found !== undefined) {
	            cx = val;
	            val = found;
	          } else {
	            val = '';
	          }
	        }
	      }

	      if (returnFound && !val) {
	        return false;
	      }

	      if (!returnFound && typeof val == 'function') {
	        ctx.push(cx);
	        val = this.mv(val, ctx, partials);
	        ctx.pop();
	      }

	      return val;
	    },

	    // find values with normal names
	    f: function(key, ctx, partials, returnFound) {
	      var val = false,
	          v = null,
	          found = false,
	          doModelGet = this.options.modelGet;

	      for (var i = ctx.length - 1; i >= 0; i--) {
	        v = ctx[i];
	        val = findInScope(key, v, doModelGet);
	        if (val !== undefined) {
	          found = true;
	          break;
	        }
	      }

	      if (!found) {
	        return (returnFound) ? false : "";
	      }

	      if (!returnFound && typeof val == 'function') {
	        val = this.mv(val, ctx, partials);
	      }

	      return val;
	    },

	    // higher order templates
	    ls: function(func, cx, partials, text, tags) {
	      var oldTags = this.options.delimiters;

	      this.options.delimiters = tags;
	      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
	      this.options.delimiters = oldTags;

	      return false;
	    },

	    // compile text
	    ct: function(text, cx, partials) {
	      if (this.options.disableLambda) {
	        throw new Error('Lambda features disabled.');
	      }
	      return this.c.compile(text, this.options).render(cx, partials);
	    },

	    // template result buffering
	    b: function(s) { this.buf += s; },

	    fl: function() { var r = this.buf; this.buf = ''; return r; },

	    // method replace section
	    ms: function(func, ctx, partials, inverted, start, end, tags) {
	      var textSource,
	          cx = ctx[ctx.length - 1],
	          result = func.call(cx);

	      if (typeof result == 'function') {
	        if (inverted) {
	          return true;
	        } else {
	          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
	          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
	        }
	      }

	      return result;
	    },

	    // method replace variable
	    mv: function(func, ctx, partials) {
	      var cx = ctx[ctx.length - 1];
	      var result = func.call(cx);

	      if (typeof result == 'function') {
	        return this.ct(coerceToString(result.call(cx)), cx, partials);
	      }

	      return result;
	    },

	    sub: function(name, context, partials, indent) {
	      var f = this.subs[name];
	      if (f) {
	        this.activeSub = name;
	        f(context, partials, this, indent);
	        this.activeSub = false;
	      }
	    }

	  };

	  //Find a key in an object
	  function findInScope(key, scope, doModelGet) {
	    var val;

	    if (scope && typeof scope == 'object') {

	      if (scope[key] !== undefined) {
	        val = scope[key];

	      // try lookup with get for backbone or similar model data
	      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
	        val = scope.get(key);
	      }
	    }

	    return val;
	  }

	  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
	    function PartialTemplate() {};
	    PartialTemplate.prototype = instance;
	    function Substitutions() {};
	    Substitutions.prototype = instance.subs;
	    var key;
	    var partial = new PartialTemplate();
	    partial.subs = new Substitutions();
	    partial.subsText = {};  //hehe. substext.
	    partial.buf = '';

	    stackSubs = stackSubs || {};
	    partial.stackSubs = stackSubs;
	    partial.subsText = stackText;
	    for (key in subs) {
	      if (!stackSubs[key]) stackSubs[key] = subs[key];
	    }
	    for (key in stackSubs) {
	      partial.subs[key] = stackSubs[key];
	    }

	    stackPartials = stackPartials || {};
	    partial.stackPartials = stackPartials;
	    for (key in partials) {
	      if (!stackPartials[key]) stackPartials[key] = partials[key];
	    }
	    for (key in stackPartials) {
	      partial.partials[key] = stackPartials[key];
	    }

	    return partial;
	  }

	  var rAmp = /&/g,
	      rLt = /</g,
	      rGt = />/g,
	      rApos = /\'/g,
	      rQuot = /\"/g,
	      hChars = /[&<>\"\']/;

	  function coerceToString(val) {
	    return String((val === null || val === undefined) ? '' : val);
	  }

	  function hoganEscape(str) {
	    str = coerceToString(str);
	    return hChars.test(str) ?
	      str
	        .replace(rAmp, '&amp;')
	        .replace(rLt, '&lt;')
	        .replace(rGt, '&gt;')
	        .replace(rApos, '&#39;')
	        .replace(rQuot, '&quot;') :
	      str;
	  }

	  var isArray = Array.isArray || function(a) {
	    return Object.prototype.toString.call(a) === '[object Array]';
	  };

	})(typeof exports !== 'undefined' ? exports : Hogan);
	});

	var template$1 = interopDefault(template);


	var require$$0 = Object.freeze({
	  default: template$1
	});

	var hogan = createCommonjsModule(function (module) {
	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */

	// This file is for use with Node.js. See dist/ for browser files.

	var Hogan = interopDefault(require$$1);
	Hogan.Template = interopDefault(require$$0).Template;
	Hogan.template = Hogan.Template;
	module.exports = Hogan;
	});

	var hogan$1 = interopDefault(hogan);

	var stylesTemplate = '{{#selectors}}' + '{{#media}} {{media}} { {{/media}}' + '{{selector}} { ' + '{{#declarations}}' + '{{property}}: {{{value}}};' + '{{/declarations}}' + ' } ' + '{{#media}} } {{/media}}' + '{{/selectors}}';

	var conditionalStyles = ".modal {\n  display: none; }\n  .modal.is-active {\n    display: block;\n    opacity: 1;\n    margin-left: auto;\n    margin-right: auto; }\n";

	var iframeStyles = {
	  width: '100%',
	  overflow: 'hidden',
	  border: 'none'
	};

	var iframeAttrs = {
	  horizontalscrolling: 'no',
	  verticalscrolling: 'no',
	  allowTransparency: 'true',
	  frameBorder: '0',
	  scrolling: 'no'
	};

	var webfontScript = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js';

	function isPseudoSelector$1(key) {
	  return key.charAt(0) === ':';
	}

	function isMedia$1(key) {
	  return key.charAt(0) === '@';
	}

	function ruleDeclarations(rule) {
	  return Object.keys(rule).filter(function (key) {
	    return !isPseudoSelector$1(key) && !isMedia$1(key);
	  }).map(function (key) {
	    return { property: key, value: rule[key] };
	  });
	}

	function selectorStyleGroup(selector, selectorClass) {
	  var styleGroup = [];
	  if (selector && selectorClass) {
	    Object.keys(selector).forEach(function (decKey) {
	      if (selector && selectorClass) {
	        if (isPseudoSelector$1(decKey)) {
	          styleGroup.push({
	            selector: '.' + selectorClass + decKey,
	            declarations: ruleDeclarations(selector[decKey])
	          });
	        } else if (isMedia$1(decKey)) {
	          styleGroup.push({
	            media: decKey,
	            selector: '.' + selectorClass,
	            declarations: ruleDeclarations(selector[decKey])
	          });
	        }
	      }
	    });
	    var formattedSelector = selectorClass.split(' ').join('.');
	    styleGroup.push({
	      selector: '.' + formattedSelector,
	      declarations: ruleDeclarations(selector)
	    });
	  }
	  return styleGroup;
	}

	var iframe = function () {
	  function iframe(node, config) {
	    var _this = this;

	    classCallCheck(this, iframe);

	    this.el = document.createElement('iframe');
	    this.parent = node;
	    this.stylesheet = config.stylesheet;
	    this.customStylesHash = config.customStyles || {};
	    this.classes = config.classes;
	    this.browserFeatures = config.browserFeatures;
	    this.googleFonts = config.googleFonts || [];
	    this.name = config.name;
	    this.width = config.width;
	    if (this.width) {
	      this.setWidth(this.width);
	    }
	    Object.keys(iframeStyles).forEach(function (key) {
	      _this.el.style[key] = iframeStyles[key];
	    });
	    Object.keys(iframeAttrs).forEach(function (key) {
	      return _this.el.setAttribute(key, iframeAttrs[key]);
	    });
	    this.el.setAttribute('name', config.name);
	    this.styleTag = null;
	  }

	  iframe.prototype.load = function load() {
	    var _this2 = this;

	    return new Promise(function (resolve) {
	      _this2.el.onload = function () {
	        return _this2.loadFonts().then(function () {
	          _this2.appendStyleTag();
	          return resolve();
	        });
	      };
	      _this2.parent.appendChild(_this2.el);
	    });
	  };

	  iframe.prototype.loadFonts = function loadFonts() {
	    var _this3 = this;

	    if (!this.googleFonts.length) {
	      return Promise.resolve(true);
	    }
	    return this.loadFontScript().then(function () {
	      if (window.WebFont) {
	        window.WebFont.load({
	          google: {
	            families: _this3.googleFonts
	          },
	          context: frames[_this3.name]
	        });
	      }
	      return true;
	    });
	  };

	  iframe.prototype.loadFontScript = function loadFontScript() {
	    if (window.WebFont) {
	      return Promise.resolve();
	    }
	    var fontScript = document.createElement('script');
	    return new Promise(function (resolve) {
	      fontScript.onload = function () {
	        resolve();
	      };
	      fontScript.src = webfontScript;
	      document.head.appendChild(fontScript);
	      setTimeout(function () {
	        resolve();
	      }, 500);
	    });
	  };

	  iframe.prototype.setWidth = function setWidth(width) {
	    this.parent.style['max-width'] = width;
	  };

	  iframe.prototype.addClass = function addClass(className) {
	    if (this.parent.className.indexOf(className) < 0) {
	      this.parent.className += ' ' + className;
	    }
	  };

	  iframe.prototype.setName = function setName(name) {
	    this.el.setAttribute('name', name);
	  };

	  iframe.prototype.removeClass = function removeClass(className) {
	    var newClass = this.parent.className.replace(className, '');
	    this.parent.className = newClass;
	  };

	  iframe.prototype.updateStyles = function updateStyles(customStyles) {
	    this.customStylesHash = customStyles;
	    this.styleTag.innerHTML = this.css;
	  };

	  iframe.prototype.appendStyleTag = function appendStyleTag() {
	    if (!this.document.head) {
	      return;
	    }
	    this.styleTag = this.document.createElement('style');

	    if (this.styleTag.styleSheet) {
	      this.styleTag.styleSheet.cssText = this.css;
	    } else {
	      this.styleTag.appendChild(this.document.createTextNode(this.css));
	    }

	    this.document.head.appendChild(this.styleTag);
	  };

	  createClass$1(iframe, [{
	    key: 'document',
	    get: function get() {
	      var doc = void 0;
	      if (this.el.contentWindow && this.el.contentWindow.document.body) {
	        doc = this.el.contentWindow.document;
	      } else if (this.el.document && this.el.document.body) {
	        doc = this.el.document;
	      } else if (this.el.contentDocument && this.el.contentDocument.body) {
	        doc = this.el.contentDocument;
	      }
	      return doc;
	    }
	  }, {
	    key: 'customStyles',
	    get: function get() {
	      var _this4 = this;

	      var customStyles = [];
	      Object.keys(this.customStylesHash).forEach(function (typeKey) {
	        if (_this4.customStylesHash[typeKey]) {
	          Object.keys(_this4.customStylesHash[typeKey]).forEach(function (key) {
	            var styleGroup = selectorStyleGroup(_this4.customStylesHash[typeKey][key], _this4.classes[typeKey][key]);
	            customStyles = customStyles.concat(styleGroup);
	          });
	        }
	      });
	      return customStyles;
	    }
	  }, {
	    key: 'conditionalCSS',
	    get: function get() {
	      if (this.browserFeatures.transition && this.browserFeatures.transform && this.browserFeatures.animation) {
	        return '';
	      }
	      return conditionalStyles;
	    }
	  }, {
	    key: 'css',
	    get: function get() {
	      var compiled = hogan$1.compile(stylesTemplate);
	      return this.stylesheet + ' \n ' + compiled.render({ selectors: this.customStyles }) + ' \n ' + this.conditionalCSS;
	    }
	  }]);
	  return iframe;
	}();

	var Template = function () {
	  function Template(templates, contents, order) {
	    classCallCheck(this, Template);

	    this.templates = templates;
	    this.contents = contents;
	    this.order = order;
	    this.templateFn = hogan$1.compile(this.masterTemplate);
	  }

	  Template.prototype.render = function render(data, cb) {
	    var output = '' + this.templateFn.render(data);
	    if (!cb) {
	      return output;
	    }
	    return cb(output);
	  };

	  createClass$1(Template, [{
	    key: 'masterTemplate',
	    get: function get() {
	      var _this = this;

	      return this.order.reduce(function (acc, key) {
	        var string = '';
	        if (_this.contents[key]) {
	          string = _this.templates[key] || '';
	        }
	        return acc + string;
	      }, '');
	    }
	  }]);
	  return Template;
	}();

	var styles = {};
	styles.cart = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}body,html{min-height:100%}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#4c4c4c;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}ul{list-style:none;padding-left:0;margin:0}img{display:block;max-width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.btn{color:#fff;font-size:15px;background-color:#78b657;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background-color:#5f9d3e}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-img,.btn--parent:focus .product__variant-img{opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999;pointer-events:none}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background-color:transparent;transition:transform 100ms ease;cursor:pointer;font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}@keyframes flipin{from{max-height:0;transform:rotatex(90deg) translatey(-50%);margin-bottom:-65px;opacity:0}to{min-height:65px;margin-bottom:15px;transform:none;opacity:1}}.cart-wrapper{height:100%;padding-left:10px}.cart{height:100%;background-color:#fff;width:calc(100% - 10px);position:absolute;right:0;box-shadow:-5px 0 5px rgba(0,0,0,0.1)}.cart__header{padding:20px;position:relative;z-index:2147483647}.cart__title{font-size:18px;color:#767676;font-weight:normal}.cart-scroll{padding:70px 0 135px 0;position:absolute;top:0;height:100%;width:100%}.cart-items{overflow:hidden;overflow-y:auto;height:100%;position:relative;padding:0 20px 20px;-webkit-overflow-scrolling:touch;perspective:400px;perspective-origin:50% 0px}.cart-item{min-height:65px;margin-bottom:20px;overflow:hidden;position:relative;transition:all 200ms;backface-visibility:visible;transform-style:preserve-3d;animation-name:flipIn;animation-duration:200ms}.cart-item.is-hidden{transform:rotateX(90deg) translateY(-50%);margin-bottom:-65px;opacity:0;transition:all 200ms}.cart-item__image{width:65px;height:65px;background-size:contain;background-repeat:no-repeat;background-position:center center;background-color:transparent;position:absolute;left:0;top:0}.cart-item__title{font-size:14px;margin-left:80px;display:block;margin-bottom:10px}.cart-item__price{float:right;font-size:14px;font-weight:bold}.cart-item__variant-title{float:right;color:#4c4c4c;font-size:11px;font-weight:bold}.cart-bottom{background-color:#fff;position:absolute;width:100%;bottom:0;padding:20px;border-top:1px solid #d3dbe2}.cart__subtotal__text{text-transform:uppercase;float:left;font-size:11px;color:#4c4c4c}.cart__subtotal__price{float:right}.cart__currency{font-size:12px}.cart__notice{font-size:11px;clear:both;padding-top:10px;text-align:center;color:#4c4c4c}.cart-empty-text{padding:10px 15px;text-align:center}.btn--cart-checkout{clear:both;margin-top:15px;width:100%;padding:10px 5px;font-size:16px}.quantity-container{margin-left:80px}.cart-item__quantity-input{float:left}.quantity-container{border-radius:3px;overflow:hidden}.quantity-decrement,.quantity-increment{color:#4c4c4c;display:block;height:26px;float:left;line-height:16px;font-family:monospace;width:26px;padding:0;border:none;background:transparent;box-shadow:none;cursor:pointer;font-size:18px;text-align:center;border:1px solid #767676}.quantity-decrement{border-radius:3px 0 0 3px}.quantity-increment{border-radius:0 3px 3px 0}.quantity{color:black;width:45px;height:26px;font-size:12px;border:none;text-align:center;-moz-appearance:textfield;-webkit-appearance:none;background:transparent;display:inline-block;padding:0;border-radius:0;border-top:1px solid #767676;border-bottom:1px solid #767676}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.quantity-container.with-buttons{display:inline-block}.quantity-container.with-buttons .quantity{border-left:0;float:left} ';
	styles.modal = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}body,html{min-height:100%}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#4c4c4c;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}ul{list-style:none;padding-left:0;margin:0}img{display:block;max-width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.quantity-container{border-radius:3px;overflow:hidden}.quantity-decrement,.quantity-increment{color:#4c4c4c;display:block;height:26px;float:left;line-height:16px;font-family:monospace;width:26px;padding:0;border:none;background:transparent;box-shadow:none;cursor:pointer;font-size:18px;text-align:center;border:1px solid #767676}.quantity-decrement{border-radius:3px 0 0 3px}.quantity-increment{border-radius:0 3px 3px 0}.quantity{color:black;width:45px;height:26px;font-size:12px;border:none;text-align:center;-moz-appearance:textfield;-webkit-appearance:none;background:transparent;display:inline-block;padding:0;border-radius:0;border-top:1px solid #767676;border-bottom:1px solid #767676}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.quantity-container.with-buttons{display:inline-block}.quantity-container.with-buttons .quantity{border-left:0;float:left}.btn{color:#fff;font-size:15px;background-color:#78b657;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background-color:#5f9d3e}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-img,.btn--parent:focus .product__variant-img{opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999;pointer-events:none}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background-color:transparent;transition:transform 100ms ease;cursor:pointer;font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}.option-select-wrapper{border:1px solid #d3dbe2;border-radius:3px;box-sizing:border-box;position:relative;background:#fff;overflow:hidden;vertical-align:bottom}.shopify-select-icon{cursor:pointer;display:block;fill:#798c9c;position:absolute;right:10px;top:50%;margin-top:-6px;pointer-events:none;width:12px;height:12px;vertical-align:middle}.option-select+.option-select{margin-top:7.5px}.option-select__label{display:block;font-size:14px;margin-top:15px;margin-bottom:5px}.btn--parent .option-select__label{cursor:pointer}.option-select__select{font-size:inherit;padding:7px 10px;padding-right:32px;border:0;width:100%;background:transparent;-webkit-appearance:none;-moz-appearance:none}.btn--parent .option-select__select{cursor:pointer}.product{overflow:hidden;width:100%}.product__variant-img{margin:0 auto 15px auto;transition:all 0.3s ease;opacity:1}.product__variant-img.is-transitioning{opacity:0}.is-button{cursor:pointer}.no-image .product__variant-img{display:none}.product__title{font-size:18px;line-height:1.2;color:#4a4a4a;margin-bottom:15px;font-weight:700}.product__variant-title{font-size:18px;color:#666;font-weight:400;text-align:center;margin-bottom:15px}.product__price{margin-bottom:15px}.product-description{margin-bottom:15px;line-height:1.65;color:#4a4a4a}.product-description p+p{margin-top:9.99px}.product-description a{color:inherit}.product-description img{max-width:100%}.product-description h1{font-size:24px}.product-description h2{font-size:20px}.product-description h3{font-size:18px}.layout-vertical{text-align:center}.product__actual-price{font-size:14px;color:#4a4a4a;display:block}.product__compare-price{font-size:14px;text-decoration:line-through;color:#a2a2a3;display:block}.product__variant-selectors{margin-bottom:15px;text-align:left;font-size:14px}.quantity-container{display:inline-block;margin-bottom:20px}.quantity{border-left:1px solid;border-color:#d3dbe2;border-top-left-radius:3px;border-bottom-left-radius:3px}.quantity,.quantity-increment,.quantity-decrement{line-height:1.2;font-size:15px;height:auto;padding-top:12px;padding-bottom:12px}.btn{display:block}.btn.beside-quantity{display:inline-block;vertical-align:top;border-top-left-radius:0;border-bottom-left-radius:0;border:1px solid transparent}.cart-item__quantity-container{margin-top:20px;display:inline-block}.layout-vertical .btn:not(.beside-quantity){margin:20px auto 0}.layout-vertical .product__variant-img{width:100%}@media (min-width: 801px){.layout-horizontal:not(.no-image) .product-img-wrapper{float:left;width:50%}.layout-horizontal:not(.no-image) .quantity-container{margin-left:15px;margin-top:0}.layout-horizontal:not(.no-image) .product__title,.layout-horizontal:not(.no-image) .product__variant-title,.layout-horizontal:not(.no-image) .product__price,.layout-horizontal:not(.no-image) .product-description,.layout-horizontal:not(.no-image) .btn:not(.beside-quantity),.layout-horizontal:not(.no-image) .product__variant-selectors{margin-left:calc(50% + 25px)}}.btn--close{right:0px;font-size:45px;padding-right:3px;font-weight:100;z-index:2147483647}.btn{margin-bottom:30px}.modal{background:#fff;width:100%;max-width:1000px;position:absolute;left:0;right:0;z-index:2147483646}.product{text-align:left}.product__title,.product__price,.product__variant-title{text-align:left}.product__title{font-size:26px;font-weight:700;line-height:1.4}.product__compare-price{display:inline-block;margin-right:5px}.product__actual-price{display:inline-block}.modal .modal-product-wrapper{width:100%}.product__variant-image{margin:0}@media (max-width: 800px){body.is-active{overflow:hidden;position:fixed;height:100vh}.modal{min-height:100vh;position:fixed;overflow-y:auto}.product{padding:15px;position:absolute;top:0;left:0}.product__variant-image{max-height:60vh;margin:0 auto;width:auto;max-width:100%}.btn--close{position:fixed;top:0;right:10px}}@keyframes slideIn{from{opacity:0;transform:translateY(-200px);-webkit-transform:translateY(-200px)}to{opacity:1;transform:translateY(0);-webkit-transform:translateY(0)}}@media (min-width: 801px){html,body.is-active{height:100%}.modal{margin:100px auto 40px auto;opacity:0;border-radius:2px;border:1px solid rgba(0,0,0,0.72);transform:translateY(-200px);animation-name:slideOut;animation-duration:200ms;animation-fill-mode:forwards}.modal.is-active{animation-name:slideIn;animation-duration:200ms;animation-fill-mode:forwards}.product{padding:45px}.product-img-wrapper{height:100%;padding-right:30px;max-height:570}.product-img-wrapper{height:100%;max-height:570}.product__variant-img{max-height:100%}.btn--close{top:-60px;color:#fff}.btn--close:hover{color:#fff}} ';
	styles.product = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}body,html{min-height:100%}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#4c4c4c;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}ul{list-style:none;padding-left:0;margin:0}img{display:block;max-width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.quantity-container{border-radius:3px;overflow:hidden}.quantity-decrement,.quantity-increment{color:#4c4c4c;display:block;height:26px;float:left;line-height:16px;font-family:monospace;width:26px;padding:0;border:none;background:transparent;box-shadow:none;cursor:pointer;font-size:18px;text-align:center;border:1px solid #767676}.quantity-decrement{border-radius:3px 0 0 3px}.quantity-increment{border-radius:0 3px 3px 0}.quantity{color:black;width:45px;height:26px;font-size:12px;border:none;text-align:center;-moz-appearance:textfield;-webkit-appearance:none;background:transparent;display:inline-block;padding:0;border-radius:0;border-top:1px solid #767676;border-bottom:1px solid #767676}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.quantity-container.with-buttons{display:inline-block}.quantity-container.with-buttons .quantity{border-left:0;float:left}.btn{color:#fff;font-size:15px;background-color:#78b657;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background-color:#5f9d3e}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-img,.btn--parent:focus .product__variant-img{opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999;pointer-events:none}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background-color:transparent;transition:transform 100ms ease;cursor:pointer;font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}.option-select-wrapper{border:1px solid #d3dbe2;border-radius:3px;box-sizing:border-box;position:relative;background:#fff;overflow:hidden;vertical-align:bottom}.shopify-select-icon{cursor:pointer;display:block;fill:#798c9c;position:absolute;right:10px;top:50%;margin-top:-6px;pointer-events:none;width:12px;height:12px;vertical-align:middle}.option-select+.option-select{margin-top:7.5px}.option-select__label{display:block;font-size:14px;margin-top:15px;margin-bottom:5px}.btn--parent .option-select__label{cursor:pointer}.option-select__select{font-size:inherit;padding:7px 10px;padding-right:32px;border:0;width:100%;background:transparent;-webkit-appearance:none;-moz-appearance:none}.btn--parent .option-select__select{cursor:pointer}.product{overflow:hidden;width:100%}.product__variant-img{margin:0 auto 15px auto;transition:all 0.3s ease;opacity:1}.product__variant-img.is-transitioning{opacity:0}.is-button{cursor:pointer}.no-image .product__variant-img{display:none}.product__title{font-size:18px;line-height:1.2;color:#4a4a4a;margin-bottom:15px;font-weight:700}.product__variant-title{font-size:18px;color:#666;font-weight:400;text-align:center;margin-bottom:15px}.product__price{margin-bottom:15px}.product-description{margin-bottom:15px;line-height:1.65;color:#4a4a4a}.product-description p+p{margin-top:9.99px}.product-description a{color:inherit}.product-description img{max-width:100%}.product-description h1{font-size:24px}.product-description h2{font-size:20px}.product-description h3{font-size:18px}.layout-vertical{text-align:center}.product__actual-price{font-size:14px;color:#4a4a4a;display:block}.product__compare-price{font-size:14px;text-decoration:line-through;color:#a2a2a3;display:block}.product__variant-selectors{margin-bottom:15px;text-align:left;font-size:14px}.quantity-container{display:inline-block;margin-bottom:20px}.quantity{border-left:1px solid;border-color:#d3dbe2;border-top-left-radius:3px;border-bottom-left-radius:3px}.quantity,.quantity-increment,.quantity-decrement{line-height:1.2;font-size:15px;height:auto;padding-top:12px;padding-bottom:12px}.btn{display:block}.btn.beside-quantity{display:inline-block;vertical-align:top;border-top-left-radius:0;border-bottom-left-radius:0;border:1px solid transparent}.cart-item__quantity-container{margin-top:20px;display:inline-block}.layout-vertical .btn:not(.beside-quantity){margin:20px auto 0}.layout-vertical .product__variant-img{width:100%}@media (min-width: 801px){.layout-horizontal:not(.no-image) .product-img-wrapper{float:left;width:50%}.layout-horizontal:not(.no-image) .quantity-container{margin-left:15px;margin-top:0}.layout-horizontal:not(.no-image) .product__title,.layout-horizontal:not(.no-image) .product__variant-title,.layout-horizontal:not(.no-image) .product__price,.layout-horizontal:not(.no-image) .product-description,.layout-horizontal:not(.no-image) .btn:not(.beside-quantity),.layout-horizontal:not(.no-image) .product__variant-selectors{margin-left:calc(50% + 25px)}} ';
	styles.productSet = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}body,html{min-height:100%}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#4c4c4c;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}ul{list-style:none;padding-left:0;margin:0}img{display:block;max-width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.btn{color:#fff;font-size:15px;background-color:#78b657;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background-color:#5f9d3e}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-img,.btn--parent:focus .product__variant-img{opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999;pointer-events:none}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background-color:transparent;transition:transform 100ms ease;cursor:pointer;font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}.quantity-container{border-radius:3px;overflow:hidden}.quantity-decrement,.quantity-increment{color:#4c4c4c;display:block;height:26px;float:left;line-height:16px;font-family:monospace;width:26px;padding:0;border:none;background:transparent;box-shadow:none;cursor:pointer;font-size:18px;text-align:center;border:1px solid #767676}.quantity-decrement{border-radius:3px 0 0 3px}.quantity-increment{border-radius:0 3px 3px 0}.quantity{color:black;width:45px;height:26px;font-size:12px;border:none;text-align:center;-moz-appearance:textfield;-webkit-appearance:none;background:transparent;display:inline-block;padding:0;border-radius:0;border-top:1px solid #767676;border-bottom:1px solid #767676}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.quantity-container.with-buttons{display:inline-block}.quantity-container.with-buttons .quantity{border-left:0;float:left}.option-select-wrapper{border:1px solid #d3dbe2;border-radius:3px;box-sizing:border-box;position:relative;background:#fff;overflow:hidden;vertical-align:bottom}.shopify-select-icon{cursor:pointer;display:block;fill:#798c9c;position:absolute;right:10px;top:50%;margin-top:-6px;pointer-events:none;width:12px;height:12px;vertical-align:middle}.option-select+.option-select{margin-top:7.5px}.option-select__label{display:block;font-size:14px;margin-top:15px;margin-bottom:5px}.btn--parent .option-select__label{cursor:pointer}.option-select__select{font-size:inherit;padding:7px 10px;padding-right:32px;border:0;width:100%;background:transparent;-webkit-appearance:none;-moz-appearance:none}.btn--parent .option-select__select{cursor:pointer}.product{overflow:hidden;width:100%}.product__variant-img{margin:0 auto 15px auto;transition:all 0.3s ease;opacity:1}.product__variant-img.is-transitioning{opacity:0}.is-button{cursor:pointer}.no-image .product__variant-img{display:none}.product__title{font-size:18px;line-height:1.2;color:#4a4a4a;margin-bottom:15px;font-weight:700}.product__variant-title{font-size:18px;color:#666;font-weight:400;text-align:center;margin-bottom:15px}.product__price{margin-bottom:15px}.product-description{margin-bottom:15px;line-height:1.65;color:#4a4a4a}.product-description p+p{margin-top:9.99px}.product-description a{color:inherit}.product-description img{max-width:100%}.product-description h1{font-size:24px}.product-description h2{font-size:20px}.product-description h3{font-size:18px}.layout-vertical{text-align:center}.product__actual-price{font-size:14px;color:#4a4a4a;display:block}.product__compare-price{font-size:14px;text-decoration:line-through;color:#a2a2a3;display:block}.product__variant-selectors{margin-bottom:15px;text-align:left;font-size:14px}.quantity-container{display:inline-block;margin-bottom:20px}.quantity{border-left:1px solid;border-color:#d3dbe2;border-top-left-radius:3px;border-bottom-left-radius:3px}.quantity,.quantity-increment,.quantity-decrement{line-height:1.2;font-size:15px;height:auto;padding-top:12px;padding-bottom:12px}.btn{display:block}.btn.beside-quantity{display:inline-block;vertical-align:top;border-top-left-radius:0;border-bottom-left-radius:0;border:1px solid transparent}.cart-item__quantity-container{margin-top:20px;display:inline-block}.layout-vertical .btn:not(.beside-quantity){margin:20px auto 0}.layout-vertical .product__variant-img{width:100%}@media (min-width: 801px){.layout-horizontal:not(.no-image) .product-img-wrapper{float:left;width:50%}.layout-horizontal:not(.no-image) .quantity-container{margin-left:15px;margin-top:0}.layout-horizontal:not(.no-image) .product__title,.layout-horizontal:not(.no-image) .product__variant-title,.layout-horizontal:not(.no-image) .product__price,.layout-horizontal:not(.no-image) .product-description,.layout-horizontal:not(.no-image) .btn:not(.beside-quantity),.layout-horizontal:not(.no-image) .product__variant-selectors{margin-left:calc(50% + 25px)}}.collection{overflow:hidden}.collection-products{display:flex;justify-content:center;flex-wrap:wrap;margin-left:-15px}@media (max-width: 600px){.collection-products{display:block}}.product{margin-left:15px;margin-bottom:15px;flex:0 0 auto;display:inline-block;max-width:250px}.btn.collection-pagination-button{display:none;margin:15px auto}.btn.collection-pagination-button.is-active{display:block} ';
	styles.toggle = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}body,html{min-height:100%}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#4c4c4c;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}ul{list-style:none;padding-left:0;margin:0}img{display:block;max-width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.btn{color:#fff;font-size:15px;background-color:#78b657;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background-color:#5f9d3e}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-img,.btn--parent:focus .product__variant-img{opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999;pointer-events:none}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background-color:transparent;transition:transform 100ms ease;cursor:pointer;font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}.cart-toggle-wrapper{display:inline-block}.cart-toggle{background-color:#78b657;color:#fff;border-radius:3px 0 0 3px;padding:8px 10px;text-align:center;display:inline-block;min-width:46px;margin-right:0;cursor:pointer;transition:background 200ms ease}.cart-toggle:hover{background-color:#5f9d3e}.cart-toggle__count{font-size:18px;margin-bottom:10px}.icon-cart__group{fill:#fff}.is-inline .icon-cart,.is-inline .cart-toggle__title,.is-inline .cart-toggle__count{display:inline-block;vertical-align:middle}.is-inline .icon-cart{margin-right:5px}.is-inline .cart-toggle__title{font-size:16px;font-weight:normal}.is-inline .cart-toggle__count{margin-left:21px;margin-bottom:0;position:relative}.is-inline .cart-toggle__count:before{content:"";display:block;position:absolute;left:-12px;height:100%;width:1px;background-color:#fff;opacity:0.3}.is-inline.cart-toggle{border-radius:3px} ';

	var delegateEventSplitter = /^(\S+)\s*(.*)$/;
	var ESC_KEY$1 = 27;

	var Component = function () {
	  function Component(config, props) {
	    classCallCheck(this, Component);

	    this.id = config.id;
	    this.handle = config.handle;
	    this.node = config.node;
	    this.debug = config.debug;
	    this.config = merge({}, defaults$1, config.options || {});
	    this.props = props;
	    this.model = {};
	    this.template = new Template(this.options.templates, this.options.contents, this.options.order);
	    this.children = null;
	  }

	  Component.prototype.init = function init(data) {
	    var _this = this;

	    this._userEvent('beforeInit');
	    return this.setupView().then(function () {
	      return _this.setupModel(data);
	    }).then(function (model) {
	      _this.model = model;
	      _this.render();
	      _this.delegateEvents();
	      _this._userEvent('afterInit');
	      return _this;
	    }).catch(function (err) {
	      if (err.message.indexOf('Not Found') > -1) {
	        logNotFound(_this);
	      } else {
	        throw err;
	      }
	    });
	  };

	  Component.prototype.setupView = function setupView() {
	    if (this.iframe) {
	      return Promise.resolve();
	    }
	    if (this.options.iframe) {
	      this.iframe = new iframe(this.node, {
	        classes: this.classes,
	        customStyles: this.styles,
	        stylesheet: styles[this.typeKey],
	        browserFeatures: this.props.browserFeatures,
	        googleFonts: this.googleFonts,
	        name: this.name,
	        width: this.options.width
	      });
	      this.node.className += ' shopify-buy-frame shopify-buy-frame--' + this.typeKey;
	      this.iframe.addClass(this.iframeClass);
	      return this.iframe.load();
	    } else {
	      this.iframe = null;
	      return Promise.resolve();
	    }
	  };

	  Component.prototype.setupModel = function setupModel(data) {
	    if (data) {
	      return Promise.resolve(data);
	    } else {
	      return this.fetchData();
	    }
	  };

	  Component.prototype.render = function render() {
	    var _this2 = this;

	    this._userEvent('beforeRender');
	    var html = this.template.render({ data: this.viewData }, function (data) {
	      return _this2.wrapTemplate(data);
	    });
	    if (!this.wrapper) {
	      this.wrapper = this._createWrapper();
	    }
	    this.updateNode(this.wrapper, html);
	    this.resize();
	    this._userEvent('afterRender');
	  };

	  Component.prototype.delegateEvents = function delegateEvents() {
	    var _this3 = this;

	    this._userEvent('beforeDelegateEvents');
	    this._closeComponentsOnEsc();
	    Object.keys(this.DOMEvents).forEach(function (key) {
	      var _key$match = key.match(delegateEventSplitter);

	      var _key$match2 = slicedToArray(_key$match, 3);

	      var eventName = _key$match2[1];
	      var selectorString = _key$match2[2];

	      if (selectorString) {
	        _this3._on(eventName, selectorString, function (evt, target) {
	          _this3.DOMEvents[key].call(_this3, evt, target);
	        });
	      } else {
	        _this3.wrapper.addEventListener('click', function (evt) {
	          _this3.DOMEvents[key].call(_this3, evt);
	        });
	      }
	    });
	    this._userEvent('afterDelegateEvents');
	  };

	  Component.prototype.resize = function resize() {
	    if (!this.iframe) {
	      return;
	    }
	    if (this.shouldResizeX) {
	      this._resizeX();
	    }
	    if (this.shouldResizeY) {
	      this._resizeY();
	    }
	  };

	  Component.prototype.updateConfig = function updateConfig(config) {
	    this._userEvent('beforeUpdateConfig');
	    this.config = merge(this.config, config.options);
	    this.template = new Template(this.options.templates, this.options.contents, this.options.order);
	    if (this.iframe) {
	      this.iframe.updateStyles(this.styles);
	    }
	    this.render();
	    this.resize();
	    this._userEvent('afterUpdateConfig');
	  };

	  Component.prototype.destroy = function destroy() {
	    this.node.parentNode.removeChild(this.node);
	  };

	  Component.prototype.renderChild = function renderChild(className, template) {
	    var selector = '.' + className.split(' ').join('.');
	    var node = this.wrapper.querySelector(selector);
	    var html = template.render({ data: this.viewData });
	    this.updateNode(node, html);
	  };

	  Component.prototype.updateNode = function updateNode(node, html) {
	    var div = document.createElement('div');
	    div.innerHTML = html;
	    morphdom(node, div.firstElementChild);
	  };

	  Component.prototype.wrapTemplate = function wrapTemplate(html) {
	    return '<div class="' + this.classes[this.typeKey][this.typeKey] + '">' + html + '</div>';
	  };

	  Component.prototype._resizeX = function _resizeX() {
	    this.iframe.el.style.width = this.document.body.clientWidth + 'px';
	  };

	  Component.prototype._resizeY = function _resizeY(value) {
	    var newHeight = value || this.outerHeight;
	    this.iframe.el.style.height = newHeight;
	  };

	  Component.prototype._createWrapper = function _createWrapper() {
	    var wrapper = document.createElement('div');
	    wrapper.className = this.classes[this.typeKey][this.typeKey];
	    if (this.iframe) {
	      this.document.body.appendChild(wrapper);
	    } else {
	      this.node.appendChild(wrapper);
	    }
	    return wrapper;
	  };

	  Component.prototype._closeComponentsOnEsc = function _closeComponentsOnEsc() {
	    var _this4 = this;

	    if (!this.iframe) {
	      return;
	    }
	    this.document.addEventListener('keydown', function (evt) {
	      if (evt.keyCode !== ESC_KEY$1) {
	        return;
	      }
	      _this4.props.closeModal();
	      _this4.props.closeCart();
	    });
	  };

	  Component.prototype._userEvent = function _userEvent(methodName) {
	    if (this.debug) {
	      logger$1.info('EVENT: ' + methodName + ' (' + this.typeKey + ')');
	    }
	    if (isFunction(this.events[methodName])) {
	      this.events[methodName].call(this, this);
	    }
	  };

	  Component.prototype._on = function _on(eventName, selector, fn) {
	    var _this5 = this;

	    this.wrapper.addEventListener(eventName, function (evt) {
	      var possibleTargets = Array.prototype.slice.call(_this5.wrapper.querySelectorAll(selector));
	      var target = evt.target;

	      possibleTargets.forEach(function (possibleTarget) {
	        var el = target;
	        while (el && el !== _this5.wrapper) {
	          if (el === possibleTarget) {
	            return fn.call(possibleTarget, evt, possibleTarget);
	          }
	          el = el.parentNode;
	        }
	        return el;
	      });
	    }, eventName === 'blur');
	  };

	  createClass$1(Component, [{
	    key: 'client',
	    get: function get() {
	      return this.props.client;
	    }
	  }, {
	    key: 'name',
	    get: function get() {
	      var uniqueHandle = '';
	      if (this.id) {
	        uniqueHandle = '-' + this.id;
	      } else if (this.handle) {
	        uniqueHandle = '-' + this.handle;
	      }
	      return 'frame-' + this.typeKey + uniqueHandle;
	    }
	  }, {
	    key: 'options',
	    get: function get() {
	      return merge({}, this.config[this.typeKey]);
	    }
	  }, {
	    key: 'DOMEvents',
	    get: function get() {
	      return this.options.DOMEvents || {};
	    }
	  }, {
	    key: 'events',
	    get: function get() {
	      return this.options.events || {};
	    }
	  }, {
	    key: 'styles',
	    get: function get() {
	      var _this6 = this;

	      return this.options.manifest.filter(function (component) {
	        return _this6.config[component].styles;
	      }).reduce(function (hash, component) {
	        hash[component] = _this6.config[component].styles;
	        return hash;
	      }, {});
	    }
	  }, {
	    key: 'classes',
	    get: function get() {
	      var _this7 = this;

	      return this.options.manifest.filter(function (component) {
	        return _this7.config[component].classes;
	      }).reduce(function (hash, component) {
	        hash[component] = _this7.config[component].classes;
	        return hash;
	      }, {});
	    }
	  }, {
	    key: 'googleFonts',
	    get: function get() {
	      var _this8 = this;

	      return this.options.manifest.filter(function (component) {
	        return _this8.config[component].googleFonts;
	      }).reduce(function (fonts, component) {
	        return fonts.concat(_this8.config[component].googleFonts);
	      }, []);
	    }
	  }, {
	    key: 'document',
	    get: function get() {
	      return this.iframe ? this.iframe.document : window.document;
	    }
	  }, {
	    key: 'viewData',
	    get: function get() {
	      return merge(this.model, {
	        classes: this.classes,
	        text: this.options.text
	      });
	    }
	  }, {
	    key: 'morphCallbacks',
	    get: function get() {
	      return {
	        onBeforeElUpdated: function onBeforeElUpdated(fromEl, toEl) {
	          if (fromEl.tagName === 'IMG') {
	            if (fromEl.src === toEl.getAttribute('data-src')) {
	              return false;
	            }
	          }
	          return true;
	        }
	      };
	    }
	  }, {
	    key: 'iframeClass',
	    get: function get() {
	      return '';
	    }
	  }, {
	    key: 'shouldResizeX',
	    get: function get() {
	      return false;
	    }
	  }, {
	    key: 'shouldResizeY',
	    get: function get() {
	      return false;
	    }
	  }, {
	    key: 'outerHeight',
	    get: function get() {
	      return this.document.defaultView.getComputedStyle(this.wrapper, '').getPropertyValue('height');
	    }
	  }]);
	  return Component;
	}();

	var Checkout = function () {
	  function Checkout(config) {
	    classCallCheck(this, Checkout);

	    this.config = config;
	  }

	  Checkout.prototype.open = function open(url) {
	    window.open(url, 'checkout', this.params);
	  };

	  createClass$1(Checkout, [{
	    key: 'params',
	    get: function get() {
	      var _this = this;

	      return Object.keys(this.config.window).reduce(function (acc, key) {
	        return '' + acc + key + '=' + _this.config.window[key] + ',';
	      }, '');
	    }
	  }]);
	  return Checkout;
	}();

	var windowUtils = {
	  location: function location() {
	    return window.location.href;
	  }
	};

	var pollInterval = 200;

	function isPseudoSelector(key) {
	  return key.charAt(0) === ':';
	}

	function isMedia(key) {
	  return key.charAt(0) === '@';
	}

	var propertiesWhitelist = ['background', 'background-color', 'border', 'border-radius', 'color', 'border-color', 'border-width', 'border-style', 'transition', 'text-transform', 'text-shadow', 'box-shadow', 'font-size', 'font-family'];

	function whitelistedProperties(selectorStyles) {
	  return Object.keys(selectorStyles).reduce(function (filteredStyles, propertyName) {
	    if (isPseudoSelector(propertyName) || isMedia(propertyName)) {
	      filteredStyles[propertyName] = whitelistedProperties(selectorStyles[propertyName]);
	      return filteredStyles;
	    }
	    if (propertiesWhitelist.indexOf(propertyName) > -1) {
	      filteredStyles[propertyName] = selectorStyles[propertyName];
	    }
	    return filteredStyles;
	  }, {});
	}

	var Product = function (_Component) {
	  inherits(Product, _Component);

	  function Product(config, props) {
	    classCallCheck(this, Product);

	    var _this = possibleConstructorReturn(this, _Component.call(this, config, props));

	    _this.cartNode = config.cartNode;
	    _this.modalNode = config.modalNode;
	    _this.defaultVariantId = config.variantId;
	    _this.cachedImage = null;
	    _this.childTemplate = new Template(_this.config.option.templates, _this.config.option.contents, _this.config.option.order);
	    _this.cart = null;
	    _this.modal = null;
	    _this.imgStyle = '';
	    _this.selectedQuantity = 1;
	    return _this;
	  }

	  Product.prototype.stopPropagation = function stopPropagation(evt) {
	    if (!this.options.contents.button) {
	      evt.stopImmediatePropagation();
	    }
	  };

	  Product.prototype.init = function init(data) {
	    var _this2 = this;

	    return _Component.prototype.init.call(this, data).then(function (model) {
	      return _this2.createCart().then(function (cart) {
	        _this2.cart = cart;
	        if (model) {
	          _this2.render();
	        }
	        return model;
	      });
	    });
	  };

	  Product.prototype.render = function render() {
	    _Component.prototype.render.call(this);
	    if (this.iframe) {
	      this.resizeUntilLoaded();
	    }
	  };

	  Product.prototype.createCart = function createCart() {
	    if (this.shouldCreateCart) {
	      return this.props.createCart({
	        node: this.cartNode,
	        options: this.config
	      });
	    } else {
	      return Promise.resolve(null);
	    }
	  };

	  Product.prototype.setupModel = function setupModel(data) {
	    var _this3 = this;

	    return _Component.prototype.setupModel.call(this, data).then(function (model) {
	      return _this3.setDefaultVariant(model);
	    });
	  };

	  Product.prototype.wrapTemplate = function wrapTemplate(html) {
	    var ariaLabel = void 0;
	    switch (this.options.buttonDestination) {
	      case 'modal':
	        ariaLabel = 'View details';
	        break;
	      case 'cart':
	        ariaLabel = 'Add to cart';
	        break;
	      default:
	        ariaLabel = 'Buy Now';
	    }

	    if (this.options.contents.button) {
	      return '<div class="' + this.wrapperClass + ' ' + this.classes.product.product + '">' + html + '</div>';
	    } else {
	      return '<div class="' + this.wrapperClass + ' ' + this.classes.product.product + '"><div tabindex="0" role="button" aria-label="' + ariaLabel + '" class="' + this.classes.product.blockButton + '">' + html + '</div></div>';
	    }
	  };

	  Product.prototype.sdkFetch = function sdkFetch() {
	    if (this.id) {
	      return this.props.client.fetchProduct(this.id);
	    } else if (this.handle) {
	      return this.props.client.fetchQueryProducts({ handle: this.handle }).then(function (products) {
	        return products[0];
	      });
	    }
	    return Promise.reject();
	  };

	  Product.prototype.fetchData = function fetchData() {
	    return this.sdkFetch().then(function (model) {
	      if (model) {
	        model.selectedQuantity = 0;
	        return model;
	      }
	      throw new Error('Not Found');
	    });
	  };

	  Product.prototype.updateConfig = function updateConfig(config) {
	    if (config.id || config.variantId) {
	      this.id = config.id || this.id;
	      this.defaultVariantId = config.variantId || this.defaultVariantId;
	      this.init();
	      return;
	    }

	    var layout = this.options.layout;

	    if (config.options && config.options.product) {
	      if (config.options.product.layout) {
	        layout = config.options.product.layout;
	      }

	      if (config.options.product.width) {
	        this.iframe.setWidth(config.options.product.width);
	      }

	      if (layout === 'horizontal' && this.iframe.width && this.iframe.width !== 'none') {
	        this.iframe.setWidth('none');
	      }
	    }

	    if (this.iframe) {
	      this.iframe.removeClass('layout-vertical');
	      this.iframe.removeClass('layout-horizontal');
	      this.iframe.addClass('layout-' + layout);
	    }
	    _Component.prototype.updateConfig.call(this, config);
	    if (this.cart) {
	      this.cart.updateConfig(config);
	    }
	    if (this.modal) {
	      this.modal.updateConfig(_extends({}, config, {
	        options: _extends({}, this.config, {
	          product: this.modalProductConfig
	        })
	      }));
	    }
	  };

	  Product.prototype.onButtonClick = function onButtonClick(evt) {
	    evt.stopPropagation();
	    if (this.options.buttonDestination === 'cart') {
	      this.props.closeModal();
	      this.props.tracker.trackMethod(this.cart.addVariantToCart.bind(this), 'CART_ADD', this.selectedVariantTrackingInfo)(this.model.selectedVariant, this.model.selectedQuantity);
	    } else if (this.options.buttonDestination === 'modal') {
	      this.openModal();
	    } else if (this.options.buttonDestination === 'onlineStore') {
	      this.openOnlineStore();
	    } else {
	      new Checkout(this.config).open(this.model.selectedVariant.checkoutUrl(this.selectedQuantity));
	    }
	  };

	  Product.prototype.resizeUntilLoaded = function resizeUntilLoaded() {
	    var _this4 = this;

	    if (!this.iframe || !this.model.selectedVariantImage) {
	      return;
	    }
	    var img = this.wrapper.getElementsByClassName(this.classes.product.img)[0];
	    var intervals = 0;
	    if (img) {
	      (function () {
	        var productResize = setInterval(function () {
	          if (!img.naturalWidth && intervals < 30) {
	            intervals++;
	            return;
	          }
	          _this4.resize();
	          clearInterval(productResize);
	        }, pollInterval);
	      })();
	    }
	  };

	  Product.prototype.openOnlineStore = function openOnlineStore() {
	    window.open(this.onlineStoreURL);
	  };

	  Product.prototype.openModal = function openModal() {
	    if (!this.modal) {
	      this.modal = this.props.createModal({
	        node: this.modalNode,
	        options: _extends({}, this.config, {
	          product: this.modalProductConfig,
	          modal: _extends({}, this.config.modal, {
	            googleFonts: this.options.googleFonts
	          })
	        })
	      }, this.props);
	    }
	    return this.modal.init(this.model);
	  };

	  Product.prototype.onOptionSelect = function onOptionSelect(evt) {
	    var target = evt.target;
	    var value = target.options[target.selectedIndex].value;
	    var name = target.getAttribute('name');
	    this.updateVariant(name, value);
	  };

	  Product.prototype.onQuantityBlur = function onQuantityBlur(evt, target) {
	    this.updateQuantity(function () {
	      return target.value;
	    });
	  };

	  Product.prototype.onQuantityIncrement = function onQuantityIncrement(qty) {
	    this.updateQuantity(function (prevQty) {
	      return prevQty + qty;
	    });
	  };

	  Product.prototype.updateQuantity = function updateQuantity(fn) {
	    var quantity = fn(this.selectedQuantity);
	    if (quantity < 0) {
	      quantity = 0;
	    }
	    this.selectedQuantity = quantity;
	    this.render();
	  };

	  Product.prototype.updateVariant = function updateVariant(optionName, value) {
	    var updatedOption = this.model.options.filter(function (option) {
	      return option.name === optionName;
	    })[0];
	    updatedOption.selected = value;
	    if (this.variantExists) {
	      this.cachedImage = this.model.selectedVariantImage;
	    }
	    this.render();
	    return updatedOption;
	  };

	  Product.prototype.closeCartOnBgClick = function closeCartOnBgClick() {
	    if (this.cart && this.cart.isVisible) {
	      this.cart.close();
	    }
	  };

	  Product.prototype.setDefaultVariant = function setDefaultVariant(model) {
	    var _this5 = this;

	    if (!this.defaultVariantId) {
	      return model;
	    }

	    var selectedVariant = model.variants.filter(function (variant) {
	      return variant.id === _this5.defaultVariantId;
	    })[0];
	    if (selectedVariant) {
	      model.options.forEach(function (option) {
	        option.selected = selectedVariant.optionValues.filter(function (optionValue) {
	          return optionValue.name === option.name;
	        })[0].value;
	      });
	    } else {

	      // eslint-disable-next-line
	      console.error('invalid variant ID');
	    }
	    return model;
	  };

	  createClass$1(Product, [{
	    key: 'shouldCreateCart',
	    get: function get() {
	      return this.options.buttonDestination === 'cart' || this.options.buttonDestination === 'modal' && this.config.modalProduct.buttonDestination === 'cart';
	    }
	  }, {
	    key: 'iframeClass',
	    get: function get() {
	      return 'layout-' + this.options.layout;
	    }
	  }, {
	    key: 'typeKey',
	    get: function get() {
	      return 'product';
	    }
	  }, {
	    key: 'shouldUpdateImage',
	    get: function get() {
	      return !this.cachedImage || this.image && this.image.src && this.image.src !== this.cachedImage.src;
	    }
	  }, {
	    key: 'currentImage',
	    get: function get() {
	      if (this.shouldUpdateImage) {
	        this.cachedImage = this.image;
	      }

	      return this.cachedImage;
	    }
	  }, {
	    key: 'image',
	    get: function get() {
	      var _this6 = this;

	      if (!this.model.selectedVariant || !this.model.selectedVariant.imageVariants) {
	        return null;
	      }

	      if (this.options.imageSize) {
	        return this.model.selectedVariant.imageVariants.filter(function (imageVariant) {
	          return imageVariant.name === _this6.options.imageSize;
	        })[0];
	      }

	      if (this.options.width && this.options.layout === 'vertical') {
	        return this.model.selectedVariant.imageVariants.filter(function (image) {
	          return parseInt(image.dimension, 10) >= parseInt(_this6.options.width, 10);
	        })[0];
	      }

	      return this.model.selectedVariant.imageVariants.filter(function (imageVariant) {
	        return imageVariant.name === 'large';
	      })[0];
	    }
	  }, {
	    key: 'viewData',
	    get: function get() {
	      return merge(this.model, {
	        optionsHtml: this.optionsHtml,
	        contents: this.options.contents,
	        currentImage: this.currentImage,
	        buttonClass: this.buttonClass,
	        hasVariants: this.hasVariants,
	        buttonDisabled: !this.buttonEnabled,
	        classes: this.classes,
	        selectedQuantity: this.selectedQuantity,
	        buttonText: this.buttonText,
	        imgStyle: this.imgStyle,
	        quantityClass: this.quantityClass,
	        priceClass: this.priceClass
	      });
	    }
	  }, {
	    key: 'hasQuantity',
	    get: function get() {
	      return this.options.contents.quantityInput;
	    }
	  }, {
	    key: 'priceClass',
	    get: function get() {
	      return this.model.selectedVariant && this.model.selectedVariant.compareAtPrice ? 'price--lowered' : '';
	    }
	  }, {
	    key: 'wrapperClass',
	    get: function get() {
	      return (this.currentImage ? 'has-image' : 'no-image') + ' layout-' + this.options.layout;
	    }
	  }, {
	    key: 'DOMEvents',
	    get: function get() {
	      var _merge;

	      return merge({}, this.options.DOMEvents, (_merge = {
	        click: this.closeCartOnBgClick.bind(this)
	      }, defineProperty(_merge, 'click .' + this.classes.option.select.split(' ').join('.'), this.stopPropagation.bind(this)), defineProperty(_merge, 'focus .' + this.classes.option.select.split(' ').join('.'), this.stopPropagation.bind(this)), defineProperty(_merge, 'click .' + this.classes.option.wrapper.split(' ').join('.'), this.stopPropagation.bind(this)), defineProperty(_merge, 'click .' + this.classes.product.quantityInput.split(' ').join('.'), this.stopPropagation.bind(this)), defineProperty(_merge, 'click .' + this.classes.product.quantityButton.split(' ').join('.'), this.stopPropagation.bind(this)), defineProperty(_merge, 'change .' + this.classes.option.select.split(' ').join('.'), this.onOptionSelect.bind(this)), defineProperty(_merge, 'click .' + this.classes.product.button.split(' ').join('.'), this.onButtonClick.bind(this)), defineProperty(_merge, 'click .' + this.classes.product.blockButton.split(' ').join('.'), this.onButtonClick.bind(this)), defineProperty(_merge, 'click .' + this.classes.product.quantityButton.split(' ').join('.') + '.quantity-increment', this.onQuantityIncrement.bind(this, 1)), defineProperty(_merge, 'click .' + this.classes.product.quantityButton.split(' ').join('.') + '.quantity-decrement', this.onQuantityIncrement.bind(this, -1)), defineProperty(_merge, 'blur .' + this.classes.product.quantityInput.split(' ').join('.'), this.onQuantityBlur.bind(this)), _merge));
	    }
	  }, {
	    key: 'buttonClass',
	    get: function get() {
	      var disabledClass = this.buttonEnabled ? '' : this.classes.disabled;
	      var quantityClass = this.options.contents.quantity ? 'beside-quantity' : '';
	      return disabledClass + ' ' + quantityClass;
	    }
	  }, {
	    key: 'quantityClass',
	    get: function get() {
	      return this.options.contents.quantityIncrement || this.options.contents.quantityDecrement ? 'with-buttons' : '';
	    }
	  }, {
	    key: 'buttonText',
	    get: function get() {
	      if (!this.variantExists) {
	        return this.options.text.unavailable;
	      }
	      if (!this.variantInStock) {
	        return this.options.text.outOfStock;
	      }
	      return this.options.text.button;
	    }
	  }, {
	    key: 'buttonEnabled',
	    get: function get() {
	      return this.buttonActionAvailable && this.variantExists && this.variantInStock;
	    }
	  }, {
	    key: 'variantExists',
	    get: function get() {
	      return Boolean(this.model.selectedVariant);
	    }
	  }, {
	    key: 'variantInStock',
	    get: function get() {
	      return this.variantExists && this.model.selectedVariant.available;
	    }
	  }, {
	    key: 'requiresCart',
	    get: function get() {
	      return this.options.buttonDestination === 'cart';
	    }
	  }, {
	    key: 'buttonActionAvailable',
	    get: function get() {
	      return !this.requiresCart || Boolean(this.cart);
	    }
	  }, {
	    key: 'optionsHtml',
	    get: function get() {
	      var _this7 = this;

	      if (!this.options.contents.options) {
	        return '';
	      }
	      return this.decoratedOptions.reduce(function (acc, option) {
	        var data = option;
	        data.classes = _this7.classes;

	        return acc + _this7.childTemplate.render({ data: data });
	      }, '');
	    }
	  }, {
	    key: 'hasVariants',
	    get: function get() {
	      return this.model.variants.length > 1;
	    }
	  }, {
	    key: 'decoratedOptions',
	    get: function get() {
	      return this.model.options.map(function (option) {
	        return {
	          name: option.name,
	          values: option.values.map(function (value) {
	            return {
	              name: value,
	              selected: value === option.selected
	            };
	          })
	        };
	      });
	    }
	  }, {
	    key: 'shouldResizeX',
	    get: function get() {
	      return this.options.layout === 'horizontal';
	    }
	  }, {
	    key: 'shouldResizeY',
	    get: function get() {
	      return true;
	    }
	  }, {
	    key: 'selectedVariantTrackingInfo',
	    get: function get() {
	      var variant = this.model.selectedVariant;
	      return {
	        id: variant.id,
	        name: variant.productTitle,
	        quantity: this.model.selectedQuantity,
	        sku: null,
	        price: variant.price
	      };
	    }
	  }, {
	    key: 'modalProductConfig',
	    get: function get() {
	      var _this8 = this;

	      var modalProductStyles = void 0;
	      if (this.config.product.styles) {
	        modalProductStyles = merge({}, Object.keys(this.config.product.styles).reduce(function (productStyles, selectorKey) {
	          productStyles[selectorKey] = whitelistedProperties(_this8.config.product.styles[selectorKey]);
	          return productStyles;
	        }, {}), this.config.modalProduct.styles);
	      } else {
	        modalProductStyles = {};
	      }

	      return _extends({}, this.config.modalProduct, {
	        styles: modalProductStyles
	      });
	    }
	  }, {
	    key: 'onlineStoreParams',
	    get: function get() {
	      return {
	        channel: 'buy_button',
	        referrer: encodeURIComponent(windowUtils.location()),
	        variant: this.model.selectedVariant.id
	      };
	    }
	  }, {
	    key: 'onlineStoreQueryString',
	    get: function get() {
	      var _this9 = this;

	      return Object.keys(this.onlineStoreParams).reduce(function (string, key) {
	        return '' + string + key + '=' + _this9.onlineStoreParams[key] + '&';
	      }, '?');
	    }
	  }, {
	    key: 'onlineStoreURL',
	    get: function get() {
	      return 'https://' + this.props.client.config.domain + '/products/' + this.id + this.onlineStoreQueryString;
	    }
	  }]);
	  return Product;
	}(Component);

	function addClassToElement(className, element) {
	  if (element.classList) {
	    element.classList.add(className);
	  } else {
	    element.className += ' ' + className;
	  }
	}

	function removeClassFromElement(className, element) {
	  if (element.classList) {
	    element.classList.remove(className);
	  } else {
	    element.className = element.className.replace(className, '');
	  }
	}

	var Modal = function (_Component) {
	  inherits(Modal, _Component);

	  function Modal(config, props) {
	    classCallCheck(this, Modal);

	    var _this = possibleConstructorReturn(this, _Component.call(this, config, props));

	    _this.node = config.node || document.body.appendChild(document.createElement('div'));
	    _this.node.className = 'shopify-buy-modal-wrapper';
	    _this.product = null;
	    return _this;
	  }

	  Modal.prototype.delegateEvents = function delegateEvents() {
	    _Component.prototype.delegateEvents.call(this);
	    this.document.body.addEventListener('click', this.closeOnBgClick.bind(this));
	  };

	  Modal.prototype.closeOnBgClick = function closeOnBgClick(evt) {
	    if (!this.wrapper.contains(evt.target)) {
	      this.close();
	    }
	  };

	  Modal.prototype.init = function init(data) {
	    var _this2 = this;

	    this.isVisible = true;
	    return _Component.prototype.init.call(this, data).then(function () {
	      _this2.product = new Product(_this2.productConfig, _this2.props);
	      return _this2.product.init(_this2.model).then(function () {
	        return _this2.resize();
	      });
	    });
	  };

	  Modal.prototype.updateConfig = function updateConfig(config) {
	    var _this3 = this;

	    _Component.prototype.updateConfig.call(this, config);
	    this.product = new Product(this.productConfig, this.props);
	    return this.product.init(this.model).then(function () {
	      return _this3.resize();
	    });
	  };

	  Modal.prototype.close = function close() {
	    var _this4 = this;

	    this.isVisible = false;
	    removeClassFromElement('is-active', this.wrapper);
	    if (this.iframe) {
	      this.iframe.removeClass('is-active');
	      removeClassFromElement('is-active', this.document.body);
	    }
	    if (this.props.browserFeatures.transition) {
	      this.iframe.parent.addEventListener('transitionend', function () {
	        _this4.iframe.removeClass('is-block');
	      });
	    } else {
	      this.iframe.removeClass('is-block');
	    }
	  };

	  Modal.prototype.render = function render() {
	    if (!this.isVisible) {
	      return;
	    }
	    _Component.prototype.render.call(this);
	    this.iframe.addClass('is-active');
	    this.iframe.addClass('is-block');
	    addClassToElement('is-active', this.document.body);
	    addClassToElement('is-active', this.wrapper);
	  };

	  createClass$1(Modal, [{
	    key: 'typeKey',
	    get: function get() {
	      return 'modal';
	    }
	  }, {
	    key: 'DOMEvents',
	    get: function get() {
	      var events = _extends({}, this.options.DOMEvents, defineProperty({}, 'click .' + this.classes.modal.close.split(' ').join('.'), this.close.bind(this)));
	      if (this.product) {
	        events = _extends({}, events, this.product.DOMEvents);
	      }
	      return events;
	    }
	  }, {
	    key: 'productConfig',
	    get: function get() {
	      return {
	        node: this.wrapper,
	        options: merge({}, this.config)
	      };
	    }
	  }]);
	  return Modal;
	}(Component);

	var pollInterval$1 = 200;

	function isArray$1(arg) {
	  return Object.prototype.toString.call(arg) === '[object Array]';
	}

	var ProductSet = function (_Component) {
	  inherits(ProductSet, _Component);

	  function ProductSet(config, props) {
	    classCallCheck(this, ProductSet);

	    var _this = possibleConstructorReturn(this, _Component.call(this, config, props));

	    _this.products = [];
	    _this.cartNode = config.cartNode;
	    _this.modalNode = config.modalNode;
	    _this.cart = null;
	    _this.page = 1;
	    _this.nextModel = { products: [] };
	    _this.height = 0;
	    _this.resizeCompleted = false;
	    return _this;
	  }

	  ProductSet.prototype.init = function init(data) {
	    var _this2 = this;

	    return _Component.prototype.init.call(this, data).then(function (model) {
	      return _this2.props.createCart({ options: _this2.config }).then(function (cart) {
	        _this2.cart = cart;
	        if (model) {
	          return _this2.renderProducts(_this2.model.products);
	        }
	        return _this2;
	      });
	    });
	  };

	  ProductSet.prototype.sdkFetch = function sdkFetch() {
	    var _this3 = this;

	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


	    /* eslint-disable camelcase */
	    var queryOptions = _extends({}, this.fetchQuery, options);
	    var method = void 0;
	    if (this.id) {
	      var queryKey = isArray$1(this.id) ? 'product_ids' : 'collection_id';
	      method = this.props.client.fetchQueryProducts(_extends({}, queryOptions, defineProperty({}, queryKey, this.id)));
	    } else if (this.handle) {
	      method = this.props.client.fetchQueryCollections({ handle: this.handle }).then(function (collections) {
	        var collection = collections[0];
	        _this3.id = collection.attrs.collection_id;
	        return _this3.sdkFetch(options);
	      });
	    }
	    return method;

	    /* eslint-enable camelcase */
	  };

	  ProductSet.prototype.wrapTemplate = function wrapTemplate(html) {
	    return '<div class="' + this.classes.productSet.productSet + '">' + html + '</div>';
	  };

	  ProductSet.prototype.fetchData = function fetchData() {
	    return this.sdkFetch().then(function (products) {
	      if (products.length) {
	        return {
	          products: products
	        };
	      }
	      throw new Error('Not Found');
	    });
	  };

	  ProductSet.prototype.showPagination = function showPagination() {
	    var _this4 = this;

	    return this.sdkFetch({ page: this.page + 1 }).then(function (data) {
	      _this4.nextModel = { products: data };
	      _this4.renderChild(_this4.classes.productSet.paginationButton, _this4.paginationTemplate);
	      _this4.resize();
	      return;
	    });
	  };

	  ProductSet.prototype.nextPage = function nextPage() {
	    this.model = this.nextModel;
	    this.page = this.page + 1;
	    this.renderProducts();
	  };

	  ProductSet.prototype.updateConfig = function updateConfig(config) {
	    _Component.prototype.updateConfig.call(this, config);
	    this.cart.updateConfig(config);
	  };

	  ProductSet.prototype.resizeUntilFits = function resizeUntilFits() {
	    var _this5 = this;

	    if (!this.iframe || this.resizeCompleted) {
	      return;
	    }
	    var maxResizes = this.products.length;
	    var resizes = 0;

	    this.height = this.outerHeight;
	    this.resize();
	    var productSetResize = setInterval(function () {
	      var currentHeight = _this5.outerHeight;
	      if (parseInt(currentHeight, 10) > parseInt(_this5.height, 10)) {
	        resizes++;
	        _this5.height = currentHeight;
	        _this5.resize(currentHeight);
	      }
	      if (resizes > maxResizes) {
	        _this5.resizeCompleted = true;
	        clearInterval(productSetResize);
	      }
	    }, pollInterval$1);
	  };

	  ProductSet.prototype.renderProducts = function renderProducts() {
	    var _this6 = this;

	    if (!this.model.products.length) {
	      return Promise.resolve();
	    }
	    var productConfig = {
	      node: this.document.querySelector('.' + this.classes.productSet.products),
	      modalNode: this.modalNode,
	      cartNode: this.cartNode,
	      options: merge({}, this.config, {
	        product: {
	          iframe: false,
	          classes: {
	            wrapper: this.classes.productSet.product
	          }
	        }
	      })
	    };

	    var promises = this.model.products.map(function (productModel) {
	      var product = new Product(productConfig, _this6.props);
	      _this6.products.push(product);
	      return product.init(productModel);
	    });

	    return Promise.all(promises).then(function () {
	      _this6.resizeUntilFits();
	      _this6.showPagination();
	      return _this6;
	    });
	  };

	  createClass$1(ProductSet, [{
	    key: 'typeKey',
	    get: function get() {
	      return 'productSet';
	    }
	  }, {
	    key: 'nextButtonClass',
	    get: function get() {
	      return this.nextModel.products.length ? 'is-active' : '';
	    }
	  }, {
	    key: 'shouldResizeY',
	    get: function get() {
	      return true;
	    }
	  }, {
	    key: 'viewData',
	    get: function get() {
	      return {
	        classes: this.classes,
	        text: this.options.text,
	        nextButtonClass: this.nextButtonClass
	      };
	    }
	  }, {
	    key: 'DOMEvents',
	    get: function get() {
	      return _extends({}, this.options.DOMEvents, defineProperty({}, 'click .' + this.classes.productSet.paginationButton.split(' ').join('.'), this.nextPage.bind(this)));
	    }
	  }, {
	    key: 'paginationTemplate',
	    get: function get() {
	      this._paginationTemplate = this._paginationTemplate || new Template({ pagination: this.options.templates.pagination }, { pagination: true }, ['pagination']);
	      return this._paginationTemplate;
	    }
	  }, {
	    key: 'fetchQuery',
	    get: function get() {
	      return {
	        limit: 30,
	        page: 1
	      };
	    }
	  }]);
	  return ProductSet;
	}(Component);

	var CartToggle = function (_Component) {
	  inherits(CartToggle, _Component);

	  function CartToggle(config, props) {
	    classCallCheck(this, CartToggle);

	    var _this = possibleConstructorReturn(this, _Component.call(this, config, props));

	    _this.node = _this.props.cart.node.parentNode.insertBefore(document.createElement('div'), _this.props.cart.node);
	    return _this;
	  }

	  CartToggle.prototype.render = function render() {
	    _Component.prototype.render.call(this);
	    if (this.options.sticky) {
	      this.iframe.addClass('is-sticky');
	    }
	    if (this.isVisible) {
	      this.iframe.addClass('is-active');
	    } else {
	      this.iframe.removeClass('is-active');
	    }
	  };

	  createClass$1(CartToggle, [{
	    key: 'isVisible',
	    get: function get() {
	      return this.count > 0;
	    }
	  }, {
	    key: 'typeKey',
	    get: function get() {
	      return 'toggle';
	    }
	  }, {
	    key: 'count',
	    get: function get() {
	      return this.props.cart.model.lineItems.reduce(function (acc, lineItem) {
	        return acc + lineItem.quantity;
	      }, 0);
	    }
	  }, {
	    key: 'viewData',
	    get: function get() {
	      return {
	        classes: this.classes,
	        text: this.text,
	        count: this.count
	      };
	    }
	  }, {
	    key: 'shoudldResizeY',
	    get: function get() {
	      return !this.options.sticky;
	    }
	  }, {
	    key: 'shoudldResizeX',
	    get: function get() {
	      return !this.options.sticky;
	    }
	  }, {
	    key: 'stickyClass',
	    get: function get() {
	      return this.options.sticky ? 'is-sticky' : 'is-inline';
	    }
	  }, {
	    key: 'DOMEvents',
	    get: function get() {
	      return merge({}, this.options.DOMEvents, {
	        click: this.props.cart.toggleVisibility.bind(this.props.cart)
	      });
	    }
	  }]);
	  return CartToggle;
	}(Component);

	var Cart = function (_Component) {
	  inherits(Cart, _Component);

	  function Cart(config, props, storage) {
	    classCallCheck(this, Cart);

	    var _this = possibleConstructorReturn(this, _Component.call(this, config, props));

	    _this.storage = storage || window.localStorage;
	    _this.addVariantToCart = _this.addVariantToCart.bind(_this);
	    _this.childTemplate = new Template(_this.config.lineItem.templates, _this.config.lineItem.contents, _this.config.lineItem.order);
	    _this.node = config.node || document.body.appendChild(document.createElement('div'));
	    _this.node.className = 'shopify-buy-cart-wrapper';
	    _this.isVisible = _this.options.startOpen;
	    _this.toggle = new CartToggle(config, _extends({}, _this.props, { cart: _this }));
	    _this.checkout = new Checkout(_this.config);
	    return _this;
	  }

	  Cart.prototype.fetchData = function fetchData() {
	    var _this2 = this;

	    if (this.storage.getItem('lastCartId')) {
	      return this.props.client.fetchCart(this.storage.getItem('lastCartId'));
	    } else {
	      return this.props.client.createCart().then(function (cart) {
	        try {
	          _this2.storage.setItem('lastCartId', cart.id);
	        } catch (err) {
	          // eslint-disable-next-line
	          console.warn('localStorage unsupported');
	        }
	        return cart;
	      });
	    }
	  };

	  Cart.prototype.wrapTemplate = function wrapTemplate(html) {
	    return '<div class="' + this.classes.cart.cart + '">' + html + '</div>';
	  };

	  Cart.prototype.init = function init(data) {
	    var _this3 = this;

	    return _Component.prototype.init.call(this, data).then(function (cart) {
	      return _this3.toggle.init({ lineItems: cart.model.lineItems }).then(function () {
	        return _this3;
	      });
	    });
	  };

	  Cart.prototype.render = function render() {
	    _Component.prototype.render.call(this);
	    if (this.isVisible) {
	      this.iframe.addClass('is-active');
	    } else {
	      this.iframe.removeClass('is-active');
	    }
	  };

	  Cart.prototype.destroy = function destroy() {
	    _Component.prototype.destroy.call(this);
	    this.toggle.destroy();
	  };

	  Cart.prototype.close = function close() {
	    this.isVisible = false;
	    this.render();
	  };

	  Cart.prototype.open = function open() {
	    this.isVisible = true;
	    this.render();
	  };

	  Cart.prototype.toggleVisibility = function toggleVisibility(visible) {
	    this.isVisible = visible || !this.isVisible;
	    this.render();
	  };

	  Cart.prototype.onQuantityBlur = function onQuantityBlur(evt, target) {
	    this.setQuantity(target, function () {
	      return target.value;
	    });
	  };

	  Cart.prototype.onQuantityIncrement = function onQuantityIncrement(qty, evt, target) {
	    this.setQuantity(target, function (prevQty) {
	      return prevQty + qty;
	    });
	  };

	  Cart.prototype.setQuantity = function setQuantity(target, fn) {
	    var id = target.getAttribute('data-line-item-id');
	    var item = this.model.lineItems.filter(function (lineItem) {
	      return lineItem.id === id;
	    })[0];
	    var newQty = fn(item.quantity);
	    return this.props.tracker.trackMethod(this.updateItem.bind(this), 'CART_UPDATE', this.cartItemTrackingInfo(item, newQty))(id, newQty);
	  };

	  Cart.prototype.updateItem = function updateItem(id, qty) {
	    var _this4 = this;

	    return this.model.updateLineItem(id, qty).then(function (cart) {
	      _this4.model = cart;
	      _this4.toggle.render();
	      if (qty > 0) {
	        _this4.render();
	      } else {
	        _this4.animateRemoveItem(id);
	      }
	      return cart;
	    });
	  };

	  Cart.prototype.animateRemoveItem = function animateRemoveItem(id) {
	    var _this5 = this;

	    var el = this.document.getElementById(id);
	    addClassToElement('is-hidden', el);
	    if (this.props.browserFeatures.transition) {
	      el.addEventListener('transitionend', function () {
	        // eslint-disable-next-line
	        // TODO: why is transitionend sometimes called twice?
	        if (!el.parentNode) {
	          return;
	        }
	        el.parentNode.removeChild(el);
	        _this5.render();
	      });
	    } else {
	      el.parentNode.removeChild(el);
	    }
	  };

	  Cart.prototype.updateConfig = function updateConfig(config) {
	    _Component.prototype.updateConfig.call(this, config);
	    this.toggle.updateConfig(config);
	  };

	  Cart.prototype.onCheckout = function onCheckout() {
	    this.checkout.open(this.model.checkoutUrl);
	  };

	  Cart.prototype.addVariantToCart = function addVariantToCart(variant) {
	    var _this6 = this;

	    var quantity = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

	    this.isVisible = true;
	    this.render();
	    return this.model.addVariants({ variant: variant, quantity: quantity }).then(function (cart) {
	      _this6.render();
	      _this6.toggle.render();
	      return cart;
	    });
	  };

	  Cart.prototype.cartItemTrackingInfo = function cartItemTrackingInfo(item, quantity) {
	    return {
	      id: item.variant_id,
	      name: item.title,
	      sku: null,
	      price: item.price,
	      prevQuantity: item.quantity,
	      quantity: parseFloat(quantity)
	    };
	  };

	  createClass$1(Cart, [{
	    key: 'typeKey',
	    get: function get() {
	      return 'cart';
	    }
	  }, {
	    key: 'DOMEvents',
	    get: function get() {
	      var _merge;

	      return merge({}, this.options.DOMEvents, (_merge = {}, defineProperty(_merge, 'click .' + this.classes.cart.close.split(' ').join('.'), this.close.bind(this)), defineProperty(_merge, 'click .' + this.classes.lineItem.quantityButton.split(' ').join('.') + '.quantity-increment', this.onQuantityIncrement.bind(this, 1)), defineProperty(_merge, 'click .' + this.classes.lineItem.quantityButton.split(' ').join('.') + '.quantity-decrement', this.onQuantityIncrement.bind(this, -1)), defineProperty(_merge, 'click .' + this.classes.cart.button.split(' ').join('.'), this.onCheckout.bind(this)), defineProperty(_merge, 'blur .' + this.classes.lineItem.quantityInput.split(' ').join('.'), this.onQuantityBlur.bind(this)), _merge));
	    }
	  }, {
	    key: 'lineItemsHtml',
	    get: function get() {
	      var _this7 = this;

	      return this.model.lineItems.reduce(function (acc, lineItem) {
	        var data = lineItem;
	        data.classes = _this7.classes;
	        return acc + _this7.childTemplate.render({ data: data }, function (output) {
	          return '<div id="' + lineItem.id + '" class=' + _this7.classes.lineItem.lineItem + '>' + output + '</div>';
	        });
	      }, '');
	    }
	  }, {
	    key: 'viewData',
	    get: function get() {
	      return merge(this.model, {
	        text: this.options.text,
	        classes: this.classes,
	        lineItemsHtml: this.lineItemsHtml,
	        isEmpty: this.isEmpty
	      });
	    }
	  }, {
	    key: 'isEmpty',
	    get: function get() {
	      return this.model.lineItems.length < 1;
	    }
	  }, {
	    key: 'wrapperClass',
	    get: function get() {
	      return this.isVisible ? 'is-active' : '';
	    }
	  }]);
	  return Cart;
	}(Component);

	var Tracker = function () {
	  function Tracker(lib) {
	    classCallCheck(this, Tracker);

	    this.lib = lib || null;
	  }

	  Tracker.prototype.trackMethod = function trackMethod(fn, event, properties) {
	    var self = this;
	    return function () {
	      var returnValue = fn.apply(undefined, arguments);
	      if (returnValue && returnValue.then) {
	        return returnValue.then(function (val) {
	          self.callLib(event, properties);
	          return val;
	        });
	      }
	      self.callLib(event, properties);
	      return returnValue;
	    };
	  };

	  Tracker.prototype.callLib = function callLib(eventName, properties) {
	    switch (eventName) {
	      case 'CART_UPDATE':
	        if (properties.quantity < 1) {
	          return this.track('CART_REMOVE', properties);
	        }
	        if (properties.quantity < properties.prevQuantity) {
	          return this.track('CART_DECREMENT', properties);
	        }
	        return this.track('CART_INCREMENT', properties);
	      default:
	        return this.track(eventName, properties);
	    }
	  };

	  Tracker.prototype.trackPageview = function trackPageview() {
	    if (this.lib && this.lib.page) {
	      this.lib.page();
	    }
	  };

	  Tracker.prototype.track = function track(eventName, properties) {
	    properties.pageurl = document.referrer;
	    if (this.lib && this.lib.track) {
	      this.lib.track(eventName, properties);
	    }
	  };

	  return Tracker;
	}();

	var hostStyles = ".shopify-buy-frame {\n  display: inline-block; }\n  .shopify-buy-frame iframe {\n    width: 100%;\n    display: block;\n    height: 0;\n    overflow: hidden; }\n\n.shopify-buy-frame--cart {\n  width: 100%;\n  max-width: 350px;\n  position: fixed;\n  top: 0;\n  right: 0;\n  height: 100%;\n  z-index: 2147483647;\n  transform: translateX(100%);\n  -webkit-transform: translateX(100%);\n  transition: all 250ms cubic-bezier(0.165, 0.84, 0.44, 1); }\n  .shopify-buy-frame--cart iframe {\n    height: 100%; }\n  .shopify-buy-frame--cart.is-active {\n    transform: translateX(0);\n    -webkit-transform: translateX(0); }\n\n.shopify-buy-frame--product {\n  display: block; }\n  .shopify-buy-frame--product.layout-horizontal {\n    display: block; }\n    .shopify-buy-frame--product.layout-horizontal iframe {\n      max-width: 100%; }\n      @media (min-width: 801px) {\n        .shopify-buy-frame--product.layout-horizontal iframe {\n          max-width: 950px;\n          margin-left: auto;\n          margin-right: auto; } }\n\n.shopify-buy-frame--toggle.is-sticky {\n  display: none;\n  position: fixed;\n  right: 0;\n  top: 50%;\n  transform: translateX(0);\n  -webkit-transform: translateX(0);\n  max-width: 46px;\n  z-index: 2147483645; }\n\n.shopify-buy-frame--toggle.is-active {\n  display: block; }\n\n.shopify-buy-frame--toggle iframe {\n  height: auto; }\n\n.shopify-buy-frame--productSet {\n  width: 100%; }\n\n.shopify-buy-frame--modal {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n  z-index: 2147483646;\n  display: none;\n  transition: background 300ms ease; }\n  .shopify-buy-frame--modal iframe {\n    height: 100%;\n    width: 100%;\n    max-width: none; }\n  .shopify-buy-frame--modal.is-active {\n    background: rgba(0, 0, 0, 0.6); }\n  .shopify-buy-frame--modal.is-block {\n    display: block; }\n";

	var conditionalStyles$1 = ".shopify-buy-frame--cart {\n  display: none; }\n  .shopify-buy-frame--cart.is-active {\n    display: block; }\n";

	var frameUtils = {};

	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	if (window.requestAnimationFrame && window.cancelAnimationFrame) {
	  frameUtils.requestAnimationFrame = window.requestAnimationFrame;
	  frameUtils.cancelAnimationFrame = window.cancelAnimationFrame;
	} else {
	  for (var x = 0; x < vendors.length && !frameUtils.requestAnimationFrame; ++x) {
	    frameUtils.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
	    frameUtils.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	  }

	  if (!frameUtils.requestAnimationFrame) frameUtils.requestAnimationFrame = function (callback, element) {
	    var currTime = new Date().getTime();
	    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	    var id = window.setTimeout(function () {
	      callback(currTime + timeToCall);
	    }, timeToCall);
	    lastTime = currTime + timeToCall;
	    return id;
	  };

	  if (!frameUtils.cancelAnimationFrame) frameUtils.cancelAnimationFrame = function (id) {
	    clearTimeout(id);
	  };
	}

	function CustomEvent(event, params) {
	  params = params || { bubbles: false, cancelable: false, detail: undefined };
	  var evt = document.createEvent('CustomEvent');
	  evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
	  return evt;
	};

	CustomEvent.prototype = window.Event.prototype;

	var throttle = function throttle(type, name, obj) {
	  obj = obj || window;
	  var running = false;
	  var func = function func() {
	    if (running) {
	      return;
	    }
	    running = true;
	    frameUtils.requestAnimationFrame.call(window, function () {
	      obj.dispatchEvent(new CustomEvent(name));
	      running = false;
	    });
	  };
	  obj.addEventListener(type, func);
	};

	function detectCSSFeature(featurename) {
	  var feature = false,
	      domPrefixes = 'Webkit Moz ms O'.split(' '),
	      elm = document.createElement('div'),
	      featurenameCapital = null;

	  featurename = featurename.toLowerCase();

	  if (elm.style[featurename] !== undefined) {
	    feature = true;
	  }

	  if (feature === false) {
	    featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
	    for (var i = 0; i < domPrefixes.length; i++) {
	      if (elm.style[domPrefixes[i] + featurenameCapital] !== undefined) {
	        feature = true;
	        break;
	      }
	    }
	  }
	  return feature;
	}

	var supportsAnimations = function supportsAnimations() {
	  return detectCSSFeature('animation');
	};

	var supportsTransitions = function supportsTransitions() {
	  return detectCSSFeature('transition');
	};

	var supportsTransforms = function supportsTransforms() {
	  return detectCSSFeature('transform');
	};

	var browserFeatures = {
	  animation: supportsAnimations(),
	  transition: supportsTransitions(),
	  transform: supportsTransforms()
	};

	var DATA_ATTRIBUTE = 'data-shopify-buy-ui';
	var ESC_KEY = 27;

	var UI = function () {
	  function UI(client, trackingLib) {
	    classCallCheck(this, UI);

	    this.client = client;
	    this.iframeComponents = [];
	    this.components = {
	      product: [],
	      cart: [],
	      collection: [],
	      productSet: [],
	      modal: [],
	      toggle: []
	    };
	    this.componentTypes = {
	      product: Product,
	      cart: Cart,
	      collection: ProductSet,
	      productSet: ProductSet,
	      toggle: CartToggle
	    };
	    this.tracker = new Tracker(trackingLib);
	    this.tracker.trackPageview();
	    this._appendStyleTag();
	    this._bindResize();
	    this._bindHostClick();
	    this._bindEsc();
	  }

	  UI.prototype.createCart = function createCart(config) {
	    if (this.components.cart.length) {
	      return Promise.resolve(this.components.cart[0]);
	    } else {
	      var cart = new Cart(config, this.componentProps);
	      this.components.cart.push(cart);
	      return cart.init();
	    }
	  };

	  UI.prototype.closeCart = function closeCart() {
	    if (this.components.cart.length) {
	      this.components.cart.forEach(function (cart) {
	        if (cart.isVisible) {
	          cart.close();
	        }
	      });
	    }
	  };

	  UI.prototype.openCart = function openCart() {
	    if (this.components.cart.length) {
	      this.components.cart.forEach(function (cart) {
	        cart.open();
	      });
	    }
	  };

	  UI.prototype.toggleCart = function toggleCart(visibility) {
	    if (this.components.cart.length) {
	      this.components.cart.forEach(function (cart) {
	        cart.toggleVisibility(visibility);
	      });
	    }
	  };

	  UI.prototype.createModal = function createModal(config) {
	    if (this.components.modal.length) {
	      return this.components.modal[0];
	    } else {
	      var modal = new Modal(config, this.componentProps);
	      this.components.modal.push(modal);
	      return modal;
	    }
	  };

	  UI.prototype.closeModal = function closeModal() {
	    if (this.components.modal.length) {
	      this.components.modal.forEach(function (modal) {
	        return modal.close();
	      });
	    }
	  };

	  UI.prototype.createComponent = function createComponent(type, config) {
	    config.node = config.node || this._queryEntryNode();
	    var component = new this.componentTypes[type](config, this.componentProps);
	    this.components[type].push(component);
	    return component.init();
	  };

	  UI.prototype.destroyComponent = function destroyComponent(type, id) {
	    var _this = this;

	    this.components[type].forEach(function (component, index) {
	      if (!component.model.id === id) {
	        return;
	      }
	      _this.components[type][index].destroy();
	      _this.components[type].splice(index, 1);
	    });
	  };

	  UI.prototype._queryEntryNode = function _queryEntryNode() {
	    this.entry = this.entry || window.document.querySelectorAll('script[' + DATA_ATTRIBUTE + ']')[0];
	    this.entry.removeAttribute(DATA_ATTRIBUTE);

	    var div = document.createElement('div');
	    this.entry.parentNode.insertBefore(div, this.entry);
	    return div;
	  };

	  UI.prototype._appendStyleTag = function _appendStyleTag() {
	    var styleTag = document.createElement('style');
	    if (styleTag.styleSheet) {
	      styleTag.styleSheet.cssText = this.styleText;
	    } else {
	      styleTag.appendChild(document.createTextNode(this.styleText));
	    }
	    document.head.appendChild(styleTag);
	  };

	  UI.prototype._bindHostClick = function _bindHostClick() {
	    var _this2 = this;

	    document.addEventListener('click', function () {
	      _this2.closeCart();
	    });
	  };

	  UI.prototype._bindResize = function _bindResize() {
	    var _this3 = this;

	    throttle('resize', 'safeResize');
	    window.addEventListener('safeResize', function () {
	      _this3.components.collection.forEach(function (collection) {
	        return collection.resize();
	      });
	      _this3.components.productSet.forEach(function (set) {
	        return set.resize();
	      });
	    });
	  };

	  UI.prototype._bindEsc = function _bindEsc() {
	    var _this4 = this;

	    window.addEventListener('keydown', function (evt) {
	      if (evt.keyCode !== ESC_KEY) {
	        return;
	      }
	      _this4.closeModal();
	      _this4.closeCart();
	    });
	  };

	  createClass$1(UI, [{
	    key: 'componentProps',
	    get: function get() {
	      return {
	        client: this.client,
	        createCart: this.createCart.bind(this),
	        closeCart: this.closeCart.bind(this),
	        toggleCart: this.toggleCart.bind(this),
	        createModal: this.createModal.bind(this),
	        closeModal: this.closeModal.bind(this),
	        tracker: this.tracker,
	        browserFeatures: browserFeatures
	      };
	    }
	  }, {
	    key: 'styleText',
	    get: function get() {
	      if (browserFeatures.transition && browserFeatures.transform && browserFeatures.animation) {
	        return hostStyles;
	      }
	      return hostStyles + conditionalStyles$1;
	    }
	  }]);
	  return UI;
	}();

	Shopify.UI = {
	  ui: null,

	  init: function init(client) {
	    var trackingLib = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

	    if (!this.ui) {
	      this.ui = new UI(client, trackingLib);
	    }
	    return this.ui;
	  },


	  adapterHelpers: {
	    templates: {
	      product: productTemplate
	    }
	  },

	  UIConstructor: UI
	};

	window.ShopifyBuy = Shopify;

	return Shopify;

}));