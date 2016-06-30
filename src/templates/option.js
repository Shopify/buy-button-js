const optionTemplates = {
      option: '<label>{{data.name}}</label>' +
              '<select class={{data.classes.select}} name={{data.name}}>' +
                '{{#data.decoratedValues}}' +
                  '<option {{#selected}}selected{{/selected}} value={{name}}>{{name}}</option>' +
                '{{/data.decoratedValues}}' +
              '</select>'
}
export default optionTemplates;
