import Handlebars from 'handlebars';
Handlebars.registerHelper('conditionalString', (val1, val2, output) => {
  return val1 === val2 ? output : null;
});

let idCounter = 0;

function uniqueId() {
  return `shopify-ui-${++idCounter}`;
}

export default class View {
  constructor(config, data, events = {}) {
    this.config = config;
    this.data = data;
    this.events = events;
    this.id = uniqueId();
  }

  listen() {
    let eventNodes = this.wrapper.querySelectorAll('[data-event]');
    [...eventNodes].forEach((node) => {
      let [eventType, eventName] = node.dataset.event.split('.');
      node.addEventListener(eventType, (evt) => {
        this.events[eventName].call(this, this, evt);
        if (this.config[eventName] && typeof this.config[eventName] === 'function') {
          this.config[eventName].call(this, this.data, evt);
        }
      });
    })
  }

  get templateString() {
    return this.config.contents.reduce((string, item) => {
      return string + this.config.templates[item];
    }, '');
  }

  get template() {
    return Handlebars.compile(this.templateString);
  }

  resizeAfterImgLoad() {
    if (this.events.imagesRendered && typeof this.events.imagesRendered === 'function') {
      let promises = [...this.wrapper.querySelectorAll('img')].map(img => {
        return new Promise((resolve) => {
          img.addEventListener('load', (evt) => {
            resolve(evt)
          });
        });
      });
      if (promises.length) {
        Promise.all(promises).then(result => {
          this.events.imagesRendered();
        });
      }
    }
  }

  render(wrapper) {
    let data = {
      data: this.data,
      classes: this.config.classes
    };
    let html = this.template(data);
    wrapper.innerHTML = this.template(data);
    wrapper.setAttribute('id', this.id);
    this.wrapper = wrapper;
    this.resizeAfterImgLoad()
    this.listen();
  }
}

