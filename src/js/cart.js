"use strict";

//TODO GET корзину
//TODO render cart

//TODO delete from cart
//TODO GET cart - find - splice - total calc - POST cart

class AddToCart {
  constructor() {
    this.catalog = {};
    this.cart = {
      total: 0,
      countGoods: 0,
      contents: [],
    };
  }

  init() {
    this.getCart();
    this.addToCartButtonHandler(this);
  }

  renderHeaderCart(data) {
    let renderHeaderCart = new RenderHeaderCart(data.contents, data.total);

    renderHeaderCart.init();
  }

  /**
   * Find all "Add to cart" buttons and if clicked start callback with "id" as param
   */
  addToCartButtonHandler(that) {
    $('.addToCart').click(function (event) {
      event.preventDefault();

      let id = +this.getAttribute('id'); // found id of added product
      that.getCatalog(id);
    })
  }

  deleteButtonHandler(){
    $('.cart-div').on('click', '.cart-item-del', function (event) {
      event.preventDefault();

      let id = +this.getAttribute('id'); // found id of added product
      that.getCatalog(id);
    })
  }

  getCatalog(id) {
    $.ajax({
      url: 'http://localhost:3000/products',
      method: 'GET',
      dataType: 'json',
      success: data => {
        this.catalog = data;
        console.log('Got full catalog from JSON');
        this.getCart(id);
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
  getCart(id) {
    $.ajax({
      url: `http://localhost:3001/cart`,
      method: 'GET',
      dataType: 'json',
      success: data => {
        this.cart = data;
        if (id) {
          this.getProdFromCatalog(id);
        } else {
          console.log('Initial cart rendering');
          this.renderHeaderCart(data);
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
    this.renderHeaderCart(this.cart)
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
    }
  }

  /**
   * POST cart to JSON file
   * @param {} data - cart data
   */
  postToCart(data) {
    $.ajax({
      url: `http://localhost:3001/cart`,
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
 * Create and return one cart item
 */
class RenderHeaderCart {
  constructor(items, total){
    this.items = items;
    this.total = total;
    this.selectors = {
      cart: '.cart-div',
      item: '.cart-item-in-header',
      href: '.cart-item-href',
      img: '.cart-item-img',
      name: '.cart-item-name',
      quantity: '.cart-item-quantity',
      price: '.cart-item-price',
      del: '.cart-item-del',
      rate: '.rate',
      total: '.cart-total',
      displayNone: 'template',
    };
  }

  init(){
    this.clearCartDOM(this.selectors.cart);

    for (let cartItem, i = 0; i < this.items.length; i++) {
      cartItem = this.cloneNode(this.selectors.item);

      this.setImg(this.selectors.img, cartItem, this.items[i]);
      this.setName(this.selectors.name, cartItem, this.items[i]);
      this.setHref(this.selectors.href, cartItem, this.items[i].href);
      this.setQuantity(this.selectors.quantity, cartItem, this.items[i]);
      this.setPrice(this.selectors.price, cartItem, this.items[i]);
      this.fillRateStars(this.selectors.rate, cartItem, this.items[i].rating);
      this.setDeleteButtonId(this.selectors.del, cartItem, this.items[i]);

      this.displayNoneDelete(this.selectors.displayNone, cartItem);
      this.itemAppend(this.selectors.cart, cartItem);
    }

    this.showTotalPrice(this.selectors.total, this.total);
  }

  clearCartDOM(selector){
    document.querySelector(selector).innerHTML = '';
  }

  cloneNode(selector){
    return $(selector)[0].cloneNode(true);
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
    let aCollection = cartItem.querySelector(selector);

    for (let i = 0; i < aCollection.length; i++) {
      aCollection[i].href = href;
    }
  }

  setQuantity(selector, cartItem, product){
    cartItem.querySelector(selector).textContent = product.quantity;
  }

  setPrice(selector, cartItem, product){
    cartItem.querySelector(selector).textContent = product.price;
  }

  fillRateStars(selector, cartItem, rating){
    let maxWidth = $(selector).css('max-width');
    cartItem.querySelector(selector).style = `width: calc(${maxWidth} / 5 * ${rating})`;
  }

  setDeleteButtonId(selector, cartItem, product){
    cartItem.querySelector(selector).id = product.id;
  }

  displayNoneDelete(selector, cartItem) {
    cartItem.classList.remove(selector);
  }

  itemAppend(selector, item){
    document.querySelector(selector).appendChild(item);
  }

  showTotalPrice(selector, total){
    document.querySelector(selector).textContent = total;
  }
}

class DelFromCart {
  constructor() {

  }

  //set button click handler

}


(function ($) {
  $(function () {

    // Найти кнопку по классу addToCart
    // Повесить на нее обработчик - клик добавляет в корзину
    // Получить GET из catalogData.json товар по ID
    // И запушить его POST в cart.json - contents
    // Посчитать в корзине число товаров countGoods и сумму стоимостей total

    // let addToCart = new AddToCart();
  })
})(jQuery);