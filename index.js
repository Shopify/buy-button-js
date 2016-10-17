var client = ShopifyBuy.buildClient({
  apiKey: 'bf081e860bc9dc1ce0654fdfbc20892d',
  domain: 'embeds.myshopify.com',
  appId: '6'
});

var ui = ShopifyBuy.UI.init(client);

// ui.createComponent('product', {
//   id: 3614411907,
//   options: {
//     option: {
//       styles: {
//         wrapper: {
//           'border': 'none',
//           'background': 'transparent',
//         },
//         select: {
//           color: 'white',
//         }
//       }
//     },
//     product: {
//       buttonDestination: 'checkout',
//       width: '200px',
//       order: [
//         'price',
//         'button',
//         'options',
//       ],
//       contents: {
//         title: false,
//         img: false,
//         description: false,
//         quantity: false,
//       },
//       text: {
//         button: 'BUY NOW',
//       },
//       classes: {
//         activeBtn: 'btn-active',
//       },
//       DOMEvents: {
//         'click .btn': function (evt, target) {
//           target.classList.add('btn-active');
//         },
//         'change .option-select__select': function (evt, target) {
//           var product = ui.components.product.filter(function (product) {
//             return product.id === 3614411907;
//           })[0];
//           product.onOptionSelect(evt);
//           product.onButtonClick(evt);
//           product.updateConfig({
//             options: {
//               product: {
//                 text: {
//                   button: 'THANKS!'
//                 }
//               }
//             }
//           });
//         },
//       },
//       styles: {
//         options: {
//           position: 'absolute',
//           right: 0,
//           'z-index': '2',
//         },
//         activeBtn: {
//           transform: 'translateX(-80px)',
//           transition: 'all .3s',
//         },
//         product: {
//           'background-color': '#c0392b',
//         },
//         button: {
//           transition: 'all .3s',
//           'background-color': '#e74c3c',
//           'border-radius': 0,
//           'font-weight': 'bold',
//           margin: '0!important',
//           float: 'right',
//           width: '60%',
//           padding: '8px 10px',
//           'z-index': '3',
//           position: 'relative',
//         },
//         prices: {
//           float: 'left',
//           width: '40%',
//           padding: '8px 10px',
//           margin: 0
//         },
//         price: {
//           color: 'white',
//           'font-size': '15px',
//           'font-weight': 'bold',
//         }
//       }
//     }
//   }
// });

// fancy hover example
/*ui.createComponent('product', {
  id: 8729805062,
  options: {
    product: {
      buttonDestination: 'modal',
      order: [
        'button',
        'img',
        'info',
      ],
      contents: {
        img: true,
        info: true,
        title: false,
        price: false,
        quantityInput: false,
      },
      templates: {
        info: '<div class="{{data.classes.product.overlay}}"></div>' +
        '<div class="{{data.classes.product.info}}">' +
        '<h1 class="{{data.classes.product.title}}">{{data.title}}</h1>' +
        '{{#data.hasVariants}}<div class="{{data.classes.product.options}}">' +
          '{{#data.decoratedOptions}}' +
          '<div class="{{data.classes.product.option}}">' +
          '{{#values}}' +
              '<span class="{{#disabled}}{{data.classes.option.optionDisabled}}{{/disabled}}  {{data.classes.product.optionValue}}">{{name}}</span>' +
          '{{/values}}' +
          '</div>' +
          '{{/data.decoratedOptions}}' +
        '</div>{{/data.hasVariants}}' +
        '<div class="{{data.classes.product.description}}">{{{data.description}}}</div>' +
        '</div>',
      },
      classes: {
        info: 'product-info',
        overlay: 'product-overlay',
        optionValue: 'product-option-value',
        option: 'product-option',
      },
      styles: {
        optionValue: {
          display: 'inline-block',
          'margin-right': '5px'
        },
        option: {
          'text-align': 'center',
        },
        info: {
          position: 'relative',
          transition: 'all .3s',
          background: 'white',
          padding: '20px',
        },
        button: {
          position: 'absolute',
          transition: 'all .3s',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          opacity: 0,
          top: '80px',
          'background-color': 'rgba(255, 255, 255, 0.3)',
          color: '#fff',
          border: '2px solid #fff',
          'z-index': '100',
          'font-weight': 'bold',
          ':hover': {
            'color': '#5ff7d2',
            'background-color': '#fff',
          }
        },
        overlay: {
          transition: 'all .3s',
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          'background-color': '#5ff7d2',
          opacity: 0,
        },
        product: {
          height: '410px',
          ':hover': {
            overlay: {
              opacity: '0.5',
            },
            button: {
              opacity: '1',
            },
            info: {
              'transform': 'translateY(-70px)',
            },
          },
        }
      }
    },
  }
});*/

// collection

/*ui.createComponent('collection', {
  id: 154868035,
  options: {
    product: {
      buttonDestination: 'modal',
    }
  }
});*/

// simple product

ui.createComponent('product', {
  id: 6640321030,
  options: {
    product: {
      buttonDestination: 'modal',
    }
  }
});


// fancy option selection
/*ui.createComponent('product', {
  id: 8728441478,
  options: {
    option: {
      templates: {
        option: '' +
          '<div class="{{}}">' +
            '<p>{{data.name}}</p>' +
            '<div>' +
              '{{#data.values}}' +
              '<button data-value={{name}} data-option={{data.name}} class="{{#disabled}}{{data.classes.option.optionDisabled}}{{/disabled}} {{#selected}}{{data.classes.option.optionSelected}}{{/selected}} {{data.classes.option.option}}">{{name}}</button>' +
              '{{/data.values}}' +
            '</div>' +
          '</div>'
      },
      styles: {
        option: {
          'border': '1px solid #444',
          'padding': '5px',
          'display': 'inline-block',
          'margin-top': '0!important',
          'margin-right': '5px',
          'background-color': '#fff',
        },
        optionDisabled: {
          'opacity': '0.2',
          'text-decoration': 'line-through'
        },
        optionSelected: {
          'border-color': 'red'
        }
      }
    },
    product: {
      layout: 'horizontal',
      DOMEvents: {
        'click .option-select': function (evt, target) {
          var data = target.dataset;
          var product = ui.components.product.filter(function (product) {
            return product.id === 8728441478;
          })[0];
          product.updateVariant(data.option, data.value);
        }
      },
      contents: {
        description: true,
        variantTitle: true,
      },
    }
  }
});

*/
