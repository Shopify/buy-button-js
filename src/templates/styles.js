const stylesTemplate ='{{#selectors}}' +
                          '{{selector}} \{ ' +
                          '{{#declarations}}' +
                            '{{name}}: {{value}};'+
                          '{{/declarations}}' +
                          ' \} ' +
                      '{{/selectors}}';
export default stylesTemplate;
