(function () {

  var fnNamePrefixRegex = /^[\S\s]*?function\s*/;
  var fnNameSuffixRegex = /[\s\(\/][\S\s]+$/;

  function _name() {
    var name = "";
    if (this === Function || this === Function.prototype.constructor) {
      name = "Function";
    }
    else if (this !== Function.prototype) {
      name = ("" + this).replace(fnNamePrefixRegex, "").replace(fnNameSuffixRegex, "");
    }
    return name;
  }

  // Inspect the polyfill-ability of this browser
  var needsPolyfill = !("name" in Function.prototype && "name" in (function x() {}));
  var canDefineProp = typeof Object.defineProperty === "function" &&
    (function() {
      var result;
      try {
        Object.defineProperty(Function.prototype, "_xyz", {
          get: function() {
            return "blah";
          },
          configurable: true
        });
        result = Function.prototype._xyz === "blah";
        delete Function.prototype._xyz;
      }
      catch (e) {
        result = false;
      }
      return result;
    })();

  // Add the "private" property for testing, even if the real property can be polyfilled
  Function.prototype._name = _name;


  // Polyfill it!
  if (canDefineProp && needsPolyfill) {
    Object.defineProperty(Function.prototype, "name", {
      get: _name
    });
  }

})();
