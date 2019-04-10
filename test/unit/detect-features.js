import browserFeatures from '../../src/utils/detect-features';

describe('windowOpen', () => {
  it('returns true if user agent does not contain `Mac OS X`', () => {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36';
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => userAgent,
      configurable: true,
    });

    assert.isTrue(browserFeatures.windowOpen());
  });

  it('returns false if user agent contains `Mac OS X` and `Instagram`', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57 Instagram 85.0.0.10.100 (iPhone10,3; iOS 12_1_4; en_US; en-US; scale=3.00; gamut=wide; 1125x2436; 145918352)';
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => userAgent,
      configurable: true,
    });

    assert.isFalse(browserFeatures.windowOpen());
  });

  it('returns false if user agent contains `Mac OS X` and `Pinterest/iOS`', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57 [Pinterest/iOS]';
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => userAgent,
      configurable: true,
    });

    assert.isFalse(browserFeatures.windowOpen());
  });

  it('returns false if user agent contains `Mac OS X` amd `FBAN/FBIOS`', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57 [FBAN/FBIOS;FBDV/iPhone9,1;FBMD/iPhone;FBSN/iOS;FBSV/12.1.4;FBSS/2;FBCR/Verizon;FBID/phone;FBLC/en_US;FBOP/5]';
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => userAgent,
      configurable: true,
    });

    assert.isFalse(browserFeatures.windowOpen());
  });

  it('returns false if user agent contains `Mac OS X` and `FBAN/MessengerForiOS`', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16C101 [FBAN/MessengerForiOS;FBAV/204.0.0.37.117;FBBV/143733207;FBDV/iPhone10,5;FBMD/iPhone;FBSN/iOS;FBSV/12.1.2;FBSS/3;FBCR/AT&T;FBID/phone;FBLC/en_US;FBOP/5]';
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => userAgent,
      configurable: true,
    });

    assert.isFalse(browserFeatures.windowOpen());
  });

  it('returns true if user agent contains `Mac OS X` but no unsupported apps', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1';
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => userAgent,
      configurable: true,
    });

    assert.isTrue(browserFeatures.windowOpen());
  });
});
