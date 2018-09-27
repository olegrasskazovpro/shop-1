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

/**
 * Working with json databases - GETting from and POSTing to it
 */
class GetAndPost {
	constructor() {

	}

	/**
   * GETs data from DB
	 * @param String url for GET request
	 * @param successCallback - what to do if GET request succeed
	 * @param errorCallback - what to do if GET request failed
	 */
	get(url, successCallback, errorCallback) {
		$.ajax({
			url: url,
			method: 'GET',
			dataType: 'json',
			success: response => {
				successCallback.call(this, response);
			},
			error: response => {
				errorCallback(response);
			}
		})
	}

	/**
	 * POSTs data to DB
	 * @param String url for POST request
	 * @param successCallback - what to do if POST request succeed
	 * @param errorCallback - what to do if POST request failed
	 */
	post(url, data, successCallback, errorCallback) {
		$.ajax({
			url: url,
			method: 'POST',
			contentType: "application/json",
			data: JSON.stringify(data),
			success: response => {
				successCallback(response, data);
			},
			error: response => {
				errorCallback(response);
			}
		})
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
        filters: 'http://localhost:3003/filters',
        filteredProducts: 'http://localhost:3003/filteredProducts',
        cart: 'http://localhost:3002/cart',
      },
      selectors: {
				active: "active",
        addToCart: '.addToCart',
        cart: '.cart-container',
        cartClear: '.cart-clear',
        cartHeaderImg: '.cart-header-img',
				del: '.cart-item-del',
				displayNone: 'template',
				featuredProducts: ".featured-products",
				href: '.cart-item-href',
        img: '.cart-item-img',
				item: '.cart-item.template',
        name: '.cart-item-name',
        quantity: '.cart-item-quantity',
        price: '.cart-item-price',
        rate: '.rate',
        subtotal: '.cart-item-subtotal',
        total: '.cart-total',
				oops: "#oops",
        pagination: '#pagination',
        pageL: '.page-left-button',
        pageR: '.page-right-button',
        productsDiv: ".product-box",
        productItem: ".product-box-a",
        productHref: ".product_href",
        productName: ".product-name",
        productPrice: ".product-price",
        productImg: ".product-img",
				relatedProd: ".you-may-like",
				singleAddToCart: ".single-desc-button",
      }
    };

    if (ifProduct) {
      let filtersHandle = new FiltersHandle();
      filtersHandle.init(0, 1000, 1, config);
    } else {
      let cart = new Cart();
      cart.init(config);
    }

    if($('.featured-products')[0]){
    	let renderFilteredProducts = new RenderFilteredProducts(config, 'featured');
    	renderFilteredProducts.init();
		} else if ($('.you-may-like')[0]){
			let renderFilteredProducts = new RenderFilteredProducts(config, 'related');
			renderFilteredProducts.init();
		}
  })
})(jQuery);


//= product.js

//= cart.js

//= jCarousel.js

//= js.cookie.js