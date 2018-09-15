"use strict";

class SetActiveLinks {
  constructor() {

  }

  /**
   * Set class="active" to nav links for page opened
   */
  setActiveClass() {
    if (this.checkUrl('product.html')) {
      $('.menu a').removeAttr('class');
      $('.menu>li a[href="product.html"]').addClass('menu-active');
      $('.mega-list a:first').addClass('active');
      $('.mega a:first').addClass('active');
    }
    if (this.checkUrl('index.html')) {
      $('.menu>li a[href="index.html"]').addClass('menu-active');
    }
  }

  /**
   * Check if page URL contains some string
   * @param string url - regExp condition
   * @returns {boolean} true if URL contains regExp
   */
  checkUrl(url) {
    let checkUrl = new RegExp(url);
    return checkUrl.test(document.location.href)
  }
}

class Carousel {
  constructor() {
  }

  init() {
    $('.jcarousel').jcarousel({
      wrap: 'circular'
    });
    $('.jcarousel-prev').click(function () {
      $('.jcarousel').jcarousel('scroll', '-=1');
    });

    $('.jcarousel-next').click(function () {
      $('.jcarousel').jcarousel('scroll', '+=1');
    });
  }
}

(function ($) {
  $(function () {
    let pageInit = new SetActiveLinks();
    pageInit.setActiveClass();

    let carousel = new Carousel();
    carousel.init();

    let ifProduct = new RegExp('product.html').test(document.location.href);
    let ifSingle = new RegExp('single.html').test(document.location.href);
    let config = {
      url: {
        products: 'http://localhost:3000/products',
        filters: 'http://localhost:3002/filters',
        filteredProducts: 'http://localhost:3002/filteredProducts',
        cart: 'http://localhost:3001/cart',
      },
      selectors: {
        addToCart: '.addToCart',
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
      }
    };

    if (ifProduct) {
      let filtersHandle = new FiltersHandle();

      filtersHandle.init(0, 1000, 1, config);

    } else {
      let cart = new Cart();
      cart.init(config);
    }
  })
})(jQuery);

//= product.js

//= cart.js

//= jCarousel.js

//= js.cookie.js