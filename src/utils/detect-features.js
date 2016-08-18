function detectCSSFeature(featurename){
  var feature = false,
  domPrefixes = 'Webkit Moz ms O'.split(' '),
  elm = document.createElement('div'),
  featurenameCapital = null;

  featurename = featurename.toLowerCase();

  if( elm.style[featurename] !== undefined ) { feature = true; }

  if( feature === false ) {
    featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
    for( var i = 0; i < domPrefixes.length; i++ ) {
      if( elm.style[domPrefixes[i] + featurenameCapital ] !== undefined ) {
        feature = true;
        break;
      }
    }
  }
  return feature;
}

var supportsAnimations = function() {
  return detectCSSFeature('animation');
}

var supportsTransitions = function() {
  return detectCSSFeature('transition');
}

var supportsTransforms = function() {
  return detectCSSFeature('transform');
}

export default {
  animation: supportsAnimations(),
  transition: supportsTransitions(),
  transform: supportsTransforms(),
}
