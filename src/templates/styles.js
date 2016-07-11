const stylesTemplate = '{{#selectors}}' +
                          '{{selector}} { ' +
                          '{{#declarations}}' +
                            '{{property}}: {{{value}}};' +
                          '{{/declarations}}' +
                          ' } ' +
                      '{{/selectors}}';
export default stylesTemplate;
