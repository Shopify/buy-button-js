
  describe('updateConfig', () => {
    const newConfig = {
      options: {
        styles: {
          button: {
            'color': 'red',
          },
        },
      },
    }

    let superSpy;

    beforeEach(() => {
      superSpy = sinon.stub(Updater.prototype, 'updateConfig');
      cart.toggles[0].updateConfig = sinon.spy();
    });

    afterEach(() => {
      superSpy.restore();
    });

    it('calls updateConfig on toggle', () => {
      cart.updateConfig(newConfig);
      assert.calledWith(cart.toggles[0].updateConfig, newConfig);
      assert.calledWith(superSpy, newConfig);
    });
  });

  describe('updateConfig', () => {
    it('updates config with passed options', () => {
      const updateConfig = {
        id: 123,
        options: {
          product: {
            styles: {
              button: {
                'color': 'blue'
              }
            },
          }
        }
      }
      component.updateConfig(updateConfig);
      assert.equal(component.options.styles.button.color, 'blue');
    });
  });

