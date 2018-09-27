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


class RenderFilteredProducts {
	constructor(config, filter) {
		this.config = config;
		this.filter = filter;
		this.filtered = [];
	}

	init() {
		this.getCatalog(this.config, this.filter);
	}

	getCatalog(config, filter) {
		let url = config.url.products;
		let successCallback = catalog => {
			console.log('18 - Got filtered catalog from DB');
			this.filterAndRender(config, filter, catalog);
		};
		let errorCallback = response => {
			console.log('18 - Method getCatalog() of getting catalog FAILED');
		};

		let getAndPost = new GetAndPost();
		getAndPost.get(url, successCallback, errorCallback);
	}

	/**
	 * Filter catalog and render filtered products array
	 * @param [{}] catalog - array of catalog products
	 * @param String filter - filter value
	 * @param {} config - Object of config
	 */
	filterAndRender(config, filter, catalog) {
		let filtered = [];

		if (filter === 'featured') {
			filtered = this.filterByTag(catalog, filter);
		} else if (filter === 'related') {
			filtered = this.filterRelated(catalog);
		}

		let render = new RenderProducts(config, filtered);
		render.init();
	}

	/**
	 * Filter out from catalog taged products
	 * @param {} catalog - catalog object
	 * @param String tag - the tag we are looking for
	 */
	filterByTag(catalog, tag) {
		let filtered = [];
		for (const item of catalog) {
			if (this.hasTag(item.tag, tag)) {
				filtered.push(item);
			}
		}
		return filtered;
	}

	/**
	 * Check if product's tag string contains needed tag
	 * @param tags - string of product tags
	 * @param regExp - string of tag we need to find
	 * @returns {*} - true if tag found
	 */
	hasTag(tags, tag){
		let regExp = new RegExp(tag);
		return regExp.test(tags);
	}

	/**
	 * Filter out from catalog related products
	 * @param catalog
	 * @returns {Array} related products
	 */
	filterRelated(catalog) {
		// найти кнопку добавления в корзину товара Single и взять с нее id
		let id = this.getSingleProductId();
		let prod = this.findProductById(catalog, id);
		let relatedProdId = prod.relatedProdId;

		return this.getRelatedProducts(catalog, relatedProdId);
	}

	/**
	 * Find addToCart button of single page's product and returns its id
	 * @returns {number} id of products of single page
	 */
	getSingleProductId(){
		return +$(this.config.selectors.singleAddToCart)[0].id;
	}

	/**
	 * Filter out of catalog related products
	 * @param catalog - product catalog object
	 * @param relatedProdId - array of related products id's
	 * @returns {Array} related products
	 */
	getRelatedProducts(catalog, relatedProdId){
		let relProd = [];
		for (const id of relatedProdId) {
			let oneRelatedProd = this.findProductById(catalog, id);
			relProd.push(oneRelatedProd);
		}
		return relProd;
	}

	/**
	 * Filter catalog, comparing catalog item id with id from params
	 * @param {} catalog - catalog we need to filter
	 * @param Int id - id value of catalog item we need to find
	 * @returns {}|Boolean item of catalog or false if not found
	 */
	findProductById(catalog, id) {
		for (const item of catalog) {
			if (item.id === id) {
				return item;
			}
		}
	}
}


/**
 * Collect from DOM all product's filters and send it to server (json)
 */
class FiltersHandle {
	constructor() {
		this.filters = {
			catItem: null, // string
			category: null, // 'all' or string
			brand: null, // 'all' or string
			designer: null, // 'all' or string
			size: [0], // [0] or [a, (...)]
			price: [], // [a, b]
			showBy: null,
		};
		this.config = {
			url: {},
			selectors: {},
		};
	}

	init(min, max, step, config) {
		this.config = config;
		this.setCookiesFilters();
		this.initPriceSlider(min, max, step);
		this.filters.catItem = this.getCatItem();
		this.filters.category = this.getCategory();
		this.filters.brand = this.getBrand();
		this.filters.designer = this.getDesigner();
		this.setSizeCheckboxHandler();
		this.filters.price = this.getPriceRange();
		this.setShowByHandler();
		this.postFilters(this.filters);
	}

	/**
	 * Setting in DOM all filters from cookies
	 */
	setCookiesFilters() {
		this.getCookiesFilters();
		this.setSizeChecked();
		this.setShowBySelected(this.filters.showBy);
	}

	/**
	 * Save in this.filters all filters from cookies
	 */
	getCookiesFilters() {
		const cookiesFilters = Cookies.get();
		if (cookiesFilters.price) {
			cookiesFilters.price = cookiesFilters.price.split('_');
		}
		if (cookiesFilters.size) {
			cookiesFilters.size = cookiesFilters.size.split('_');
		}

		for (const propC in cookiesFilters) {
			for (const propF in this.filters) {
				if (propC === propF) {
					this.filters[propF] = cookiesFilters[propC];
				}
			}
		}
	}

	/**
	 * Setting up price-range slider.
	 * If price cookie is - set minVal and maxVal from cookies
	 */
	initPriceSlider(min, max, step) {
		let minVal, maxVal;

		if (this.filters.price.length) {
			minVal = this.filters.price[0];
			maxVal = this.filters.price[1];
		} else {
			minVal = max * 0.05;
			maxVal = max * 0.4;
		}

		$('.price-range__slider').slider({
			range: true,
			values: [minVal, maxVal],
			min: min,
			max: max,
			step: step,
			slide: () => {
				this.showPriceRangeValues();
			},
			change: () => {
				this.showPriceRangeValues();
				this.filters.price = this.getPriceRange();
				this.setCookies('price', this.filters.price.join('_'));
				$('#oops').addClass('template');
				this.postFilters(this.filters);
			}
		});
		this.showPriceRangeValues();
	}

	/**
	 * Show/Update min and max price range values
	 */
	showPriceRangeValues() {
		$('#price-min').text(this.getPriceRange()[0]);
		$('#price-max').text(this.getPriceRange()[1]);
	}

	getCatItem() {
		return $('.menu-active').text()
	}

	getCategory() {
		if ($('.menu .active')[0]) {
			return $('.menu .active').text()
		} else {
			return 'all'
		}
	}

	getBrand() {
		if ($('#brand .active')[0]) {
			console.log($('#brand .active').text());
			return $('#brand .active').text()
		} else {
			return 'all'
		}
	}

	getDesigner() {
		if ($('#designer .active')[0]) {
			return $('#designer .active').text()
		} else {
			return 'all'
		}
	}

	/**
	 * If (no size cookie) set all sizes, else set sizes from cookies
	 */
	setSizeChecked() {
		if (Cookies.get('size')) {
			let cookiesSize = Cookies.get('size').split('_'); // turn size cookie to array
			// find all checkboxes which data-name is one of cookiesSize and set it checked
			for (let i = 0; i < cookiesSize.length; i++) {
				for (let j = 0; j < $('.size-checkbox').length; j++) {
					if (cookiesSize[i] === $('.size-checkbox')[j].dataset.name) {
						$('.size-checkbox')[j].setAttribute("checked", "");
						$('.size-checkbox')[j].classList.add("checked");
					}
				}
			}
		} else {
			for (let j = 0; j < $('.size-checkbox').length; j++) {
				$('.size-checkbox')[j].setAttribute("checked", "");
				$('.size-checkbox')[j].classList.add("checked");
			}
		}
	}

	/**
	 * Set handlers of size checkboxes state changing
	 * Updates size cookie, this.filters and sends POST to server
	 */
	setSizeCheckboxHandler() {
		let that = this;
		// set update sizes Arr for every size checkbox click
		$('.size-checkbox').on('click', function () {
			this.classList.toggle('checked'); // if Checked set class 'checked' and back
			$('#oops').addClass('template');

			if ($('.checked').length) {
				let sizes = []; // clear size Arr
				for (let i = 0; i < $('.checked').length; i++) {
					sizes.push($('.checked')[i].dataset.name);
				}
				that.filters.size = sizes;
				that.setCookies('size', sizes.join('_'));
			} else {
				that.filters.size = [0];
			}
			that.postFilters(that.filters);
		});
	}

	/**
	 * Returns price slider range
	 * @returns [] {jQuery}
	 */
	getPriceRange() {
		return $('.price-range__slider').slider('values');
	}

	/**
	 * Sets "selected" attribute for showBy option
	 * @param Int value value of option's value property
	 */
	setShowBySelected(value) {
		if (value === null) {
			this.filters.showBy = 3;
			$(`#showBy option[value="3"]`)[0].setAttribute("selected", "");
		} else {
			$(`#showBy option:selected`).removeAttr("selected");
			$(`#showBy option[value=${value}]`)[0].setAttribute("selected", "");
		}
	}

	/**
	 * ShowBy selector change handler. If changed:
	 * remove "selected" attr,
	 * update this.filters.showBy,
	 * update showBy in Cookies
	 * post updated filters to server
	 */
	setShowByHandler() {
		$('#showBy').on('change', () => {
			$(`#showBy option[selected]`).removeAttr("selected");
			this.filters.showBy = +$('#showBy option:selected').text();
			$(`#showBy option[value=${this.filters.showBy}]`)[0].setAttribute("selected", "");

			this.setCookies('showBy', this.filters.showBy);
			this.postFilters(this.filters);
		})
	}

	setCookies(name, val) {
		Cookies.set(name, val, {expires: 7});
	}

	/**
	 * Send filters to server
	 * @param {} data - filters
	 */
	postFilters(data) {
		let getAndPost = new GetAndPost();

		let url = this.config.url.filters;
		let successCallback = () => {
			console.log('Product filters was SENT to DB');
			let serverFilterProducts = new ServerFilterProducts();
			serverFilterProducts.init(this.config);
		};
		let errorCallback = () => {
			console.log('Product filters sending to DB FAILED');
		};

		getAndPost.post(url, data, successCallback, errorCallback);

	}
}

/**
 * Server side work emulation - filters catalog with filters and save result to DB
 */
class ServerFilterProducts {
	constructor() {
		this.filters = {};
		this.catalog = {};
		this.config = {
			url: {},
			selectors: {},
		};
	}

	init(config) {
		this.config = config;
		this.getFilters()
	}

	getFilters() {
		let getAndPost = new GetAndPost();
		let url = this.config.url.filters;
		let successCallback = response => {
			this.filters = response;
			console.log('302 - Server got filters from DB');
			this.getCatalog();
		};
		let errorCallback = response => {
			console.log('302 - Method getFilters() of getting filters FAILED');
		};

		getAndPost.get(url, successCallback, errorCallback);
	}

	getCatalog() {
		let getAndPost = new GetAndPost();

		let url = this.config.url.products;
		let successCallback = response => {
			this.catalog = response;
			console.log('316 - Server got products catalog from DB');
			this.filterCatalog();
		};

		let errorCallback = response => {
			console.log('316 - Method getCatalog() of getting catalog FAILED');
		};

		getAndPost.get(url, successCallback, errorCallback);
	}

	/**
	 * Filters all products in catalog with every filters property and put result to this.filteredCatalog
	 */
	filterCatalog() {
		let filteredCatalog = [];
		this.postFiltered({}); // clean previous filtered catalog

		for (let i = 0; i < this.catalog.length; i++) { // and filter with them catalog. Intermediate results put
			// check if the product satisfy all filters
			if (
					this.checkProdWithFilter(this.filters.catItem, this.catalog[i].catItem) &&
					this.checkProdWithFilter(this.filters.category, this.catalog[i].category) &&
					this.checkProdWithFilter(this.filters.brand, this.catalog[i].brand) &&
					this.checkProdWithFilter(this.filters.designer, this.catalog[i].designer) &&
					this.checkProdBySize(this.filters.size, this.catalog[i].size) &&
					this.checkProdByPrice(this.filters.price, this.catalog[i].price)
			) {

				filteredCatalog.push(this.catalog[i]); // add this product to this.filteredCatalog
			}
		}

		this.paginate(filteredCatalog);

		// this.postFiltered(this.filteredCatalog); // this.filteredCatalog сохраняется правильно
	}

	/**
	 * Devide filteredCatalog by pages according to Show selector value
	 * @param {} filteredCatalog
	 */
	paginate(filteredCatalog) {
		let filtCatWithPag = {};
		let n = 1; // first page number

		for (let i = 0; i < filteredCatalog.length; i++) {
			const page_num = 'page_' + n;
			filtCatWithPag[page_num] = [];

			for (let j = 0; j < this.filters.showBy && i < filteredCatalog.length; j++, i++) {
				filtCatWithPag[page_num].push(filteredCatalog[i]);
			}
			i--;
			n++;
		}

		this.postFiltered(filtCatWithPag);
	}

	/**
	 * Check simple filter parameters if the product satisfy
	 * @param string filter filter property value
	 * @param string product property value
	 * @returns {boolean} true if filter = 'all' or satisfy to product
	 */
	checkProdWithFilter(filter, product) {
		if (filter === 'all') {
			return true
		} else return (filter === product);
	}

	/**
	 * Check if the product has one of filter's size
	 * @param string [] filterSizes - array of sizes in filter
	 * @param string [] prodSizes - array of product's sizes
	 * @returns {boolean} true if the product has one of filtered sizes
	 */
	checkProdBySize(filterSizes, prodSizes) {
		if (filterSizes[0] !== 0) {
			// check if any size of filter is into product sizes
			for (let i = 0; i < filterSizes.length; i++) {
				if (prodSizes.includes(filterSizes[i])) {
					return true
				}
			}
			return false
		} else {
			return true
		}
	}

	/**
	 * Filter product with price filter
	 * @param Int [] filterPriceRange - filter's array of min and max product price
	 * @param Int prodPrice - product's price
	 * @returns {boolean} true if the product's price between min and max
	 */
	checkProdByPrice(filterPriceRange, prodPrice) {
		if (filterPriceRange[0] === 0) {
			return true
		} else {
			// check if any size of filter is into product sizes
			return prodPrice >= filterPriceRange[0] && prodPrice <= filterPriceRange[1];
		}
	}

	postFiltered(data) {
		let getAndPost = new GetAndPost();
		let url = this.config.url.filteredProducts;

		let successCallback = null;
		if (data["page_1"] === undefined) {
			successCallback = () => {
				console.log('428 - Filtered catalog DB cleaned');
			}
		} else {
			let renderPagination = new RenderPagination(this.config, data);
			let renderProducts = new RenderProducts(this.config, data);

			//TODO сделать так, чтобы data передавалась

			successCallback = () => {
				console.log('428 - Filtered catalog posted to DB');
				renderPagination.init(renderPagination);
				renderProducts.init(renderProducts);
			};
		}

		let errorCallback = () => {
			console.log('428 - Method postFiltered(data) of filtered catalog saving to DB FAILED');
		};

		getAndPost.post(url, data, successCallback, errorCallback);
	}
}

/**
 * Render parent class
 */
class Render {
	constructor(config, data) {
		this.data = data;
		this.config = config;
	}

	init() {
		this.clean();
		this.render(this.config, this.data);
	}

	/**
	 * Find and clean HTML object
	 */
	clean(selector) {
		document.querySelector(selector).innerHTML = '';
	}

	/**
	 * Render filtered catalog with pagination and set for filtered catalog addToCartHandler
	 * @param data
	 */
	render(config, data) {
		return false;
	}
}

/**
 * Render pagination div
 */
class RenderPagination extends Render {
	constructor(config, data) {
		super(config, data);
	}

	init() {
		let selectors = this.config.selectors;
		this.clean(selectors.pagination);
		this.render(selectors, this.data);
	}

	/**
	 * * Set pagination div - fill it with <a>Num</a>
	 * @param String pag - css class of pagination div
	 * @param {} data filtered catalog
	 */
	render(selectors, data) {
		let pag = selectors.pagination;
		let active = selectors.active;

		for (let i = 0; i < Object.keys(data).length; i++) {
			let href = '?' + Object.keys(data)[i];
			let a = `<a href="${href}">${i + 1}</a>`;

			if (i === 0) { //add first page number
				$(pag).append(a);
				$(`${pag} a`).addClass(active); //set the first active

			} else { //add another page numbers
				$(pag).append(a);
			}
		}

		this.urlPagination(selectors, data);
		this.paginationNumHandler(pag, active);
	}

	/**
	 * Check if URL has page_* and set active page + add href to pagination slider arrows
	 * @param {} data filtered catalog
	 */
	urlPagination(selectors, data) {
		let pag = selectors.pagination;
		let active = selectors.active;
		// get page_N from URL
		let exp = /page_\d+/i;

		if (this.checkUrl(exp)) { // check if URL has page_*
			let pageInURL = this.parseUrl(document.location.href, exp);
			let pageNoInURL = +this.parseUrl(pageInURL, /\d+/i); // parse number of page_ from URL
			if (pageNoInURL > 0 && pageNoInURL <= Object.keys(data).length) {
				this.setActiveInPagination(pag, active, pageNoInURL);
				this.setPaginationArrowsHref(active, pageNoInURL, data);
			} else {
				this.setActiveInPagination(pag, active, 1);
				this.setPaginationArrowsHref(selectors, 1, data);
			}
		}
	}

	/**
	 * Check if page URL contains some string
	 * @param string exp - regExp condition
	 * @returns {boolean} true if URL contains regExp
	 */
	checkUrl(exp) {
		let checkUrl = new RegExp(exp);
		return checkUrl.test(document.location.href)
	}

	/**
	 * Parse string and return RegExp sutisfied result or null
	 * @param string for parsing
	 * @param string exp regular expression for search
	 * @returns {*} returns founded part of string or null
	 */
	parseUrl(string, exp) {
		let parse = string.match(exp);
		return parse[0]
	}

	/**
	 * Set .active class for n-th page in pagination
	 * @param Int n number of page from URL
	 */
	setActiveInPagination(pag, active, n) {
		$(`${pag} .${active}`).removeClass(active); //remove current active class
		$(`${pag} a:nth-child(${n})`).addClass(active); //add new active class
	}

	/**
	 * Set href to <a> in pagination slider
	 * @param Int n number of page from URL
	 * @param {} data filtered catalog
	 */
	setPaginationArrowsHref(selectors, n, data) {
		let active = selectors.active;
		let pageLSelector = selectors.pageL;
		let pageRSelector = selectors.pageR;
		let urlHtml = this.parseUrl(document.location.href, /\/[^\/]+?\.html/i); // get /*.html from url

		// set left buttton href
		if (n > 1) {
			let prev = `${urlHtml}?page_${n - 1}`;
			$(pageLSelector).attr('href', prev);
		} else {
			$(pageLSelector).addClass(active)
		}

		// set right buttton href
		if (n < Object.keys(data).length) {
			let next = `${urlHtml}?page_${n + 1}`;
			$(pageRSelector).attr('href', next);
		} else {
			$(pageRSelector).addClass(active)
		}
	}

	/**
	 * Set click handler at pagination numbers
	 * @param String pag - id name of pagination div
	 * @param String active - css class name of active page in pagination
	 */
	paginationNumHandler(pag, active) {
		let pagActive = `${pag} .${active}`;
		$(pagActive).on('click', 'a', function () {

			$(pagActive).removeClass(active);
			this.classList.add(active);
		});
	}
}

/**
 * Render products' cards
 * @param {} config initial settings (urls, selectors)
 * @param {} data - what to render - object of products
 */
class RenderProducts extends Render {
	constructor(config, data) {
		super(config, data);
	}

	init() {
		let selectors = this.config.selectors;
		this.clean(selectors.productsDiv);
		this.render(selectors, this.data);

		let cart = new Cart();
		cart.init(this.config);
	}

	render(selectors, data) {
		if ($(selectors.pagination)[0]) {
			this.renderWithPag(selectors, data)
		} else {
			this.renderNoPag(selectors, data);
		}
	}

	/**
	 * Render products without pagination
	 * @param {} selectors
	 * @param [] data product's properties array
	 */
	renderNoPag(selectors, data) {
		if (data.length) {
			for (let oneProd, i = 0; i < data.length; i++) {
				let dataPageItem = data[i];

				oneProd = $(selectors.productItem)[0].cloneNode(true);
				oneProd.querySelector(selectors.productHref).href = dataPageItem.href;
				oneProd.querySelector(selectors.productImg).src = dataPageItem.img[0];
				oneProd.querySelector(selectors.productImg).alt = dataPageItem.name;
				oneProd.querySelector(selectors.addToCart).id = dataPageItem.id;
				oneProd.querySelector(selectors.productName).textContent = dataPageItem.name;
				oneProd.querySelector(selectors.productPrice).textContent = '$' + dataPageItem.price + '.00';
				oneProd.classList.remove(selectors.displayNone);

				document.querySelector(selectors.productsDiv).appendChild(oneProd);
			}
		} else {
			$(selectors.productsDiv)[0].parentElement.innerHTML = '';
		}
	}

	/**
	 * Render products with pagination
	 * @param {} selectors
	 * @param [] data product's properties array
	 */
	renderWithPag(selectors, data) {
		let page = 'page_' + $(selectors.pagination + ' .' + selectors.active).text(); // find active page
		let dataPage = data[page];

		if (dataPage) {
			for (let oneProd, i = 0; i < dataPage.length; i++) {
				let dataPageItem = dataPage[i];

				oneProd = $(selectors.productItem)[0].cloneNode(true);
				oneProd.querySelector(selectors.productHref).href = dataPageItem.href;
				oneProd.querySelector(selectors.productImg).src = dataPageItem.img[0];
				oneProd.querySelector(selectors.productImg).alt = dataPageItem.name;
				oneProd.querySelector(selectors.addToCart).id = dataPageItem.id;
				oneProd.querySelector(selectors.productName).textContent = dataPageItem.name;
				oneProd.querySelector(selectors.productPrice).textContent = '$' + dataPageItem.price + '.00';
				oneProd.classList.remove(selectors.displayNone);

				document.querySelector(selectors.productsDiv).appendChild(oneProd);
			}
		} else {
			$(selectors.oops).removeClass(selectors.displayNone);
		}
	}
}

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
    this.clearCartButtonHandler();
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
      that.animateCart(that.config.selectors.cartHeaderImg);
    })
  }

  animateCart(selector){
    $(selector).effect('bounce', 'slow')
  }

  deleteButtonHandler(){
    let that = this;
    $(this.config.selectors.cart).on('click', this.config.selectors.del, function (event) {
      event.preventDefault();

      let id = +this.getAttribute('id'); // found id of added product
      that.deleteFromCart(id);
    })
  }

	clearCartButtonHandler(){
		$(this.config.selectors.cartClear).click(() => {
			event.preventDefault();

			this.cart = {
				total: 0,
				countGoods: 0,
				contents: [],
			};
			this.calcTotal(this.cart);
			this.postToCart(this.cart);
			this.renderCart(this.cart);
			debugger;
			this.animateCart(this.config.selectors.cartHeaderImg);
		})
	}

  deleteFromCart(id){
    let idx = this.checkInCart(id);

    this.cart.contents.splice(idx, 1);
    this.calcTotal(this.cart);
    this.postToCart(this.cart);
    this.renderCart(this.cart);
		this.animateCart(this.config.selectors.cartHeaderImg);
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

    this.calcTotal(this.cart);
    this.postToCart(this.cart);
    this.renderCart(this.cart);
  }

  getCatalog(id) {
		let getAndPost = new GetAndPost();

		let url = this.config.url.products;
		let successCallback = response => {
			this.catalog = response;
			console.log('93 - Got full catalog from JSON');
			this.getCart(id, this.getProdFromCatalog);
		};

		let errorCallback = response => {
			console.log('103 - Method getCatalog() of getting catalog FAILED');
		};

		getAndPost.get(url, successCallback, errorCallback);
  }

  /**
   * Get cart from JSON and do getProdFromCatalog(id) or render cart
   * @param number id - id of product that addToCart button was clicked
   */
  getCart(id, callback) {
		let getAndPost = new GetAndPost();

		let url = this.config.url.cart;
		let successCallback = response => {
			this.cart = response;
			if (id) {
				callback.call(this, id);
			} else {
				console.log('114 - Initial cart rendering start');
				callback.call(this);
			}
		};

		let errorCallback = response => {
			console.log('114 - Method getCatalog() of getting catalog FAILED');
		};

		getAndPost.get(url, successCallback, errorCallback);
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

    this.calcTotal(this.cart);
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
  calcTotal(cart) {
    if (cart.contents.length) {
      cart.countGoods = cart.contents.length;

      cart.total = 0;
      for (let i = 0; i < cart.contents.length; i++) {
        let price = cart.contents[i].price;
        let quantity = cart.contents[i].quantity;

        cart.total += price * quantity;
      }
    } else {
      cart.total = 0;
      cart.countGoods = 0;
    }
  }

  /**
   * POST cart to JSON file
   * @param {} data - cart data
   */
  postToCart(data) {
		let getAndPost = new GetAndPost();
		let url = this.config.url.cart;
		let successCallback = () => {
			console.log('215 - Cart was SENT to DB');
		};
		let errorCallback = () => {
			console.log('Cart sending to DB FAILED');
		};

		getAndPost.post(url, data, successCallback, errorCallback);
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

/*! jCarousel - v0.3.8 - 2018-05-31
* http://sorgalla.com/jcarousel/
* Copyright (c) 2006-2018 Jan Sorgalla; Licensed MIT */
(function($) {
  'use strict';

  var jCarousel = $.jCarousel = {};

  jCarousel.version = '0.3.8';

  var rRelativeTarget = /^([+\-]=)?(.+)$/;

  jCarousel.parseTarget = function(target) {
    var relative = false,
      parts    = typeof target !== 'object' ?
        rRelativeTarget.exec(target) :
        null;

    if (parts) {
      target = parseInt(parts[2], 10) || 0;

      if (parts[1]) {
        relative = true;
        if (parts[1] === '-=') {
          target *= -1;
        }
      }
    } else if (typeof target !== 'object') {
      target = parseInt(target, 10) || 0;
    }

    return {
      target: target,
      relative: relative
    };
  };

  jCarousel.detectCarousel = function(element) {
    var carousel;

    while (element.length > 0) {
      carousel = element.filter('[data-jcarousel]');

      if (carousel.length > 0) {
        return carousel;
      }

      carousel = element.find('[data-jcarousel]');

      if (carousel.length > 0) {
        return carousel;
      }

      element = element.parent();
    }

    return null;
  };

  jCarousel.base = function(pluginName) {
    return {
      version:  jCarousel.version,
      _options:  {},
      _element:  null,
      _carousel: null,
      _init:     $.noop,
      _create:   $.noop,
      _destroy:  $.noop,
      _reload:   $.noop,
      create: function() {
        this._element
          .attr('data-' + pluginName.toLowerCase(), true)
          .data(pluginName, this);

        if (false === this._trigger('create')) {
          return this;
        }

        this._create();

        this._trigger('createend');

        return this;
      },
      destroy: function() {
        if (false === this._trigger('destroy')) {
          return this;
        }

        this._destroy();

        this._trigger('destroyend');

        this._element
          .removeData(pluginName)
          .removeAttr('data-' + pluginName.toLowerCase());

        return this;
      },
      reload: function(options) {
        if (false === this._trigger('reload')) {
          return this;
        }

        if (options) {
          this.options(options);
        }

        this._reload();

        this._trigger('reloadend');

        return this;
      },
      element: function() {
        return this._element;
      },
      options: function(key, value) {
        if (arguments.length === 0) {
          return $.extend({}, this._options);
        }

        if (typeof key === 'string') {
          if (typeof value === 'undefined') {
            return typeof this._options[key] === 'undefined' ?
              null :
              this._options[key];
          }

          this._options[key] = value;
        } else {
          this._options = $.extend({}, this._options, key);
        }

        return this;
      },
      carousel: function() {
        if (!this._carousel) {
          this._carousel = jCarousel.detectCarousel(this.options('carousel') || this._element);

          if (!this._carousel) {
            $.error('Could not detect carousel for plugin "' + pluginName + '"');
          }
        }

        return this._carousel;
      },
      _trigger: function(type, element, data) {
        var event,
          defaultPrevented = false;

        data = [this].concat(data || []);

        (element || this._element).each(function() {
          event = $.Event((pluginName + ':' + type).toLowerCase());

          $(this).trigger(event, data);

          if (event.isDefaultPrevented()) {
            defaultPrevented = true;
          }
        });

        return !defaultPrevented;
      }
    };
  };

  jCarousel.plugin = function(pluginName, pluginPrototype) {
    var Plugin = $[pluginName] = function(element, options) {
      this._element = $(element);
      this.options(options);

      this._init();
      this.create();
    };

    Plugin.fn = Plugin.prototype = $.extend(
      {},
      jCarousel.base(pluginName),
      pluginPrototype
    );

    $.fn[pluginName] = function(options) {
      var args        = Array.prototype.slice.call(arguments, 1),
        returnValue = this;

      if (typeof options === 'string') {
        this.each(function() {
          var instance = $(this).data(pluginName);

          if (!instance) {
            return $.error(
              'Cannot call methods on ' + pluginName + ' prior to initialization; ' +
              'attempted to call method "' + options + '"'
            );
          }

          if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
            return $.error(
              'No such method "' + options + '" for ' + pluginName + ' instance'
            );
          }

          var methodValue = instance[options].apply(instance, args);

          if (methodValue !== instance && typeof methodValue !== 'undefined') {
            returnValue = methodValue;
            return false;
          }
        });
      } else {
        this.each(function() {
          var instance = $(this).data(pluginName);

          if (instance instanceof Plugin) {
            instance.reload(options);
          } else {
            new Plugin(this, options);
          }
        });
      }

      return returnValue;
    };

    return Plugin;
  };
}(jQuery));

(function($, window) {
  'use strict';

  var $window = $(window);

  var toFloat = function(val) {
    return parseFloat(val) || 0;
  };

  $.jCarousel.plugin('jcarousel', {
    animating:   false,
    tail:        0,
    inTail:      false,
    resizeState: null,
    resizeTimer: null,
    lt:          null,
    vertical:    false,
    rtl:         false,
    circular:    false,
    underflow:   false,
    relative:    false,

    _options: {
      list: function() {
        return this.element().children().eq(0);
      },
      items: function() {
        return this.list().children();
      },
      animation:   400,
      transitions: false,
      wrap:        null,
      vertical:    null,
      rtl:         null,
      center:      false
    },

    // Protected, don't access directly
    _list:         null,
    _items:        null,
    _target:       $(),
    _first:        $(),
    _last:         $(),
    _visible:      $(),
    _fullyvisible: $(),
    _init: function() {
      var self = this;

      self.resizeState = $window.width() + 'x' + $window.height();

      this.onWindowResize = function() {
        if (self.resizeTimer) {
          clearTimeout(self.resizeTimer);
        }

        self.resizeTimer = setTimeout(function() {
          var currentResizeState = $window.width() + 'x' + $window.height();

          // Check if the window size actually changed.
          // iOS might trigger resize events on page scroll.
          if (currentResizeState === self.resizeState) {
            return;
          }

          self.resizeState = currentResizeState;
          self.reload();
        }, 100);
      };

      return this;
    },
    _create: function() {
      this._reload();

      $window.on('resize.jcarousel', this.onWindowResize);
    },
    _destroy: function() {
      $window.off('resize.jcarousel', this.onWindowResize);
    },
    _reload: function() {
      this.vertical = this.options('vertical');

      if (this.vertical == null) {
        this.vertical = toFloat(this.list().height()) > toFloat(this.list().width());
      }

      this.rtl = this.options('rtl');

      if (this.rtl == null) {
        this.rtl = (function(element) {
          if (('' + element.attr('dir')).toLowerCase() === 'rtl') {
            return true;
          }

          var found = false;

          element.parents('[dir]').each(function() {
            if ((/rtl/i).test($(this).attr('dir'))) {
              found = true;
              return false;
            }
          });

          return found;
        }(this._element));
      }

      this.lt = this.vertical ? 'top' : 'left';

      // Ensure before closest() call
      this.relative = this.list().css('position') === 'relative';

      // Force list and items reload
      this._list  = null;
      this._items = null;

      var item = this.index(this._target) >= 0 ?
        this._target :
        this.closest();

      // _prepare() needs this here
      this.circular  = this.options('wrap') === 'circular';
      this.underflow = false;

      var props = {'left': 0, 'top': 0};

      if (item.length > 0) {
        this._prepare(item);
        this.list().find('[data-jcarousel-clone]').remove();

        // Force items reload
        this._items = null;

        this.underflow = this._fullyvisible.length >= this.items().length;
        this.circular  = this.circular && !this.underflow;

        props[this.lt] = this._position(item) + 'px';
      }

      this.move(props);

      return this;
    },
    list: function() {
      if (this._list === null) {
        var option = this.options('list');
        this._list = $.isFunction(option) ? option.call(this) : this._element.find(option);
      }

      return this._list;
    },
    items: function() {
      if (this._items === null) {
        var option = this.options('items');
        this._items = ($.isFunction(option) ? option.call(this) : this.list().find(option)).not('[data-jcarousel-clone]');
      }

      return this._items;
    },
    index: function(item) {
      return this.items().index(item);
    },
    closest: function() {
      var self    = this,
        pos     = this.list().position()[this.lt],
        closest = $(), // Ensure we're returning a jQuery instance
        stop    = false,
        lrb     = this.vertical ? 'bottom' : (this.rtl && !this.relative ? 'left' : 'right'),
        width;

      if (this.rtl && this.relative && !this.vertical) {
        pos += toFloat(this.list().width()) - this.clipping();
      }

      this.items().each(function() {
        closest = $(this);

        if (stop) {
          return false;
        }

        var dim = self.dimension(closest);

        pos += dim;

        if (pos >= 0) {
          width = dim - toFloat(closest.css('margin-' + lrb));

          if ((Math.abs(pos) - dim + (width / 2)) <= 0) {
            stop = true;
          } else {
            return false;
          }
        }
      });


      return closest;
    },
    target: function() {
      return this._target;
    },
    first: function() {
      return this._first;
    },
    last: function() {
      return this._last;
    },
    visible: function() {
      return this._visible;
    },
    fullyvisible: function() {
      return this._fullyvisible;
    },
    hasNext: function() {
      if (false === this._trigger('hasnext')) {
        return true;
      }

      var wrap = this.options('wrap'),
        end = this.items().length - 1,
        check = this.options('center') ? this._target : this._last;

      return end >= 0 && !this.underflow &&
      ((wrap && wrap !== 'first') ||
        (this.index(check) < end) ||
        (this.tail && !this.inTail)) ? true : false;
    },
    hasPrev: function() {
      if (false === this._trigger('hasprev')) {
        return true;
      }

      var wrap = this.options('wrap');

      return this.items().length > 0 && !this.underflow &&
      ((wrap && wrap !== 'last') ||
        (this.index(this._first) > 0) ||
        (this.tail && this.inTail)) ? true : false;
    },
    clipping: function() {
      return toFloat(this._element['inner' + (this.vertical ? 'Height' : 'Width')]());
    },
    dimension: function(element) {
      return toFloat(element['outer' + (this.vertical ? 'Height' : 'Width')](true));
    },
    scroll: function(target, animate, callback) {
      if (this.animating) {
        return this;
      }

      if (false === this._trigger('scroll', null, [target, animate])) {
        return this;
      }

      if ($.isFunction(animate)) {
        callback = animate;
        animate  = true;
      }

      var parsed = $.jCarousel.parseTarget(target);

      if (parsed.relative) {
        var end    = this.items().length - 1,
          scroll = Math.abs(parsed.target),
          wrap   = this.options('wrap'),
          current,
          first,
          index,
          start,
          curr,
          isVisible,
          props,
          i;

        if (parsed.target > 0) {
          var last = this.index(this._last);

          if (last >= end && this.tail) {
            if (!this.inTail) {
              this._scrollTail(animate, callback);
            } else {
              if (wrap === 'both' || wrap === 'last') {
                this._scroll(0, animate, callback);
              } else {
                if ($.isFunction(callback)) {
                  callback.call(this, false);
                }
              }
            }
          } else {
            current = this.index(this._target);

            if ((this.underflow && current === end && (wrap === 'circular' || wrap === 'both' || wrap === 'last')) ||
              (!this.underflow && last === end && (wrap === 'both' || wrap === 'last'))) {
              this._scroll(0, animate, callback);
            } else {
              index = current + scroll;

              if (this.circular && index > end) {
                i = end;
                curr = this.items().get(-1);

                while (i++ < index) {
                  curr = this.items().eq(0);
                  isVisible = this._visible.index(curr) >= 0;

                  if (isVisible) {
                    curr.after(curr.clone(true).attr('data-jcarousel-clone', true));
                  }

                  this.list().append(curr);

                  if (!isVisible) {
                    props = {};
                    props[this.lt] = this.dimension(curr);
                    this.moveBy(props);
                  }

                  // Force items reload
                  this._items = null;
                }

                this._scroll(curr, animate, callback);
              } else {
                this._scroll(Math.min(index, end), animate, callback);
              }
            }
          }
        } else {
          if (this.inTail) {
            this._scroll(Math.max((this.index(this._first) - scroll) + 1, 0), animate, callback);
          } else {
            first  = this.index(this._first);
            current = this.index(this._target);
            start  = this.underflow ? current : first;
            index  = start - scroll;

            if (start <= 0 && ((this.underflow && wrap === 'circular') || wrap === 'both' || wrap === 'first')) {
              this._scroll(end, animate, callback);
            } else {
              if (this.circular && index < 0) {
                i    = index;
                curr = this.items().get(0);

                while (i++ < 0) {
                  curr = this.items().eq(-1);
                  isVisible = this._visible.index(curr) >= 0;

                  if (isVisible) {
                    curr.after(curr.clone(true).attr('data-jcarousel-clone', true));
                  }

                  this.list().prepend(curr);

                  // Force items reload
                  this._items = null;

                  var dim = this.dimension(curr);

                  props = {};
                  props[this.lt] = -dim;
                  this.moveBy(props);

                }

                this._scroll(curr, animate, callback);
              } else {
                this._scroll(Math.max(index, 0), animate, callback);
              }
            }
          }
        }
      } else {
        this._scroll(parsed.target, animate, callback);
      }

      this._trigger('scrollend');

      return this;
    },
    moveBy: function(properties, opts) {
      var position = this.list().position(),
        multiplier = 1,
        correction = 0;

      if (this.rtl && !this.vertical) {
        multiplier = -1;

        if (this.relative) {
          correction = toFloat(this.list().width()) - this.clipping();
        }
      }

      if (properties.left) {
        properties.left = (toFloat(position.left) + correction + toFloat(properties.left) * multiplier) + 'px';
      }

      if (properties.top) {
        properties.top = (toFloat(position.top) + correction + toFloat(properties.top) * multiplier) + 'px';
      }

      return this.move(properties, opts);
    },
    move: function(properties, opts) {
      opts = opts || {};

      var option       = this.options('transitions'),
        transitions  = !!option,
        transforms   = !!option.transforms,
        transforms3d = !!option.transforms3d,
        duration     = opts.duration || 0,
        list         = this.list();

      if (!transitions && duration > 0) {
        list.animate(properties, opts);
        return;
      }

      var complete = opts.complete || $.noop,
        css = {};

      if (transitions) {
        var backup = {
            transitionDuration: list.css('transitionDuration'),
            transitionTimingFunction: list.css('transitionTimingFunction'),
            transitionProperty: list.css('transitionProperty')
          },
          oldComplete = complete;

        complete = function() {
          $(this).css(backup);
          oldComplete.call(this);
        };
        css = {
          transitionDuration: (duration > 0 ? duration / 1000 : 0) + 's',
          transitionTimingFunction: option.easing || opts.easing,
          transitionProperty: duration > 0 ? (function() {
            if (transforms || transforms3d) {
              // We have to use 'all' because jQuery doesn't prefix
              // css values, like transition-property: transform;
              return 'all';
            }

            return properties.left ? 'left' : 'top';
          })() : 'none',
          transform: 'none'
        };
      }

      if (transforms3d) {
        css.transform = 'translate3d(' + (properties.left || 0) + ',' + (properties.top || 0) + ',0)';
      } else if (transforms) {
        css.transform = 'translate(' + (properties.left || 0) + ',' + (properties.top || 0) + ')';
      } else {
        $.extend(css, properties);
      }

      if (transitions && duration > 0) {
        list.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', complete);
      }

      list.css(css);

      if (duration <= 0) {
        list.each(function() {
          complete.call(this);
        });
      }
    },
    _scroll: function(item, animate, callback) {
      if (this.animating) {
        if ($.isFunction(callback)) {
          callback.call(this, false);
        }

        return this;
      }

      if (typeof item !== 'object') {
        item = this.items().eq(item);
      } else if (typeof item.jquery === 'undefined') {
        item = $(item);
      }

      if (item.length === 0) {
        if ($.isFunction(callback)) {
          callback.call(this, false);
        }

        return this;
      }

      this.inTail = false;

      this._prepare(item);

      var pos     = this._position(item),
        currPos = toFloat(this.list().position()[this.lt]);

      if (pos === currPos) {
        if ($.isFunction(callback)) {
          callback.call(this, false);
        }

        return this;
      }

      var properties = {};
      properties[this.lt] = pos + 'px';

      this._animate(properties, animate, callback);

      return this;
    },
    _scrollTail: function(animate, callback) {
      if (this.animating || !this.tail) {
        if ($.isFunction(callback)) {
          callback.call(this, false);
        }

        return this;
      }

      var pos = this.list().position()[this.lt];

      if (this.rtl && this.relative && !this.vertical) {
        pos += toFloat(this.list().width()) - this.clipping();
      }

      if (this.rtl && !this.vertical) {
        pos += this.tail;
      } else {
        pos -= this.tail;
      }

      this.inTail = true;

      var properties = {};
      properties[this.lt] = pos + 'px';

      this._update({
        target:       this._target.next(),
        fullyvisible: this._fullyvisible.slice(1).add(this._visible.last())
      });

      this._animate(properties, animate, callback);

      return this;
    },
    _animate: function(properties, animate, callback) {
      callback = callback || $.noop;

      if (false === this._trigger('animate')) {
        callback.call(this, false);
        return this;
      }

      this.animating = true;

      var animation = this.options('animation'),
        complete  = $.proxy(function() {
          this.animating = false;

          var c = this.list().find('[data-jcarousel-clone]');

          if (c.length > 0) {
            c.remove();
            this._reload();
          }

          this._trigger('animateend');

          callback.call(this, true);
        }, this);

      var opts = typeof animation === 'object' ?
        $.extend({}, animation) :
        {duration: animation},
        oldComplete = opts.complete || $.noop;

      if (animate === false) {
        opts.duration = 0;
      } else if (typeof $.fx.speeds[opts.duration] !== 'undefined') {
        opts.duration = $.fx.speeds[opts.duration];
      }

      opts.complete = function() {
        complete();
        oldComplete.call(this);
      };

      this.move(properties, opts);

      return this;
    },
    _prepare: function(item) {
      var index  = this.index(item),
        idx    = index,
        wh     = this.dimension(item),
        clip   = this.clipping(),
        lrb    = this.vertical ? 'bottom' : (this.rtl ? 'left'  : 'right'),
        center = this.options('center'),
        update = {
          target:       item,
          first:        item,
          last:         item,
          visible:      item,
          fullyvisible: wh <= clip ? item : $()
        },
        curr,
        isVisible,
        margin,
        dim;

      if (center) {
        wh /= 2;
        clip /= 2;
      }

      if (wh < clip) {
        while (true) {
          curr = this.items().eq(++idx);

          if (curr.length === 0) {
            if (!this.circular) {
              break;
            }

            curr = this.items().eq(0);

            if (item.get(0) === curr.get(0)) {
              break;
            }

            isVisible = this._visible.index(curr) >= 0;

            if (isVisible) {
              curr.after(curr.clone(true).attr('data-jcarousel-clone', true));
            }

            this.list().append(curr);

            if (!isVisible) {
              var props = {};
              props[this.lt] = this.dimension(curr);
              this.moveBy(props);
            }

            // Force items reload
            this._items = null;
          }

          dim = this.dimension(curr);

          if (dim === 0) {
            break;
          }

          wh += dim;

          update.last    = curr;
          update.visible = update.visible.add(curr);

          // Remove right/bottom margin from total width
          margin = toFloat(curr.css('margin-' + lrb));

          if ((wh - margin) <= clip) {
            update.fullyvisible = update.fullyvisible.add(curr);
          }

          if (wh >= clip) {
            break;
          }
        }
      }

      if (!this.circular && !center && wh < clip) {
        idx = index;

        while (true) {
          if (--idx < 0) {
            break;
          }

          curr = this.items().eq(idx);

          if (curr.length === 0) {
            break;
          }

          dim = this.dimension(curr);

          if (dim === 0) {
            break;
          }

          wh += dim;

          update.first   = curr;
          update.visible = update.visible.add(curr);

          // Remove right/bottom margin from total width
          margin = toFloat(curr.css('margin-' + lrb));

          if ((wh - margin) <= clip) {
            update.fullyvisible = update.fullyvisible.add(curr);
          }

          if (wh >= clip) {
            break;
          }
        }
      }

      this._update(update);

      this.tail = 0;

      if (!center &&
        this.options('wrap') !== 'circular' &&
        this.options('wrap') !== 'custom' &&
        this.index(update.last) === (this.items().length - 1)) {

        // Remove right/bottom margin from total width
        wh -= toFloat(update.last.css('margin-' + lrb));

        if (wh > clip) {
          this.tail = wh - clip;
        }
      }

      return this;
    },
    _position: function(item) {
      var first  = this._first,
        pos    = toFloat(first.position()[this.lt]),
        center = this.options('center'),
        centerOffset = center ? (this.clipping() / 2) - (this.dimension(first) / 2) : 0;

      if (this.rtl && !this.vertical) {
        if (this.relative) {
          pos -= toFloat(this.list().width()) - this.dimension(first);
        } else {
          pos -= this.clipping() - this.dimension(first);
        }

        pos += centerOffset;
      } else {
        pos -= centerOffset;
      }

      if (!center &&
        (this.index(item) > this.index(first) || this.inTail) &&
        this.tail) {
        pos = this.rtl && !this.vertical ? pos - this.tail : pos + this.tail;
        this.inTail = true;
      } else {
        this.inTail = false;
      }

      return -pos;
    },
    _update: function(update) {
      var self = this,
        current = {
          target:       this._target,
          first:        this._first,
          last:         this._last,
          visible:      this._visible,
          fullyvisible: this._fullyvisible
        },
        back = this.index(update.first || current.first) < this.index(current.first),
        key,
        doUpdate = function(key) {
          var elIn  = [],
            elOut = [];

          update[key].each(function() {
            if (current[key].index(this) < 0) {
              elIn.push(this);
            }
          });

          current[key].each(function() {
            if (update[key].index(this) < 0) {
              elOut.push(this);
            }
          });

          if (back) {
            elIn = elIn.reverse();
          } else {
            elOut = elOut.reverse();
          }

          self._trigger(key + 'in', $(elIn));
          self._trigger(key + 'out', $(elOut));

          self['_' + key] = update[key];
        };

      for (key in update) {
        doUpdate(key);
      }

      return this;
    }
  });
}(jQuery, window));

/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function decode (s) {
		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	}

	function init (converter) {
		function api() {}

		function set (key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			attributes = extend({
				path: '/'
			}, api.defaults, attributes);

			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}

			// We're using "expires" because "max-age" is not supported by IE
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			try {
				var result = JSON.stringify(value);
				if (/^[\{\[]/.test(result)) {
					value = result;
				}
			} catch (e) {}

			value = converter.write ?
				converter.write(value, key) :
				encodeURIComponent(String(value))
					.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

			key = encodeURIComponent(String(key))
				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
				.replace(/[\(\)]/g, escape);

			var stringifiedAttributes = '';
			for (var attributeName in attributes) {
				if (!attributes[attributeName]) {
					continue;
				}
				stringifiedAttributes += '; ' + attributeName;
				if (attributes[attributeName] === true) {
					continue;
				}

				// Considers RFC 6265 section 5.2:
				// ...
				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
				//     character:
				// Consume the characters of the unparsed-attributes up to,
				// not including, the first %x3B (";") character.
				// ...
				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
			}

			return (document.cookie = key + '=' + value + stringifiedAttributes);
		}

		function get (key, json) {
			if (typeof document === 'undefined') {
				return;
			}

			var jar = {};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) ||
						decode(cookie);

					if (json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		}

		api.set = set;
		api.get = function (key) {
			return get(key, false /* read as raw */);
		};
		api.getJSON = function (key) {
			return get(key, true /* read as json */);
		};
		api.remove = function (key, attributes) {
			set(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.defaults = {};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5jbGFzcyBTZXRBY3RpdmVMaW5rcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuXG4gIH1cblxuICAvKipcbiAgICogU2V0IGNsYXNzPVwiYWN0aXZlXCIgdG8gbmF2IGxpbmtzIGZvciBwYWdlIG9wZW5lZFxuICAgKi9cbiAgc2V0QWN0aXZlQ2xhc3MoKSB7XG4gICAgaWYgKHRoaXMuY2hlY2tVcmwoJ3Byb2R1Y3QuaHRtbCcpKSB7XG4gICAgICAkKCcubWVudSBhJykucmVtb3ZlQXR0cignY2xhc3MnKTtcbiAgICAgICQoJy5tZW51PmxpIGFbaHJlZj1cInByb2R1Y3QuaHRtbFwiXScpLmFkZENsYXNzKCdtZW51LWFjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EtbGlzdCBhOmZpcnN0JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EgYTpmaXJzdCcpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2hlY2tVcmwoJ2luZGV4Lmh0bWwnKSkge1xuICAgICAgJCgnLm1lbnU+bGkgYVtocmVmPVwiaW5kZXguaHRtbFwiXScpLmFkZENsYXNzKCdtZW51LWFjdGl2ZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBwYWdlIFVSTCBjb250YWlucyBzb21lIHN0cmluZ1xuICAgKiBAcGFyYW0gc3RyaW5nIHVybCAtIHJlZ0V4cCBjb25kaXRpb25cbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgVVJMIGNvbnRhaW5zIHJlZ0V4cFxuICAgKi9cbiAgY2hlY2tVcmwodXJsKSB7XG4gICAgbGV0IGNoZWNrVXJsID0gbmV3IFJlZ0V4cCh1cmwpO1xuICAgIHJldHVybiBjaGVja1VybC50ZXN0KGRvY3VtZW50LmxvY2F0aW9uLmhyZWYpXG4gIH1cbn1cblxuLyoqXG4gKiBXb3JraW5nIHdpdGgganNvbiBkYXRhYmFzZXMgLSBHRVR0aW5nIGZyb20gYW5kIFBPU1RpbmcgdG8gaXRcbiAqL1xuY2xhc3MgR2V0QW5kUG9zdCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXG5cdH1cblxuXHQvKipcbiAgICogR0VUcyBkYXRhIGZyb20gREJcblx0ICogQHBhcmFtIFN0cmluZyB1cmwgZm9yIEdFVCByZXF1ZXN0XG5cdCAqIEBwYXJhbSBzdWNjZXNzQ2FsbGJhY2sgLSB3aGF0IHRvIGRvIGlmIEdFVCByZXF1ZXN0IHN1Y2NlZWRcblx0ICogQHBhcmFtIGVycm9yQ2FsbGJhY2sgLSB3aGF0IHRvIGRvIGlmIEdFVCByZXF1ZXN0IGZhaWxlZFxuXHQgKi9cblx0Z2V0KHVybCwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogdXJsLFxuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRzdWNjZXNzOiByZXNwb25zZSA9PiB7XG5cdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjay5jYWxsKHRoaXMsIHJlc3BvbnNlKTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogcmVzcG9uc2UgPT4ge1xuXHRcdFx0XHRlcnJvckNhbGxiYWNrKHJlc3BvbnNlKTtcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdCAqIFBPU1RzIGRhdGEgdG8gREJcblx0ICogQHBhcmFtIFN0cmluZyB1cmwgZm9yIFBPU1QgcmVxdWVzdFxuXHQgKiBAcGFyYW0gc3VjY2Vzc0NhbGxiYWNrIC0gd2hhdCB0byBkbyBpZiBQT1NUIHJlcXVlc3Qgc3VjY2VlZFxuXHQgKiBAcGFyYW0gZXJyb3JDYWxsYmFjayAtIHdoYXQgdG8gZG8gaWYgUE9TVCByZXF1ZXN0IGZhaWxlZFxuXHQgKi9cblx0cG9zdCh1cmwsIGRhdGEsIHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IHVybCxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuXHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG5cdFx0XHRzdWNjZXNzOiByZXNwb25zZSA9PiB7XG5cdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjayhyZXNwb25zZSwgZGF0YSk7XG5cdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IHJlc3BvbnNlID0+IHtcblx0XHRcdFx0ZXJyb3JDYWxsYmFjayhyZXNwb25zZSk7XG5cdFx0XHR9XG5cdFx0fSlcblx0fVxufVxuXG5jbGFzcyBDYXJvdXNlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICAkKCcuamNhcm91c2VsJykuamNhcm91c2VsKHtcbiAgICAgIHdyYXA6ICdjaXJjdWxhcidcbiAgICB9KTtcbiAgICAkKCcuamNhcm91c2VsLXByZXYnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcuamNhcm91c2VsJykuamNhcm91c2VsKCdzY3JvbGwnLCAnLT0xJyk7XG4gICAgfSk7XG5cbiAgICAkKCcuamNhcm91c2VsLW5leHQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcuamNhcm91c2VsJykuamNhcm91c2VsKCdzY3JvbGwnLCAnKz0xJyk7XG4gICAgfSk7XG4gIH1cbn1cblxuKGZ1bmN0aW9uICgkKSB7XG4gICQoZnVuY3Rpb24gKCkge1xuICAgIGxldCBwYWdlSW5pdCA9IG5ldyBTZXRBY3RpdmVMaW5rcygpO1xuICAgIHBhZ2VJbml0LnNldEFjdGl2ZUNsYXNzKCk7XG5cbiAgICBsZXQgY2Fyb3VzZWwgPSBuZXcgQ2Fyb3VzZWwoKTtcbiAgICBjYXJvdXNlbC5pbml0KCk7XG5cbiAgICBsZXQgaWZQcm9kdWN0ID0gbmV3IFJlZ0V4cCgncHJvZHVjdC5odG1sJykudGVzdChkb2N1bWVudC5sb2NhdGlvbi5ocmVmKTtcbiAgICBsZXQgaWZTaW5nbGUgPSBuZXcgUmVnRXhwKCdzaW5nbGUuaHRtbCcpLnRlc3QoZG9jdW1lbnQubG9jYXRpb24uaHJlZik7XG4gICAgbGV0IGNvbmZpZyA9IHtcbiAgICAgIHVybDoge1xuICAgICAgICBwcm9kdWN0czogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9wcm9kdWN0cycsXG4gICAgICAgIGZpbHRlcnM6ICdodHRwOi8vbG9jYWxob3N0OjMwMDMvZmlsdGVycycsXG4gICAgICAgIGZpbHRlcmVkUHJvZHVjdHM6ICdodHRwOi8vbG9jYWxob3N0OjMwMDMvZmlsdGVyZWRQcm9kdWN0cycsXG4gICAgICAgIGNhcnQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDIvY2FydCcsXG4gICAgICB9LFxuICAgICAgc2VsZWN0b3JzOiB7XG5cdFx0XHRcdGFjdGl2ZTogXCJhY3RpdmVcIixcbiAgICAgICAgYWRkVG9DYXJ0OiAnLmFkZFRvQ2FydCcsXG4gICAgICAgIGNhcnQ6ICcuY2FydC1jb250YWluZXInLFxuICAgICAgICBjYXJ0Q2xlYXI6ICcuY2FydC1jbGVhcicsXG4gICAgICAgIGNhcnRIZWFkZXJJbWc6ICcuY2FydC1oZWFkZXItaW1nJyxcblx0XHRcdFx0ZGVsOiAnLmNhcnQtaXRlbS1kZWwnLFxuXHRcdFx0XHRkaXNwbGF5Tm9uZTogJ3RlbXBsYXRlJyxcblx0XHRcdFx0ZmVhdHVyZWRQcm9kdWN0czogXCIuZmVhdHVyZWQtcHJvZHVjdHNcIixcblx0XHRcdFx0aHJlZjogJy5jYXJ0LWl0ZW0taHJlZicsXG4gICAgICAgIGltZzogJy5jYXJ0LWl0ZW0taW1nJyxcblx0XHRcdFx0aXRlbTogJy5jYXJ0LWl0ZW0udGVtcGxhdGUnLFxuICAgICAgICBuYW1lOiAnLmNhcnQtaXRlbS1uYW1lJyxcbiAgICAgICAgcXVhbnRpdHk6ICcuY2FydC1pdGVtLXF1YW50aXR5JyxcbiAgICAgICAgcHJpY2U6ICcuY2FydC1pdGVtLXByaWNlJyxcbiAgICAgICAgcmF0ZTogJy5yYXRlJyxcbiAgICAgICAgc3VidG90YWw6ICcuY2FydC1pdGVtLXN1YnRvdGFsJyxcbiAgICAgICAgdG90YWw6ICcuY2FydC10b3RhbCcsXG5cdFx0XHRcdG9vcHM6IFwiI29vcHNcIixcbiAgICAgICAgcGFnaW5hdGlvbjogJyNwYWdpbmF0aW9uJyxcbiAgICAgICAgcGFnZUw6ICcucGFnZS1sZWZ0LWJ1dHRvbicsXG4gICAgICAgIHBhZ2VSOiAnLnBhZ2UtcmlnaHQtYnV0dG9uJyxcbiAgICAgICAgcHJvZHVjdHNEaXY6IFwiLnByb2R1Y3QtYm94XCIsXG4gICAgICAgIHByb2R1Y3RJdGVtOiBcIi5wcm9kdWN0LWJveC1hXCIsXG4gICAgICAgIHByb2R1Y3RIcmVmOiBcIi5wcm9kdWN0X2hyZWZcIixcbiAgICAgICAgcHJvZHVjdE5hbWU6IFwiLnByb2R1Y3QtbmFtZVwiLFxuICAgICAgICBwcm9kdWN0UHJpY2U6IFwiLnByb2R1Y3QtcHJpY2VcIixcbiAgICAgICAgcHJvZHVjdEltZzogXCIucHJvZHVjdC1pbWdcIixcblx0XHRcdFx0cmVsYXRlZFByb2Q6IFwiLnlvdS1tYXktbGlrZVwiLFxuXHRcdFx0XHRzaW5nbGVBZGRUb0NhcnQ6IFwiLnNpbmdsZS1kZXNjLWJ1dHRvblwiLFxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoaWZQcm9kdWN0KSB7XG4gICAgICBsZXQgZmlsdGVyc0hhbmRsZSA9IG5ldyBGaWx0ZXJzSGFuZGxlKCk7XG4gICAgICBmaWx0ZXJzSGFuZGxlLmluaXQoMCwgMTAwMCwgMSwgY29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGNhcnQgPSBuZXcgQ2FydCgpO1xuICAgICAgY2FydC5pbml0KGNvbmZpZyk7XG4gICAgfVxuXG4gICAgaWYoJCgnLmZlYXR1cmVkLXByb2R1Y3RzJylbMF0pe1xuICAgIFx0bGV0IHJlbmRlckZpbHRlcmVkUHJvZHVjdHMgPSBuZXcgUmVuZGVyRmlsdGVyZWRQcm9kdWN0cyhjb25maWcsICdmZWF0dXJlZCcpO1xuICAgIFx0cmVuZGVyRmlsdGVyZWRQcm9kdWN0cy5pbml0KCk7XG5cdFx0fSBlbHNlIGlmICgkKCcueW91LW1heS1saWtlJylbMF0pe1xuXHRcdFx0bGV0IHJlbmRlckZpbHRlcmVkUHJvZHVjdHMgPSBuZXcgUmVuZGVyRmlsdGVyZWRQcm9kdWN0cyhjb25maWcsICdyZWxhdGVkJyk7XG5cdFx0XHRyZW5kZXJGaWx0ZXJlZFByb2R1Y3RzLmluaXQoKTtcblx0XHR9XG4gIH0pXG59KShqUXVlcnkpO1xuXG5cbmNsYXNzIFJlbmRlckZpbHRlcmVkUHJvZHVjdHMge1xuXHRjb25zdHJ1Y3Rvcihjb25maWcsIGZpbHRlcikge1xuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xuXHRcdHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuXHRcdHRoaXMuZmlsdGVyZWQgPSBbXTtcblx0fVxuXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5nZXRDYXRhbG9nKHRoaXMuY29uZmlnLCB0aGlzLmZpbHRlcik7XG5cdH1cblxuXHRnZXRDYXRhbG9nKGNvbmZpZywgZmlsdGVyKSB7XG5cdFx0bGV0IHVybCA9IGNvbmZpZy51cmwucHJvZHVjdHM7XG5cdFx0bGV0IHN1Y2Nlc3NDYWxsYmFjayA9IGNhdGFsb2cgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJzE4IC0gR290IGZpbHRlcmVkIGNhdGFsb2cgZnJvbSBEQicpO1xuXHRcdFx0dGhpcy5maWx0ZXJBbmRSZW5kZXIoY29uZmlnLCBmaWx0ZXIsIGNhdGFsb2cpO1xuXHRcdH07XG5cdFx0bGV0IGVycm9yQ2FsbGJhY2sgPSByZXNwb25zZSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnMTggLSBNZXRob2QgZ2V0Q2F0YWxvZygpIG9mIGdldHRpbmcgY2F0YWxvZyBGQUlMRUQnKTtcblx0XHR9O1xuXG5cdFx0bGV0IGdldEFuZFBvc3QgPSBuZXcgR2V0QW5kUG9zdCgpO1xuXHRcdGdldEFuZFBvc3QuZ2V0KHVybCwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgY2F0YWxvZyBhbmQgcmVuZGVyIGZpbHRlcmVkIHByb2R1Y3RzIGFycmF5XG5cdCAqIEBwYXJhbSBbe31dIGNhdGFsb2cgLSBhcnJheSBvZiBjYXRhbG9nIHByb2R1Y3RzXG5cdCAqIEBwYXJhbSBTdHJpbmcgZmlsdGVyIC0gZmlsdGVyIHZhbHVlXG5cdCAqIEBwYXJhbSB7fSBjb25maWcgLSBPYmplY3Qgb2YgY29uZmlnXG5cdCAqL1xuXHRmaWx0ZXJBbmRSZW5kZXIoY29uZmlnLCBmaWx0ZXIsIGNhdGFsb2cpIHtcblx0XHRsZXQgZmlsdGVyZWQgPSBbXTtcblxuXHRcdGlmIChmaWx0ZXIgPT09ICdmZWF0dXJlZCcpIHtcblx0XHRcdGZpbHRlcmVkID0gdGhpcy5maWx0ZXJCeVRhZyhjYXRhbG9nLCBmaWx0ZXIpO1xuXHRcdH0gZWxzZSBpZiAoZmlsdGVyID09PSAncmVsYXRlZCcpIHtcblx0XHRcdGZpbHRlcmVkID0gdGhpcy5maWx0ZXJSZWxhdGVkKGNhdGFsb2cpO1xuXHRcdH1cblxuXHRcdGxldCByZW5kZXIgPSBuZXcgUmVuZGVyUHJvZHVjdHMoY29uZmlnLCBmaWx0ZXJlZCk7XG5cdFx0cmVuZGVyLmluaXQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgb3V0IGZyb20gY2F0YWxvZyB0YWdlZCBwcm9kdWN0c1xuXHQgKiBAcGFyYW0ge30gY2F0YWxvZyAtIGNhdGFsb2cgb2JqZWN0XG5cdCAqIEBwYXJhbSBTdHJpbmcgdGFnIC0gdGhlIHRhZyB3ZSBhcmUgbG9va2luZyBmb3Jcblx0ICovXG5cdGZpbHRlckJ5VGFnKGNhdGFsb2csIHRhZykge1xuXHRcdGxldCBmaWx0ZXJlZCA9IFtdO1xuXHRcdGZvciAoY29uc3QgaXRlbSBvZiBjYXRhbG9nKSB7XG5cdFx0XHRpZiAodGhpcy5oYXNUYWcoaXRlbS50YWcsIHRhZykpIHtcblx0XHRcdFx0ZmlsdGVyZWQucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZpbHRlcmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHByb2R1Y3QncyB0YWcgc3RyaW5nIGNvbnRhaW5zIG5lZWRlZCB0YWdcblx0ICogQHBhcmFtIHRhZ3MgLSBzdHJpbmcgb2YgcHJvZHVjdCB0YWdzXG5cdCAqIEBwYXJhbSByZWdFeHAgLSBzdHJpbmcgb2YgdGFnIHdlIG5lZWQgdG8gZmluZFxuXHQgKiBAcmV0dXJucyB7Kn0gLSB0cnVlIGlmIHRhZyBmb3VuZFxuXHQgKi9cblx0aGFzVGFnKHRhZ3MsIHRhZyl7XG5cdFx0bGV0IHJlZ0V4cCA9IG5ldyBSZWdFeHAodGFnKTtcblx0XHRyZXR1cm4gcmVnRXhwLnRlc3QodGFncyk7XG5cdH1cblxuXHQvKipcblx0ICogRmlsdGVyIG91dCBmcm9tIGNhdGFsb2cgcmVsYXRlZCBwcm9kdWN0c1xuXHQgKiBAcGFyYW0gY2F0YWxvZ1xuXHQgKiBAcmV0dXJucyB7QXJyYXl9IHJlbGF0ZWQgcHJvZHVjdHNcblx0ICovXG5cdGZpbHRlclJlbGF0ZWQoY2F0YWxvZykge1xuXHRcdC8vINC90LDQudGC0Lgg0LrQvdC+0L/QutGDINC00L7QsdCw0LLQu9C10L3QuNGPINCyINC60L7RgNC30LjQvdGDINGC0L7QstCw0YDQsCBTaW5nbGUg0Lgg0LLQt9GP0YLRjCDRgSDQvdC10LUgaWRcblx0XHRsZXQgaWQgPSB0aGlzLmdldFNpbmdsZVByb2R1Y3RJZCgpO1xuXHRcdGxldCBwcm9kID0gdGhpcy5maW5kUHJvZHVjdEJ5SWQoY2F0YWxvZywgaWQpO1xuXHRcdGxldCByZWxhdGVkUHJvZElkID0gcHJvZC5yZWxhdGVkUHJvZElkO1xuXG5cdFx0cmV0dXJuIHRoaXMuZ2V0UmVsYXRlZFByb2R1Y3RzKGNhdGFsb2csIHJlbGF0ZWRQcm9kSWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmQgYWRkVG9DYXJ0IGJ1dHRvbiBvZiBzaW5nbGUgcGFnZSdzIHByb2R1Y3QgYW5kIHJldHVybnMgaXRzIGlkXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9IGlkIG9mIHByb2R1Y3RzIG9mIHNpbmdsZSBwYWdlXG5cdCAqL1xuXHRnZXRTaW5nbGVQcm9kdWN0SWQoKXtcblx0XHRyZXR1cm4gKyQodGhpcy5jb25maWcuc2VsZWN0b3JzLnNpbmdsZUFkZFRvQ2FydClbMF0uaWQ7XG5cdH1cblxuXHQvKipcblx0ICogRmlsdGVyIG91dCBvZiBjYXRhbG9nIHJlbGF0ZWQgcHJvZHVjdHNcblx0ICogQHBhcmFtIGNhdGFsb2cgLSBwcm9kdWN0IGNhdGFsb2cgb2JqZWN0XG5cdCAqIEBwYXJhbSByZWxhdGVkUHJvZElkIC0gYXJyYXkgb2YgcmVsYXRlZCBwcm9kdWN0cyBpZCdzXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gcmVsYXRlZCBwcm9kdWN0c1xuXHQgKi9cblx0Z2V0UmVsYXRlZFByb2R1Y3RzKGNhdGFsb2csIHJlbGF0ZWRQcm9kSWQpe1xuXHRcdGxldCByZWxQcm9kID0gW107XG5cdFx0Zm9yIChjb25zdCBpZCBvZiByZWxhdGVkUHJvZElkKSB7XG5cdFx0XHRsZXQgb25lUmVsYXRlZFByb2QgPSB0aGlzLmZpbmRQcm9kdWN0QnlJZChjYXRhbG9nLCBpZCk7XG5cdFx0XHRyZWxQcm9kLnB1c2gob25lUmVsYXRlZFByb2QpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVsUHJvZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgY2F0YWxvZywgY29tcGFyaW5nIGNhdGFsb2cgaXRlbSBpZCB3aXRoIGlkIGZyb20gcGFyYW1zXG5cdCAqIEBwYXJhbSB7fSBjYXRhbG9nIC0gY2F0YWxvZyB3ZSBuZWVkIHRvIGZpbHRlclxuXHQgKiBAcGFyYW0gSW50IGlkIC0gaWQgdmFsdWUgb2YgY2F0YWxvZyBpdGVtIHdlIG5lZWQgdG8gZmluZFxuXHQgKiBAcmV0dXJucyB7fXxCb29sZWFuIGl0ZW0gb2YgY2F0YWxvZyBvciBmYWxzZSBpZiBub3QgZm91bmRcblx0ICovXG5cdGZpbmRQcm9kdWN0QnlJZChjYXRhbG9nLCBpZCkge1xuXHRcdGZvciAoY29uc3QgaXRlbSBvZiBjYXRhbG9nKSB7XG5cdFx0XHRpZiAoaXRlbS5pZCA9PT0gaWQpIHtcblx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cblxuLyoqXG4gKiBDb2xsZWN0IGZyb20gRE9NIGFsbCBwcm9kdWN0J3MgZmlsdGVycyBhbmQgc2VuZCBpdCB0byBzZXJ2ZXIgKGpzb24pXG4gKi9cbmNsYXNzIEZpbHRlcnNIYW5kbGUge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmZpbHRlcnMgPSB7XG5cdFx0XHRjYXRJdGVtOiBudWxsLCAvLyBzdHJpbmdcblx0XHRcdGNhdGVnb3J5OiBudWxsLCAvLyAnYWxsJyBvciBzdHJpbmdcblx0XHRcdGJyYW5kOiBudWxsLCAvLyAnYWxsJyBvciBzdHJpbmdcblx0XHRcdGRlc2lnbmVyOiBudWxsLCAvLyAnYWxsJyBvciBzdHJpbmdcblx0XHRcdHNpemU6IFswXSwgLy8gWzBdIG9yIFthLCAoLi4uKV1cblx0XHRcdHByaWNlOiBbXSwgLy8gW2EsIGJdXG5cdFx0XHRzaG93Qnk6IG51bGwsXG5cdFx0fTtcblx0XHR0aGlzLmNvbmZpZyA9IHtcblx0XHRcdHVybDoge30sXG5cdFx0XHRzZWxlY3RvcnM6IHt9LFxuXHRcdH07XG5cdH1cblxuXHRpbml0KG1pbiwgbWF4LCBzdGVwLCBjb25maWcpIHtcblx0XHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcblx0XHR0aGlzLnNldENvb2tpZXNGaWx0ZXJzKCk7XG5cdFx0dGhpcy5pbml0UHJpY2VTbGlkZXIobWluLCBtYXgsIHN0ZXApO1xuXHRcdHRoaXMuZmlsdGVycy5jYXRJdGVtID0gdGhpcy5nZXRDYXRJdGVtKCk7XG5cdFx0dGhpcy5maWx0ZXJzLmNhdGVnb3J5ID0gdGhpcy5nZXRDYXRlZ29yeSgpO1xuXHRcdHRoaXMuZmlsdGVycy5icmFuZCA9IHRoaXMuZ2V0QnJhbmQoKTtcblx0XHR0aGlzLmZpbHRlcnMuZGVzaWduZXIgPSB0aGlzLmdldERlc2lnbmVyKCk7XG5cdFx0dGhpcy5zZXRTaXplQ2hlY2tib3hIYW5kbGVyKCk7XG5cdFx0dGhpcy5maWx0ZXJzLnByaWNlID0gdGhpcy5nZXRQcmljZVJhbmdlKCk7XG5cdFx0dGhpcy5zZXRTaG93QnlIYW5kbGVyKCk7XG5cdFx0dGhpcy5wb3N0RmlsdGVycyh0aGlzLmZpbHRlcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHRpbmcgaW4gRE9NIGFsbCBmaWx0ZXJzIGZyb20gY29va2llc1xuXHQgKi9cblx0c2V0Q29va2llc0ZpbHRlcnMoKSB7XG5cdFx0dGhpcy5nZXRDb29raWVzRmlsdGVycygpO1xuXHRcdHRoaXMuc2V0U2l6ZUNoZWNrZWQoKTtcblx0XHR0aGlzLnNldFNob3dCeVNlbGVjdGVkKHRoaXMuZmlsdGVycy5zaG93QnkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNhdmUgaW4gdGhpcy5maWx0ZXJzIGFsbCBmaWx0ZXJzIGZyb20gY29va2llc1xuXHQgKi9cblx0Z2V0Q29va2llc0ZpbHRlcnMoKSB7XG5cdFx0Y29uc3QgY29va2llc0ZpbHRlcnMgPSBDb29raWVzLmdldCgpO1xuXHRcdGlmIChjb29raWVzRmlsdGVycy5wcmljZSkge1xuXHRcdFx0Y29va2llc0ZpbHRlcnMucHJpY2UgPSBjb29raWVzRmlsdGVycy5wcmljZS5zcGxpdCgnXycpO1xuXHRcdH1cblx0XHRpZiAoY29va2llc0ZpbHRlcnMuc2l6ZSkge1xuXHRcdFx0Y29va2llc0ZpbHRlcnMuc2l6ZSA9IGNvb2tpZXNGaWx0ZXJzLnNpemUuc3BsaXQoJ18nKTtcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IHByb3BDIGluIGNvb2tpZXNGaWx0ZXJzKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHByb3BGIGluIHRoaXMuZmlsdGVycykge1xuXHRcdFx0XHRpZiAocHJvcEMgPT09IHByb3BGKSB7XG5cdFx0XHRcdFx0dGhpcy5maWx0ZXJzW3Byb3BGXSA9IGNvb2tpZXNGaWx0ZXJzW3Byb3BDXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXR0aW5nIHVwIHByaWNlLXJhbmdlIHNsaWRlci5cblx0ICogSWYgcHJpY2UgY29va2llIGlzIC0gc2V0IG1pblZhbCBhbmQgbWF4VmFsIGZyb20gY29va2llc1xuXHQgKi9cblx0aW5pdFByaWNlU2xpZGVyKG1pbiwgbWF4LCBzdGVwKSB7XG5cdFx0bGV0IG1pblZhbCwgbWF4VmFsO1xuXG5cdFx0aWYgKHRoaXMuZmlsdGVycy5wcmljZS5sZW5ndGgpIHtcblx0XHRcdG1pblZhbCA9IHRoaXMuZmlsdGVycy5wcmljZVswXTtcblx0XHRcdG1heFZhbCA9IHRoaXMuZmlsdGVycy5wcmljZVsxXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bWluVmFsID0gbWF4ICogMC4wNTtcblx0XHRcdG1heFZhbCA9IG1heCAqIDAuNDtcblx0XHR9XG5cblx0XHQkKCcucHJpY2UtcmFuZ2VfX3NsaWRlcicpLnNsaWRlcih7XG5cdFx0XHRyYW5nZTogdHJ1ZSxcblx0XHRcdHZhbHVlczogW21pblZhbCwgbWF4VmFsXSxcblx0XHRcdG1pbjogbWluLFxuXHRcdFx0bWF4OiBtYXgsXG5cdFx0XHRzdGVwOiBzdGVwLFxuXHRcdFx0c2xpZGU6ICgpID0+IHtcblx0XHRcdFx0dGhpcy5zaG93UHJpY2VSYW5nZVZhbHVlcygpO1xuXHRcdFx0fSxcblx0XHRcdGNoYW5nZTogKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnNob3dQcmljZVJhbmdlVmFsdWVzKCk7XG5cdFx0XHRcdHRoaXMuZmlsdGVycy5wcmljZSA9IHRoaXMuZ2V0UHJpY2VSYW5nZSgpO1xuXHRcdFx0XHR0aGlzLnNldENvb2tpZXMoJ3ByaWNlJywgdGhpcy5maWx0ZXJzLnByaWNlLmpvaW4oJ18nKSk7XG5cdFx0XHRcdCQoJyNvb3BzJykuYWRkQ2xhc3MoJ3RlbXBsYXRlJyk7XG5cdFx0XHRcdHRoaXMucG9zdEZpbHRlcnModGhpcy5maWx0ZXJzKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNob3dQcmljZVJhbmdlVmFsdWVzKCk7XG5cdH1cblxuXHQvKipcblx0ICogU2hvdy9VcGRhdGUgbWluIGFuZCBtYXggcHJpY2UgcmFuZ2UgdmFsdWVzXG5cdCAqL1xuXHRzaG93UHJpY2VSYW5nZVZhbHVlcygpIHtcblx0XHQkKCcjcHJpY2UtbWluJykudGV4dCh0aGlzLmdldFByaWNlUmFuZ2UoKVswXSk7XG5cdFx0JCgnI3ByaWNlLW1heCcpLnRleHQodGhpcy5nZXRQcmljZVJhbmdlKClbMV0pO1xuXHR9XG5cblx0Z2V0Q2F0SXRlbSgpIHtcblx0XHRyZXR1cm4gJCgnLm1lbnUtYWN0aXZlJykudGV4dCgpXG5cdH1cblxuXHRnZXRDYXRlZ29yeSgpIHtcblx0XHRpZiAoJCgnLm1lbnUgLmFjdGl2ZScpWzBdKSB7XG5cdFx0XHRyZXR1cm4gJCgnLm1lbnUgLmFjdGl2ZScpLnRleHQoKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gJ2FsbCdcblx0XHR9XG5cdH1cblxuXHRnZXRCcmFuZCgpIHtcblx0XHRpZiAoJCgnI2JyYW5kIC5hY3RpdmUnKVswXSkge1xuXHRcdFx0Y29uc29sZS5sb2coJCgnI2JyYW5kIC5hY3RpdmUnKS50ZXh0KCkpO1xuXHRcdFx0cmV0dXJuICQoJyNicmFuZCAuYWN0aXZlJykudGV4dCgpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAnYWxsJ1xuXHRcdH1cblx0fVxuXG5cdGdldERlc2lnbmVyKCkge1xuXHRcdGlmICgkKCcjZGVzaWduZXIgLmFjdGl2ZScpWzBdKSB7XG5cdFx0XHRyZXR1cm4gJCgnI2Rlc2lnbmVyIC5hY3RpdmUnKS50ZXh0KClcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuICdhbGwnXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIElmIChubyBzaXplIGNvb2tpZSkgc2V0IGFsbCBzaXplcywgZWxzZSBzZXQgc2l6ZXMgZnJvbSBjb29raWVzXG5cdCAqL1xuXHRzZXRTaXplQ2hlY2tlZCgpIHtcblx0XHRpZiAoQ29va2llcy5nZXQoJ3NpemUnKSkge1xuXHRcdFx0bGV0IGNvb2tpZXNTaXplID0gQ29va2llcy5nZXQoJ3NpemUnKS5zcGxpdCgnXycpOyAvLyB0dXJuIHNpemUgY29va2llIHRvIGFycmF5XG5cdFx0XHQvLyBmaW5kIGFsbCBjaGVja2JveGVzIHdoaWNoIGRhdGEtbmFtZSBpcyBvbmUgb2YgY29va2llc1NpemUgYW5kIHNldCBpdCBjaGVja2VkXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNvb2tpZXNTaXplLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgJCgnLnNpemUtY2hlY2tib3gnKS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdGlmIChjb29raWVzU2l6ZVtpXSA9PT0gJCgnLnNpemUtY2hlY2tib3gnKVtqXS5kYXRhc2V0Lm5hbWUpIHtcblx0XHRcdFx0XHRcdCQoJy5zaXplLWNoZWNrYm94Jylbal0uc2V0QXR0cmlidXRlKFwiY2hlY2tlZFwiLCBcIlwiKTtcblx0XHRcdFx0XHRcdCQoJy5zaXplLWNoZWNrYm94Jylbal0uY2xhc3NMaXN0LmFkZChcImNoZWNrZWRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgJCgnLnNpemUtY2hlY2tib3gnKS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHQkKCcuc2l6ZS1jaGVja2JveCcpW2pdLnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIiwgXCJcIik7XG5cdFx0XHRcdCQoJy5zaXplLWNoZWNrYm94Jylbal0uY2xhc3NMaXN0LmFkZChcImNoZWNrZWRcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCBoYW5kbGVycyBvZiBzaXplIGNoZWNrYm94ZXMgc3RhdGUgY2hhbmdpbmdcblx0ICogVXBkYXRlcyBzaXplIGNvb2tpZSwgdGhpcy5maWx0ZXJzIGFuZCBzZW5kcyBQT1NUIHRvIHNlcnZlclxuXHQgKi9cblx0c2V0U2l6ZUNoZWNrYm94SGFuZGxlcigpIHtcblx0XHRsZXQgdGhhdCA9IHRoaXM7XG5cdFx0Ly8gc2V0IHVwZGF0ZSBzaXplcyBBcnIgZm9yIGV2ZXJ5IHNpemUgY2hlY2tib3ggY2xpY2tcblx0XHQkKCcuc2l6ZS1jaGVja2JveCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnY2hlY2tlZCcpOyAvLyBpZiBDaGVja2VkIHNldCBjbGFzcyAnY2hlY2tlZCcgYW5kIGJhY2tcblx0XHRcdCQoJyNvb3BzJykuYWRkQ2xhc3MoJ3RlbXBsYXRlJyk7XG5cblx0XHRcdGlmICgkKCcuY2hlY2tlZCcpLmxlbmd0aCkge1xuXHRcdFx0XHRsZXQgc2l6ZXMgPSBbXTsgLy8gY2xlYXIgc2l6ZSBBcnJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCAkKCcuY2hlY2tlZCcpLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0c2l6ZXMucHVzaCgkKCcuY2hlY2tlZCcpW2ldLmRhdGFzZXQubmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhhdC5maWx0ZXJzLnNpemUgPSBzaXplcztcblx0XHRcdFx0dGhhdC5zZXRDb29raWVzKCdzaXplJywgc2l6ZXMuam9pbignXycpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoYXQuZmlsdGVycy5zaXplID0gWzBdO1xuXHRcdFx0fVxuXHRcdFx0dGhhdC5wb3N0RmlsdGVycyh0aGF0LmZpbHRlcnMpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgcHJpY2Ugc2xpZGVyIHJhbmdlXG5cdCAqIEByZXR1cm5zIFtdIHtqUXVlcnl9XG5cdCAqL1xuXHRnZXRQcmljZVJhbmdlKCkge1xuXHRcdHJldHVybiAkKCcucHJpY2UtcmFuZ2VfX3NsaWRlcicpLnNsaWRlcigndmFsdWVzJyk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBcInNlbGVjdGVkXCIgYXR0cmlidXRlIGZvciBzaG93Qnkgb3B0aW9uXG5cdCAqIEBwYXJhbSBJbnQgdmFsdWUgdmFsdWUgb2Ygb3B0aW9uJ3MgdmFsdWUgcHJvcGVydHlcblx0ICovXG5cdHNldFNob3dCeVNlbGVjdGVkKHZhbHVlKSB7XG5cdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHR0aGlzLmZpbHRlcnMuc2hvd0J5ID0gMztcblx0XHRcdCQoYCNzaG93Qnkgb3B0aW9uW3ZhbHVlPVwiM1wiXWApWzBdLnNldEF0dHJpYnV0ZShcInNlbGVjdGVkXCIsIFwiXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKGAjc2hvd0J5IG9wdGlvbjpzZWxlY3RlZGApLnJlbW92ZUF0dHIoXCJzZWxlY3RlZFwiKTtcblx0XHRcdCQoYCNzaG93Qnkgb3B0aW9uW3ZhbHVlPSR7dmFsdWV9XWApWzBdLnNldEF0dHJpYnV0ZShcInNlbGVjdGVkXCIsIFwiXCIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93Qnkgc2VsZWN0b3IgY2hhbmdlIGhhbmRsZXIuIElmIGNoYW5nZWQ6XG5cdCAqIHJlbW92ZSBcInNlbGVjdGVkXCIgYXR0cixcblx0ICogdXBkYXRlIHRoaXMuZmlsdGVycy5zaG93QnksXG5cdCAqIHVwZGF0ZSBzaG93QnkgaW4gQ29va2llc1xuXHQgKiBwb3N0IHVwZGF0ZWQgZmlsdGVycyB0byBzZXJ2ZXJcblx0ICovXG5cdHNldFNob3dCeUhhbmRsZXIoKSB7XG5cdFx0JCgnI3Nob3dCeScpLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG5cdFx0XHQkKGAjc2hvd0J5IG9wdGlvbltzZWxlY3RlZF1gKS5yZW1vdmVBdHRyKFwic2VsZWN0ZWRcIik7XG5cdFx0XHR0aGlzLmZpbHRlcnMuc2hvd0J5ID0gKyQoJyNzaG93Qnkgb3B0aW9uOnNlbGVjdGVkJykudGV4dCgpO1xuXHRcdFx0JChgI3Nob3dCeSBvcHRpb25bdmFsdWU9JHt0aGlzLmZpbHRlcnMuc2hvd0J5fV1gKVswXS5zZXRBdHRyaWJ1dGUoXCJzZWxlY3RlZFwiLCBcIlwiKTtcblxuXHRcdFx0dGhpcy5zZXRDb29raWVzKCdzaG93QnknLCB0aGlzLmZpbHRlcnMuc2hvd0J5KTtcblx0XHRcdHRoaXMucG9zdEZpbHRlcnModGhpcy5maWx0ZXJzKTtcblx0XHR9KVxuXHR9XG5cblx0c2V0Q29va2llcyhuYW1lLCB2YWwpIHtcblx0XHRDb29raWVzLnNldChuYW1lLCB2YWwsIHtleHBpcmVzOiA3fSk7XG5cdH1cblxuXHQvKipcblx0ICogU2VuZCBmaWx0ZXJzIHRvIHNlcnZlclxuXHQgKiBAcGFyYW0ge30gZGF0YSAtIGZpbHRlcnNcblx0ICovXG5cdHBvc3RGaWx0ZXJzKGRhdGEpIHtcblx0XHRsZXQgZ2V0QW5kUG9zdCA9IG5ldyBHZXRBbmRQb3N0KCk7XG5cblx0XHRsZXQgdXJsID0gdGhpcy5jb25maWcudXJsLmZpbHRlcnM7XG5cdFx0bGV0IHN1Y2Nlc3NDYWxsYmFjayA9ICgpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCdQcm9kdWN0IGZpbHRlcnMgd2FzIFNFTlQgdG8gREInKTtcblx0XHRcdGxldCBzZXJ2ZXJGaWx0ZXJQcm9kdWN0cyA9IG5ldyBTZXJ2ZXJGaWx0ZXJQcm9kdWN0cygpO1xuXHRcdFx0c2VydmVyRmlsdGVyUHJvZHVjdHMuaW5pdCh0aGlzLmNvbmZpZyk7XG5cdFx0fTtcblx0XHRsZXQgZXJyb3JDYWxsYmFjayA9ICgpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCdQcm9kdWN0IGZpbHRlcnMgc2VuZGluZyB0byBEQiBGQUlMRUQnKTtcblx0XHR9O1xuXG5cdFx0Z2V0QW5kUG9zdC5wb3N0KHVybCwgZGF0YSwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcblxuXHR9XG59XG5cbi8qKlxuICogU2VydmVyIHNpZGUgd29yayBlbXVsYXRpb24gLSBmaWx0ZXJzIGNhdGFsb2cgd2l0aCBmaWx0ZXJzIGFuZCBzYXZlIHJlc3VsdCB0byBEQlxuICovXG5jbGFzcyBTZXJ2ZXJGaWx0ZXJQcm9kdWN0cyB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuZmlsdGVycyA9IHt9O1xuXHRcdHRoaXMuY2F0YWxvZyA9IHt9O1xuXHRcdHRoaXMuY29uZmlnID0ge1xuXHRcdFx0dXJsOiB7fSxcblx0XHRcdHNlbGVjdG9yczoge30sXG5cdFx0fTtcblx0fVxuXG5cdGluaXQoY29uZmlnKSB7XG5cdFx0dGhpcy5jb25maWcgPSBjb25maWc7XG5cdFx0dGhpcy5nZXRGaWx0ZXJzKClcblx0fVxuXG5cdGdldEZpbHRlcnMoKSB7XG5cdFx0bGV0IGdldEFuZFBvc3QgPSBuZXcgR2V0QW5kUG9zdCgpO1xuXHRcdGxldCB1cmwgPSB0aGlzLmNvbmZpZy51cmwuZmlsdGVycztcblx0XHRsZXQgc3VjY2Vzc0NhbGxiYWNrID0gcmVzcG9uc2UgPT4ge1xuXHRcdFx0dGhpcy5maWx0ZXJzID0gcmVzcG9uc2U7XG5cdFx0XHRjb25zb2xlLmxvZygnMzAyIC0gU2VydmVyIGdvdCBmaWx0ZXJzIGZyb20gREInKTtcblx0XHRcdHRoaXMuZ2V0Q2F0YWxvZygpO1xuXHRcdH07XG5cdFx0bGV0IGVycm9yQ2FsbGJhY2sgPSByZXNwb25zZSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnMzAyIC0gTWV0aG9kIGdldEZpbHRlcnMoKSBvZiBnZXR0aW5nIGZpbHRlcnMgRkFJTEVEJyk7XG5cdFx0fTtcblxuXHRcdGdldEFuZFBvc3QuZ2V0KHVybCwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcblx0fVxuXG5cdGdldENhdGFsb2coKSB7XG5cdFx0bGV0IGdldEFuZFBvc3QgPSBuZXcgR2V0QW5kUG9zdCgpO1xuXG5cdFx0bGV0IHVybCA9IHRoaXMuY29uZmlnLnVybC5wcm9kdWN0cztcblx0XHRsZXQgc3VjY2Vzc0NhbGxiYWNrID0gcmVzcG9uc2UgPT4ge1xuXHRcdFx0dGhpcy5jYXRhbG9nID0gcmVzcG9uc2U7XG5cdFx0XHRjb25zb2xlLmxvZygnMzE2IC0gU2VydmVyIGdvdCBwcm9kdWN0cyBjYXRhbG9nIGZyb20gREInKTtcblx0XHRcdHRoaXMuZmlsdGVyQ2F0YWxvZygpO1xuXHRcdH07XG5cblx0XHRsZXQgZXJyb3JDYWxsYmFjayA9IHJlc3BvbnNlID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCczMTYgLSBNZXRob2QgZ2V0Q2F0YWxvZygpIG9mIGdldHRpbmcgY2F0YWxvZyBGQUlMRUQnKTtcblx0XHR9O1xuXG5cdFx0Z2V0QW5kUG9zdC5nZXQodXJsLCBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbHRlcnMgYWxsIHByb2R1Y3RzIGluIGNhdGFsb2cgd2l0aCBldmVyeSBmaWx0ZXJzIHByb3BlcnR5IGFuZCBwdXQgcmVzdWx0IHRvIHRoaXMuZmlsdGVyZWRDYXRhbG9nXG5cdCAqL1xuXHRmaWx0ZXJDYXRhbG9nKCkge1xuXHRcdGxldCBmaWx0ZXJlZENhdGFsb2cgPSBbXTtcblx0XHR0aGlzLnBvc3RGaWx0ZXJlZCh7fSk7IC8vIGNsZWFuIHByZXZpb3VzIGZpbHRlcmVkIGNhdGFsb2dcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jYXRhbG9nLmxlbmd0aDsgaSsrKSB7IC8vIGFuZCBmaWx0ZXIgd2l0aCB0aGVtIGNhdGFsb2cuIEludGVybWVkaWF0ZSByZXN1bHRzIHB1dFxuXHRcdFx0Ly8gY2hlY2sgaWYgdGhlIHByb2R1Y3Qgc2F0aXNmeSBhbGwgZmlsdGVyc1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRcdHRoaXMuY2hlY2tQcm9kV2l0aEZpbHRlcih0aGlzLmZpbHRlcnMuY2F0SXRlbSwgdGhpcy5jYXRhbG9nW2ldLmNhdEl0ZW0pICYmXG5cdFx0XHRcdFx0dGhpcy5jaGVja1Byb2RXaXRoRmlsdGVyKHRoaXMuZmlsdGVycy5jYXRlZ29yeSwgdGhpcy5jYXRhbG9nW2ldLmNhdGVnb3J5KSAmJlxuXHRcdFx0XHRcdHRoaXMuY2hlY2tQcm9kV2l0aEZpbHRlcih0aGlzLmZpbHRlcnMuYnJhbmQsIHRoaXMuY2F0YWxvZ1tpXS5icmFuZCkgJiZcblx0XHRcdFx0XHR0aGlzLmNoZWNrUHJvZFdpdGhGaWx0ZXIodGhpcy5maWx0ZXJzLmRlc2lnbmVyLCB0aGlzLmNhdGFsb2dbaV0uZGVzaWduZXIpICYmXG5cdFx0XHRcdFx0dGhpcy5jaGVja1Byb2RCeVNpemUodGhpcy5maWx0ZXJzLnNpemUsIHRoaXMuY2F0YWxvZ1tpXS5zaXplKSAmJlxuXHRcdFx0XHRcdHRoaXMuY2hlY2tQcm9kQnlQcmljZSh0aGlzLmZpbHRlcnMucHJpY2UsIHRoaXMuY2F0YWxvZ1tpXS5wcmljZSlcblx0XHRcdCkge1xuXG5cdFx0XHRcdGZpbHRlcmVkQ2F0YWxvZy5wdXNoKHRoaXMuY2F0YWxvZ1tpXSk7IC8vIGFkZCB0aGlzIHByb2R1Y3QgdG8gdGhpcy5maWx0ZXJlZENhdGFsb2dcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnBhZ2luYXRlKGZpbHRlcmVkQ2F0YWxvZyk7XG5cblx0XHQvLyB0aGlzLnBvc3RGaWx0ZXJlZCh0aGlzLmZpbHRlcmVkQ2F0YWxvZyk7IC8vIHRoaXMuZmlsdGVyZWRDYXRhbG9nINGB0L7RhdGA0LDQvdGP0LXRgtGB0Y8g0L/RgNCw0LLQuNC70YzQvdC+XG5cdH1cblxuXHQvKipcblx0ICogRGV2aWRlIGZpbHRlcmVkQ2F0YWxvZyBieSBwYWdlcyBhY2NvcmRpbmcgdG8gU2hvdyBzZWxlY3RvciB2YWx1ZVxuXHQgKiBAcGFyYW0ge30gZmlsdGVyZWRDYXRhbG9nXG5cdCAqL1xuXHRwYWdpbmF0ZShmaWx0ZXJlZENhdGFsb2cpIHtcblx0XHRsZXQgZmlsdENhdFdpdGhQYWcgPSB7fTtcblx0XHRsZXQgbiA9IDE7IC8vIGZpcnN0IHBhZ2UgbnVtYmVyXG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGZpbHRlcmVkQ2F0YWxvZy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgcGFnZV9udW0gPSAncGFnZV8nICsgbjtcblx0XHRcdGZpbHRDYXRXaXRoUGFnW3BhZ2VfbnVtXSA9IFtdO1xuXG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuZmlsdGVycy5zaG93QnkgJiYgaSA8IGZpbHRlcmVkQ2F0YWxvZy5sZW5ndGg7IGorKywgaSsrKSB7XG5cdFx0XHRcdGZpbHRDYXRXaXRoUGFnW3BhZ2VfbnVtXS5wdXNoKGZpbHRlcmVkQ2F0YWxvZ1tpXSk7XG5cdFx0XHR9XG5cdFx0XHRpLS07XG5cdFx0XHRuKys7XG5cdFx0fVxuXG5cdFx0dGhpcy5wb3N0RmlsdGVyZWQoZmlsdENhdFdpdGhQYWcpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIHNpbXBsZSBmaWx0ZXIgcGFyYW1ldGVycyBpZiB0aGUgcHJvZHVjdCBzYXRpc2Z5XG5cdCAqIEBwYXJhbSBzdHJpbmcgZmlsdGVyIGZpbHRlciBwcm9wZXJ0eSB2YWx1ZVxuXHQgKiBAcGFyYW0gc3RyaW5nIHByb2R1Y3QgcHJvcGVydHkgdmFsdWVcblx0ICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgZmlsdGVyID0gJ2FsbCcgb3Igc2F0aXNmeSB0byBwcm9kdWN0XG5cdCAqL1xuXHRjaGVja1Byb2RXaXRoRmlsdGVyKGZpbHRlciwgcHJvZHVjdCkge1xuXHRcdGlmIChmaWx0ZXIgPT09ICdhbGwnKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH0gZWxzZSByZXR1cm4gKGZpbHRlciA9PT0gcHJvZHVjdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIHByb2R1Y3QgaGFzIG9uZSBvZiBmaWx0ZXIncyBzaXplXG5cdCAqIEBwYXJhbSBzdHJpbmcgW10gZmlsdGVyU2l6ZXMgLSBhcnJheSBvZiBzaXplcyBpbiBmaWx0ZXJcblx0ICogQHBhcmFtIHN0cmluZyBbXSBwcm9kU2l6ZXMgLSBhcnJheSBvZiBwcm9kdWN0J3Mgc2l6ZXNcblx0ICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHByb2R1Y3QgaGFzIG9uZSBvZiBmaWx0ZXJlZCBzaXplc1xuXHQgKi9cblx0Y2hlY2tQcm9kQnlTaXplKGZpbHRlclNpemVzLCBwcm9kU2l6ZXMpIHtcblx0XHRpZiAoZmlsdGVyU2l6ZXNbMF0gIT09IDApIHtcblx0XHRcdC8vIGNoZWNrIGlmIGFueSBzaXplIG9mIGZpbHRlciBpcyBpbnRvIHByb2R1Y3Qgc2l6ZXNcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVyU2l6ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb2RTaXplcy5pbmNsdWRlcyhmaWx0ZXJTaXplc1tpXSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRmlsdGVyIHByb2R1Y3Qgd2l0aCBwcmljZSBmaWx0ZXJcblx0ICogQHBhcmFtIEludCBbXSBmaWx0ZXJQcmljZVJhbmdlIC0gZmlsdGVyJ3MgYXJyYXkgb2YgbWluIGFuZCBtYXggcHJvZHVjdCBwcmljZVxuXHQgKiBAcGFyYW0gSW50IHByb2RQcmljZSAtIHByb2R1Y3QncyBwcmljZVxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcHJvZHVjdCdzIHByaWNlIGJldHdlZW4gbWluIGFuZCBtYXhcblx0ICovXG5cdGNoZWNrUHJvZEJ5UHJpY2UoZmlsdGVyUHJpY2VSYW5nZSwgcHJvZFByaWNlKSB7XG5cdFx0aWYgKGZpbHRlclByaWNlUmFuZ2VbMF0gPT09IDApIHtcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGNoZWNrIGlmIGFueSBzaXplIG9mIGZpbHRlciBpcyBpbnRvIHByb2R1Y3Qgc2l6ZXNcblx0XHRcdHJldHVybiBwcm9kUHJpY2UgPj0gZmlsdGVyUHJpY2VSYW5nZVswXSAmJiBwcm9kUHJpY2UgPD0gZmlsdGVyUHJpY2VSYW5nZVsxXTtcblx0XHR9XG5cdH1cblxuXHRwb3N0RmlsdGVyZWQoZGF0YSkge1xuXHRcdGxldCBnZXRBbmRQb3N0ID0gbmV3IEdldEFuZFBvc3QoKTtcblx0XHRsZXQgdXJsID0gdGhpcy5jb25maWcudXJsLmZpbHRlcmVkUHJvZHVjdHM7XG5cblx0XHRsZXQgc3VjY2Vzc0NhbGxiYWNrID0gbnVsbDtcblx0XHRpZiAoZGF0YVtcInBhZ2VfMVwiXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRzdWNjZXNzQ2FsbGJhY2sgPSAoKSA9PiB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCc0MjggLSBGaWx0ZXJlZCBjYXRhbG9nIERCIGNsZWFuZWQnKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IHJlbmRlclBhZ2luYXRpb24gPSBuZXcgUmVuZGVyUGFnaW5hdGlvbih0aGlzLmNvbmZpZywgZGF0YSk7XG5cdFx0XHRsZXQgcmVuZGVyUHJvZHVjdHMgPSBuZXcgUmVuZGVyUHJvZHVjdHModGhpcy5jb25maWcsIGRhdGEpO1xuXG5cdFx0XHQvL1RPRE8g0YHQtNC10LvQsNGC0Ywg0YLQsNC6LCDRh9GC0L7QsdGLIGRhdGEg0L/QtdGA0LXQtNCw0LLQsNC70LDRgdGMXG5cblx0XHRcdHN1Y2Nlc3NDYWxsYmFjayA9ICgpID0+IHtcblx0XHRcdFx0Y29uc29sZS5sb2coJzQyOCAtIEZpbHRlcmVkIGNhdGFsb2cgcG9zdGVkIHRvIERCJyk7XG5cdFx0XHRcdHJlbmRlclBhZ2luYXRpb24uaW5pdChyZW5kZXJQYWdpbmF0aW9uKTtcblx0XHRcdFx0cmVuZGVyUHJvZHVjdHMuaW5pdChyZW5kZXJQcm9kdWN0cyk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGxldCBlcnJvckNhbGxiYWNrID0gKCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJzQyOCAtIE1ldGhvZCBwb3N0RmlsdGVyZWQoZGF0YSkgb2YgZmlsdGVyZWQgY2F0YWxvZyBzYXZpbmcgdG8gREIgRkFJTEVEJyk7XG5cdFx0fTtcblxuXHRcdGdldEFuZFBvc3QucG9zdCh1cmwsIGRhdGEsIHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG5cdH1cbn1cblxuLyoqXG4gKiBSZW5kZXIgcGFyZW50IGNsYXNzXG4gKi9cbmNsYXNzIFJlbmRlciB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZywgZGF0YSkge1xuXHRcdHRoaXMuZGF0YSA9IGRhdGE7XG5cdFx0dGhpcy5jb25maWcgPSBjb25maWc7XG5cdH1cblxuXHRpbml0KCkge1xuXHRcdHRoaXMuY2xlYW4oKTtcblx0XHR0aGlzLnJlbmRlcih0aGlzLmNvbmZpZywgdGhpcy5kYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kIGFuZCBjbGVhbiBIVE1MIG9iamVjdFxuXHQgKi9cblx0Y2xlYW4oc2VsZWN0b3IpIHtcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5pbm5lckhUTUwgPSAnJztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgZmlsdGVyZWQgY2F0YWxvZyB3aXRoIHBhZ2luYXRpb24gYW5kIHNldCBmb3IgZmlsdGVyZWQgY2F0YWxvZyBhZGRUb0NhcnRIYW5kbGVyXG5cdCAqIEBwYXJhbSBkYXRhXG5cdCAqL1xuXHRyZW5kZXIoY29uZmlnLCBkYXRhKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbi8qKlxuICogUmVuZGVyIHBhZ2luYXRpb24gZGl2XG4gKi9cbmNsYXNzIFJlbmRlclBhZ2luYXRpb24gZXh0ZW5kcyBSZW5kZXIge1xuXHRjb25zdHJ1Y3Rvcihjb25maWcsIGRhdGEpIHtcblx0XHRzdXBlcihjb25maWcsIGRhdGEpO1xuXHR9XG5cblx0aW5pdCgpIHtcblx0XHRsZXQgc2VsZWN0b3JzID0gdGhpcy5jb25maWcuc2VsZWN0b3JzO1xuXHRcdHRoaXMuY2xlYW4oc2VsZWN0b3JzLnBhZ2luYXRpb24pO1xuXHRcdHRoaXMucmVuZGVyKHNlbGVjdG9ycywgdGhpcy5kYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiAqIFNldCBwYWdpbmF0aW9uIGRpdiAtIGZpbGwgaXQgd2l0aCA8YT5OdW08L2E+XG5cdCAqIEBwYXJhbSBTdHJpbmcgcGFnIC0gY3NzIGNsYXNzIG9mIHBhZ2luYXRpb24gZGl2XG5cdCAqIEBwYXJhbSB7fSBkYXRhIGZpbHRlcmVkIGNhdGFsb2dcblx0ICovXG5cdHJlbmRlcihzZWxlY3RvcnMsIGRhdGEpIHtcblx0XHRsZXQgcGFnID0gc2VsZWN0b3JzLnBhZ2luYXRpb247XG5cdFx0bGV0IGFjdGl2ZSA9IHNlbGVjdG9ycy5hY3RpdmU7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgaHJlZiA9ICc/JyArIE9iamVjdC5rZXlzKGRhdGEpW2ldO1xuXHRcdFx0bGV0IGEgPSBgPGEgaHJlZj1cIiR7aHJlZn1cIj4ke2kgKyAxfTwvYT5gO1xuXG5cdFx0XHRpZiAoaSA9PT0gMCkgeyAvL2FkZCBmaXJzdCBwYWdlIG51bWJlclxuXHRcdFx0XHQkKHBhZykuYXBwZW5kKGEpO1xuXHRcdFx0XHQkKGAke3BhZ30gYWApLmFkZENsYXNzKGFjdGl2ZSk7IC8vc2V0IHRoZSBmaXJzdCBhY3RpdmVcblxuXHRcdFx0fSBlbHNlIHsgLy9hZGQgYW5vdGhlciBwYWdlIG51bWJlcnNcblx0XHRcdFx0JChwYWcpLmFwcGVuZChhKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnVybFBhZ2luYXRpb24oc2VsZWN0b3JzLCBkYXRhKTtcblx0XHR0aGlzLnBhZ2luYXRpb25OdW1IYW5kbGVyKHBhZywgYWN0aXZlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiBVUkwgaGFzIHBhZ2VfKiBhbmQgc2V0IGFjdGl2ZSBwYWdlICsgYWRkIGhyZWYgdG8gcGFnaW5hdGlvbiBzbGlkZXIgYXJyb3dzXG5cdCAqIEBwYXJhbSB7fSBkYXRhIGZpbHRlcmVkIGNhdGFsb2dcblx0ICovXG5cdHVybFBhZ2luYXRpb24oc2VsZWN0b3JzLCBkYXRhKSB7XG5cdFx0bGV0IHBhZyA9IHNlbGVjdG9ycy5wYWdpbmF0aW9uO1xuXHRcdGxldCBhY3RpdmUgPSBzZWxlY3RvcnMuYWN0aXZlO1xuXHRcdC8vIGdldCBwYWdlX04gZnJvbSBVUkxcblx0XHRsZXQgZXhwID0gL3BhZ2VfXFxkKy9pO1xuXG5cdFx0aWYgKHRoaXMuY2hlY2tVcmwoZXhwKSkgeyAvLyBjaGVjayBpZiBVUkwgaGFzIHBhZ2VfKlxuXHRcdFx0bGV0IHBhZ2VJblVSTCA9IHRoaXMucGFyc2VVcmwoZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgZXhwKTtcblx0XHRcdGxldCBwYWdlTm9JblVSTCA9ICt0aGlzLnBhcnNlVXJsKHBhZ2VJblVSTCwgL1xcZCsvaSk7IC8vIHBhcnNlIG51bWJlciBvZiBwYWdlXyBmcm9tIFVSTFxuXHRcdFx0aWYgKHBhZ2VOb0luVVJMID4gMCAmJiBwYWdlTm9JblVSTCA8PSBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGgpIHtcblx0XHRcdFx0dGhpcy5zZXRBY3RpdmVJblBhZ2luYXRpb24ocGFnLCBhY3RpdmUsIHBhZ2VOb0luVVJMKTtcblx0XHRcdFx0dGhpcy5zZXRQYWdpbmF0aW9uQXJyb3dzSHJlZihhY3RpdmUsIHBhZ2VOb0luVVJMLCBkYXRhKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc2V0QWN0aXZlSW5QYWdpbmF0aW9uKHBhZywgYWN0aXZlLCAxKTtcblx0XHRcdFx0dGhpcy5zZXRQYWdpbmF0aW9uQXJyb3dzSHJlZihzZWxlY3RvcnMsIDEsIGRhdGEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiBwYWdlIFVSTCBjb250YWlucyBzb21lIHN0cmluZ1xuXHQgKiBAcGFyYW0gc3RyaW5nIGV4cCAtIHJlZ0V4cCBjb25kaXRpb25cblx0ICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgVVJMIGNvbnRhaW5zIHJlZ0V4cFxuXHQgKi9cblx0Y2hlY2tVcmwoZXhwKSB7XG5cdFx0bGV0IGNoZWNrVXJsID0gbmV3IFJlZ0V4cChleHApO1xuXHRcdHJldHVybiBjaGVja1VybC50ZXN0KGRvY3VtZW50LmxvY2F0aW9uLmhyZWYpXG5cdH1cblxuXHQvKipcblx0ICogUGFyc2Ugc3RyaW5nIGFuZCByZXR1cm4gUmVnRXhwIHN1dGlzZmllZCByZXN1bHQgb3IgbnVsbFxuXHQgKiBAcGFyYW0gc3RyaW5nIGZvciBwYXJzaW5nXG5cdCAqIEBwYXJhbSBzdHJpbmcgZXhwIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3Igc2VhcmNoXG5cdCAqIEByZXR1cm5zIHsqfSByZXR1cm5zIGZvdW5kZWQgcGFydCBvZiBzdHJpbmcgb3IgbnVsbFxuXHQgKi9cblx0cGFyc2VVcmwoc3RyaW5nLCBleHApIHtcblx0XHRsZXQgcGFyc2UgPSBzdHJpbmcubWF0Y2goZXhwKTtcblx0XHRyZXR1cm4gcGFyc2VbMF1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgLmFjdGl2ZSBjbGFzcyBmb3Igbi10aCBwYWdlIGluIHBhZ2luYXRpb25cblx0ICogQHBhcmFtIEludCBuIG51bWJlciBvZiBwYWdlIGZyb20gVVJMXG5cdCAqL1xuXHRzZXRBY3RpdmVJblBhZ2luYXRpb24ocGFnLCBhY3RpdmUsIG4pIHtcblx0XHQkKGAke3BhZ30gLiR7YWN0aXZlfWApLnJlbW92ZUNsYXNzKGFjdGl2ZSk7IC8vcmVtb3ZlIGN1cnJlbnQgYWN0aXZlIGNsYXNzXG5cdFx0JChgJHtwYWd9IGE6bnRoLWNoaWxkKCR7bn0pYCkuYWRkQ2xhc3MoYWN0aXZlKTsgLy9hZGQgbmV3IGFjdGl2ZSBjbGFzc1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCBocmVmIHRvIDxhPiBpbiBwYWdpbmF0aW9uIHNsaWRlclxuXHQgKiBAcGFyYW0gSW50IG4gbnVtYmVyIG9mIHBhZ2UgZnJvbSBVUkxcblx0ICogQHBhcmFtIHt9IGRhdGEgZmlsdGVyZWQgY2F0YWxvZ1xuXHQgKi9cblx0c2V0UGFnaW5hdGlvbkFycm93c0hyZWYoc2VsZWN0b3JzLCBuLCBkYXRhKSB7XG5cdFx0bGV0IGFjdGl2ZSA9IHNlbGVjdG9ycy5hY3RpdmU7XG5cdFx0bGV0IHBhZ2VMU2VsZWN0b3IgPSBzZWxlY3RvcnMucGFnZUw7XG5cdFx0bGV0IHBhZ2VSU2VsZWN0b3IgPSBzZWxlY3RvcnMucGFnZVI7XG5cdFx0bGV0IHVybEh0bWwgPSB0aGlzLnBhcnNlVXJsKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIC9cXC9bXlxcL10rP1xcLmh0bWwvaSk7IC8vIGdldCAvKi5odG1sIGZyb20gdXJsXG5cblx0XHQvLyBzZXQgbGVmdCBidXR0dG9uIGhyZWZcblx0XHRpZiAobiA+IDEpIHtcblx0XHRcdGxldCBwcmV2ID0gYCR7dXJsSHRtbH0/cGFnZV8ke24gLSAxfWA7XG5cdFx0XHQkKHBhZ2VMU2VsZWN0b3IpLmF0dHIoJ2hyZWYnLCBwcmV2KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JChwYWdlTFNlbGVjdG9yKS5hZGRDbGFzcyhhY3RpdmUpXG5cdFx0fVxuXG5cdFx0Ly8gc2V0IHJpZ2h0IGJ1dHR0b24gaHJlZlxuXHRcdGlmIChuIDwgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoKSB7XG5cdFx0XHRsZXQgbmV4dCA9IGAke3VybEh0bWx9P3BhZ2VfJHtuICsgMX1gO1xuXHRcdFx0JChwYWdlUlNlbGVjdG9yKS5hdHRyKCdocmVmJywgbmV4dCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQocGFnZVJTZWxlY3RvcikuYWRkQ2xhc3MoYWN0aXZlKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgY2xpY2sgaGFuZGxlciBhdCBwYWdpbmF0aW9uIG51bWJlcnNcblx0ICogQHBhcmFtIFN0cmluZyBwYWcgLSBpZCBuYW1lIG9mIHBhZ2luYXRpb24gZGl2XG5cdCAqIEBwYXJhbSBTdHJpbmcgYWN0aXZlIC0gY3NzIGNsYXNzIG5hbWUgb2YgYWN0aXZlIHBhZ2UgaW4gcGFnaW5hdGlvblxuXHQgKi9cblx0cGFnaW5hdGlvbk51bUhhbmRsZXIocGFnLCBhY3RpdmUpIHtcblx0XHRsZXQgcGFnQWN0aXZlID0gYCR7cGFnfSAuJHthY3RpdmV9YDtcblx0XHQkKHBhZ0FjdGl2ZSkub24oJ2NsaWNrJywgJ2EnLCBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdCQocGFnQWN0aXZlKS5yZW1vdmVDbGFzcyhhY3RpdmUpO1xuXHRcdFx0dGhpcy5jbGFzc0xpc3QuYWRkKGFjdGl2ZSk7XG5cdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBSZW5kZXIgcHJvZHVjdHMnIGNhcmRzXG4gKiBAcGFyYW0ge30gY29uZmlnIGluaXRpYWwgc2V0dGluZ3MgKHVybHMsIHNlbGVjdG9ycylcbiAqIEBwYXJhbSB7fSBkYXRhIC0gd2hhdCB0byByZW5kZXIgLSBvYmplY3Qgb2YgcHJvZHVjdHNcbiAqL1xuY2xhc3MgUmVuZGVyUHJvZHVjdHMgZXh0ZW5kcyBSZW5kZXIge1xuXHRjb25zdHJ1Y3Rvcihjb25maWcsIGRhdGEpIHtcblx0XHRzdXBlcihjb25maWcsIGRhdGEpO1xuXHR9XG5cblx0aW5pdCgpIHtcblx0XHRsZXQgc2VsZWN0b3JzID0gdGhpcy5jb25maWcuc2VsZWN0b3JzO1xuXHRcdHRoaXMuY2xlYW4oc2VsZWN0b3JzLnByb2R1Y3RzRGl2KTtcblx0XHR0aGlzLnJlbmRlcihzZWxlY3RvcnMsIHRoaXMuZGF0YSk7XG5cblx0XHRsZXQgY2FydCA9IG5ldyBDYXJ0KCk7XG5cdFx0Y2FydC5pbml0KHRoaXMuY29uZmlnKTtcblx0fVxuXG5cdHJlbmRlcihzZWxlY3RvcnMsIGRhdGEpIHtcblx0XHRpZiAoJChzZWxlY3RvcnMucGFnaW5hdGlvbilbMF0pIHtcblx0XHRcdHRoaXMucmVuZGVyV2l0aFBhZyhzZWxlY3RvcnMsIGRhdGEpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucmVuZGVyTm9QYWcoc2VsZWN0b3JzLCBkYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVuZGVyIHByb2R1Y3RzIHdpdGhvdXQgcGFnaW5hdGlvblxuXHQgKiBAcGFyYW0ge30gc2VsZWN0b3JzXG5cdCAqIEBwYXJhbSBbXSBkYXRhIHByb2R1Y3QncyBwcm9wZXJ0aWVzIGFycmF5XG5cdCAqL1xuXHRyZW5kZXJOb1BhZyhzZWxlY3RvcnMsIGRhdGEpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGgpIHtcblx0XHRcdGZvciAobGV0IG9uZVByb2QsIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRsZXQgZGF0YVBhZ2VJdGVtID0gZGF0YVtpXTtcblxuXHRcdFx0XHRvbmVQcm9kID0gJChzZWxlY3RvcnMucHJvZHVjdEl0ZW0pWzBdLmNsb25lTm9kZSh0cnVlKTtcblx0XHRcdFx0b25lUHJvZC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycy5wcm9kdWN0SHJlZikuaHJlZiA9IGRhdGFQYWdlSXRlbS5ocmVmO1xuXHRcdFx0XHRvbmVQcm9kLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLnByb2R1Y3RJbWcpLnNyYyA9IGRhdGFQYWdlSXRlbS5pbWdbMF07XG5cdFx0XHRcdG9uZVByb2QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMucHJvZHVjdEltZykuYWx0ID0gZGF0YVBhZ2VJdGVtLm5hbWU7XG5cdFx0XHRcdG9uZVByb2QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMuYWRkVG9DYXJ0KS5pZCA9IGRhdGFQYWdlSXRlbS5pZDtcblx0XHRcdFx0b25lUHJvZC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycy5wcm9kdWN0TmFtZSkudGV4dENvbnRlbnQgPSBkYXRhUGFnZUl0ZW0ubmFtZTtcblx0XHRcdFx0b25lUHJvZC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycy5wcm9kdWN0UHJpY2UpLnRleHRDb250ZW50ID0gJyQnICsgZGF0YVBhZ2VJdGVtLnByaWNlICsgJy4wMCc7XG5cdFx0XHRcdG9uZVByb2QuY2xhc3NMaXN0LnJlbW92ZShzZWxlY3RvcnMuZGlzcGxheU5vbmUpO1xuXG5cdFx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLnByb2R1Y3RzRGl2KS5hcHBlbmRDaGlsZChvbmVQcm9kKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0JChzZWxlY3RvcnMucHJvZHVjdHNEaXYpWzBdLnBhcmVudEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlbmRlciBwcm9kdWN0cyB3aXRoIHBhZ2luYXRpb25cblx0ICogQHBhcmFtIHt9IHNlbGVjdG9yc1xuXHQgKiBAcGFyYW0gW10gZGF0YSBwcm9kdWN0J3MgcHJvcGVydGllcyBhcnJheVxuXHQgKi9cblx0cmVuZGVyV2l0aFBhZyhzZWxlY3RvcnMsIGRhdGEpIHtcblx0XHRsZXQgcGFnZSA9ICdwYWdlXycgKyAkKHNlbGVjdG9ycy5wYWdpbmF0aW9uICsgJyAuJyArIHNlbGVjdG9ycy5hY3RpdmUpLnRleHQoKTsgLy8gZmluZCBhY3RpdmUgcGFnZVxuXHRcdGxldCBkYXRhUGFnZSA9IGRhdGFbcGFnZV07XG5cblx0XHRpZiAoZGF0YVBhZ2UpIHtcblx0XHRcdGZvciAobGV0IG9uZVByb2QsIGkgPSAwOyBpIDwgZGF0YVBhZ2UubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bGV0IGRhdGFQYWdlSXRlbSA9IGRhdGFQYWdlW2ldO1xuXG5cdFx0XHRcdG9uZVByb2QgPSAkKHNlbGVjdG9ycy5wcm9kdWN0SXRlbSlbMF0uY2xvbmVOb2RlKHRydWUpO1xuXHRcdFx0XHRvbmVQcm9kLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLnByb2R1Y3RIcmVmKS5ocmVmID0gZGF0YVBhZ2VJdGVtLmhyZWY7XG5cdFx0XHRcdG9uZVByb2QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMucHJvZHVjdEltZykuc3JjID0gZGF0YVBhZ2VJdGVtLmltZ1swXTtcblx0XHRcdFx0b25lUHJvZC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycy5wcm9kdWN0SW1nKS5hbHQgPSBkYXRhUGFnZUl0ZW0ubmFtZTtcblx0XHRcdFx0b25lUHJvZC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycy5hZGRUb0NhcnQpLmlkID0gZGF0YVBhZ2VJdGVtLmlkO1xuXHRcdFx0XHRvbmVQcm9kLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLnByb2R1Y3ROYW1lKS50ZXh0Q29udGVudCA9IGRhdGFQYWdlSXRlbS5uYW1lO1xuXHRcdFx0XHRvbmVQcm9kLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLnByb2R1Y3RQcmljZSkudGV4dENvbnRlbnQgPSAnJCcgKyBkYXRhUGFnZUl0ZW0ucHJpY2UgKyAnLjAwJztcblx0XHRcdFx0b25lUHJvZC5jbGFzc0xpc3QucmVtb3ZlKHNlbGVjdG9ycy5kaXNwbGF5Tm9uZSk7XG5cblx0XHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMucHJvZHVjdHNEaXYpLmFwcGVuZENoaWxkKG9uZVByb2QpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKHNlbGVjdG9ycy5vb3BzKS5yZW1vdmVDbGFzcyhzZWxlY3RvcnMuZGlzcGxheU5vbmUpO1xuXHRcdH1cblx0fVxufVxuXG5cInVzZSBzdHJpY3RcIjtcblxuLy9UT0RPIG1ha2UgYWRkIGNhcnQgd29yayBmb3IgbWFpbiBwYWdlXG4vL1RPRE8gbWFrZSBhZGQgY2FydCB3b3JrIGZvciBzaW5nbGUgcGFnZVxuXG4vKipcbiAqIEdldCBjYXJ0LCByZW5kZXIgY2FydCwgYWRkIHRvIGNhcnQsIGRlbGV0ZSBmcm9tIGNhcnRcbiAqL1xuY2xhc3MgQ2FydCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2F0YWxvZyA9IHt9O1xuICAgIHRoaXMuY2FydCA9IHtcbiAgICAgIHRvdGFsOiAwLFxuICAgICAgY291bnRHb29kczogMCxcbiAgICAgIGNvbnRlbnRzOiBbXSxcbiAgICB9O1xuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgdXJsOiB7fSxcbiAgICAgIHNlbGVjdG9yczoge30sXG4gICAgfTtcbiAgfVxuXG4gIGluaXQoY29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5nZXRDYXJ0KCcnLCB0aGlzLnJlbmRlckNhcnQpO1xuICAgIHRoaXMuYWRkVG9DYXJ0QnV0dG9uSGFuZGxlcigpO1xuICAgIHRoaXMuZGVsZXRlQnV0dG9uSGFuZGxlcigpO1xuICAgIHRoaXMuY2xlYXJDYXJ0QnV0dG9uSGFuZGxlcigpO1xuICAgIHRoaXMucXVhbnRpdHlIYW5kbGVyKCdpbnB1dCcgKyB0aGlzLmNvbmZpZy5zZWxlY3RvcnMucXVhbnRpdHkpO1xuICB9XG5cbiAgcmVuZGVyQ2FydCgpIHtcbiAgICBsZXQgcmVuZGVyQ2FydCA9IG5ldyBSZW5kZXJDYXJ0KHRoaXMuY2FydC5jb250ZW50cywgdGhpcy5jYXJ0LnRvdGFsKTtcblxuICAgIHJlbmRlckNhcnQuaW5pdCh0aGlzLmNvbmZpZy5zZWxlY3RvcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYWxsIFwiQWRkIHRvIGNhcnRcIiBidXR0b25zIGFuZCBpZiBjbGlja2VkIHN0YXJ0IGNhbGxiYWNrIHdpdGggXCJpZFwiIGFzIHBhcmFtXG4gICAqL1xuICBhZGRUb0NhcnRCdXR0b25IYW5kbGVyKCkge1xuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgICQodGhpcy5jb25maWcuc2VsZWN0b3JzLmFkZFRvQ2FydCkuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBsZXQgaWQgPSArdGhpcy5nZXRBdHRyaWJ1dGUoJ2lkJyk7IC8vIGZvdW5kIGlkIG9mIGFkZGVkIHByb2R1Y3RcbiAgICAgIHRoYXQuZ2V0Q2F0YWxvZyhpZCk7XG4gICAgICB0aGF0LmFuaW1hdGVDYXJ0KHRoYXQuY29uZmlnLnNlbGVjdG9ycy5jYXJ0SGVhZGVySW1nKTtcbiAgICB9KVxuICB9XG5cbiAgYW5pbWF0ZUNhcnQoc2VsZWN0b3Ipe1xuICAgICQoc2VsZWN0b3IpLmVmZmVjdCgnYm91bmNlJywgJ3Nsb3cnKVxuICB9XG5cbiAgZGVsZXRlQnV0dG9uSGFuZGxlcigpe1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAkKHRoaXMuY29uZmlnLnNlbGVjdG9ycy5jYXJ0KS5vbignY2xpY2snLCB0aGlzLmNvbmZpZy5zZWxlY3RvcnMuZGVsLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGxldCBpZCA9ICt0aGlzLmdldEF0dHJpYnV0ZSgnaWQnKTsgLy8gZm91bmQgaWQgb2YgYWRkZWQgcHJvZHVjdFxuICAgICAgdGhhdC5kZWxldGVGcm9tQ2FydChpZCk7XG4gICAgfSlcbiAgfVxuXG5cdGNsZWFyQ2FydEJ1dHRvbkhhbmRsZXIoKXtcblx0XHQkKHRoaXMuY29uZmlnLnNlbGVjdG9ycy5jYXJ0Q2xlYXIpLmNsaWNrKCgpID0+IHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdHRoaXMuY2FydCA9IHtcblx0XHRcdFx0dG90YWw6IDAsXG5cdFx0XHRcdGNvdW50R29vZHM6IDAsXG5cdFx0XHRcdGNvbnRlbnRzOiBbXSxcblx0XHRcdH07XG5cdFx0XHR0aGlzLmNhbGNUb3RhbCh0aGlzLmNhcnQpO1xuXHRcdFx0dGhpcy5wb3N0VG9DYXJ0KHRoaXMuY2FydCk7XG5cdFx0XHR0aGlzLnJlbmRlckNhcnQodGhpcy5jYXJ0KTtcblx0XHRcdGRlYnVnZ2VyO1xuXHRcdFx0dGhpcy5hbmltYXRlQ2FydCh0aGlzLmNvbmZpZy5zZWxlY3RvcnMuY2FydEhlYWRlckltZyk7XG5cdFx0fSlcblx0fVxuXG4gIGRlbGV0ZUZyb21DYXJ0KGlkKXtcbiAgICBsZXQgaWR4ID0gdGhpcy5jaGVja0luQ2FydChpZCk7XG5cbiAgICB0aGlzLmNhcnQuY29udGVudHMuc3BsaWNlKGlkeCwgMSk7XG4gICAgdGhpcy5jYWxjVG90YWwodGhpcy5jYXJ0KTtcbiAgICB0aGlzLnBvc3RUb0NhcnQodGhpcy5jYXJ0KTtcbiAgICB0aGlzLnJlbmRlckNhcnQodGhpcy5jYXJ0KTtcblx0XHR0aGlzLmFuaW1hdGVDYXJ0KHRoaXMuY29uZmlnLnNlbGVjdG9ycy5jYXJ0SGVhZGVySW1nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBxdWFudGl0eSBpbnB1dCB2YWx1ZSBjaGFuZ2VkIChhbmQgbG9vc2UgZm9jdXMpIHNlbmQgdG8gY2FsbGJhY2sgcHJvZHVjdCBpZCBhbmQgbmV3IHZhbHVlXG4gICAqIEBwYXJhbSBTdHJpbmcgc2VsZWN0b3Igb2YgcXVhbnRpdHkgaW5wdXRcbiAgICovXG4gIHF1YW50aXR5SGFuZGxlcihzZWxlY3Rvcil7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCBzZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGlkID0gK3RoaXMuZGF0YXNldC5pZDtcbiAgICAgIGxldCBuZXdWYWwgPSArdGhpcy52YWx1ZTtcblxuICAgICAgdGhhdC5zZXROZXdRdWFudGl0eS5jYWxsKHRoYXQsIGlkLCBuZXdWYWwpXG4gICAgfSlcbiAgfVxuXG4gIHNldE5ld1F1YW50aXR5KGlkLCBuZXdWYWwpe1xuICAgIGxldCBpZHggPSB0aGlzLmNoZWNrSW5DYXJ0KGlkKTtcbiAgICB0aGlzLmNhcnQuY29udGVudHNbaWR4XS5xdWFudGl0eSA9IG5ld1ZhbDtcblxuICAgIHRoaXMuY2FsY1RvdGFsKHRoaXMuY2FydCk7XG4gICAgdGhpcy5wb3N0VG9DYXJ0KHRoaXMuY2FydCk7XG4gICAgdGhpcy5yZW5kZXJDYXJ0KHRoaXMuY2FydCk7XG4gIH1cblxuICBnZXRDYXRhbG9nKGlkKSB7XG5cdFx0bGV0IGdldEFuZFBvc3QgPSBuZXcgR2V0QW5kUG9zdCgpO1xuXG5cdFx0bGV0IHVybCA9IHRoaXMuY29uZmlnLnVybC5wcm9kdWN0cztcblx0XHRsZXQgc3VjY2Vzc0NhbGxiYWNrID0gcmVzcG9uc2UgPT4ge1xuXHRcdFx0dGhpcy5jYXRhbG9nID0gcmVzcG9uc2U7XG5cdFx0XHRjb25zb2xlLmxvZygnOTMgLSBHb3QgZnVsbCBjYXRhbG9nIGZyb20gSlNPTicpO1xuXHRcdFx0dGhpcy5nZXRDYXJ0KGlkLCB0aGlzLmdldFByb2RGcm9tQ2F0YWxvZyk7XG5cdFx0fTtcblxuXHRcdGxldCBlcnJvckNhbGxiYWNrID0gcmVzcG9uc2UgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJzEwMyAtIE1ldGhvZCBnZXRDYXRhbG9nKCkgb2YgZ2V0dGluZyBjYXRhbG9nIEZBSUxFRCcpO1xuXHRcdH07XG5cblx0XHRnZXRBbmRQb3N0LmdldCh1cmwsIHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNhcnQgZnJvbSBKU09OIGFuZCBkbyBnZXRQcm9kRnJvbUNhdGFsb2coaWQpIG9yIHJlbmRlciBjYXJ0XG4gICAqIEBwYXJhbSBudW1iZXIgaWQgLSBpZCBvZiBwcm9kdWN0IHRoYXQgYWRkVG9DYXJ0IGJ1dHRvbiB3YXMgY2xpY2tlZFxuICAgKi9cbiAgZ2V0Q2FydChpZCwgY2FsbGJhY2spIHtcblx0XHRsZXQgZ2V0QW5kUG9zdCA9IG5ldyBHZXRBbmRQb3N0KCk7XG5cblx0XHRsZXQgdXJsID0gdGhpcy5jb25maWcudXJsLmNhcnQ7XG5cdFx0bGV0IHN1Y2Nlc3NDYWxsYmFjayA9IHJlc3BvbnNlID0+IHtcblx0XHRcdHRoaXMuY2FydCA9IHJlc3BvbnNlO1xuXHRcdFx0aWYgKGlkKSB7XG5cdFx0XHRcdGNhbGxiYWNrLmNhbGwodGhpcywgaWQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJzExNCAtIEluaXRpYWwgY2FydCByZW5kZXJpbmcgc3RhcnQnKTtcblx0XHRcdFx0Y2FsbGJhY2suY2FsbCh0aGlzKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0bGV0IGVycm9yQ2FsbGJhY2sgPSByZXNwb25zZSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnMTE0IC0gTWV0aG9kIGdldENhdGFsb2coKSBvZiBnZXR0aW5nIGNhdGFsb2cgRkFJTEVEJyk7XG5cdFx0fTtcblxuXHRcdGdldEFuZFBvc3QuZ2V0KHVybCwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW50IGJ5IGlkIHByb2R1Y3QgaW4gY2F0YWxvZyBhbmQgc2VudCBpdCB0byBwcmVwYXJlRm9yQ2FydCgpXG4gICAqIEBwYXJhbSBJbnQgaWQgLSBpZCBvZiBwcm9kdWN0IHdhcyBjbGlja2VkXG4gICAqL1xuICBnZXRQcm9kRnJvbUNhdGFsb2coaWQpIHtcbiAgICAvLyBmaW5kIGluIGRhdGEgb2JqZWN0IHByb2R1Y3Qgd2l0aCBzdWNoIGlkIGFuZCBwdXNoIGl0IHRvIHRoaXMuY29udGVudHNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY2F0YWxvZy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuY2F0YWxvZ1tpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgdGhpcy5wcmVwYXJlRm9yQ2FydCh0aGlzLmNhdGFsb2dbaV0pOyAvLyBzZW5kIGZvdW5kZWQgcHJvZHVjdCB0byBjYWxsYmFja1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwYXJlIHByb2R1Y3QgZnJvbSBjYXRhbG9nIGZvciBQVVNIaW5nIHRvIGNhcnRcbiAgICogQHBhcmFtIHt9IHByb2QgLSBwcm9kdWN0IGZyb20gY2F0YWxvZ1xuICAgKi9cbiAgcHJlcGFyZUZvckNhcnQocHJvZCkge1xuICAgIGxldCBuZXdUb0NhcnQgPSB7fTtcblxuICAgIG5ld1RvQ2FydC5pZCA9IHByb2QuaWQ7XG4gICAgbmV3VG9DYXJ0Lm5hbWUgPSBwcm9kLm5hbWU7XG4gICAgbmV3VG9DYXJ0LnByaWNlID0gcHJvZC5wcmljZTtcbiAgICBuZXdUb0NhcnQuaHJlZiA9IHByb2QuaHJlZjtcbiAgICBuZXdUb0NhcnQuaW1nID0gcHJvZC5pbWc7XG4gICAgbmV3VG9DYXJ0LnJhdGluZyA9IHByb2QucmF0aW5nO1xuXG4gICAgbGV0IGluQ2FydEluZGV4ID0gdGhpcy5jaGVja0luQ2FydChwcm9kLmlkKTtcbiAgICBpZiAoaW5DYXJ0SW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5jYXJ0LmNvbnRlbnRzW2luQ2FydEluZGV4XS5xdWFudGl0eSArPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdUb0NhcnQucXVhbnRpdHkgPSAxO1xuICAgICAgdGhpcy5jYXJ0LmNvbnRlbnRzLnB1c2gobmV3VG9DYXJ0KVxuICAgIH1cblxuICAgIHRoaXMuY2FsY1RvdGFsKHRoaXMuY2FydCk7XG4gICAgdGhpcy5wb3N0VG9DYXJ0KHRoaXMuY2FydCk7XG4gICAgdGhpcy5yZW5kZXJDYXJ0KHRoaXMuY2FydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBjYXJ0IGhhcyBzdWNoIHByb2R1Y3RcbiAgICogQHBhcmFtIGlkIC0gcHJvZHVjdCBpZCB0aGF0IGlzIG5lZWRlZCB0byBsb29rIHRocm91Z2ggdGhlIGNhcnRcbiAgICogQHJldHVybnMgbnVtYmVyIC0gMCBpZiBub3QgZm91bmQgRUxTRSBwcm9kdWN0IGluZGV4IG9mIGNhcnQgYXJyYXlcbiAgICovXG4gIGNoZWNrSW5DYXJ0KGlkKSB7XG4gICAgLy8gZmluZCBpbiBkYXRhIG9iamVjdCBwcm9kdWN0IHdpdGggc3VjaCBpZCBhbmQgcHVzaCBpdCB0byB0aGlzLmNvbnRlbnRzXG4gICAgbGV0IGNhcnRBcnIgPSB0aGlzLmNhcnQuY29udGVudHM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYXJ0QXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY2FydEFycltpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdG90YWwgYW5kIGNvdW50R29vZHMgdmFsdWVzIGFuZCBzYXZlIGl0IHRvIHRoaXMuY2FydFxuICAgKi9cbiAgY2FsY1RvdGFsKGNhcnQpIHtcbiAgICBpZiAoY2FydC5jb250ZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhcnQuY291bnRHb29kcyA9IGNhcnQuY29udGVudHMubGVuZ3RoO1xuXG4gICAgICBjYXJ0LnRvdGFsID0gMDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2FydC5jb250ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcHJpY2UgPSBjYXJ0LmNvbnRlbnRzW2ldLnByaWNlO1xuICAgICAgICBsZXQgcXVhbnRpdHkgPSBjYXJ0LmNvbnRlbnRzW2ldLnF1YW50aXR5O1xuXG4gICAgICAgIGNhcnQudG90YWwgKz0gcHJpY2UgKiBxdWFudGl0eTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2FydC50b3RhbCA9IDA7XG4gICAgICBjYXJ0LmNvdW50R29vZHMgPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQT1NUIGNhcnQgdG8gSlNPTiBmaWxlXG4gICAqIEBwYXJhbSB7fSBkYXRhIC0gY2FydCBkYXRhXG4gICAqL1xuICBwb3N0VG9DYXJ0KGRhdGEpIHtcblx0XHRsZXQgZ2V0QW5kUG9zdCA9IG5ldyBHZXRBbmRQb3N0KCk7XG5cdFx0bGV0IHVybCA9IHRoaXMuY29uZmlnLnVybC5jYXJ0O1xuXHRcdGxldCBzdWNjZXNzQ2FsbGJhY2sgPSAoKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnMjE1IC0gQ2FydCB3YXMgU0VOVCB0byBEQicpO1xuXHRcdH07XG5cdFx0bGV0IGVycm9yQ2FsbGJhY2sgPSAoKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnQ2FydCBzZW5kaW5nIHRvIERCIEZBSUxFRCcpO1xuXHRcdH07XG5cblx0XHRnZXRBbmRQb3N0LnBvc3QodXJsLCBkYXRhLCBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuICB9XG59XG5cbi8qKlxuICogRmluZCBjYXJ0IGRpdiBhbmQgY2FydCBpdGVtIHRlbXBsYXRlLCBjbG9uZSB0ZW1wbGF0ZSBhbmQgZmlsbCBpdCB3aXRoIGNhcnQgaXRlbXMgZGF0YSwgYXBwZW5kIGl0IHRvIERPTVxuICovXG5jbGFzcyBSZW5kZXJDYXJ0IHtcbiAgY29uc3RydWN0b3IoaXRlbXMsIHRvdGFsKXtcbiAgICB0aGlzLml0ZW1zID0gaXRlbXM7XG4gICAgdGhpcy50b3RhbCA9IHRvdGFsO1xuICAgIHRoaXMuc2VsZWN0b3JzID0ge1xuICAgICAgY2FydDogJy5jYXJ0LWNvbnRhaW5lcicsXG4gICAgICBpdGVtOiAnLmNhcnQtaXRlbS50ZW1wbGF0ZScsXG4gICAgICBocmVmOiAnLmNhcnQtaXRlbS1ocmVmJyxcbiAgICAgIGltZzogJy5jYXJ0LWl0ZW0taW1nJyxcbiAgICAgIG5hbWU6ICcuY2FydC1pdGVtLW5hbWUnLFxuICAgICAgcXVhbnRpdHk6ICcuY2FydC1pdGVtLXF1YW50aXR5JyxcbiAgICAgIHByaWNlOiAnLmNhcnQtaXRlbS1wcmljZScsXG4gICAgICBkZWw6ICcuY2FydC1pdGVtLWRlbCcsXG4gICAgICByYXRlOiAnLnJhdGUnLFxuICAgICAgc3VidG90YWw6ICcuY2FydC1pdGVtLXN1YnRvdGFsJyxcbiAgICAgIHRvdGFsOiAnLmNhcnQtdG90YWwnLFxuICAgICAgZGlzcGxheU5vbmU6ICd0ZW1wbGF0ZScsXG4gICAgfTtcbiAgfVxuXG4gIGluaXQoc2VsZWN0b3JzKXtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICBsZXQgY2FydE5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5jYXJ0KTtcbiAgICBsZXQgSXRlbU5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5pdGVtKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2FydE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgY2FydE5vZGUgPSBjYXJ0Tm9kZXNbaV07XG4gICAgICBsZXQgaXRlbU5vZGUgPSBJdGVtTm9kZXNbaV07XG5cbiAgICAgIHRoaXMuY2xlYXJDYXJ0Q29udGFpbmVyKGNhcnROb2RlKTtcblxuICAgICAgZm9yIChsZXQgY2FydEl0ZW0sIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjYXJ0SXRlbSA9IHRoaXMuY2xvbmVOb2RlKGl0ZW1Ob2RlKTtcblxuICAgICAgICB0aGlzLnNldEltZyh0aGlzLnNlbGVjdG9ycy5pbWcsIGNhcnRJdGVtLCB0aGlzLml0ZW1zW2ldKTtcbiAgICAgICAgdGhpcy5zZXROYW1lKHRoaXMuc2VsZWN0b3JzLm5hbWUsIGNhcnRJdGVtLCB0aGlzLml0ZW1zW2ldKTtcbiAgICAgICAgdGhpcy5zZXRIcmVmKHRoaXMuc2VsZWN0b3JzLmhyZWYsIGNhcnRJdGVtLCB0aGlzLml0ZW1zW2ldLmhyZWYpO1xuICAgICAgICB0aGlzLnNldFF1YW50aXR5KHRoaXMuc2VsZWN0b3JzLnF1YW50aXR5LCBjYXJ0SXRlbSwgdGhpcy5pdGVtc1tpXSk7XG4gICAgICAgIHRoaXMuc2V0UHJpY2UodGhpcy5zZWxlY3RvcnMucHJpY2UsIGNhcnRJdGVtLCB0aGlzLml0ZW1zW2ldKTtcbiAgICAgICAgdGhpcy5maWxsUmF0ZVN0YXJzKHRoaXMuc2VsZWN0b3JzLnJhdGUsIGNhcnRJdGVtLCB0aGlzLml0ZW1zW2ldLnJhdGluZyk7XG4gICAgICAgIHRoaXMuc2V0RGVsZXRlQnV0dG9uSWQodGhpcy5zZWxlY3RvcnMuZGVsLCBjYXJ0SXRlbSwgdGhpcy5pdGVtc1tpXSk7XG4gICAgICAgIHRoaXMuc2V0U3ViVG90YWwodGhpcy5zZWxlY3RvcnMuc3VidG90YWwsIGNhcnRJdGVtLCB0aGlzLml0ZW1zW2ldKTtcblxuICAgICAgICB0aGlzLmRpc3BsYXlOb25lRGVsZXRlKHRoaXMuc2VsZWN0b3JzLmRpc3BsYXlOb25lLCBjYXJ0SXRlbSk7XG4gICAgICAgIHRoaXMuaXRlbUFwcGVuZChjYXJ0Tm9kZSwgY2FydEl0ZW0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNob3dUb3RhbFByaWNlKHRoaXMuc2VsZWN0b3JzLnRvdGFsLCB0aGlzLnRvdGFsKTtcbiAgICB9XG4gIH1cblxuICBjbGVhckNhcnRDb250YWluZXIobm9kZSl7XG4gICAgbm9kZS5pbm5lckhUTUwgPSAnJztcbiAgfVxuXG4gIGNsb25lTm9kZShpdGVtTm9kZSl7XG4gICAgcmV0dXJuIGl0ZW1Ob2RlLmNsb25lTm9kZSh0cnVlKTtcbiAgfVxuXG4gIHNldEltZyhzZWxlY3RvciwgY2FydEl0ZW0sIHByb2R1Y3Qpe1xuICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnNyYyA9IHByb2R1Y3QuaW1nWzBdO1xuICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmFsdCA9IHByb2R1Y3QubmFtZTtcbiAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS50aXRsZSA9IHByb2R1Y3QubmFtZTtcbiAgfVxuXG4gIHNldE5hbWUoc2VsZWN0b3IsIGNhcnRJdGVtLCBwcm9kdWN0KXtcbiAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS50ZXh0Q29udGVudCA9IHByb2R1Y3QubmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgaHJlZiB0byBhbGwgZWxlbWVudHMgb2YgSFRNTCBjb2xsZWN0aW9uXG4gICAqIEBwYXJhbSBhcnIgSFRNTCBjb2xsZWN0aW9uXG4gICAqIEBwYXJhbSBocmVmXG4gICAqL1xuICBzZXRIcmVmKHNlbGVjdG9yLCBjYXJ0SXRlbSwgaHJlZil7XG4gICAgbGV0IGFDb2xsZWN0aW9uID0gY2FydEl0ZW0ucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFDb2xsZWN0aW9uLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhQ29sbGVjdGlvbltpXS5ocmVmID0gaHJlZjtcbiAgICB9XG4gIH1cblxuICBzZXRRdWFudGl0eShzZWxlY3RvciwgY2FydEl0ZW0sIGl0ZW0pe1xuICAgIGlmIChjYXJ0SXRlbS5sb2NhbE5hbWUgPT09ICdkaXYnKSB7XG4gICAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS50ZXh0Q29udGVudCA9IGl0ZW0ucXVhbnRpdHk7XG4gICAgfSBlbHNlIGlmIChjYXJ0SXRlbS5sb2NhbE5hbWUgPT09ICd0cicpIHtcbiAgICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnZhbHVlID0gaXRlbS5xdWFudGl0eTtcbiAgICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmRhdGFzZXQuaWQgPSBpdGVtLmlkO1xuICAgIH1cbiAgfVxuXG4gIHNldFByaWNlKHNlbGVjdG9yLCBjYXJ0SXRlbSwgcHJvZHVjdCl7XG4gICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikudGV4dENvbnRlbnQgPSBwcm9kdWN0LnByaWNlO1xuICB9XG5cbiAgZmlsbFJhdGVTdGFycyhzZWxlY3RvciwgY2FydEl0ZW0sIHJhdGluZyl7XG4gICAgbGV0IG1heFdpZHRoID0gJChzZWxlY3RvcikuY3NzKCdtYXgtd2lkdGgnKTtcbiAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5zdHlsZSA9IGB3aWR0aDogY2FsYygke21heFdpZHRofSAvIDUgKiAke3JhdGluZ30pYDtcbiAgfVxuXG4gIHNldFN1YlRvdGFsKHNlbGVjdG9yLCBjYXJ0SXRlbSwgcHJvZHVjdCl7XG4gICAgaWYgKGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgICBsZXQgc3ViID0gcHJvZHVjdC5wcmljZSAqIHByb2R1Y3QucXVhbnRpdHk7XG4gICAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS50ZXh0Q29udGVudCA9IHN1YjtcbiAgICB9XG59XG5cbiAgc2V0RGVsZXRlQnV0dG9uSWQoc2VsZWN0b3IsIGNhcnRJdGVtLCBwcm9kdWN0KXtcbiAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5pZCA9IHByb2R1Y3QuaWQ7XG4gIH1cblxuICBkaXNwbGF5Tm9uZURlbGV0ZShzZWxlY3RvciwgY2FydEl0ZW0pIHtcbiAgICBjYXJ0SXRlbS5jbGFzc0xpc3QucmVtb3ZlKHNlbGVjdG9yKTtcbiAgfVxuXG4gIGl0ZW1BcHBlbmQoY2FydE5vZGUsIGl0ZW0pe1xuICAgIGNhcnROb2RlLmFwcGVuZENoaWxkKGl0ZW0pO1xuICB9XG5cbiAgc2hvd1RvdGFsUHJpY2Uoc2VsZWN0b3IsIHRvdGFsKXtcbiAgICBsZXQgdG90YWxOb2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuXG4gICAgdG90YWxOb2Rlcy5mb3JFYWNoKGVsZW0gPT4ge1xuICAgICAgZWxlbS50ZXh0Q29udGVudCA9IHRvdGFsO1xuICAgIH0pO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnRleHRDb250ZW50ID0gdG90YWw7XG4gIH1cbn1cblxuLyohIGpDYXJvdXNlbCAtIHYwLjMuOCAtIDIwMTgtMDUtMzFcbiogaHR0cDovL3NvcmdhbGxhLmNvbS9qY2Fyb3VzZWwvXG4qIENvcHlyaWdodCAoYykgMjAwNi0yMDE4IEphbiBTb3JnYWxsYTsgTGljZW5zZWQgTUlUICovXG4oZnVuY3Rpb24oJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIGpDYXJvdXNlbCA9ICQuakNhcm91c2VsID0ge307XG5cbiAgakNhcm91c2VsLnZlcnNpb24gPSAnMC4zLjgnO1xuXG4gIHZhciByUmVsYXRpdmVUYXJnZXQgPSAvXihbK1xcLV09KT8oLispJC87XG5cbiAgakNhcm91c2VsLnBhcnNlVGFyZ2V0ID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdmFyIHJlbGF0aXZlID0gZmFsc2UsXG4gICAgICBwYXJ0cyAgICA9IHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnID9cbiAgICAgICAgclJlbGF0aXZlVGFyZ2V0LmV4ZWModGFyZ2V0KSA6XG4gICAgICAgIG51bGw7XG5cbiAgICBpZiAocGFydHMpIHtcbiAgICAgIHRhcmdldCA9IHBhcnNlSW50KHBhcnRzWzJdLCAxMCkgfHwgMDtcblxuICAgICAgaWYgKHBhcnRzWzFdKSB7XG4gICAgICAgIHJlbGF0aXZlID0gdHJ1ZTtcbiAgICAgICAgaWYgKHBhcnRzWzFdID09PSAnLT0nKSB7XG4gICAgICAgICAgdGFyZ2V0ICo9IC0xO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGFyZ2V0ID0gcGFyc2VJbnQodGFyZ2V0LCAxMCkgfHwgMDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICByZWxhdGl2ZTogcmVsYXRpdmVcbiAgICB9O1xuICB9O1xuXG4gIGpDYXJvdXNlbC5kZXRlY3RDYXJvdXNlbCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICB2YXIgY2Fyb3VzZWw7XG5cbiAgICB3aGlsZSAoZWxlbWVudC5sZW5ndGggPiAwKSB7XG4gICAgICBjYXJvdXNlbCA9IGVsZW1lbnQuZmlsdGVyKCdbZGF0YS1qY2Fyb3VzZWxdJyk7XG5cbiAgICAgIGlmIChjYXJvdXNlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBjYXJvdXNlbDtcbiAgICAgIH1cblxuICAgICAgY2Fyb3VzZWwgPSBlbGVtZW50LmZpbmQoJ1tkYXRhLWpjYXJvdXNlbF0nKTtcblxuICAgICAgaWYgKGNhcm91c2VsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGNhcm91c2VsO1xuICAgICAgfVxuXG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBqQ2Fyb3VzZWwuYmFzZSA9IGZ1bmN0aW9uKHBsdWdpbk5hbWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogIGpDYXJvdXNlbC52ZXJzaW9uLFxuICAgICAgX29wdGlvbnM6ICB7fSxcbiAgICAgIF9lbGVtZW50OiAgbnVsbCxcbiAgICAgIF9jYXJvdXNlbDogbnVsbCxcbiAgICAgIF9pbml0OiAgICAgJC5ub29wLFxuICAgICAgX2NyZWF0ZTogICAkLm5vb3AsXG4gICAgICBfZGVzdHJveTogICQubm9vcCxcbiAgICAgIF9yZWxvYWQ6ICAgJC5ub29wLFxuICAgICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudFxuICAgICAgICAgIC5hdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lLnRvTG93ZXJDYXNlKCksIHRydWUpXG4gICAgICAgICAgLmRhdGEocGx1Z2luTmFtZSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdjcmVhdGUnKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3JlYXRlKCk7XG5cbiAgICAgICAgdGhpcy5fdHJpZ2dlcignY3JlYXRlZW5kJyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignZGVzdHJveScpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9kZXN0cm95KCk7XG5cbiAgICAgICAgdGhpcy5fdHJpZ2dlcignZGVzdHJveWVuZCcpO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnRcbiAgICAgICAgICAucmVtb3ZlRGF0YShwbHVnaW5OYW1lKVxuICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lLnRvTG93ZXJDYXNlKCkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIHJlbG9hZDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ3JlbG9hZCcpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgIHRoaXMub3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JlbG9hZCgpO1xuXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ3JlbG9hZGVuZCcpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIGVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudDtcbiAgICAgIH0sXG4gICAgICBvcHRpb25zOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuICQuZXh0ZW5kKHt9LCB0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuX29wdGlvbnNba2V5XSA9PT0gJ3VuZGVmaW5lZCcgP1xuICAgICAgICAgICAgICBudWxsIDpcbiAgICAgICAgICAgICAgdGhpcy5fb3B0aW9uc1trZXldO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX29wdGlvbnNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX29wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5fb3B0aW9ucywga2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIGNhcm91c2VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jYXJvdXNlbCkge1xuICAgICAgICAgIHRoaXMuX2Nhcm91c2VsID0gakNhcm91c2VsLmRldGVjdENhcm91c2VsKHRoaXMub3B0aW9ucygnY2Fyb3VzZWwnKSB8fCB0aGlzLl9lbGVtZW50KTtcblxuICAgICAgICAgIGlmICghdGhpcy5fY2Fyb3VzZWwpIHtcbiAgICAgICAgICAgICQuZXJyb3IoJ0NvdWxkIG5vdCBkZXRlY3QgY2Fyb3VzZWwgZm9yIHBsdWdpbiBcIicgKyBwbHVnaW5OYW1lICsgJ1wiJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2Nhcm91c2VsO1xuICAgICAgfSxcbiAgICAgIF90cmlnZ2VyOiBmdW5jdGlvbih0eXBlLCBlbGVtZW50LCBkYXRhKSB7XG4gICAgICAgIHZhciBldmVudCxcbiAgICAgICAgICBkZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG5cbiAgICAgICAgZGF0YSA9IFt0aGlzXS5jb25jYXQoZGF0YSB8fCBbXSk7XG5cbiAgICAgICAgKGVsZW1lbnQgfHwgdGhpcy5fZWxlbWVudCkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBldmVudCA9ICQuRXZlbnQoKHBsdWdpbk5hbWUgKyAnOicgKyB0eXBlKS50b0xvd2VyQ2FzZSgpKTtcblxuICAgICAgICAgICQodGhpcykudHJpZ2dlcihldmVudCwgZGF0YSk7XG5cbiAgICAgICAgICBpZiAoZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuICFkZWZhdWx0UHJldmVudGVkO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgakNhcm91c2VsLnBsdWdpbiA9IGZ1bmN0aW9uKHBsdWdpbk5hbWUsIHBsdWdpblByb3RvdHlwZSkge1xuICAgIHZhciBQbHVnaW4gPSAkW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgdGhpcy5fZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICB0aGlzLm9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIHRoaXMuY3JlYXRlKCk7XG4gICAgfTtcblxuICAgIFBsdWdpbi5mbiA9IFBsdWdpbi5wcm90b3R5cGUgPSAkLmV4dGVuZChcbiAgICAgIHt9LFxuICAgICAgakNhcm91c2VsLmJhc2UocGx1Z2luTmFtZSksXG4gICAgICBwbHVnaW5Qcm90b3R5cGVcbiAgICApO1xuXG4gICAgJC5mbltwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBhcmdzICAgICAgICA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgIHJldHVyblZhbHVlID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGluc3RhbmNlID0gJCh0aGlzKS5kYXRhKHBsdWdpbk5hbWUpO1xuXG4gICAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuICQuZXJyb3IoXG4gICAgICAgICAgICAgICdDYW5ub3QgY2FsbCBtZXRob2RzIG9uICcgKyBwbHVnaW5OYW1lICsgJyBwcmlvciB0byBpbml0aWFsaXphdGlvbjsgJyArXG4gICAgICAgICAgICAgICdhdHRlbXB0ZWQgdG8gY2FsbCBtZXRob2QgXCInICsgb3B0aW9ucyArICdcIidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCEkLmlzRnVuY3Rpb24oaW5zdGFuY2Vbb3B0aW9uc10pIHx8IG9wdGlvbnMuY2hhckF0KDApID09PSAnXycpIHtcbiAgICAgICAgICAgIHJldHVybiAkLmVycm9yKFxuICAgICAgICAgICAgICAnTm8gc3VjaCBtZXRob2QgXCInICsgb3B0aW9ucyArICdcIiBmb3IgJyArIHBsdWdpbk5hbWUgKyAnIGluc3RhbmNlJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgbWV0aG9kVmFsdWUgPSBpbnN0YW5jZVtvcHRpb25zXS5hcHBseShpbnN0YW5jZSwgYXJncyk7XG5cbiAgICAgICAgICBpZiAobWV0aG9kVmFsdWUgIT09IGluc3RhbmNlICYmIHR5cGVvZiBtZXRob2RWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gbWV0aG9kVmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgaW5zdGFuY2UgPSAkKHRoaXMpLmRhdGEocGx1Z2luTmFtZSk7XG5cbiAgICAgICAgICBpZiAoaW5zdGFuY2UgaW5zdGFuY2VvZiBQbHVnaW4pIHtcbiAgICAgICAgICAgIGluc3RhbmNlLnJlbG9hZChvcHRpb25zKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3IFBsdWdpbih0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfTtcblxuICAgIHJldHVybiBQbHVnaW47XG4gIH07XG59KGpRdWVyeSkpO1xuXG4oZnVuY3Rpb24oJCwgd2luZG93KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcblxuICB2YXIgdG9GbG9hdCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbCkgfHwgMDtcbiAgfTtcblxuICAkLmpDYXJvdXNlbC5wbHVnaW4oJ2pjYXJvdXNlbCcsIHtcbiAgICBhbmltYXRpbmc6ICAgZmFsc2UsXG4gICAgdGFpbDogICAgICAgIDAsXG4gICAgaW5UYWlsOiAgICAgIGZhbHNlLFxuICAgIHJlc2l6ZVN0YXRlOiBudWxsLFxuICAgIHJlc2l6ZVRpbWVyOiBudWxsLFxuICAgIGx0OiAgICAgICAgICBudWxsLFxuICAgIHZlcnRpY2FsOiAgICBmYWxzZSxcbiAgICBydGw6ICAgICAgICAgZmFsc2UsXG4gICAgY2lyY3VsYXI6ICAgIGZhbHNlLFxuICAgIHVuZGVyZmxvdzogICBmYWxzZSxcbiAgICByZWxhdGl2ZTogICAgZmFsc2UsXG5cbiAgICBfb3B0aW9uczoge1xuICAgICAgbGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQoKS5jaGlsZHJlbigpLmVxKDApO1xuICAgICAgfSxcbiAgICAgIGl0ZW1zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdCgpLmNoaWxkcmVuKCk7XG4gICAgICB9LFxuICAgICAgYW5pbWF0aW9uOiAgIDQwMCxcbiAgICAgIHRyYW5zaXRpb25zOiBmYWxzZSxcbiAgICAgIHdyYXA6ICAgICAgICBudWxsLFxuICAgICAgdmVydGljYWw6ICAgIG51bGwsXG4gICAgICBydGw6ICAgICAgICAgbnVsbCxcbiAgICAgIGNlbnRlcjogICAgICBmYWxzZVxuICAgIH0sXG5cbiAgICAvLyBQcm90ZWN0ZWQsIGRvbid0IGFjY2VzcyBkaXJlY3RseVxuICAgIF9saXN0OiAgICAgICAgIG51bGwsXG4gICAgX2l0ZW1zOiAgICAgICAgbnVsbCxcbiAgICBfdGFyZ2V0OiAgICAgICAkKCksXG4gICAgX2ZpcnN0OiAgICAgICAgJCgpLFxuICAgIF9sYXN0OiAgICAgICAgICQoKSxcbiAgICBfdmlzaWJsZTogICAgICAkKCksXG4gICAgX2Z1bGx5dmlzaWJsZTogJCgpLFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgc2VsZi5yZXNpemVTdGF0ZSA9ICR3aW5kb3cud2lkdGgoKSArICd4JyArICR3aW5kb3cuaGVpZ2h0KCk7XG5cbiAgICAgIHRoaXMub25XaW5kb3dSZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNlbGYucmVzaXplVGltZXIpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5yZXNpemVUaW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLnJlc2l6ZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgY3VycmVudFJlc2l6ZVN0YXRlID0gJHdpbmRvdy53aWR0aCgpICsgJ3gnICsgJHdpbmRvdy5oZWlnaHQoKTtcblxuICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSB3aW5kb3cgc2l6ZSBhY3R1YWxseSBjaGFuZ2VkLlxuICAgICAgICAgIC8vIGlPUyBtaWdodCB0cmlnZ2VyIHJlc2l6ZSBldmVudHMgb24gcGFnZSBzY3JvbGwuXG4gICAgICAgICAgaWYgKGN1cnJlbnRSZXNpemVTdGF0ZSA9PT0gc2VsZi5yZXNpemVTdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYucmVzaXplU3RhdGUgPSBjdXJyZW50UmVzaXplU3RhdGU7XG4gICAgICAgICAgc2VsZi5yZWxvYWQoKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgX2NyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZWxvYWQoKTtcblxuICAgICAgJHdpbmRvdy5vbigncmVzaXplLmpjYXJvdXNlbCcsIHRoaXMub25XaW5kb3dSZXNpemUpO1xuICAgIH0sXG4gICAgX2Rlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgJHdpbmRvdy5vZmYoJ3Jlc2l6ZS5qY2Fyb3VzZWwnLCB0aGlzLm9uV2luZG93UmVzaXplKTtcbiAgICB9LFxuICAgIF9yZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy52ZXJ0aWNhbCA9IHRoaXMub3B0aW9ucygndmVydGljYWwnKTtcblxuICAgICAgaWYgKHRoaXMudmVydGljYWwgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnZlcnRpY2FsID0gdG9GbG9hdCh0aGlzLmxpc3QoKS5oZWlnaHQoKSkgPiB0b0Zsb2F0KHRoaXMubGlzdCgpLndpZHRoKCkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJ0bCA9IHRoaXMub3B0aW9ucygncnRsJyk7XG5cbiAgICAgIGlmICh0aGlzLnJ0bCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucnRsID0gKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICBpZiAoKCcnICsgZWxlbWVudC5hdHRyKCdkaXInKSkudG9Mb3dlckNhc2UoKSA9PT0gJ3J0bCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuXG4gICAgICAgICAgZWxlbWVudC5wYXJlbnRzKCdbZGlyXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoKC9ydGwvaSkudGVzdCgkKHRoaXMpLmF0dHIoJ2RpcicpKSkge1xuICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgfSh0aGlzLl9lbGVtZW50KSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubHQgPSB0aGlzLnZlcnRpY2FsID8gJ3RvcCcgOiAnbGVmdCc7XG5cbiAgICAgIC8vIEVuc3VyZSBiZWZvcmUgY2xvc2VzdCgpIGNhbGxcbiAgICAgIHRoaXMucmVsYXRpdmUgPSB0aGlzLmxpc3QoKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdyZWxhdGl2ZSc7XG5cbiAgICAgIC8vIEZvcmNlIGxpc3QgYW5kIGl0ZW1zIHJlbG9hZFxuICAgICAgdGhpcy5fbGlzdCAgPSBudWxsO1xuICAgICAgdGhpcy5faXRlbXMgPSBudWxsO1xuXG4gICAgICB2YXIgaXRlbSA9IHRoaXMuaW5kZXgodGhpcy5fdGFyZ2V0KSA+PSAwID9cbiAgICAgICAgdGhpcy5fdGFyZ2V0IDpcbiAgICAgICAgdGhpcy5jbG9zZXN0KCk7XG5cbiAgICAgIC8vIF9wcmVwYXJlKCkgbmVlZHMgdGhpcyBoZXJlXG4gICAgICB0aGlzLmNpcmN1bGFyICA9IHRoaXMub3B0aW9ucygnd3JhcCcpID09PSAnY2lyY3VsYXInO1xuICAgICAgdGhpcy51bmRlcmZsb3cgPSBmYWxzZTtcblxuICAgICAgdmFyIHByb3BzID0geydsZWZ0JzogMCwgJ3RvcCc6IDB9O1xuXG4gICAgICBpZiAoaXRlbS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuX3ByZXBhcmUoaXRlbSk7XG4gICAgICAgIHRoaXMubGlzdCgpLmZpbmQoJ1tkYXRhLWpjYXJvdXNlbC1jbG9uZV0nKS5yZW1vdmUoKTtcblxuICAgICAgICAvLyBGb3JjZSBpdGVtcyByZWxvYWRcbiAgICAgICAgdGhpcy5faXRlbXMgPSBudWxsO1xuXG4gICAgICAgIHRoaXMudW5kZXJmbG93ID0gdGhpcy5fZnVsbHl2aXNpYmxlLmxlbmd0aCA+PSB0aGlzLml0ZW1zKCkubGVuZ3RoO1xuICAgICAgICB0aGlzLmNpcmN1bGFyICA9IHRoaXMuY2lyY3VsYXIgJiYgIXRoaXMudW5kZXJmbG93O1xuXG4gICAgICAgIHByb3BzW3RoaXMubHRdID0gdGhpcy5fcG9zaXRpb24oaXRlbSkgKyAncHgnO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1vdmUocHJvcHMpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX2xpc3QgPT09IG51bGwpIHtcbiAgICAgICAgdmFyIG9wdGlvbiA9IHRoaXMub3B0aW9ucygnbGlzdCcpO1xuICAgICAgICB0aGlzLl9saXN0ID0gJC5pc0Z1bmN0aW9uKG9wdGlvbikgPyBvcHRpb24uY2FsbCh0aGlzKSA6IHRoaXMuX2VsZW1lbnQuZmluZChvcHRpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fbGlzdDtcbiAgICB9LFxuICAgIGl0ZW1zOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9pdGVtcyA9PT0gbnVsbCkge1xuICAgICAgICB2YXIgb3B0aW9uID0gdGhpcy5vcHRpb25zKCdpdGVtcycpO1xuICAgICAgICB0aGlzLl9pdGVtcyA9ICgkLmlzRnVuY3Rpb24ob3B0aW9uKSA/IG9wdGlvbi5jYWxsKHRoaXMpIDogdGhpcy5saXN0KCkuZmluZChvcHRpb24pKS5ub3QoJ1tkYXRhLWpjYXJvdXNlbC1jbG9uZV0nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX2l0ZW1zO1xuICAgIH0sXG4gICAgaW5kZXg6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiB0aGlzLml0ZW1zKCkuaW5kZXgoaXRlbSk7XG4gICAgfSxcbiAgICBjbG9zZXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmICAgID0gdGhpcyxcbiAgICAgICAgcG9zICAgICA9IHRoaXMubGlzdCgpLnBvc2l0aW9uKClbdGhpcy5sdF0sXG4gICAgICAgIGNsb3Nlc3QgPSAkKCksIC8vIEVuc3VyZSB3ZSdyZSByZXR1cm5pbmcgYSBqUXVlcnkgaW5zdGFuY2VcbiAgICAgICAgc3RvcCAgICA9IGZhbHNlLFxuICAgICAgICBscmIgICAgID0gdGhpcy52ZXJ0aWNhbCA/ICdib3R0b20nIDogKHRoaXMucnRsICYmICF0aGlzLnJlbGF0aXZlID8gJ2xlZnQnIDogJ3JpZ2h0JyksXG4gICAgICAgIHdpZHRoO1xuXG4gICAgICBpZiAodGhpcy5ydGwgJiYgdGhpcy5yZWxhdGl2ZSAmJiAhdGhpcy52ZXJ0aWNhbCkge1xuICAgICAgICBwb3MgKz0gdG9GbG9hdCh0aGlzLmxpc3QoKS53aWR0aCgpKSAtIHRoaXMuY2xpcHBpbmcoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pdGVtcygpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsb3Nlc3QgPSAkKHRoaXMpO1xuXG4gICAgICAgIGlmIChzdG9wKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRpbSA9IHNlbGYuZGltZW5zaW9uKGNsb3Nlc3QpO1xuXG4gICAgICAgIHBvcyArPSBkaW07XG5cbiAgICAgICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAgICAgd2lkdGggPSBkaW0gLSB0b0Zsb2F0KGNsb3Nlc3QuY3NzKCdtYXJnaW4tJyArIGxyYikpO1xuXG4gICAgICAgICAgaWYgKChNYXRoLmFicyhwb3MpIC0gZGltICsgKHdpZHRoIC8gMikpIDw9IDApIHtcbiAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuXG4gICAgICByZXR1cm4gY2xvc2VzdDtcbiAgICB9LFxuICAgIHRhcmdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdGFyZ2V0O1xuICAgIH0sXG4gICAgZmlyc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2ZpcnN0O1xuICAgIH0sXG4gICAgbGFzdDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbGFzdDtcbiAgICB9LFxuICAgIHZpc2libGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XG4gICAgfSxcbiAgICBmdWxseXZpc2libGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2Z1bGx5dmlzaWJsZTtcbiAgICB9LFxuICAgIGhhc05leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdoYXNuZXh0JykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciB3cmFwID0gdGhpcy5vcHRpb25zKCd3cmFwJyksXG4gICAgICAgIGVuZCA9IHRoaXMuaXRlbXMoKS5sZW5ndGggLSAxLFxuICAgICAgICBjaGVjayA9IHRoaXMub3B0aW9ucygnY2VudGVyJykgPyB0aGlzLl90YXJnZXQgOiB0aGlzLl9sYXN0O1xuXG4gICAgICByZXR1cm4gZW5kID49IDAgJiYgIXRoaXMudW5kZXJmbG93ICYmXG4gICAgICAoKHdyYXAgJiYgd3JhcCAhPT0gJ2ZpcnN0JykgfHxcbiAgICAgICAgKHRoaXMuaW5kZXgoY2hlY2spIDwgZW5kKSB8fFxuICAgICAgICAodGhpcy50YWlsICYmICF0aGlzLmluVGFpbCkpID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0sXG4gICAgaGFzUHJldjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ2hhc3ByZXYnKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHdyYXAgPSB0aGlzLm9wdGlvbnMoJ3dyYXAnKTtcblxuICAgICAgcmV0dXJuIHRoaXMuaXRlbXMoKS5sZW5ndGggPiAwICYmICF0aGlzLnVuZGVyZmxvdyAmJlxuICAgICAgKCh3cmFwICYmIHdyYXAgIT09ICdsYXN0JykgfHxcbiAgICAgICAgKHRoaXMuaW5kZXgodGhpcy5fZmlyc3QpID4gMCkgfHxcbiAgICAgICAgKHRoaXMudGFpbCAmJiB0aGlzLmluVGFpbCkpID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0sXG4gICAgY2xpcHBpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRvRmxvYXQodGhpcy5fZWxlbWVudFsnaW5uZXInICsgKHRoaXMudmVydGljYWwgPyAnSGVpZ2h0JyA6ICdXaWR0aCcpXSgpKTtcbiAgICB9LFxuICAgIGRpbWVuc2lvbjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgcmV0dXJuIHRvRmxvYXQoZWxlbWVudFsnb3V0ZXInICsgKHRoaXMudmVydGljYWwgPyAnSGVpZ2h0JyA6ICdXaWR0aCcpXSh0cnVlKSk7XG4gICAgfSxcbiAgICBzY3JvbGw6IGZ1bmN0aW9uKHRhcmdldCwgYW5pbWF0ZSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGluZykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdzY3JvbGwnLCBudWxsLCBbdGFyZ2V0LCBhbmltYXRlXSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGlmICgkLmlzRnVuY3Rpb24oYW5pbWF0ZSkpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBhbmltYXRlO1xuICAgICAgICBhbmltYXRlICA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYXJzZWQgPSAkLmpDYXJvdXNlbC5wYXJzZVRhcmdldCh0YXJnZXQpO1xuXG4gICAgICBpZiAocGFyc2VkLnJlbGF0aXZlKSB7XG4gICAgICAgIHZhciBlbmQgICAgPSB0aGlzLml0ZW1zKCkubGVuZ3RoIC0gMSxcbiAgICAgICAgICBzY3JvbGwgPSBNYXRoLmFicyhwYXJzZWQudGFyZ2V0KSxcbiAgICAgICAgICB3cmFwICAgPSB0aGlzLm9wdGlvbnMoJ3dyYXAnKSxcbiAgICAgICAgICBjdXJyZW50LFxuICAgICAgICAgIGZpcnN0LFxuICAgICAgICAgIGluZGV4LFxuICAgICAgICAgIHN0YXJ0LFxuICAgICAgICAgIGN1cnIsXG4gICAgICAgICAgaXNWaXNpYmxlLFxuICAgICAgICAgIHByb3BzLFxuICAgICAgICAgIGk7XG5cbiAgICAgICAgaWYgKHBhcnNlZC50YXJnZXQgPiAwKSB7XG4gICAgICAgICAgdmFyIGxhc3QgPSB0aGlzLmluZGV4KHRoaXMuX2xhc3QpO1xuXG4gICAgICAgICAgaWYgKGxhc3QgPj0gZW5kICYmIHRoaXMudGFpbCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmluVGFpbCkge1xuICAgICAgICAgICAgICB0aGlzLl9zY3JvbGxUYWlsKGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICh3cmFwID09PSAnYm90aCcgfHwgd3JhcCA9PT0gJ2xhc3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKDAsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLmluZGV4KHRoaXMuX3RhcmdldCk7XG5cbiAgICAgICAgICAgIGlmICgodGhpcy51bmRlcmZsb3cgJiYgY3VycmVudCA9PT0gZW5kICYmICh3cmFwID09PSAnY2lyY3VsYXInIHx8IHdyYXAgPT09ICdib3RoJyB8fCB3cmFwID09PSAnbGFzdCcpKSB8fFxuICAgICAgICAgICAgICAoIXRoaXMudW5kZXJmbG93ICYmIGxhc3QgPT09IGVuZCAmJiAod3JhcCA9PT0gJ2JvdGgnIHx8IHdyYXAgPT09ICdsYXN0JykpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3Njcm9sbCgwLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpbmRleCA9IGN1cnJlbnQgKyBzY3JvbGw7XG5cbiAgICAgICAgICAgICAgaWYgKHRoaXMuY2lyY3VsYXIgJiYgaW5kZXggPiBlbmQpIHtcbiAgICAgICAgICAgICAgICBpID0gZW5kO1xuICAgICAgICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZ2V0KC0xKTtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChpKysgPCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5lcSgwKTtcbiAgICAgICAgICAgICAgICAgIGlzVmlzaWJsZSA9IHRoaXMuX3Zpc2libGUuaW5kZXgoY3VycikgPj0gMDtcblxuICAgICAgICAgICAgICAgICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyLmFmdGVyKGN1cnIuY2xvbmUodHJ1ZSkuYXR0cignZGF0YS1qY2Fyb3VzZWwtY2xvbmUnLCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHRoaXMubGlzdCgpLmFwcGVuZChjdXJyKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKCFpc1Zpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHNbdGhpcy5sdF0gPSB0aGlzLmRpbWVuc2lvbihjdXJyKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlQnkocHJvcHMpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBGb3JjZSBpdGVtcyByZWxvYWRcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2l0ZW1zID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoY3VyciwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbChNYXRoLm1pbihpbmRleCwgZW5kKSwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLmluVGFpbCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKE1hdGgubWF4KCh0aGlzLmluZGV4KHRoaXMuX2ZpcnN0KSAtIHNjcm9sbCkgKyAxLCAwKSwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaXJzdCAgPSB0aGlzLmluZGV4KHRoaXMuX2ZpcnN0KTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLmluZGV4KHRoaXMuX3RhcmdldCk7XG4gICAgICAgICAgICBzdGFydCAgPSB0aGlzLnVuZGVyZmxvdyA/IGN1cnJlbnQgOiBmaXJzdDtcbiAgICAgICAgICAgIGluZGV4ICA9IHN0YXJ0IC0gc2Nyb2xsO1xuXG4gICAgICAgICAgICBpZiAoc3RhcnQgPD0gMCAmJiAoKHRoaXMudW5kZXJmbG93ICYmIHdyYXAgPT09ICdjaXJjdWxhcicpIHx8IHdyYXAgPT09ICdib3RoJyB8fCB3cmFwID09PSAnZmlyc3QnKSkge1xuICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoZW5kLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAodGhpcy5jaXJjdWxhciAmJiBpbmRleCA8IDApIHtcbiAgICAgICAgICAgICAgICBpICAgID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5nZXQoMCk7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAoaSsrIDwgMCkge1xuICAgICAgICAgICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5lcSgtMSk7XG4gICAgICAgICAgICAgICAgICBpc1Zpc2libGUgPSB0aGlzLl92aXNpYmxlLmluZGV4KGN1cnIpID49IDA7XG5cbiAgICAgICAgICAgICAgICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3Vyci5hZnRlcihjdXJyLmNsb25lKHRydWUpLmF0dHIoJ2RhdGEtamNhcm91c2VsLWNsb25lJywgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICB0aGlzLmxpc3QoKS5wcmVwZW5kKGN1cnIpO1xuXG4gICAgICAgICAgICAgICAgICAvLyBGb3JjZSBpdGVtcyByZWxvYWRcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2l0ZW1zID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgdmFyIGRpbSA9IHRoaXMuZGltZW5zaW9uKGN1cnIpO1xuXG4gICAgICAgICAgICAgICAgICBwcm9wcyA9IHt9O1xuICAgICAgICAgICAgICAgICAgcHJvcHNbdGhpcy5sdF0gPSAtZGltO1xuICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlQnkocHJvcHMpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKGN1cnIsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoTWF0aC5tYXgoaW5kZXgsIDApLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbChwYXJzZWQudGFyZ2V0LCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3RyaWdnZXIoJ3Njcm9sbGVuZCcpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIG1vdmVCeTogZnVuY3Rpb24ocHJvcGVydGllcywgb3B0cykge1xuICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5saXN0KCkucG9zaXRpb24oKSxcbiAgICAgICAgbXVsdGlwbGllciA9IDEsXG4gICAgICAgIGNvcnJlY3Rpb24gPSAwO1xuXG4gICAgICBpZiAodGhpcy5ydGwgJiYgIXRoaXMudmVydGljYWwpIHtcbiAgICAgICAgbXVsdGlwbGllciA9IC0xO1xuXG4gICAgICAgIGlmICh0aGlzLnJlbGF0aXZlKSB7XG4gICAgICAgICAgY29ycmVjdGlvbiA9IHRvRmxvYXQodGhpcy5saXN0KCkud2lkdGgoKSkgLSB0aGlzLmNsaXBwaW5nKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BlcnRpZXMubGVmdCkge1xuICAgICAgICBwcm9wZXJ0aWVzLmxlZnQgPSAodG9GbG9hdChwb3NpdGlvbi5sZWZ0KSArIGNvcnJlY3Rpb24gKyB0b0Zsb2F0KHByb3BlcnRpZXMubGVmdCkgKiBtdWx0aXBsaWVyKSArICdweCc7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9wZXJ0aWVzLnRvcCkge1xuICAgICAgICBwcm9wZXJ0aWVzLnRvcCA9ICh0b0Zsb2F0KHBvc2l0aW9uLnRvcCkgKyBjb3JyZWN0aW9uICsgdG9GbG9hdChwcm9wZXJ0aWVzLnRvcCkgKiBtdWx0aXBsaWVyKSArICdweCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLm1vdmUocHJvcGVydGllcywgb3B0cyk7XG4gICAgfSxcbiAgICBtb3ZlOiBmdW5jdGlvbihwcm9wZXJ0aWVzLCBvcHRzKSB7XG4gICAgICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICAgICAgdmFyIG9wdGlvbiAgICAgICA9IHRoaXMub3B0aW9ucygndHJhbnNpdGlvbnMnKSxcbiAgICAgICAgdHJhbnNpdGlvbnMgID0gISFvcHRpb24sXG4gICAgICAgIHRyYW5zZm9ybXMgICA9ICEhb3B0aW9uLnRyYW5zZm9ybXMsXG4gICAgICAgIHRyYW5zZm9ybXMzZCA9ICEhb3B0aW9uLnRyYW5zZm9ybXMzZCxcbiAgICAgICAgZHVyYXRpb24gICAgID0gb3B0cy5kdXJhdGlvbiB8fCAwLFxuICAgICAgICBsaXN0ICAgICAgICAgPSB0aGlzLmxpc3QoKTtcblxuICAgICAgaWYgKCF0cmFuc2l0aW9ucyAmJiBkdXJhdGlvbiA+IDApIHtcbiAgICAgICAgbGlzdC5hbmltYXRlKHByb3BlcnRpZXMsIG9wdHMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBjb21wbGV0ZSA9IG9wdHMuY29tcGxldGUgfHwgJC5ub29wLFxuICAgICAgICBjc3MgPSB7fTtcblxuICAgICAgaWYgKHRyYW5zaXRpb25zKSB7XG4gICAgICAgIHZhciBiYWNrdXAgPSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246IGxpc3QuY3NzKCd0cmFuc2l0aW9uRHVyYXRpb24nKSxcbiAgICAgICAgICAgIHRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogbGlzdC5jc3MoJ3RyYW5zaXRpb25UaW1pbmdGdW5jdGlvbicpLFxuICAgICAgICAgICAgdHJhbnNpdGlvblByb3BlcnR5OiBsaXN0LmNzcygndHJhbnNpdGlvblByb3BlcnR5JylcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9sZENvbXBsZXRlID0gY29tcGxldGU7XG5cbiAgICAgICAgY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKHRoaXMpLmNzcyhiYWNrdXApO1xuICAgICAgICAgIG9sZENvbXBsZXRlLmNhbGwodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIGNzcyA9IHtcbiAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246IChkdXJhdGlvbiA+IDAgPyBkdXJhdGlvbiAvIDEwMDAgOiAwKSArICdzJyxcbiAgICAgICAgICB0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb246IG9wdGlvbi5lYXNpbmcgfHwgb3B0cy5lYXNpbmcsXG4gICAgICAgICAgdHJhbnNpdGlvblByb3BlcnR5OiBkdXJhdGlvbiA+IDAgPyAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtcyB8fCB0cmFuc2Zvcm1zM2QpIHtcbiAgICAgICAgICAgICAgLy8gV2UgaGF2ZSB0byB1c2UgJ2FsbCcgYmVjYXVzZSBqUXVlcnkgZG9lc24ndCBwcmVmaXhcbiAgICAgICAgICAgICAgLy8gY3NzIHZhbHVlcywgbGlrZSB0cmFuc2l0aW9uLXByb3BlcnR5OiB0cmFuc2Zvcm07XG4gICAgICAgICAgICAgIHJldHVybiAnYWxsJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnRpZXMubGVmdCA/ICdsZWZ0JyA6ICd0b3AnO1xuICAgICAgICAgIH0pKCkgOiAnbm9uZScsXG4gICAgICAgICAgdHJhbnNmb3JtOiAnbm9uZSdcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRyYW5zZm9ybXMzZCkge1xuICAgICAgICBjc3MudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyAocHJvcGVydGllcy5sZWZ0IHx8IDApICsgJywnICsgKHByb3BlcnRpZXMudG9wIHx8IDApICsgJywwKSc7XG4gICAgICB9IGVsc2UgaWYgKHRyYW5zZm9ybXMpIHtcbiAgICAgICAgY3NzLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChwcm9wZXJ0aWVzLmxlZnQgfHwgMCkgKyAnLCcgKyAocHJvcGVydGllcy50b3AgfHwgMCkgKyAnKSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkLmV4dGVuZChjc3MsIHByb3BlcnRpZXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHJhbnNpdGlvbnMgJiYgZHVyYXRpb24gPiAwKSB7XG4gICAgICAgIGxpc3Qub25lKCd0cmFuc2l0aW9uZW5kIHdlYmtpdFRyYW5zaXRpb25FbmQgb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQgTVNUcmFuc2l0aW9uRW5kJywgY29tcGxldGUpO1xuICAgICAgfVxuXG4gICAgICBsaXN0LmNzcyhjc3MpO1xuXG4gICAgICBpZiAoZHVyYXRpb24gPD0gMCkge1xuICAgICAgICBsaXN0LmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29tcGxldGUuY2FsbCh0aGlzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBfc2Nyb2xsOiBmdW5jdGlvbihpdGVtLCBhbmltYXRlLCBjYWxsYmFjaykge1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nKSB7XG4gICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVtICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBpdGVtID0gdGhpcy5pdGVtcygpLmVxKGl0ZW0pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaXRlbS5qcXVlcnkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGl0ZW0gPSAkKGl0ZW0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmluVGFpbCA9IGZhbHNlO1xuXG4gICAgICB0aGlzLl9wcmVwYXJlKGl0ZW0pO1xuXG4gICAgICB2YXIgcG9zICAgICA9IHRoaXMuX3Bvc2l0aW9uKGl0ZW0pLFxuICAgICAgICBjdXJyUG9zID0gdG9GbG9hdCh0aGlzLmxpc3QoKS5wb3NpdGlvbigpW3RoaXMubHRdKTtcblxuICAgICAgaWYgKHBvcyA9PT0gY3VyclBvcykge1xuICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9wZXJ0aWVzID0ge307XG4gICAgICBwcm9wZXJ0aWVzW3RoaXMubHRdID0gcG9zICsgJ3B4JztcblxuICAgICAgdGhpcy5fYW5pbWF0ZShwcm9wZXJ0aWVzLCBhbmltYXRlLCBjYWxsYmFjayk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgX3Njcm9sbFRhaWw6IGZ1bmN0aW9uKGFuaW1hdGUsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAodGhpcy5hbmltYXRpbmcgfHwgIXRoaXMudGFpbCkge1xuICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHZhciBwb3MgPSB0aGlzLmxpc3QoKS5wb3NpdGlvbigpW3RoaXMubHRdO1xuXG4gICAgICBpZiAodGhpcy5ydGwgJiYgdGhpcy5yZWxhdGl2ZSAmJiAhdGhpcy52ZXJ0aWNhbCkge1xuICAgICAgICBwb3MgKz0gdG9GbG9hdCh0aGlzLmxpc3QoKS53aWR0aCgpKSAtIHRoaXMuY2xpcHBpbmcoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucnRsICYmICF0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIHBvcyArPSB0aGlzLnRhaWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3MgLT0gdGhpcy50YWlsO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmluVGFpbCA9IHRydWU7XG5cbiAgICAgIHZhciBwcm9wZXJ0aWVzID0ge307XG4gICAgICBwcm9wZXJ0aWVzW3RoaXMubHRdID0gcG9zICsgJ3B4JztcblxuICAgICAgdGhpcy5fdXBkYXRlKHtcbiAgICAgICAgdGFyZ2V0OiAgICAgICB0aGlzLl90YXJnZXQubmV4dCgpLFxuICAgICAgICBmdWxseXZpc2libGU6IHRoaXMuX2Z1bGx5dmlzaWJsZS5zbGljZSgxKS5hZGQodGhpcy5fdmlzaWJsZS5sYXN0KCkpXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fYW5pbWF0ZShwcm9wZXJ0aWVzLCBhbmltYXRlLCBjYWxsYmFjayk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgX2FuaW1hdGU6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIGFuaW1hdGUsIGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8ICQubm9vcDtcblxuICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdhbmltYXRlJykpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFuaW1hdGluZyA9IHRydWU7XG5cbiAgICAgIHZhciBhbmltYXRpb24gPSB0aGlzLm9wdGlvbnMoJ2FuaW1hdGlvbicpLFxuICAgICAgICBjb21wbGV0ZSAgPSAkLnByb3h5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMuYW5pbWF0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICB2YXIgYyA9IHRoaXMubGlzdCgpLmZpbmQoJ1tkYXRhLWpjYXJvdXNlbC1jbG9uZV0nKTtcblxuICAgICAgICAgIGlmIChjLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGMucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLl9yZWxvYWQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl90cmlnZ2VyKCdhbmltYXRlZW5kJyk7XG5cbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIHRydWUpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgdmFyIG9wdHMgPSB0eXBlb2YgYW5pbWF0aW9uID09PSAnb2JqZWN0JyA/XG4gICAgICAgICQuZXh0ZW5kKHt9LCBhbmltYXRpb24pIDpcbiAgICAgICAge2R1cmF0aW9uOiBhbmltYXRpb259LFxuICAgICAgICBvbGRDb21wbGV0ZSA9IG9wdHMuY29tcGxldGUgfHwgJC5ub29wO1xuXG4gICAgICBpZiAoYW5pbWF0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgb3B0cy5kdXJhdGlvbiA9IDA7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiAkLmZ4LnNwZWVkc1tvcHRzLmR1cmF0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgb3B0cy5kdXJhdGlvbiA9ICQuZnguc3BlZWRzW29wdHMuZHVyYXRpb25dO1xuICAgICAgfVxuXG4gICAgICBvcHRzLmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgIG9sZENvbXBsZXRlLmNhbGwodGhpcyk7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLm1vdmUocHJvcGVydGllcywgb3B0cyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgX3ByZXBhcmU6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHZhciBpbmRleCAgPSB0aGlzLmluZGV4KGl0ZW0pLFxuICAgICAgICBpZHggICAgPSBpbmRleCxcbiAgICAgICAgd2ggICAgID0gdGhpcy5kaW1lbnNpb24oaXRlbSksXG4gICAgICAgIGNsaXAgICA9IHRoaXMuY2xpcHBpbmcoKSxcbiAgICAgICAgbHJiICAgID0gdGhpcy52ZXJ0aWNhbCA/ICdib3R0b20nIDogKHRoaXMucnRsID8gJ2xlZnQnICA6ICdyaWdodCcpLFxuICAgICAgICBjZW50ZXIgPSB0aGlzLm9wdGlvbnMoJ2NlbnRlcicpLFxuICAgICAgICB1cGRhdGUgPSB7XG4gICAgICAgICAgdGFyZ2V0OiAgICAgICBpdGVtLFxuICAgICAgICAgIGZpcnN0OiAgICAgICAgaXRlbSxcbiAgICAgICAgICBsYXN0OiAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgdmlzaWJsZTogICAgICBpdGVtLFxuICAgICAgICAgIGZ1bGx5dmlzaWJsZTogd2ggPD0gY2xpcCA/IGl0ZW0gOiAkKClcbiAgICAgICAgfSxcbiAgICAgICAgY3VycixcbiAgICAgICAgaXNWaXNpYmxlLFxuICAgICAgICBtYXJnaW4sXG4gICAgICAgIGRpbTtcblxuICAgICAgaWYgKGNlbnRlcikge1xuICAgICAgICB3aCAvPSAyO1xuICAgICAgICBjbGlwIC89IDI7XG4gICAgICB9XG5cbiAgICAgIGlmICh3aCA8IGNsaXApIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmVxKCsraWR4KTtcblxuICAgICAgICAgIGlmIChjdXJyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNpcmN1bGFyKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmVxKDApO1xuXG4gICAgICAgICAgICBpZiAoaXRlbS5nZXQoMCkgPT09IGN1cnIuZ2V0KDApKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpc1Zpc2libGUgPSB0aGlzLl92aXNpYmxlLmluZGV4KGN1cnIpID49IDA7XG5cbiAgICAgICAgICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgICAgICAgICAgY3Vyci5hZnRlcihjdXJyLmNsb25lKHRydWUpLmF0dHIoJ2RhdGEtamNhcm91c2VsLWNsb25lJywgdHJ1ZSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmxpc3QoKS5hcHBlbmQoY3Vycik7XG5cbiAgICAgICAgICAgIGlmICghaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgIHZhciBwcm9wcyA9IHt9O1xuICAgICAgICAgICAgICBwcm9wc1t0aGlzLmx0XSA9IHRoaXMuZGltZW5zaW9uKGN1cnIpO1xuICAgICAgICAgICAgICB0aGlzLm1vdmVCeShwcm9wcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZvcmNlIGl0ZW1zIHJlbG9hZFxuICAgICAgICAgICAgdGhpcy5faXRlbXMgPSBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRpbSA9IHRoaXMuZGltZW5zaW9uKGN1cnIpO1xuXG4gICAgICAgICAgaWYgKGRpbSA9PT0gMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd2ggKz0gZGltO1xuXG4gICAgICAgICAgdXBkYXRlLmxhc3QgICAgPSBjdXJyO1xuICAgICAgICAgIHVwZGF0ZS52aXNpYmxlID0gdXBkYXRlLnZpc2libGUuYWRkKGN1cnIpO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIHJpZ2h0L2JvdHRvbSBtYXJnaW4gZnJvbSB0b3RhbCB3aWR0aFxuICAgICAgICAgIG1hcmdpbiA9IHRvRmxvYXQoY3Vyci5jc3MoJ21hcmdpbi0nICsgbHJiKSk7XG5cbiAgICAgICAgICBpZiAoKHdoIC0gbWFyZ2luKSA8PSBjbGlwKSB7XG4gICAgICAgICAgICB1cGRhdGUuZnVsbHl2aXNpYmxlID0gdXBkYXRlLmZ1bGx5dmlzaWJsZS5hZGQoY3Vycik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHdoID49IGNsaXApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuY2lyY3VsYXIgJiYgIWNlbnRlciAmJiB3aCA8IGNsaXApIHtcbiAgICAgICAgaWR4ID0gaW5kZXg7XG5cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBpZiAoLS1pZHggPCAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmVxKGlkeCk7XG5cbiAgICAgICAgICBpZiAoY3Vyci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRpbSA9IHRoaXMuZGltZW5zaW9uKGN1cnIpO1xuXG4gICAgICAgICAgaWYgKGRpbSA9PT0gMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd2ggKz0gZGltO1xuXG4gICAgICAgICAgdXBkYXRlLmZpcnN0ICAgPSBjdXJyO1xuICAgICAgICAgIHVwZGF0ZS52aXNpYmxlID0gdXBkYXRlLnZpc2libGUuYWRkKGN1cnIpO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIHJpZ2h0L2JvdHRvbSBtYXJnaW4gZnJvbSB0b3RhbCB3aWR0aFxuICAgICAgICAgIG1hcmdpbiA9IHRvRmxvYXQoY3Vyci5jc3MoJ21hcmdpbi0nICsgbHJiKSk7XG5cbiAgICAgICAgICBpZiAoKHdoIC0gbWFyZ2luKSA8PSBjbGlwKSB7XG4gICAgICAgICAgICB1cGRhdGUuZnVsbHl2aXNpYmxlID0gdXBkYXRlLmZ1bGx5dmlzaWJsZS5hZGQoY3Vycik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHdoID49IGNsaXApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl91cGRhdGUodXBkYXRlKTtcblxuICAgICAgdGhpcy50YWlsID0gMDtcblxuICAgICAgaWYgKCFjZW50ZXIgJiZcbiAgICAgICAgdGhpcy5vcHRpb25zKCd3cmFwJykgIT09ICdjaXJjdWxhcicgJiZcbiAgICAgICAgdGhpcy5vcHRpb25zKCd3cmFwJykgIT09ICdjdXN0b20nICYmXG4gICAgICAgIHRoaXMuaW5kZXgodXBkYXRlLmxhc3QpID09PSAodGhpcy5pdGVtcygpLmxlbmd0aCAtIDEpKSB7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHJpZ2h0L2JvdHRvbSBtYXJnaW4gZnJvbSB0b3RhbCB3aWR0aFxuICAgICAgICB3aCAtPSB0b0Zsb2F0KHVwZGF0ZS5sYXN0LmNzcygnbWFyZ2luLScgKyBscmIpKTtcblxuICAgICAgICBpZiAod2ggPiBjbGlwKSB7XG4gICAgICAgICAgdGhpcy50YWlsID0gd2ggLSBjbGlwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgX3Bvc2l0aW9uOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICB2YXIgZmlyc3QgID0gdGhpcy5fZmlyc3QsXG4gICAgICAgIHBvcyAgICA9IHRvRmxvYXQoZmlyc3QucG9zaXRpb24oKVt0aGlzLmx0XSksXG4gICAgICAgIGNlbnRlciA9IHRoaXMub3B0aW9ucygnY2VudGVyJyksXG4gICAgICAgIGNlbnRlck9mZnNldCA9IGNlbnRlciA/ICh0aGlzLmNsaXBwaW5nKCkgLyAyKSAtICh0aGlzLmRpbWVuc2lvbihmaXJzdCkgLyAyKSA6IDA7XG5cbiAgICAgIGlmICh0aGlzLnJ0bCAmJiAhdGhpcy52ZXJ0aWNhbCkge1xuICAgICAgICBpZiAodGhpcy5yZWxhdGl2ZSkge1xuICAgICAgICAgIHBvcyAtPSB0b0Zsb2F0KHRoaXMubGlzdCgpLndpZHRoKCkpIC0gdGhpcy5kaW1lbnNpb24oZmlyc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBvcyAtPSB0aGlzLmNsaXBwaW5nKCkgLSB0aGlzLmRpbWVuc2lvbihmaXJzdCk7XG4gICAgICAgIH1cblxuICAgICAgICBwb3MgKz0gY2VudGVyT2Zmc2V0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zIC09IGNlbnRlck9mZnNldDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFjZW50ZXIgJiZcbiAgICAgICAgKHRoaXMuaW5kZXgoaXRlbSkgPiB0aGlzLmluZGV4KGZpcnN0KSB8fCB0aGlzLmluVGFpbCkgJiZcbiAgICAgICAgdGhpcy50YWlsKSB7XG4gICAgICAgIHBvcyA9IHRoaXMucnRsICYmICF0aGlzLnZlcnRpY2FsID8gcG9zIC0gdGhpcy50YWlsIDogcG9zICsgdGhpcy50YWlsO1xuICAgICAgICB0aGlzLmluVGFpbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluVGFpbCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gLXBvcztcbiAgICB9LFxuICAgIF91cGRhdGU6IGZ1bmN0aW9uKHVwZGF0ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBjdXJyZW50ID0ge1xuICAgICAgICAgIHRhcmdldDogICAgICAgdGhpcy5fdGFyZ2V0LFxuICAgICAgICAgIGZpcnN0OiAgICAgICAgdGhpcy5fZmlyc3QsXG4gICAgICAgICAgbGFzdDogICAgICAgICB0aGlzLl9sYXN0LFxuICAgICAgICAgIHZpc2libGU6ICAgICAgdGhpcy5fdmlzaWJsZSxcbiAgICAgICAgICBmdWxseXZpc2libGU6IHRoaXMuX2Z1bGx5dmlzaWJsZVxuICAgICAgICB9LFxuICAgICAgICBiYWNrID0gdGhpcy5pbmRleCh1cGRhdGUuZmlyc3QgfHwgY3VycmVudC5maXJzdCkgPCB0aGlzLmluZGV4KGN1cnJlbnQuZmlyc3QpLFxuICAgICAgICBrZXksXG4gICAgICAgIGRvVXBkYXRlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgdmFyIGVsSW4gID0gW10sXG4gICAgICAgICAgICBlbE91dCA9IFtdO1xuXG4gICAgICAgICAgdXBkYXRlW2tleV0uZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50W2tleV0uaW5kZXgodGhpcykgPCAwKSB7XG4gICAgICAgICAgICAgIGVsSW4ucHVzaCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGN1cnJlbnRba2V5XS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHVwZGF0ZVtrZXldLmluZGV4KHRoaXMpIDwgMCkge1xuICAgICAgICAgICAgICBlbE91dC5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGJhY2spIHtcbiAgICAgICAgICAgIGVsSW4gPSBlbEluLnJldmVyc2UoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxPdXQgPSBlbE91dC5yZXZlcnNlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fdHJpZ2dlcihrZXkgKyAnaW4nLCAkKGVsSW4pKTtcbiAgICAgICAgICBzZWxmLl90cmlnZ2VyKGtleSArICdvdXQnLCAkKGVsT3V0KSk7XG5cbiAgICAgICAgICBzZWxmWydfJyArIGtleV0gPSB1cGRhdGVba2V5XTtcbiAgICAgICAgfTtcblxuICAgICAgZm9yIChrZXkgaW4gdXBkYXRlKSB7XG4gICAgICAgIGRvVXBkYXRlKGtleSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG59KGpRdWVyeSwgd2luZG93KSk7XG5cbi8qIVxuICogSmF2YVNjcmlwdCBDb29raWUgdjIuMi4wXG4gKiBodHRwczovL2dpdGh1Yi5jb20vanMtY29va2llL2pzLWNvb2tpZVxuICpcbiAqIENvcHlyaWdodCAyMDA2LCAyMDE1IEtsYXVzIEhhcnRsICYgRmFnbmVyIEJyYWNrXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuOyhmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHR2YXIgcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyO1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKCFyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIpIHtcblx0XHR2YXIgT2xkQ29va2llcyA9IHdpbmRvdy5Db29raWVzO1xuXHRcdHZhciBhcGkgPSB3aW5kb3cuQ29va2llcyA9IGZhY3RvcnkoKTtcblx0XHRhcGkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5Db29raWVzID0gT2xkQ29va2llcztcblx0XHRcdHJldHVybiBhcGk7XG5cdFx0fTtcblx0fVxufShmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbIGkgXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVjb2RlIChzKSB7XG5cdFx0cmV0dXJuIHMucmVwbGFjZSgvKCVbMC05QS1aXXsyfSkrL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0IChjb252ZXJ0ZXIpIHtcblx0XHRmdW5jdGlvbiBhcGkoKSB7fVxuXG5cdFx0ZnVuY3Rpb24gc2V0IChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGF0dHJpYnV0ZXMgPSBleHRlbmQoe1xuXHRcdFx0XHRwYXRoOiAnLydcblx0XHRcdH0sIGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cblx0XHRcdGlmICh0eXBlb2YgYXR0cmlidXRlcy5leHBpcmVzID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpICogMSArIGF0dHJpYnV0ZXMuZXhwaXJlcyAqIDg2NGUrNSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdlJ3JlIHVzaW5nIFwiZXhwaXJlc1wiIGJlY2F1c2UgXCJtYXgtYWdlXCIgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuXHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gYXR0cmlidXRlcy5leHBpcmVzID8gYXR0cmlidXRlcy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgOiAnJztcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdFx0aWYgKC9eW1xce1xcW10vLnRlc3QocmVzdWx0KSkge1xuXHRcdFx0XHRcdHZhbHVlID0gcmVzdWx0O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlKSB7fVxuXG5cdFx0XHR2YWx1ZSA9IGNvbnZlcnRlci53cml0ZSA/XG5cdFx0XHRcdGNvbnZlcnRlci53cml0ZSh2YWx1ZSwga2V5KSA6XG5cdFx0XHRcdGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDNBfDNDfDNFfDNEfDJGfDNGfDQwfDVCfDVEfDVFfDYwfDdCfDdEfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXG5cdFx0XHRrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpXG5cdFx0XHRcdC5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDVFfDYwfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpXG5cdFx0XHRcdC5yZXBsYWNlKC9bXFwoXFwpXS9nLCBlc2NhcGUpO1xuXG5cdFx0XHR2YXIgc3RyaW5naWZpZWRBdHRyaWJ1dGVzID0gJyc7XG5cdFx0XHRmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0aWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc7ICcgKyBhdHRyaWJ1dGVOYW1lO1xuXHRcdFx0XHRpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ29uc2lkZXJzIFJGQyA2MjY1IHNlY3Rpb24gNS4yOlxuXHRcdFx0XHQvLyAuLi5cblx0XHRcdFx0Ly8gMy4gIElmIHRoZSByZW1haW5pbmcgdW5wYXJzZWQtYXR0cmlidXRlcyBjb250YWlucyBhICV4M0IgKFwiO1wiKVxuXHRcdFx0XHQvLyAgICAgY2hhcmFjdGVyOlxuXHRcdFx0XHQvLyBDb25zdW1lIHRoZSBjaGFyYWN0ZXJzIG9mIHRoZSB1bnBhcnNlZC1hdHRyaWJ1dGVzIHVwIHRvLFxuXHRcdFx0XHQvLyBub3QgaW5jbHVkaW5nLCB0aGUgZmlyc3QgJXgzQiAoXCI7XCIpIGNoYXJhY3Rlci5cblx0XHRcdFx0Ly8gLi4uXG5cdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnPScgKyBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdLnNwbGl0KCc7JylbMF07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAoZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJpbmdpZmllZEF0dHJpYnV0ZXMpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGdldCAoa2V5LCBqc29uKSB7XG5cdFx0XHRpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBqYXIgPSB7fTtcblx0XHRcdC8vIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXlcblx0XHRcdC8vIGluIGNhc2UgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLlxuXHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykgOiBbXTtcblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0Zm9yICg7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcblx0XHRcdFx0dmFyIGNvb2tpZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJz0nKTtcblxuXHRcdFx0XHRpZiAoIWpzb24gJiYgY29va2llLmNoYXJBdCgwKSA9PT0gJ1wiJykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZS5zbGljZSgxLCAtMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHZhciBuYW1lID0gZGVjb2RlKHBhcnRzWzBdKTtcblx0XHRcdFx0XHRjb29raWUgPSAoY29udmVydGVyLnJlYWQgfHwgY29udmVydGVyKShjb29raWUsIG5hbWUpIHx8XG5cdFx0XHRcdFx0XHRkZWNvZGUoY29va2llKTtcblxuXHRcdFx0XHRcdGlmIChqc29uKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb29raWUgPSBKU09OLnBhcnNlKGNvb2tpZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGphcltuYW1lXSA9IGNvb2tpZTtcblxuXHRcdFx0XHRcdGlmIChrZXkgPT09IG5hbWUpIHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGtleSA/IGphcltrZXldIDogamFyO1xuXHRcdH1cblxuXHRcdGFwaS5zZXQgPSBzZXQ7XG5cdFx0YXBpLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBnZXQoa2V5LCBmYWxzZSAvKiByZWFkIGFzIHJhdyAqLyk7XG5cdFx0fTtcblx0XHRhcGkuZ2V0SlNPTiA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBnZXQoa2V5LCB0cnVlIC8qIHJlYWQgYXMganNvbiAqLyk7XG5cdFx0fTtcblx0XHRhcGkucmVtb3ZlID0gZnVuY3Rpb24gKGtleSwgYXR0cmlidXRlcykge1xuXHRcdFx0c2V0KGtleSwgJycsIGV4dGVuZChhdHRyaWJ1dGVzLCB7XG5cdFx0XHRcdGV4cGlyZXM6IC0xXG5cdFx0XHR9KSk7XG5cdFx0fTtcblxuXHRcdGFwaS5kZWZhdWx0cyA9IHt9O1xuXG5cdFx0YXBpLndpdGhDb252ZXJ0ZXIgPSBpbml0O1xuXG5cdFx0cmV0dXJuIGFwaTtcblx0fVxuXG5cdHJldHVybiBpbml0KGZ1bmN0aW9uICgpIHt9KTtcbn0pKTsiXSwiZmlsZSI6Im1haW4uanMifQ==
