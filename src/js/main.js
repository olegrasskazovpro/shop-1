"use strict";

class SetActiveLinks {
  constructor () {

  }

  /**
   * Set class="active" to nav links for page opened
   */
  setActiveClass() {
    if (this.checkUrl('product.html')){
      $('.menu a').removeAttr('class');
      $('.menu>li a[href="product.html"]').addClass('menu-active');
      $('.mega-list a:first').addClass('active');
      $('.mega a:first').addClass('active');
    }
    if(this.checkUrl('index.html')){
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
  constructor () {}

  init() {
    $('.jcarousel').jcarousel({
      wrap: 'circular'
    });
    $('.jcarousel-prev').click(function() {
      $('.jcarousel').jcarousel('scroll', '-=1');
    });

    $('.jcarousel-next').click(function() {
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
    if (ifProduct) {
      let addToCart = new AddToCart();
      let render = new Render(addToCart);
      let filterProducts = new ServerFilterProducts(render);
      let filtersHandle = new FiltersHandle(filterProducts);

      filtersHandle.init(0, 1000, 1);

    } else if (ifSingle) {

      let addToCart = new AddToCart();
      addToCart.init();
    }
  })
})(jQuery);

//= product.js

//= cart.js

//= jCarousel.js

//= js.cookie.js