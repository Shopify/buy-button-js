import Tracker from '../../src/utils/track';

let tracker;

describe('Tracker', () => {

  beforeEach(() => {
    tracker = new Tracker();
  });

  afterEach(() => {
    tracker = null;
  });

  describe('trackMethod', () => {
    beforeEach(() => {
      tracker.callLib = sinon.spy();
    });

    describe('with a sync method', () => {
      it('calls passed method and tracks it', () => {
        let spy = sinon.spy();
        tracker.trackMethod(spy, 'TEST_EVENT', {test: true})('argument');
        assert.calledWith(spy, 'argument');
        assert.calledWith(tracker.callLib, 'TEST_EVENT', {test: true});
      });
    });

    describe('with an async method', () => {
      it('calls passed method and tracks it', () => {
        let spy = sinon.stub().returns(Promise.resolve());
        return tracker.trackMethod(spy, 'TEST_EVENT', {test: true})('argument').then(() => {
          assert.calledWith(spy, 'argument');
          assert.calledWith(tracker.callLib, 'TEST_EVENT', {test: true});
          return Promise.resolve();
        });
      });
    });
  });

  describe('callLib', () => {
    beforeEach(() => {
      tracker.track = sinon.spy();
    });

    it('calls tricorder with supplied eventName and properties', () => {
      const props = {
        id: 123,
      }
      tracker.callLib('TEST_EVENT', props);
      assert.calledWith(tracker.track, 'TEST_EVENT', props);
    });

    describe('with eventName Update Cart', () => {
      describe('if quantity increases', () => {
        it('calls tricorder with Added Product event name', () => {
          const props = {
            id: 123,
            quantity: 2,
            prevQuantity: 1,
          }
          tracker.callLib('Update Cart', props);
          assert.calledWith(tracker.track, 'Added Product', props);
        });
      });

      describe('if quantity decreases', () => {
        it('calls tricorder with Removed Product event name', () => {
          const props = {
            id: 123,
            quantity: 0,
            prevQuantity: 3,
          }
          tracker.callLib('Update Cart', props);
          assert.calledWith(tracker.track, 'Removed Product', props);
        });
      });

      describe('if quantity is zero', () => {
        it('calls tricorder with Removed Product event name', () => {
          const props = {
            id: 123,
            quantity: 0,
            prevQuantity: 3,
          }
          tracker.callLib('Update Cart', props);
          assert.calledWith(tracker.track, 'Removed Product', props);
        });
      });
    });
  });

  describe('trackPageview', () => {
    beforeEach(() => {
      tracker.lib = {
        page: sinon.spy(),
      }
    });

    it('calls tricorder with page info', () => {
      tracker.trackPageview();
      assert.calledOnce(tracker.lib.page);
    });
  });
});

