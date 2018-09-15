"use strict";

//TODO make add cart work for main page
//TODO make add cart work for single page

/**
 * Get cart, render cart, add to cart, delete from cart
 */
class Cart {
  constructor() {
    this.catalog = {};
    this.cart = {
      total: 0,
      countGoods: 0,
      contents: [],
    };
    this.config = {
      url: {},
      selectors: {},
    };
  }

  init(config) {
    this.config = config;
    this.getCart('', this.renderCart);
    this.addToCartButtonHandler();
    this.deleteButtonHandler();
    this.quantityHandler('input' + this.config.selectors.quantity);
  }

  renderCart() {
    let renderCart = new RenderCart(this.cart.contents, this.cart.total);

    renderCart.init(this.config.selectors);
  }

  /**
   * Find all "Add to cart" buttons and if clicked start callback with "id" as param
   */
  addToCartButtonHandler() {
    let that = this;

    $(this.config.selectors.addToCart).click(function (event) {
      event.preventDefault();

      let id = +this.getAttribute('id'); // found id of added product
      that.getCatalog(id);
    })
  }

  deleteButtonHandler(){
    let that = this;
    $('.cart-container').on('click', this.config.selectors.del, function (event) {
      event.preventDefault();

      let id = +this.getAttribute('id'); // found id of added product
      that.deleteFromCart(id);
    })
  }

  deleteFromCart(id){
    let idx = this.checkInCart(id);

    this.cart.contents.splice(idx, 1);
    this.calcTotal();
    this.postToCart(this.cart);
    this.renderCart(this.cart);
  }

  /**
   * If quantity input value changed (and loose focus) send to callback product id and new value
   * @param String selector of quantity input
   */
  quantityHandler(selector){
    let that = this;
    $(document).on('change', selector, function () {
      let id = +this.dataset.id;
      let newVal = +this.value;

      that.setNewQuantity.call(that, id, newVal)
    })
  }

  setNewQuantity(id, newVal){
    let idx = this.checkInCart(id);
    this.cart.contents[idx].quantity = newVal;

    this.calcTotal();
    this.postToCart(this.cart);
    this.renderCart(this.cart);
  }

  getCatalog(id) {
    $.ajax({
      url: this.config.url.products,
      method: 'GET',
      dataType: 'json',
      success: data => {
        this.catalog = data;
        console.log('Got full catalog from JSON');
        this.getCart(id, this.getProdFromCatalog);
      },
      error: () => {
        console.log('Method getCatalog() FAILED');
      }
    })
  }

  /**
   * Get cart from JSON and do getProdFromCatalog(id) or render cart
   * @param number id - id of product that addToCart button was clicked
   */
  getCart(id, callback) {
    $.ajax({
      url: this.config.url.cart,
      method: 'GET',
      dataType: 'json',
      success: data => {
        this.cart = data;
        if (id) {
          callback.call(this, id);
        } else {
          console.log('Initial cart rendering');
          callback.call(this);
        }
      },
      error: () => {
        console.log('Method getCart() FAILED');
      }
    })
  }

  /**
   * Fint by id product in catalog and sent it to prepareForCart()
   * @param Int id - id of product was clicked
   */
  getProdFromCatalog(id) {
    // find in data object product with such id and push it to this.contents
    for (let i = 0; i < this.catalog.length; i++) {
      if (this.catalog[i].id === id) {
        this.prepareForCart(this.catalog[i]); // send founded product to callback
      }
    }
  }

  /**
   * Prepare product from catalog for PUSHing to cart
   * @param {} prod - product from catalog
   */
  prepareForCart(prod) {
    let newToCart = {};

    newToCart.id = prod.id;
    newToCart.name = prod.name;
    newToCart.price = prod.price;
    newToCart.href = prod.href;
    newToCart.img = prod.img;
    newToCart.rating = prod.rating;

    let inCartIndex = this.checkInCart(prod.id);
    if (inCartIndex >= 0) {
      this.cart.contents[inCartIndex].quantity += 1;
    } else {
      newToCart.quantity = 1;
      this.cart.contents.push(newToCart)
    }

    this.calcTotal();
    this.postToCart(this.cart);
    this.renderCart(this.cart)
  }

  /**
   * Check if cart has such product
   * @param id - product id that is needed to look through the cart
   * @returns number - 0 if not found ELSE product index of cart array
   */
  checkInCart(id) {
    // find in data object product with such id and push it to this.contents
    let cartArr = this.cart.contents;
    for (let i = 0; i < cartArr.length; i++) {
      if (cartArr[i].id === id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Calculate total and countGoods values and save it to this.cart
   */
  calcTotal() {
    if (this.cart.contents.length) {
      this.cart.countGoods = this.cart.contents.length;

      this.cart.total = 0;
      for (let i = 0; i < this.cart.contents.length; i++) {
        let price = this.cart.contents[i].price;
        let quantity = this.cart.contents[i].quantity;

        this.cart.total += price * quantity;
      }
    } else {
      this.cart.total = 0;
      this.cart.countGoods = 0;
    }
  }

  /**
   * POST cart to JSON file
   * @param {} data - cart data
   */
  postToCart(data) {
    $.ajax({
      url: this.config.url.cart,
      method: 'POST',
      contentType: "application/json",
      data: JSON.stringify(data),
      success: () => {
        console.log('Cart was SENT to DB');
      },
      error: () => {
        console.log('Cart sending to DB FAILED');
      }
    })
  }
}

/**
 * Find cart div and cart item template, clone template and fill it with cart items data, append it to DOM
 */
class RenderCart {
  constructor(items, total){
    this.items = items;
    this.total = total;
    this.selectors = {
      cart: '.cart-container',
      item: '.cart-item.template',
      href: '.cart-item-href',
      img: '.cart-item-img',
      name: '.cart-item-name',
      quantity: '.cart-item-quantity',
      price: '.cart-item-price',
      del: '.cart-item-del',
      rate: '.rate',
      subtotal: '.cart-item-subtotal',
      total: '.cart-total',
      displayNone: 'template',
    };
  }

  init(selectors){
    this.selectors = selectors;
    let cartNodes = document.querySelectorAll(this.selectors.cart);
    let ItemNodes = document.querySelectorAll(this.selectors.item);

    for (let i = 0; i < cartNodes.length; i++) {
      let cartNode = cartNodes[i];
      let itemNode = ItemNodes[i];

      this.clearCartContainer(cartNode);

      for (let cartItem, i = 0; i < this.items.length; i++) {
        cartItem = this.cloneNode(itemNode);

        this.setImg(this.selectors.img, cartItem, this.items[i]);
        this.setName(this.selectors.name, cartItem, this.items[i]);
        this.setHref(this.selectors.href, cartItem, this.items[i].href);
        this.setQuantity(this.selectors.quantity, cartItem, this.items[i]);
        this.setPrice(this.selectors.price, cartItem, this.items[i]);
        this.fillRateStars(this.selectors.rate, cartItem, this.items[i].rating);
        this.setDeleteButtonId(this.selectors.del, cartItem, this.items[i]);
        this.setSubTotal(this.selectors.subtotal, cartItem, this.items[i]);

        this.displayNoneDelete(this.selectors.displayNone, cartItem);
        this.itemAppend(cartNode, cartItem);
      }

      this.showTotalPrice(this.selectors.total, this.total);
    }
  }

  clearCartContainer(node){
    node.innerHTML = '';
  }

  cloneNode(itemNode){
    return itemNode.cloneNode(true);
  }

  setImg(selector, cartItem, product){
    cartItem.querySelector(selector).src = product.img[0];
    cartItem.querySelector(selector).alt = product.name;
    cartItem.querySelector(selector).title = product.name;
  }

  setName(selector, cartItem, product){
    cartItem.querySelector(selector).textContent = product.name;
  }

  /**
   * Add href to all elements of HTML collection
   * @param arr HTML collection
   * @param href
   */
  setHref(selector, cartItem, href){
    let aCollection = cartItem.querySelectorAll(selector);

    for (let i = 0; i < aCollection.length; i++) {
      aCollection[i].href = href;
    }
  }

  setQuantity(selector, cartItem, item){
    if (cartItem.localName === 'div') {
      cartItem.querySelector(selector).textContent = item.quantity;
    } else if (cartItem.localName === 'tr') {
      cartItem.querySelector(selector).value = item.quantity;
      cartItem.querySelector(selector).dataset.id = item.id;
    }
  }

  setPrice(selector, cartItem, product){
    cartItem.querySelector(selector).textContent = product.price;
  }

  fillRateStars(selector, cartItem, rating){
    let maxWidth = $(selector).css('max-width');
    cartItem.querySelector(selector).style = `width: calc(${maxWidth} / 5 * ${rating})`;
  }

  setSubTotal(selector, cartItem, product){
    if (cartItem.querySelector(selector)) {
      let sub = product.price * product.quantity;
      cartItem.querySelector(selector).textContent = sub;
    }
}

  setDeleteButtonId(selector, cartItem, product){
    cartItem.querySelector(selector).id = product.id;
  }

  displayNoneDelete(selector, cartItem) {
    cartItem.classList.remove(selector);
  }

  itemAppend(cartNode, item){
    cartNode.appendChild(item);
  }

  showTotalPrice(selector, total){
    let totalNodes = document.querySelectorAll(selector);

    totalNodes.forEach(elem => {
      elem.textContent = total;
    });
    document.querySelector(selector).textContent = total;
  }
}