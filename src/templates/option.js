const optionTemplates = {
  'option': '<select data-event="change.selectVariant" name={{data.name}}>' +
              '{{#each data.values}}' +
                  '<option {{conditionalString ../data.selected this "selected"}}  value={{this}}>{{this}}</option>' +
              '{{/each}}' +
            '</select>'
}

export default optionTemplates;
