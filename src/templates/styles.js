const stylesTemplate = '{{#selectors}}' +
                          '{{#media}} {{media}} { {{/media}}' +
                          '{{selector}} { ' +
                          '{{#declarations}}' +
                            '{{property}}: {{{value}}};' +
                          '{{/declarations}}' +
                          ' } ' +

                          '{{#media}} } {{/media}}' +
                      '{{/selectors}}';
export default stylesTemplate;
