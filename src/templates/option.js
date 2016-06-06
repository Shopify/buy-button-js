const optionTemplates = {
  'option': '<select data-event="change.selectVariant" name={{name}}>' +
              '{{#each values}}' +
                  '<option value={{this}}>{{this}}</option>' +
              '{{/each}}' +
            '</select>'
}

export default optionTemplates;
