import merge from '../../src/utils/merge';

describe('merge util', () => {
  it('merges objects recursively', () => {
    const original = {
      lol: true,
      a: 'strings',
      b: {
        c: 'lol',
        d: {
          style: 'fancy',
          color: 'blue',
        }
      }
    }

    const patch = {
      a: 'new strings',
      b: {
        d: {
          color: 'green',
        }
      }
    }

    const expected = {
      lol: true,
      a: 'new strings',
      b: {
        c: 'lol',
        d: {
          style: 'fancy',
          color: 'green',
        }
      }
    }
    assert.deepEqual(merge(original, patch), expected);
  });

  it('copies getters', () => {
    const original = {
      lol: true,
      get a() {
        return 'gotten';
      }
    }

    const patch = {color: 'green'};

    const expected = {
      lol: true,
      a: 'gotten',
      color: 'green',
    }

    assert.deepEqual(merge(original, patch), expected);
  });

  it('does not merge arrays', () => {
    const original = {
      arr: ['a', 'b', 'c']
    }

    const patch = {
      arr: ['a', 'z']
    }

    const expected = {
      arr: ['a', 'z']
    }

    assert.deepEqual(merge(original, patch), expected);
  });

  it('merges multiple sources', () => {
    const original = {
      lol: true,
      color: 'blue',
    }

    const patch1 = {
      lol: false,
    }

    const patch2 = {
      color: 'green',
      foo: 'food',
    }

    const expected = {
      lol: false,
      color: 'green',
      foo: 'food',
    }

    assert.deepEqual(merge(original, patch1, patch2), expected);
  });

  it('assigns if passed an empty object', () => {
    const patch1 = {
      lol: false,
      styles: {
        color: 'blue'
      }
    }

    const patch2 = {
      styles: {
        color: 'green',
      }
    }

    const expected = {
      lol: false,
      styles: {
        color: 'green'
      }
    }

    assert.deepEqual(merge({}, patch1, patch2), expected);
  });
});
