const modalTemplates = {
  contents: `
              <button class="{{data.classes.modal.close}}" data-element="modal.close">
                <span aria-hidden="true">&times;</span>
                <span class="visuallyhidden">{{data.text.closeAccessibilityLabel}}</span>
              </button>
            `,
};

export default modalTemplates;
