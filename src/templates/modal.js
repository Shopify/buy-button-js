const modalTemplates = {
  overlay: '<div class={{data.classes.modal.overlay}}></div>',
  contents: `<div class={{data.classes.modal.contents}}>
              <button class="{{data.classes.modal.close}}">
                <span aria-role="hidden">×</span>
                <span class="visuallyhidden">Close</span>
              </button>
            </div>`,
};

export default modalTemplates;
