import Handlebars from 'handlebars';

Handlebars.registerHelper('conditionalString', (val1, val2, output) => {
  return val1 === val2 ? output : null;
});

let idCounter = 0;

function uniqueId() {
  return `shopify-ui-${++idCounter}`;
}

export default class View {
  constructor(config, data, events) {
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

  render(wrapper) {
    wrapper.innerHTML = this.template(this.data);
    wrapper.setAttribute('id', this.id);
    this.wrapper = wrapper;
    this.listen();
  }
}

