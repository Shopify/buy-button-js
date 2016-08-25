const optionTemplates = {
  option: `<div class={{data.classes.option.option}}>
    <label class="{{data.classes.option.label}} visuallyhidden">{{data.name}}</label>
      <div class="{{data.classes.option.wrapper}}">
      <select class="{{data.classes.option.select}}" name="{{data.name}}">
        {{#data.values}}
          <option {{#disabled}}disabled{{/disabled}} {{#selected}}selected{{/selected}} value={{name}}>{{data.name}}: {{name}}</option>
        {{/data.values}}
      </select>
      <svg class="shopify-select-icon" viewBox="0 0 24 24"><path d="M21 5.176l-9.086 9.353L3 5.176.686 7.647 12 19.382 23.314 7.647 21 5.176z"></path></svg>
    </div>
  </div>`,
};

export default optionTemplates;
