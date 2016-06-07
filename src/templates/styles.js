const stylesTemplate = '{{#each selectors}}' +
                          '{{this.selector}} \{ ' +
                          '{{#each this.declarations}}' +
                            '{{this.name}}: {{this.value}};'+
                          '{{/each}}' +
                          ' \} ' +
                         '{{/each}}';

export default stylesTemplate;

