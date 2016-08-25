import productTemplates from '../../templates/product';

const productModalTemplate = {
  contents: `
    <div class="{{data.classes.modal.img}}">${productTemplates.img}</div>
    <div class="{{data.classes.modal.contents}} {{#data.currentImage}}{{data.classes.modal.contentsWithImg}}{{/data.currentImage}}">
      <div class="{{data.classes.modal.scrollContents}}">
        ${productTemplates.title}
        ${productTemplates.price}
        ${productTemplates.options}
        ${productTemplates.description}
      </div>
    </div>
    <div class="{{data.classes.modal.footer}} {{#data.currentImage}}{{data.classes.modal.footerWithImg}}{{/data.currentImage}}">
      ${productTemplates.button}
    </div>
  `,
};

export default productModalTemplate;
