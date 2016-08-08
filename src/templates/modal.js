const modalTemplates = {
  overlay: '<div class={{data.classes.modal.overlay}}></div>',
  contents: `
              <button class="{{data.classes.modal.close}}">
                <span aria-role="hidden">×</span>
                <span class="visuallyhidden">Close</span>
              </button>
            `,
};

export default modalTemplates;
