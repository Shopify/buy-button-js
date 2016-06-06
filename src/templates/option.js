const optionTemplates = {
  'option': '<select data-event="change.selectVariant">' +
              '{{#each values}}' +
                  '<option>{{value}}</option>' +
              '{{/each}}' +
            '</select>'
}

export default optionTemplates;
