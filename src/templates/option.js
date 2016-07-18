const optionTemplates = {
  option: '<div class={{data.classes.option}}>' +
    '<label>{{data.name}}</label>' +
    '<div class="shopify-select">' +
      '<select class="{{data.classes.select}}" name="{{data.name}}">' +
        '{{#data.values}}' +
          '<option {{#disabled}}disabled{{/disabled}} {{#selected}}selected{{/selected}} value={{name}}>{{name}}</option>' +
        '{{/data.values}}' +
      '</select>' +
      '<svg class="shopify-select-icon" viewBox="0 0 24 24"><path d="M21 5.176l-9.086 9.353L3 5.176.686 7.647 12 19.382 23.314 7.647 21 5.176z"></path></svg>' +
    '</div>' +
  '</div>',
};

export default optionTemplates;
