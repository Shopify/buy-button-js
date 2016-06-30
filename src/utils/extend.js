export default function extend(a,b) {
  for ( var i in b ) {
    var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);

    if ( g || s ) {
      if ( g )
        a.__defineGetter__(i, g);
      if ( s )
        a.__defineSetter__(i, s);
    } else
      a[i] = b[i];
  }
  return a;
}
