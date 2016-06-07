const optionTemplates = {
  'option': '<select data-event="change.selectVariant" name={{name}}' +
              ' selected={{selected}}>' +
              '{{#each values}}' +
                  '<option {{conditionalString ../selected this "selected"}}  value={{this}}>{{this}}</option>' +
              '{{/each}}' +
            '</select>'
}

export default optionTemplates;
