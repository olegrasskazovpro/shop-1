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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5jbGFzcyBTZXRBY3RpdmVMaW5rcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuXG4gIH1cblxuICAvKipcbiAgICogU2V0IGNsYXNzPVwiYWN0aXZlXCIgdG8gbmF2IGxpbmtzIGZvciBwYWdlIG9wZW5lZFxuICAgKi9cbiAgc2V0QWN0aXZlQ2xhc3MoKSB7XG4gICAgaWYgKHRoaXMuY2hlY2tVcmwoJ3Byb2R1Y3QuaHRtbCcpKSB7XG4gICAgICAkKCcubWVudSBhJykucmVtb3ZlQXR0cignY2xhc3MnKTtcbiAgICAgICQoJy5tZW51PmxpIGFbaHJlZj1cInByb2R1Y3QuaHRtbFwiXScpLmFkZENsYXNzKCdtZW51LWFjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EtbGlzdCBhOmZpcnN0JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EgYTpmaXJzdCcpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2hlY2tVcmwoJ2luZGV4Lmh0bWwnKSkge1xuICAgICAgJCgnLm1lbnU+bGkgYVtocmVmPVwiaW5kZXguaHRtbFwiXScpLmFkZENsYXNzKCdtZW51LWFjdGl2ZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBwYWdlIFVSTCBjb250YWlucyBzb21lIHN0cmluZ1xuICAgKiBAcGFyYW0gc3RyaW5nIHVybCAtIHJlZ0V4cCBjb25kaXRpb25cbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgVVJMIGNvbnRhaW5zIHJlZ0V4cFxuICAgKi9cbiAgY2hlY2tVcmwodXJsKSB7XG4gICAgbGV0IGNoZWNrVXJsID0gbmV3IFJlZ0V4cCh1cmwpO1xuICAgIHJldHVybiBjaGVja1VybC50ZXN0KGRvY3VtZW50LmxvY2F0aW9uLmhyZWYpXG4gIH1cbn1cblxuLyoqXG4gKiBXb3JraW5nIHdpdGgganNvbiBkYXRhYmFzZXMgLSBHRVR0aW5nIGZyb20gYW5kIFBPU1RpbmcgdG8gaXRcbiAqL1xuY2xhc3MgR2V0QW5kUG9zdCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXG5cdH1cblxuXHQvKipcbiAgICogR0VUcyBkYXRhIGZyb20gREJcblx0ICogQHBhcmFtIFN0cmluZyB1cmwgZm9yIEdFVCByZXF1ZXN0XG5cdCAqIEBwYXJhbSBzdWNjZXNzQ2FsbGJhY2sgLSB3aGF0IHRvIGRvIGlmIEdFVCByZXF1ZXN0IHN1Y2NlZWRcblx0ICogQHBhcmFtIGVycm9yQ2FsbGJhY2sgLSB3aGF0IHRvIGRvIGlmIEdFVCByZXF1ZXN0IGZhaWxlZFxuXHQgKi9cblx0Z2V0KHVybCwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogdXJsLFxuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRzdWNjZXNzOiByZXNwb25zZSA9PiB7XG5cdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjay5jYWxsKHRoaXMsIHJlc3BvbnNlKTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogcmVzcG9uc2UgPT4ge1xuXHRcdFx0XHRlcnJvckNhbGxiYWNrKHJlc3BvbnNlKTtcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdCAqIFBPU1RzIGRhdGEgdG8gREJcblx0ICogQHBhcmFtIFN0cmluZyB1cmwgZm9yIFBPU1QgcmVxdWVzdFxuXHQgKiBAcGFyYW0gc3VjY2Vzc0NhbGxiYWNrIC0gd2hhdCB0byBkbyBpZiBQT1NUIHJlcXVlc3Qgc3VjY2VlZFxuXHQgKiBAcGFyYW0gZXJyb3JDYWxsYmFjayAtIHdoYXQgdG8gZG8gaWYgUE9TVCByZXF1ZXN0IGZhaWxlZFxuXHQgKi9cblx0cG9zdCh1cmwsIGRhdGEsIHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IHVybCxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuXHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG5cdFx0XHRzdWNjZXNzOiByZXNwb25zZSA9PiB7XG5cdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjayhyZXNwb25zZSwgZGF0YSk7XG5cdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IHJlc3BvbnNlID0+IHtcblx0XHRcdFx0ZXJyb3JDYWxsYmFjayhyZXNwb25zZSk7XG5cdFx0XHR9XG5cdFx0fSlcblx0fVxufVxuXG5jbGFzcyBDYXJvdXNlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICAkKCcuamNhcm91c2VsJykuamNhcm91c2VsKHtcbiAgICAgIHdyYXA6ICdjaXJjdWxhcidcbiAgICB9KTtcbiAgICAkKCcuamNhcm91c2VsLXByZXYnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcuamNhcm91c2VsJykuamNhcm91c2VsKCdzY3JvbGwnLCAnLT0xJyk7XG4gICAgfSk7XG5cbiAgICAkKCcuamNhcm91c2VsLW5leHQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcuamNhcm91c2VsJykuamNhcm91c2VsKCdzY3JvbGwnLCAnKz0xJyk7XG4gICAgfSk7XG4gIH1cbn1cblxuKGZ1bmN0aW9uICgkKSB7XG4gICQoZnVuY3Rpb24gKCkge1xuICAgIGxldCBwYWdlSW5pdCA9IG5ldyBTZXRBY3RpdmVMaW5rcygpO1xuICAgIHBhZ2VJbml0LnNldEFjdGl2ZUNsYXNzKCk7XG5cbiAgICBsZXQgY2Fyb3VzZWwgPSBuZXcgQ2Fyb3VzZWwoKTtcbiAgICBjYXJvdXNlbC5pbml0KCk7XG5cbiAgICBsZXQgaWZQcm9kdWN0ID0gbmV3IFJlZ0V4cCgncHJvZHVjdC5odG1sJykudGVzdChkb2N1bWVudC5sb2NhdGlvbi5ocmVmKTtcbiAgICBsZXQgaWZTaW5nbGUgPSBuZXcgUmVnRXhwKCdzaW5nbGUuaHRtbCcpLnRlc3QoZG9jdW1lbnQubG9jYXRpb24uaHJlZik7XG4gICAgbGV0IGNvbmZpZyA9IHtcbiAgICAgIHVybDoge1xuICAgICAgICBwcm9kdWN0czogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9wcm9kdWN0cycsXG4gICAgICAgIGZpbHRlcnM6ICdodHRwOi8vbG9jYWxob3N0OjMwMDMvZmlsdGVycycsXG4gICAgICAgIGZpbHRlcmVkUHJvZHVjdHM6ICdodHRwOi8vbG9jYWxob3N0OjMwMDMvZmlsdGVyZWRQcm9kdWN0cycsXG4gICAgICAgIGNhcnQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDIvY2FydCcsXG4gICAgICB9LFxuICAgICAgc2VsZWN0b3JzOiB7XG5cdFx0XHRcdGFjdGl2ZTogXCJhY3RpdmVcIixcbiAgICAgICAgYWRkVG9DYXJ0OiAnLmFkZFRvQ2FydCcsXG4gICAgICAgIGNhcnQ6ICcuY2FydC1jb250YWluZXInLFxuXHRcdFx0XHRkZWw6ICcuY2FydC1pdGVtLWRlbCcsXG5cdFx0XHRcdGRpc3BsYXlOb25lOiAndGVtcGxhdGUnLFxuXHRcdFx0XHRmZWF0dXJlZFByb2R1Y3RzOiBcIi5mZWF0dXJlZC1wcm9kdWN0c1wiLFxuXHRcdFx0XHRocmVmOiAnLmNhcnQtaXRlbS1ocmVmJyxcbiAgICAgICAgaW1nOiAnLmNhcnQtaXRlbS1pbWcnLFxuXHRcdFx0XHRpdGVtOiAnLmNhcnQtaXRlbS50ZW1wbGF0ZScsXG4gICAgICAgIG5hbWU6ICcuY2FydC1pdGVtLW5hbWUnLFxuICAgICAgICBxdWFudGl0eTogJy5jYXJ0LWl0ZW0tcXVhbnRpdHknLFxuICAgICAgICBwcmljZTogJy5jYXJ0LWl0ZW0tcHJpY2UnLFxuICAgICAgICByYXRlOiAnLnJhdGUnLFxuICAgICAgICBzdWJ0b3RhbDogJy5jYXJ0LWl0ZW0tc3VidG90YWwnLFxuICAgICAgICB0b3RhbDogJy5jYXJ0LXRvdGFsJyxcblx0XHRcdFx0b29wczogXCIjb29wc1wiLFxuICAgICAgICBwYWdpbmF0aW9uOiAnI3BhZ2luYXRpb24nLFxuICAgICAgICBwYWdlTDogJy5wYWdlLWxlZnQtYnV0dG9uJyxcbiAgICAgICAgcGFnZVI6ICcucGFnZS1yaWdodC1idXR0b24nLFxuICAgICAgICBwcm9kdWN0c0RpdjogXCIucHJvZHVjdC1ib3hcIixcbiAgICAgICAgcHJvZHVjdEl0ZW06IFwiLnByb2R1Y3QtYm94LWFcIixcbiAgICAgICAgcHJvZHVjdEhyZWY6IFwiLnByb2R1Y3RfaHJlZlwiLFxuICAgICAgICBwcm9kdWN0TmFtZTogXCIucHJvZHVjdC1uYW1lXCIsXG4gICAgICAgIHByb2R1Y3RQcmljZTogXCIucHJvZHVjdC1wcmljZVwiLFxuICAgICAgICBwcm9kdWN0SW1nOiBcIi5wcm9kdWN0LWltZ1wiLFxuXHRcdFx0XHRyZWxhdGVkUHJvZDogXCIueW91LW1heS1saWtlXCIsXG5cdFx0XHRcdHNpbmdsZUFkZFRvQ2FydDogXCIuc2luZ2xlLWRlc2MtYnV0dG9uXCIsXG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChpZlByb2R1Y3QpIHtcbiAgICAgIGxldCBmaWx0ZXJzSGFuZGxlID0gbmV3IEZpbHRlcnNIYW5kbGUoKTtcbiAgICAgIGZpbHRlcnNIYW5kbGUuaW5pdCgwLCAxMDAwLCAxLCBjb25maWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgY2FydCA9IG5ldyBDYXJ0KCk7XG4gICAgICBjYXJ0LmluaXQoY29uZmlnKTtcbiAgICB9XG5cbiAgICBpZigkKCcuZmVhdHVyZWQtcHJvZHVjdHMnKVswXSl7XG4gICAgXHRsZXQgcmVuZGVyRmlsdGVyZWRQcm9kdWN0cyA9IG5ldyBSZW5kZXJGaWx0ZXJlZFByb2R1Y3RzKGNvbmZpZywgJ2ZlYXR1cmVkJyk7XG4gICAgXHRyZW5kZXJGaWx0ZXJlZFByb2R1Y3RzLmluaXQoKTtcblx0XHR9IGVsc2UgaWYgKCQoJy55b3UtbWF5LWxpa2UnKVswXSl7XG5cdFx0XHRsZXQgcmVuZGVyRmlsdGVyZWRQcm9kdWN0cyA9IG5ldyBSZW5kZXJGaWx0ZXJlZFByb2R1Y3RzKGNvbmZpZywgJ3JlbGF0ZWQnKTtcblx0XHRcdHJlbmRlckZpbHRlcmVkUHJvZHVjdHMuaW5pdCgpO1xuXHRcdH1cbiAgfSlcbn0pKGpRdWVyeSk7XG5cblxuY2xhc3MgUmVuZGVyRmlsdGVyZWRQcm9kdWN0cyB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZywgZmlsdGVyKSB7XG5cdFx0dGhpcy5jb25maWcgPSBjb25maWc7XG5cdFx0dGhpcy5maWx0ZXIgPSBmaWx0ZXI7XG5cdFx0dGhpcy5maWx0ZXJlZCA9IFtdO1xuXHR9XG5cblx0aW5pdCgpIHtcblx0XHR0aGlzLmdldENhdGFsb2codGhpcy5jb25maWcsIHRoaXMuZmlsdGVyKTtcblx0fVxuXG5cdGdldENhdGFsb2coY29uZmlnLCBmaWx0ZXIpIHtcblx0XHRsZXQgdXJsID0gY29uZmlnLnVybC5wcm9kdWN0cztcblx0XHRsZXQgc3VjY2Vzc0NhbGxiYWNrID0gY2F0YWxvZyA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnMTggLSBHb3QgZmlsdGVyZWQgY2F0YWxvZyBmcm9tIERCJyk7XG5cdFx0XHR0aGlzLmZpbHRlckFuZFJlbmRlcihjb25maWcsIGZpbHRlciwgY2F0YWxvZyk7XG5cdFx0fTtcblx0XHRsZXQgZXJyb3JDYWxsYmFjayA9IHJlc3BvbnNlID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCcxOCAtIE1ldGhvZCBnZXRDYXRhbG9nKCkgb2YgZ2V0dGluZyBjYXRhbG9nIEZBSUxFRCcpO1xuXHRcdH07XG5cblx0XHRsZXQgZ2V0QW5kUG9zdCA9IG5ldyBHZXRBbmRQb3N0KCk7XG5cdFx0Z2V0QW5kUG9zdC5nZXQodXJsLCBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbHRlciBjYXRhbG9nIGFuZCByZW5kZXIgZmlsdGVyZWQgcHJvZHVjdHMgYXJyYXlcblx0ICogQHBhcmFtIFt7fV0gY2F0YWxvZyAtIGFycmF5IG9mIGNhdGFsb2cgcHJvZHVjdHNcblx0ICogQHBhcmFtIFN0cmluZyBmaWx0ZXIgLSBmaWx0ZXIgdmFsdWVcblx0ICogQHBhcmFtIHt9IGNvbmZpZyAtIE9iamVjdCBvZiBjb25maWdcblx0ICovXG5cdGZpbHRlckFuZFJlbmRlcihjb25maWcsIGZpbHRlciwgY2F0YWxvZykge1xuXHRcdGxldCBmaWx0ZXJlZCA9IFtdO1xuXG5cdFx0aWYgKGZpbHRlciA9PT0gJ2ZlYXR1cmVkJykge1xuXHRcdFx0ZmlsdGVyZWQgPSB0aGlzLmZpbHRlckJ5VGFnKGNhdGFsb2csIGZpbHRlcik7XG5cdFx0fSBlbHNlIGlmIChmaWx0ZXIgPT09ICdyZWxhdGVkJykge1xuXHRcdFx0ZmlsdGVyZWQgPSB0aGlzLmZpbHRlclJlbGF0ZWQoY2F0YWxvZyk7XG5cdFx0fVxuXG5cdFx0bGV0IHJlbmRlciA9IG5ldyBSZW5kZXJQcm9kdWN0cyhjb25maWcsIGZpbHRlcmVkKTtcblx0XHRyZW5kZXIuaW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbHRlciBvdXQgZnJvbSBjYXRhbG9nIHRhZ2VkIHByb2R1Y3RzXG5cdCAqIEBwYXJhbSB7fSBjYXRhbG9nIC0gY2F0YWxvZyBvYmplY3Rcblx0ICogQHBhcmFtIFN0cmluZyB0YWcgLSB0aGUgdGFnIHdlIGFyZSBsb29raW5nIGZvclxuXHQgKi9cblx0ZmlsdGVyQnlUYWcoY2F0YWxvZywgdGFnKSB7XG5cdFx0bGV0IGZpbHRlcmVkID0gW107XG5cdFx0Zm9yIChjb25zdCBpdGVtIG9mIGNhdGFsb2cpIHtcblx0XHRcdGlmICh0aGlzLmhhc1RhZyhpdGVtLnRhZywgdGFnKSkge1xuXHRcdFx0XHRmaWx0ZXJlZC5wdXNoKGl0ZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmlsdGVyZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgcHJvZHVjdCdzIHRhZyBzdHJpbmcgY29udGFpbnMgbmVlZGVkIHRhZ1xuXHQgKiBAcGFyYW0gdGFncyAtIHN0cmluZyBvZiBwcm9kdWN0IHRhZ3Ncblx0ICogQHBhcmFtIHJlZ0V4cCAtIHN0cmluZyBvZiB0YWcgd2UgbmVlZCB0byBmaW5kXG5cdCAqIEByZXR1cm5zIHsqfSAtIHRydWUgaWYgdGFnIGZvdW5kXG5cdCAqL1xuXHRoYXNUYWcodGFncywgdGFnKXtcblx0XHRsZXQgcmVnRXhwID0gbmV3IFJlZ0V4cCh0YWcpO1xuXHRcdHJldHVybiByZWdFeHAudGVzdCh0YWdzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgb3V0IGZyb20gY2F0YWxvZyByZWxhdGVkIHByb2R1Y3RzXG5cdCAqIEBwYXJhbSBjYXRhbG9nXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gcmVsYXRlZCBwcm9kdWN0c1xuXHQgKi9cblx0ZmlsdGVyUmVsYXRlZChjYXRhbG9nKSB7XG5cdFx0Ly8g0L3QsNC50YLQuCDQutC90L7Qv9C60YMg0LTQvtCx0LDQstC70LXQvdC40Y8g0LIg0LrQvtGA0LfQuNC90YMg0YLQvtCy0LDRgNCwIFNpbmdsZSDQuCDQstC30Y/RgtGMINGBINC90LXQtSBpZFxuXHRcdGxldCBpZCA9IHRoaXMuZ2V0U2luZ2xlUHJvZHVjdElkKCk7XG5cdFx0bGV0IHByb2QgPSB0aGlzLmZpbmRQcm9kdWN0QnlJZChjYXRhbG9nLCBpZCk7XG5cdFx0bGV0IHJlbGF0ZWRQcm9kSWQgPSBwcm9kLnJlbGF0ZWRQcm9kSWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5nZXRSZWxhdGVkUHJvZHVjdHMoY2F0YWxvZywgcmVsYXRlZFByb2RJZCk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZCBhZGRUb0NhcnQgYnV0dG9uIG9mIHNpbmdsZSBwYWdlJ3MgcHJvZHVjdCBhbmQgcmV0dXJucyBpdHMgaWRcblx0ICogQHJldHVybnMge251bWJlcn0gaWQgb2YgcHJvZHVjdHMgb2Ygc2luZ2xlIHBhZ2Vcblx0ICovXG5cdGdldFNpbmdsZVByb2R1Y3RJZCgpe1xuXHRcdHJldHVybiArJCh0aGlzLmNvbmZpZy5zZWxlY3RvcnMuc2luZ2xlQWRkVG9DYXJ0KVswXS5pZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgb3V0IG9mIGNhdGFsb2cgcmVsYXRlZCBwcm9kdWN0c1xuXHQgKiBAcGFyYW0gY2F0YWxvZyAtIHByb2R1Y3QgY2F0YWxvZyBvYmplY3Rcblx0ICogQHBhcmFtIHJlbGF0ZWRQcm9kSWQgLSBhcnJheSBvZiByZWxhdGVkIHByb2R1Y3RzIGlkJ3Ncblx0ICogQHJldHVybnMge0FycmF5fSByZWxhdGVkIHByb2R1Y3RzXG5cdCAqL1xuXHRnZXRSZWxhdGVkUHJvZHVjdHMoY2F0YWxvZywgcmVsYXRlZFByb2RJZCl7XG5cdFx0bGV0IHJlbFByb2QgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGlkIG9mIHJlbGF0ZWRQcm9kSWQpIHtcblx0XHRcdGxldCBvbmVSZWxhdGVkUHJvZCA9IHRoaXMuZmluZFByb2R1Y3RCeUlkKGNhdGFsb2csIGlkKTtcblx0XHRcdHJlbFByb2QucHVzaChvbmVSZWxhdGVkUHJvZCk7XG5cdFx0fVxuXHRcdHJldHVybiByZWxQcm9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbHRlciBjYXRhbG9nLCBjb21wYXJpbmcgY2F0YWxvZyBpdGVtIGlkIHdpdGggaWQgZnJvbSBwYXJhbXNcblx0ICogQHBhcmFtIHt9IGNhdGFsb2cgLSBjYXRhbG9nIHdlIG5lZWQgdG8gZmlsdGVyXG5cdCAqIEBwYXJhbSBJbnQgaWQgLSBpZCB2YWx1ZSBvZiBjYXRhbG9nIGl0ZW0gd2UgbmVlZCB0byBmaW5kXG5cdCAqIEByZXR1cm5zIHt9fEJvb2xlYW4gaXRlbSBvZiBjYXRhbG9nIG9yIGZhbHNlIGlmIG5vdCBmb3VuZFxuXHQgKi9cblx0ZmluZFByb2R1Y3RCeUlkKGNhdGFsb2csIGlkKSB7XG5cdFx0Zm9yIChjb25zdCBpdGVtIG9mIGNhdGFsb2cpIHtcblx0XHRcdGlmIChpdGVtLmlkID09PSBpZCkge1xuXHRcdFx0XHRyZXR1cm4gaXRlbTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuXG4vKipcbiAqIENvbGxlY3QgZnJvbSBET00gYWxsIHByb2R1Y3QncyBmaWx0ZXJzIGFuZCBzZW5kIGl0IHRvIHNlcnZlciAoanNvbilcbiAqL1xuY2xhc3MgRmlsdGVyc0hhbmRsZSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuZmlsdGVycyA9IHtcblx0XHRcdGNhdEl0ZW06IG51bGwsIC8vIHN0cmluZ1xuXHRcdFx0Y2F0ZWdvcnk6IG51bGwsIC8vICdhbGwnIG9yIHN0cmluZ1xuXHRcdFx0YnJhbmQ6IG51bGwsIC8vICdhbGwnIG9yIHN0cmluZ1xuXHRcdFx0ZGVzaWduZXI6IG51bGwsIC8vICdhbGwnIG9yIHN0cmluZ1xuXHRcdFx0c2l6ZTogWzBdLCAvLyBbMF0gb3IgW2EsICguLi4pXVxuXHRcdFx0cHJpY2U6IFtdLCAvLyBbYSwgYl1cblx0XHRcdHNob3dCeTogbnVsbCxcblx0XHR9O1xuXHRcdHRoaXMuY29uZmlnID0ge1xuXHRcdFx0dXJsOiB7fSxcblx0XHRcdHNlbGVjdG9yczoge30sXG5cdFx0fTtcblx0fVxuXG5cdGluaXQobWluLCBtYXgsIHN0ZXAsIGNvbmZpZykge1xuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xuXHRcdHRoaXMuc2V0Q29va2llc0ZpbHRlcnMoKTtcblx0XHR0aGlzLmluaXRQcmljZVNsaWRlcihtaW4sIG1heCwgc3RlcCk7XG5cdFx0dGhpcy5maWx0ZXJzLmNhdEl0ZW0gPSB0aGlzLmdldENhdEl0ZW0oKTtcblx0XHR0aGlzLmZpbHRlcnMuY2F0ZWdvcnkgPSB0aGlzLmdldENhdGVnb3J5KCk7XG5cdFx0dGhpcy5maWx0ZXJzLmJyYW5kID0gdGhpcy5nZXRCcmFuZCgpO1xuXHRcdHRoaXMuZmlsdGVycy5kZXNpZ25lciA9IHRoaXMuZ2V0RGVzaWduZXIoKTtcblx0XHR0aGlzLnNldFNpemVDaGVja2JveEhhbmRsZXIoKTtcblx0XHR0aGlzLmZpbHRlcnMucHJpY2UgPSB0aGlzLmdldFByaWNlUmFuZ2UoKTtcblx0XHR0aGlzLnNldFNob3dCeUhhbmRsZXIoKTtcblx0XHR0aGlzLnBvc3RGaWx0ZXJzKHRoaXMuZmlsdGVycyk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0dGluZyBpbiBET00gYWxsIGZpbHRlcnMgZnJvbSBjb29raWVzXG5cdCAqL1xuXHRzZXRDb29raWVzRmlsdGVycygpIHtcblx0XHR0aGlzLmdldENvb2tpZXNGaWx0ZXJzKCk7XG5cdFx0dGhpcy5zZXRTaXplQ2hlY2tlZCgpO1xuXHRcdHRoaXMuc2V0U2hvd0J5U2VsZWN0ZWQodGhpcy5maWx0ZXJzLnNob3dCeSk7XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZSBpbiB0aGlzLmZpbHRlcnMgYWxsIGZpbHRlcnMgZnJvbSBjb29raWVzXG5cdCAqL1xuXHRnZXRDb29raWVzRmlsdGVycygpIHtcblx0XHRjb25zdCBjb29raWVzRmlsdGVycyA9IENvb2tpZXMuZ2V0KCk7XG5cdFx0aWYgKGNvb2tpZXNGaWx0ZXJzLnByaWNlKSB7XG5cdFx0XHRjb29raWVzRmlsdGVycy5wcmljZSA9IGNvb2tpZXNGaWx0ZXJzLnByaWNlLnNwbGl0KCdfJyk7XG5cdFx0fVxuXHRcdGlmIChjb29raWVzRmlsdGVycy5zaXplKSB7XG5cdFx0XHRjb29raWVzRmlsdGVycy5zaXplID0gY29va2llc0ZpbHRlcnMuc2l6ZS5zcGxpdCgnXycpO1xuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgcHJvcEMgaW4gY29va2llc0ZpbHRlcnMpIHtcblx0XHRcdGZvciAoY29uc3QgcHJvcEYgaW4gdGhpcy5maWx0ZXJzKSB7XG5cdFx0XHRcdGlmIChwcm9wQyA9PT0gcHJvcEYpIHtcblx0XHRcdFx0XHR0aGlzLmZpbHRlcnNbcHJvcEZdID0gY29va2llc0ZpbHRlcnNbcHJvcENdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHRpbmcgdXAgcHJpY2UtcmFuZ2Ugc2xpZGVyLlxuXHQgKiBJZiBwcmljZSBjb29raWUgaXMgLSBzZXQgbWluVmFsIGFuZCBtYXhWYWwgZnJvbSBjb29raWVzXG5cdCAqL1xuXHRpbml0UHJpY2VTbGlkZXIobWluLCBtYXgsIHN0ZXApIHtcblx0XHRsZXQgbWluVmFsLCBtYXhWYWw7XG5cblx0XHRpZiAodGhpcy5maWx0ZXJzLnByaWNlLmxlbmd0aCkge1xuXHRcdFx0bWluVmFsID0gdGhpcy5maWx0ZXJzLnByaWNlWzBdO1xuXHRcdFx0bWF4VmFsID0gdGhpcy5maWx0ZXJzLnByaWNlWzFdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtaW5WYWwgPSBtYXggKiAwLjA1O1xuXHRcdFx0bWF4VmFsID0gbWF4ICogMC40O1xuXHRcdH1cblxuXHRcdCQoJy5wcmljZS1yYW5nZV9fc2xpZGVyJykuc2xpZGVyKHtcblx0XHRcdHJhbmdlOiB0cnVlLFxuXHRcdFx0dmFsdWVzOiBbbWluVmFsLCBtYXhWYWxdLFxuXHRcdFx0bWluOiBtaW4sXG5cdFx0XHRtYXg6IG1heCxcblx0XHRcdHN0ZXA6IHN0ZXAsXG5cdFx0XHRzbGlkZTogKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnNob3dQcmljZVJhbmdlVmFsdWVzKCk7XG5cdFx0XHR9LFxuXHRcdFx0Y2hhbmdlOiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuc2hvd1ByaWNlUmFuZ2VWYWx1ZXMoKTtcblx0XHRcdFx0dGhpcy5maWx0ZXJzLnByaWNlID0gdGhpcy5nZXRQcmljZVJhbmdlKCk7XG5cdFx0XHRcdHRoaXMuc2V0Q29va2llcygncHJpY2UnLCB0aGlzLmZpbHRlcnMucHJpY2Uuam9pbignXycpKTtcblx0XHRcdFx0JCgnI29vcHMnKS5hZGRDbGFzcygndGVtcGxhdGUnKTtcblx0XHRcdFx0dGhpcy5wb3N0RmlsdGVycyh0aGlzLmZpbHRlcnMpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuc2hvd1ByaWNlUmFuZ2VWYWx1ZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93L1VwZGF0ZSBtaW4gYW5kIG1heCBwcmljZSByYW5nZSB2YWx1ZXNcblx0ICovXG5cdHNob3dQcmljZVJhbmdlVmFsdWVzKCkge1xuXHRcdCQoJyNwcmljZS1taW4nKS50ZXh0KHRoaXMuZ2V0UHJpY2VSYW5nZSgpWzBdKTtcblx0XHQkKCcjcHJpY2UtbWF4JykudGV4dCh0aGlzLmdldFByaWNlUmFuZ2UoKVsxXSk7XG5cdH1cblxuXHRnZXRDYXRJdGVtKCkge1xuXHRcdHJldHVybiAkKCcubWVudS1hY3RpdmUnKS50ZXh0KClcblx0fVxuXG5cdGdldENhdGVnb3J5KCkge1xuXHRcdGlmICgkKCcubWVudSAuYWN0aXZlJylbMF0pIHtcblx0XHRcdHJldHVybiAkKCcubWVudSAuYWN0aXZlJykudGV4dCgpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAnYWxsJ1xuXHRcdH1cblx0fVxuXG5cdGdldEJyYW5kKCkge1xuXHRcdGlmICgkKCcjYnJhbmQgLmFjdGl2ZScpWzBdKSB7XG5cdFx0XHRjb25zb2xlLmxvZygkKCcjYnJhbmQgLmFjdGl2ZScpLnRleHQoKSk7XG5cdFx0XHRyZXR1cm4gJCgnI2JyYW5kIC5hY3RpdmUnKS50ZXh0KClcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuICdhbGwnXG5cdFx0fVxuXHR9XG5cblx0Z2V0RGVzaWduZXIoKSB7XG5cdFx0aWYgKCQoJyNkZXNpZ25lciAuYWN0aXZlJylbMF0pIHtcblx0XHRcdHJldHVybiAkKCcjZGVzaWduZXIgLmFjdGl2ZScpLnRleHQoKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gJ2FsbCdcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSWYgKG5vIHNpemUgY29va2llKSBzZXQgYWxsIHNpemVzLCBlbHNlIHNldCBzaXplcyBmcm9tIGNvb2tpZXNcblx0ICovXG5cdHNldFNpemVDaGVja2VkKCkge1xuXHRcdGlmIChDb29raWVzLmdldCgnc2l6ZScpKSB7XG5cdFx0XHRsZXQgY29va2llc1NpemUgPSBDb29raWVzLmdldCgnc2l6ZScpLnNwbGl0KCdfJyk7IC8vIHR1cm4gc2l6ZSBjb29raWUgdG8gYXJyYXlcblx0XHRcdC8vIGZpbmQgYWxsIGNoZWNrYm94ZXMgd2hpY2ggZGF0YS1uYW1lIGlzIG9uZSBvZiBjb29raWVzU2l6ZSBhbmQgc2V0IGl0IGNoZWNrZWRcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY29va2llc1NpemUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCAkKCcuc2l6ZS1jaGVja2JveCcpLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0aWYgKGNvb2tpZXNTaXplW2ldID09PSAkKCcuc2l6ZS1jaGVja2JveCcpW2pdLmRhdGFzZXQubmFtZSkge1xuXHRcdFx0XHRcdFx0JCgnLnNpemUtY2hlY2tib3gnKVtqXS5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsIFwiXCIpO1xuXHRcdFx0XHRcdFx0JCgnLnNpemUtY2hlY2tib3gnKVtqXS5jbGFzc0xpc3QuYWRkKFwiY2hlY2tlZFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCAkKCcuc2l6ZS1jaGVja2JveCcpLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdCQoJy5zaXplLWNoZWNrYm94Jylbal0uc2V0QXR0cmlidXRlKFwiY2hlY2tlZFwiLCBcIlwiKTtcblx0XHRcdFx0JCgnLnNpemUtY2hlY2tib3gnKVtqXS5jbGFzc0xpc3QuYWRkKFwiY2hlY2tlZFwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0IGhhbmRsZXJzIG9mIHNpemUgY2hlY2tib3hlcyBzdGF0ZSBjaGFuZ2luZ1xuXHQgKiBVcGRhdGVzIHNpemUgY29va2llLCB0aGlzLmZpbHRlcnMgYW5kIHNlbmRzIFBPU1QgdG8gc2VydmVyXG5cdCAqL1xuXHRzZXRTaXplQ2hlY2tib3hIYW5kbGVyKCkge1xuXHRcdGxldCB0aGF0ID0gdGhpcztcblx0XHQvLyBzZXQgdXBkYXRlIHNpemVzIEFyciBmb3IgZXZlcnkgc2l6ZSBjaGVja2JveCBjbGlja1xuXHRcdCQoJy5zaXplLWNoZWNrYm94Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdjaGVja2VkJyk7IC8vIGlmIENoZWNrZWQgc2V0IGNsYXNzICdjaGVja2VkJyBhbmQgYmFja1xuXHRcdFx0JCgnI29vcHMnKS5hZGRDbGFzcygndGVtcGxhdGUnKTtcblxuXHRcdFx0aWYgKCQoJy5jaGVja2VkJykubGVuZ3RoKSB7XG5cdFx0XHRcdGxldCBzaXplcyA9IFtdOyAvLyBjbGVhciBzaXplIEFyclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8ICQoJy5jaGVja2VkJykubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRzaXplcy5wdXNoKCQoJy5jaGVja2VkJylbaV0uZGF0YXNldC5uYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGF0LmZpbHRlcnMuc2l6ZSA9IHNpemVzO1xuXHRcdFx0XHR0aGF0LnNldENvb2tpZXMoJ3NpemUnLCBzaXplcy5qb2luKCdfJykpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhhdC5maWx0ZXJzLnNpemUgPSBbMF07XG5cdFx0XHR9XG5cdFx0XHR0aGF0LnBvc3RGaWx0ZXJzKHRoYXQuZmlsdGVycyk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBwcmljZSBzbGlkZXIgcmFuZ2Vcblx0ICogQHJldHVybnMgW10ge2pRdWVyeX1cblx0ICovXG5cdGdldFByaWNlUmFuZ2UoKSB7XG5cdFx0cmV0dXJuICQoJy5wcmljZS1yYW5nZV9fc2xpZGVyJykuc2xpZGVyKCd2YWx1ZXMnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIFwic2VsZWN0ZWRcIiBhdHRyaWJ1dGUgZm9yIHNob3dCeSBvcHRpb25cblx0ICogQHBhcmFtIEludCB2YWx1ZSB2YWx1ZSBvZiBvcHRpb24ncyB2YWx1ZSBwcm9wZXJ0eVxuXHQgKi9cblx0c2V0U2hvd0J5U2VsZWN0ZWQodmFsdWUpIHtcblx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdHRoaXMuZmlsdGVycy5zaG93QnkgPSAzO1xuXHRcdFx0JChgI3Nob3dCeSBvcHRpb25bdmFsdWU9XCIzXCJdYClbMF0uc2V0QXR0cmlidXRlKFwic2VsZWN0ZWRcIiwgXCJcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoYCNzaG93Qnkgb3B0aW9uOnNlbGVjdGVkYCkucmVtb3ZlQXR0cihcInNlbGVjdGVkXCIpO1xuXHRcdFx0JChgI3Nob3dCeSBvcHRpb25bdmFsdWU9JHt2YWx1ZX1dYClbMF0uc2V0QXR0cmlidXRlKFwic2VsZWN0ZWRcIiwgXCJcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNob3dCeSBzZWxlY3RvciBjaGFuZ2UgaGFuZGxlci4gSWYgY2hhbmdlZDpcblx0ICogcmVtb3ZlIFwic2VsZWN0ZWRcIiBhdHRyLFxuXHQgKiB1cGRhdGUgdGhpcy5maWx0ZXJzLnNob3dCeSxcblx0ICogdXBkYXRlIHNob3dCeSBpbiBDb29raWVzXG5cdCAqIHBvc3QgdXBkYXRlZCBmaWx0ZXJzIHRvIHNlcnZlclxuXHQgKi9cblx0c2V0U2hvd0J5SGFuZGxlcigpIHtcblx0XHQkKCcjc2hvd0J5Jykub24oJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdCQoYCNzaG93Qnkgb3B0aW9uW3NlbGVjdGVkXWApLnJlbW92ZUF0dHIoXCJzZWxlY3RlZFwiKTtcblx0XHRcdHRoaXMuZmlsdGVycy5zaG93QnkgPSArJCgnI3Nob3dCeSBvcHRpb246c2VsZWN0ZWQnKS50ZXh0KCk7XG5cdFx0XHQkKGAjc2hvd0J5IG9wdGlvblt2YWx1ZT0ke3RoaXMuZmlsdGVycy5zaG93Qnl9XWApWzBdLnNldEF0dHJpYnV0ZShcInNlbGVjdGVkXCIsIFwiXCIpO1xuXG5cdFx0XHR0aGlzLnNldENvb2tpZXMoJ3Nob3dCeScsIHRoaXMuZmlsdGVycy5zaG93QnkpO1xuXHRcdFx0dGhpcy5wb3N0RmlsdGVycyh0aGlzLmZpbHRlcnMpO1xuXHRcdH0pXG5cdH1cblxuXHRzZXRDb29raWVzKG5hbWUsIHZhbCkge1xuXHRcdENvb2tpZXMuc2V0KG5hbWUsIHZhbCwge2V4cGlyZXM6IDd9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kIGZpbHRlcnMgdG8gc2VydmVyXG5cdCAqIEBwYXJhbSB7fSBkYXRhIC0gZmlsdGVyc1xuXHQgKi9cblx0cG9zdEZpbHRlcnMoZGF0YSkge1xuXHRcdGxldCBnZXRBbmRQb3N0ID0gbmV3IEdldEFuZFBvc3QoKTtcblxuXHRcdGxldCB1cmwgPSB0aGlzLmNvbmZpZy51cmwuZmlsdGVycztcblx0XHRsZXQgc3VjY2Vzc0NhbGxiYWNrID0gKCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJ1Byb2R1Y3QgZmlsdGVycyB3YXMgU0VOVCB0byBEQicpO1xuXHRcdFx0bGV0IHNlcnZlckZpbHRlclByb2R1Y3RzID0gbmV3IFNlcnZlckZpbHRlclByb2R1Y3RzKCk7XG5cdFx0XHRzZXJ2ZXJGaWx0ZXJQcm9kdWN0cy5pbml0KHRoaXMuY29uZmlnKTtcblx0XHR9O1xuXHRcdGxldCBlcnJvckNhbGxiYWNrID0gKCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJ1Byb2R1Y3QgZmlsdGVycyBzZW5kaW5nIHRvIERCIEZBSUxFRCcpO1xuXHRcdH07XG5cblx0XHRnZXRBbmRQb3N0LnBvc3QodXJsLCBkYXRhLCBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuXG5cdH1cbn1cblxuLyoqXG4gKiBTZXJ2ZXIgc2lkZSB3b3JrIGVtdWxhdGlvbiAtIGZpbHRlcnMgY2F0YWxvZyB3aXRoIGZpbHRlcnMgYW5kIHNhdmUgcmVzdWx0IHRvIERCXG4gKi9cbmNsYXNzIFNlcnZlckZpbHRlclByb2R1Y3RzIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5maWx0ZXJzID0ge307XG5cdFx0dGhpcy5jYXRhbG9nID0ge307XG5cdFx0dGhpcy5jb25maWcgPSB7XG5cdFx0XHR1cmw6IHt9LFxuXHRcdFx0c2VsZWN0b3JzOiB7fSxcblx0XHR9O1xuXHR9XG5cblx0aW5pdChjb25maWcpIHtcblx0XHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcblx0XHR0aGlzLmdldEZpbHRlcnMoKVxuXHR9XG5cblx0Z2V0RmlsdGVycygpIHtcblx0XHRsZXQgZ2V0QW5kUG9zdCA9IG5ldyBHZXRBbmRQb3N0KCk7XG5cdFx0bGV0IHVybCA9IHRoaXMuY29uZmlnLnVybC5maWx0ZXJzO1xuXHRcdGxldCBzdWNjZXNzQ2FsbGJhY2sgPSByZXNwb25zZSA9PiB7XG5cdFx0XHR0aGlzLmZpbHRlcnMgPSByZXNwb25zZTtcblx0XHRcdGNvbnNvbGUubG9nKCczMDIgLSBTZXJ2ZXIgZ290IGZpbHRlcnMgZnJvbSBEQicpO1xuXHRcdFx0dGhpcy5nZXRDYXRhbG9nKCk7XG5cdFx0fTtcblx0XHRsZXQgZXJyb3JDYWxsYmFjayA9IHJlc3BvbnNlID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCczMDIgLSBNZXRob2QgZ2V0RmlsdGVycygpIG9mIGdldHRpbmcgZmlsdGVycyBGQUlMRUQnKTtcblx0XHR9O1xuXG5cdFx0Z2V0QW5kUG9zdC5nZXQodXJsLCBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuXHR9XG5cblx0Z2V0Q2F0YWxvZygpIHtcblx0XHRsZXQgZ2V0QW5kUG9zdCA9IG5ldyBHZXRBbmRQb3N0KCk7XG5cblx0XHRsZXQgdXJsID0gdGhpcy5jb25maWcudXJsLnByb2R1Y3RzO1xuXHRcdGxldCBzdWNjZXNzQ2FsbGJhY2sgPSByZXNwb25zZSA9PiB7XG5cdFx0XHR0aGlzLmNhdGFsb2cgPSByZXNwb25zZTtcblx0XHRcdGNvbnNvbGUubG9nKCczMTYgLSBTZXJ2ZXIgZ290IHByb2R1Y3RzIGNhdGFsb2cgZnJvbSBEQicpO1xuXHRcdFx0dGhpcy5maWx0ZXJDYXRhbG9nKCk7XG5cdFx0fTtcblxuXHRcdGxldCBlcnJvckNhbGxiYWNrID0gcmVzcG9uc2UgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJzMxNiAtIE1ldGhvZCBnZXRDYXRhbG9nKCkgb2YgZ2V0dGluZyBjYXRhbG9nIEZBSUxFRCcpO1xuXHRcdH07XG5cblx0XHRnZXRBbmRQb3N0LmdldCh1cmwsIHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG5cdH1cblxuXHQvKipcblx0ICogRmlsdGVycyBhbGwgcHJvZHVjdHMgaW4gY2F0YWxvZyB3aXRoIGV2ZXJ5IGZpbHRlcnMgcHJvcGVydHkgYW5kIHB1dCByZXN1bHQgdG8gdGhpcy5maWx0ZXJlZENhdGFsb2dcblx0ICovXG5cdGZpbHRlckNhdGFsb2coKSB7XG5cdFx0bGV0IGZpbHRlcmVkQ2F0YWxvZyA9IFtdO1xuXHRcdHRoaXMucG9zdEZpbHRlcmVkKHt9KTsgLy8gY2xlYW4gcHJldmlvdXMgZmlsdGVyZWQgY2F0YWxvZ1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNhdGFsb2cubGVuZ3RoOyBpKyspIHsgLy8gYW5kIGZpbHRlciB3aXRoIHRoZW0gY2F0YWxvZy4gSW50ZXJtZWRpYXRlIHJlc3VsdHMgcHV0XG5cdFx0XHQvLyBjaGVjayBpZiB0aGUgcHJvZHVjdCBzYXRpc2Z5IGFsbCBmaWx0ZXJzXG5cdFx0XHRpZiAoXG5cdFx0XHRcdFx0dGhpcy5jaGVja1Byb2RXaXRoRmlsdGVyKHRoaXMuZmlsdGVycy5jYXRJdGVtLCB0aGlzLmNhdGFsb2dbaV0uY2F0SXRlbSkgJiZcblx0XHRcdFx0XHR0aGlzLmNoZWNrUHJvZFdpdGhGaWx0ZXIodGhpcy5maWx0ZXJzLmNhdGVnb3J5LCB0aGlzLmNhdGFsb2dbaV0uY2F0ZWdvcnkpICYmXG5cdFx0XHRcdFx0dGhpcy5jaGVja1Byb2RXaXRoRmlsdGVyKHRoaXMuZmlsdGVycy5icmFuZCwgdGhpcy5jYXRhbG9nW2ldLmJyYW5kKSAmJlxuXHRcdFx0XHRcdHRoaXMuY2hlY2tQcm9kV2l0aEZpbHRlcih0aGlzLmZpbHRlcnMuZGVzaWduZXIsIHRoaXMuY2F0YWxvZ1tpXS5kZXNpZ25lcikgJiZcblx0XHRcdFx0XHR0aGlzLmNoZWNrUHJvZEJ5U2l6ZSh0aGlzLmZpbHRlcnMuc2l6ZSwgdGhpcy5jYXRhbG9nW2ldLnNpemUpICYmXG5cdFx0XHRcdFx0dGhpcy5jaGVja1Byb2RCeVByaWNlKHRoaXMuZmlsdGVycy5wcmljZSwgdGhpcy5jYXRhbG9nW2ldLnByaWNlKVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0ZmlsdGVyZWRDYXRhbG9nLnB1c2godGhpcy5jYXRhbG9nW2ldKTsgLy8gYWRkIHRoaXMgcHJvZHVjdCB0byB0aGlzLmZpbHRlcmVkQ2F0YWxvZ1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMucGFnaW5hdGUoZmlsdGVyZWRDYXRhbG9nKTtcblxuXHRcdC8vIHRoaXMucG9zdEZpbHRlcmVkKHRoaXMuZmlsdGVyZWRDYXRhbG9nKTsgLy8gdGhpcy5maWx0ZXJlZENhdGFsb2cg0YHQvtGF0YDQsNC90Y/QtdGC0YHRjyDQv9GA0LDQstC40LvRjNC90L5cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXZpZGUgZmlsdGVyZWRDYXRhbG9nIGJ5IHBhZ2VzIGFjY29yZGluZyB0byBTaG93IHNlbGVjdG9yIHZhbHVlXG5cdCAqIEBwYXJhbSB7fSBmaWx0ZXJlZENhdGFsb2dcblx0ICovXG5cdHBhZ2luYXRlKGZpbHRlcmVkQ2F0YWxvZykge1xuXHRcdGxldCBmaWx0Q2F0V2l0aFBhZyA9IHt9O1xuXHRcdGxldCBuID0gMTsgLy8gZmlyc3QgcGFnZSBudW1iZXJcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVyZWRDYXRhbG9nLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBwYWdlX251bSA9ICdwYWdlXycgKyBuO1xuXHRcdFx0ZmlsdENhdFdpdGhQYWdbcGFnZV9udW1dID0gW107XG5cblx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5maWx0ZXJzLnNob3dCeSAmJiBpIDwgZmlsdGVyZWRDYXRhbG9nLmxlbmd0aDsgaisrLCBpKyspIHtcblx0XHRcdFx0ZmlsdENhdFdpdGhQYWdbcGFnZV9udW1dLnB1c2goZmlsdGVyZWRDYXRhbG9nW2ldKTtcblx0XHRcdH1cblx0XHRcdGktLTtcblx0XHRcdG4rKztcblx0XHR9XG5cblx0XHR0aGlzLnBvc3RGaWx0ZXJlZChmaWx0Q2F0V2l0aFBhZyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgc2ltcGxlIGZpbHRlciBwYXJhbWV0ZXJzIGlmIHRoZSBwcm9kdWN0IHNhdGlzZnlcblx0ICogQHBhcmFtIHN0cmluZyBmaWx0ZXIgZmlsdGVyIHByb3BlcnR5IHZhbHVlXG5cdCAqIEBwYXJhbSBzdHJpbmcgcHJvZHVjdCBwcm9wZXJ0eSB2YWx1ZVxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBmaWx0ZXIgPSAnYWxsJyBvciBzYXRpc2Z5IHRvIHByb2R1Y3Rcblx0ICovXG5cdGNoZWNrUHJvZFdpdGhGaWx0ZXIoZmlsdGVyLCBwcm9kdWN0KSB7XG5cdFx0aWYgKGZpbHRlciA9PT0gJ2FsbCcpIHtcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0fSBlbHNlIHJldHVybiAoZmlsdGVyID09PSBwcm9kdWN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiB0aGUgcHJvZHVjdCBoYXMgb25lIG9mIGZpbHRlcidzIHNpemVcblx0ICogQHBhcmFtIHN0cmluZyBbXSBmaWx0ZXJTaXplcyAtIGFycmF5IG9mIHNpemVzIGluIGZpbHRlclxuXHQgKiBAcGFyYW0gc3RyaW5nIFtdIHByb2RTaXplcyAtIGFycmF5IG9mIHByb2R1Y3QncyBzaXplc1xuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcHJvZHVjdCBoYXMgb25lIG9mIGZpbHRlcmVkIHNpemVzXG5cdCAqL1xuXHRjaGVja1Byb2RCeVNpemUoZmlsdGVyU2l6ZXMsIHByb2RTaXplcykge1xuXHRcdGlmIChmaWx0ZXJTaXplc1swXSAhPT0gMCkge1xuXHRcdFx0Ly8gY2hlY2sgaWYgYW55IHNpemUgb2YgZmlsdGVyIGlzIGludG8gcHJvZHVjdCBzaXplc1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBmaWx0ZXJTaXplcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAocHJvZFNpemVzLmluY2x1ZGVzKGZpbHRlclNpemVzW2ldKSkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgcHJvZHVjdCB3aXRoIHByaWNlIGZpbHRlclxuXHQgKiBAcGFyYW0gSW50IFtdIGZpbHRlclByaWNlUmFuZ2UgLSBmaWx0ZXIncyBhcnJheSBvZiBtaW4gYW5kIG1heCBwcm9kdWN0IHByaWNlXG5cdCAqIEBwYXJhbSBJbnQgcHJvZFByaWNlIC0gcHJvZHVjdCdzIHByaWNlXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBwcm9kdWN0J3MgcHJpY2UgYmV0d2VlbiBtaW4gYW5kIG1heFxuXHQgKi9cblx0Y2hlY2tQcm9kQnlQcmljZShmaWx0ZXJQcmljZVJhbmdlLCBwcm9kUHJpY2UpIHtcblx0XHRpZiAoZmlsdGVyUHJpY2VSYW5nZVswXSA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY2hlY2sgaWYgYW55IHNpemUgb2YgZmlsdGVyIGlzIGludG8gcHJvZHVjdCBzaXplc1xuXHRcdFx0cmV0dXJuIHByb2RQcmljZSA+PSBmaWx0ZXJQcmljZVJhbmdlWzBdICYmIHByb2RQcmljZSA8PSBmaWx0ZXJQcmljZVJhbmdlWzFdO1xuXHRcdH1cblx0fVxuXG5cdHBvc3RGaWx0ZXJlZChkYXRhKSB7XG5cdFx0bGV0IGdldEFuZFBvc3QgPSBuZXcgR2V0QW5kUG9zdCgpO1xuXHRcdGxldCB1cmwgPSB0aGlzLmNvbmZpZy51cmwuZmlsdGVyZWRQcm9kdWN0cztcblxuXHRcdGxldCBzdWNjZXNzQ2FsbGJhY2sgPSBudWxsO1xuXHRcdGlmIChkYXRhW1wicGFnZV8xXCJdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHN1Y2Nlc3NDYWxsYmFjayA9ICgpID0+IHtcblx0XHRcdFx0Y29uc29sZS5sb2coJzQyOCAtIEZpbHRlcmVkIGNhdGFsb2cgREIgY2xlYW5lZCcpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgcmVuZGVyUGFnaW5hdGlvbiA9IG5ldyBSZW5kZXJQYWdpbmF0aW9uKHRoaXMuY29uZmlnLCBkYXRhKTtcblx0XHRcdGxldCByZW5kZXJQcm9kdWN0cyA9IG5ldyBSZW5kZXJQcm9kdWN0cyh0aGlzLmNvbmZpZywgZGF0YSk7XG5cblx0XHRcdC8vVE9ETyDRgdC00LXQu9Cw0YLRjCDRgtCw0LosINGH0YLQvtCx0YsgZGF0YSDQv9C10YDQtdC00LDQstCw0LvQsNGB0YxcblxuXHRcdFx0c3VjY2Vzc0NhbGxiYWNrID0gKCkgPT4ge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnNDI4IC0gRmlsdGVyZWQgY2F0YWxvZyBwb3N0ZWQgdG8gREInKTtcblx0XHRcdFx0cmVuZGVyUGFnaW5hdGlvbi5pbml0KHJlbmRlclBhZ2luYXRpb24pO1xuXHRcdFx0XHRyZW5kZXJQcm9kdWN0cy5pbml0KHJlbmRlclByb2R1Y3RzKTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0bGV0IGVycm9yQ2FsbGJhY2sgPSAoKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnNDI4IC0gTWV0aG9kIHBvc3RGaWx0ZXJlZChkYXRhKSBvZiBmaWx0ZXJlZCBjYXRhbG9nIHNhdmluZyB0byBEQiBGQUlMRUQnKTtcblx0XHR9O1xuXG5cdFx0Z2V0QW5kUG9zdC5wb3N0KHVybCwgZGF0YSwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcblx0fVxufVxuXG4vKipcbiAqIFJlbmRlciBwYXJlbnQgY2xhc3NcbiAqL1xuY2xhc3MgUmVuZGVyIHtcblx0Y29uc3RydWN0b3IoY29uZmlnLCBkYXRhKSB7XG5cdFx0dGhpcy5kYXRhID0gZGF0YTtcblx0XHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcblx0fVxuXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5jbGVhbigpO1xuXHRcdHRoaXMucmVuZGVyKHRoaXMuY29uZmlnLCB0aGlzLmRhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmQgYW5kIGNsZWFuIEhUTUwgb2JqZWN0XG5cdCAqL1xuXHRjbGVhbihzZWxlY3Rvcikge1xuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmlubmVySFRNTCA9ICcnO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbmRlciBmaWx0ZXJlZCBjYXRhbG9nIHdpdGggcGFnaW5hdGlvbiBhbmQgc2V0IGZvciBmaWx0ZXJlZCBjYXRhbG9nIGFkZFRvQ2FydEhhbmRsZXJcblx0ICogQHBhcmFtIGRhdGFcblx0ICovXG5cdHJlbmRlcihjb25maWcsIGRhdGEpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuLyoqXG4gKiBSZW5kZXIgcGFnaW5hdGlvbiBkaXZcbiAqL1xuY2xhc3MgUmVuZGVyUGFnaW5hdGlvbiBleHRlbmRzIFJlbmRlciB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZywgZGF0YSkge1xuXHRcdHN1cGVyKGNvbmZpZywgZGF0YSk7XG5cdH1cblxuXHRpbml0KCkge1xuXHRcdGxldCBzZWxlY3RvcnMgPSB0aGlzLmNvbmZpZy5zZWxlY3RvcnM7XG5cdFx0dGhpcy5jbGVhbihzZWxlY3RvcnMucGFnaW5hdGlvbik7XG5cdFx0dGhpcy5yZW5kZXIoc2VsZWN0b3JzLCB0aGlzLmRhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqICogU2V0IHBhZ2luYXRpb24gZGl2IC0gZmlsbCBpdCB3aXRoIDxhPk51bTwvYT5cblx0ICogQHBhcmFtIFN0cmluZyBwYWcgLSBjc3MgY2xhc3Mgb2YgcGFnaW5hdGlvbiBkaXZcblx0ICogQHBhcmFtIHt9IGRhdGEgZmlsdGVyZWQgY2F0YWxvZ1xuXHQgKi9cblx0cmVuZGVyKHNlbGVjdG9ycywgZGF0YSkge1xuXHRcdGxldCBwYWcgPSBzZWxlY3RvcnMucGFnaW5hdGlvbjtcblx0XHRsZXQgYWN0aXZlID0gc2VsZWN0b3JzLmFjdGl2ZTtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBocmVmID0gJz8nICsgT2JqZWN0LmtleXMoZGF0YSlbaV07XG5cdFx0XHRsZXQgYSA9IGA8YSBocmVmPVwiJHtocmVmfVwiPiR7aSArIDF9PC9hPmA7XG5cblx0XHRcdGlmIChpID09PSAwKSB7IC8vYWRkIGZpcnN0IHBhZ2UgbnVtYmVyXG5cdFx0XHRcdCQocGFnKS5hcHBlbmQoYSk7XG5cdFx0XHRcdCQoYCR7cGFnfSBhYCkuYWRkQ2xhc3MoYWN0aXZlKTsgLy9zZXQgdGhlIGZpcnN0IGFjdGl2ZVxuXG5cdFx0XHR9IGVsc2UgeyAvL2FkZCBhbm90aGVyIHBhZ2UgbnVtYmVyc1xuXHRcdFx0XHQkKHBhZykuYXBwZW5kKGEpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudXJsUGFnaW5hdGlvbihzZWxlY3RvcnMsIGRhdGEpO1xuXHRcdHRoaXMucGFnaW5hdGlvbk51bUhhbmRsZXIocGFnLCBhY3RpdmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIFVSTCBoYXMgcGFnZV8qIGFuZCBzZXQgYWN0aXZlIHBhZ2UgKyBhZGQgaHJlZiB0byBwYWdpbmF0aW9uIHNsaWRlciBhcnJvd3Ncblx0ICogQHBhcmFtIHt9IGRhdGEgZmlsdGVyZWQgY2F0YWxvZ1xuXHQgKi9cblx0dXJsUGFnaW5hdGlvbihzZWxlY3RvcnMsIGRhdGEpIHtcblx0XHRsZXQgcGFnID0gc2VsZWN0b3JzLnBhZ2luYXRpb247XG5cdFx0bGV0IGFjdGl2ZSA9IHNlbGVjdG9ycy5hY3RpdmU7XG5cdFx0Ly8gZ2V0IHBhZ2VfTiBmcm9tIFVSTFxuXHRcdGxldCBleHAgPSAvcGFnZV9cXGQrL2k7XG5cblx0XHRpZiAodGhpcy5jaGVja1VybChleHApKSB7IC8vIGNoZWNrIGlmIFVSTCBoYXMgcGFnZV8qXG5cdFx0XHRsZXQgcGFnZUluVVJMID0gdGhpcy5wYXJzZVVybChkb2N1bWVudC5sb2NhdGlvbi5ocmVmLCBleHApO1xuXHRcdFx0bGV0IHBhZ2VOb0luVVJMID0gK3RoaXMucGFyc2VVcmwocGFnZUluVVJMLCAvXFxkKy9pKTsgLy8gcGFyc2UgbnVtYmVyIG9mIHBhZ2VfIGZyb20gVVJMXG5cdFx0XHRpZiAocGFnZU5vSW5VUkwgPiAwICYmIHBhZ2VOb0luVVJMIDw9IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLnNldEFjdGl2ZUluUGFnaW5hdGlvbihwYWcsIGFjdGl2ZSwgcGFnZU5vSW5VUkwpO1xuXHRcdFx0XHR0aGlzLnNldFBhZ2luYXRpb25BcnJvd3NIcmVmKGFjdGl2ZSwgcGFnZU5vSW5VUkwsIGRhdGEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZXRBY3RpdmVJblBhZ2luYXRpb24ocGFnLCBhY3RpdmUsIDEpO1xuXHRcdFx0XHR0aGlzLnNldFBhZ2luYXRpb25BcnJvd3NIcmVmKHNlbGVjdG9ycywgMSwgZGF0YSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHBhZ2UgVVJMIGNvbnRhaW5zIHNvbWUgc3RyaW5nXG5cdCAqIEBwYXJhbSBzdHJpbmcgZXhwIC0gcmVnRXhwIGNvbmRpdGlvblxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBVUkwgY29udGFpbnMgcmVnRXhwXG5cdCAqL1xuXHRjaGVja1VybChleHApIHtcblx0XHRsZXQgY2hlY2tVcmwgPSBuZXcgUmVnRXhwKGV4cCk7XG5cdFx0cmV0dXJuIGNoZWNrVXJsLnRlc3QoZG9jdW1lbnQubG9jYXRpb24uaHJlZilcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBzdHJpbmcgYW5kIHJldHVybiBSZWdFeHAgc3V0aXNmaWVkIHJlc3VsdCBvciBudWxsXG5cdCAqIEBwYXJhbSBzdHJpbmcgZm9yIHBhcnNpbmdcblx0ICogQHBhcmFtIHN0cmluZyBleHAgcmVndWxhciBleHByZXNzaW9uIGZvciBzZWFyY2hcblx0ICogQHJldHVybnMgeyp9IHJldHVybnMgZm91bmRlZCBwYXJ0IG9mIHN0cmluZyBvciBudWxsXG5cdCAqL1xuXHRwYXJzZVVybChzdHJpbmcsIGV4cCkge1xuXHRcdGxldCBwYXJzZSA9IHN0cmluZy5tYXRjaChleHApO1xuXHRcdHJldHVybiBwYXJzZVswXVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCAuYWN0aXZlIGNsYXNzIGZvciBuLXRoIHBhZ2UgaW4gcGFnaW5hdGlvblxuXHQgKiBAcGFyYW0gSW50IG4gbnVtYmVyIG9mIHBhZ2UgZnJvbSBVUkxcblx0ICovXG5cdHNldEFjdGl2ZUluUGFnaW5hdGlvbihwYWcsIGFjdGl2ZSwgbikge1xuXHRcdCQoYCR7cGFnfSAuJHthY3RpdmV9YCkucmVtb3ZlQ2xhc3MoYWN0aXZlKTsgLy9yZW1vdmUgY3VycmVudCBhY3RpdmUgY2xhc3Ncblx0XHQkKGAke3BhZ30gYTpudGgtY2hpbGQoJHtufSlgKS5hZGRDbGFzcyhhY3RpdmUpOyAvL2FkZCBuZXcgYWN0aXZlIGNsYXNzXG5cdH1cblxuXHQvKipcblx0ICogU2V0IGhyZWYgdG8gPGE+IGluIHBhZ2luYXRpb24gc2xpZGVyXG5cdCAqIEBwYXJhbSBJbnQgbiBudW1iZXIgb2YgcGFnZSBmcm9tIFVSTFxuXHQgKiBAcGFyYW0ge30gZGF0YSBmaWx0ZXJlZCBjYXRhbG9nXG5cdCAqL1xuXHRzZXRQYWdpbmF0aW9uQXJyb3dzSHJlZihzZWxlY3RvcnMsIG4sIGRhdGEpIHtcblx0XHRsZXQgYWN0aXZlID0gc2VsZWN0b3JzLmFjdGl2ZTtcblx0XHRsZXQgcGFnZUxTZWxlY3RvciA9IHNlbGVjdG9ycy5wYWdlTDtcblx0XHRsZXQgcGFnZVJTZWxlY3RvciA9IHNlbGVjdG9ycy5wYWdlUjtcblx0XHRsZXQgdXJsSHRtbCA9IHRoaXMucGFyc2VVcmwoZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgL1xcL1teXFwvXSs/XFwuaHRtbC9pKTsgLy8gZ2V0IC8qLmh0bWwgZnJvbSB1cmxcblxuXHRcdC8vIHNldCBsZWZ0IGJ1dHR0b24gaHJlZlxuXHRcdGlmIChuID4gMSkge1xuXHRcdFx0bGV0IHByZXYgPSBgJHt1cmxIdG1sfT9wYWdlXyR7biAtIDF9YDtcblx0XHRcdCQocGFnZUxTZWxlY3RvcikuYXR0cignaHJlZicsIHByZXYpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKHBhZ2VMU2VsZWN0b3IpLmFkZENsYXNzKGFjdGl2ZSlcblx0XHR9XG5cblx0XHQvLyBzZXQgcmlnaHQgYnV0dHRvbiBocmVmXG5cdFx0aWYgKG4gPCBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGgpIHtcblx0XHRcdGxldCBuZXh0ID0gYCR7dXJsSHRtbH0/cGFnZV8ke24gKyAxfWA7XG5cdFx0XHQkKHBhZ2VSU2VsZWN0b3IpLmF0dHIoJ2hyZWYnLCBuZXh0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JChwYWdlUlNlbGVjdG9yKS5hZGRDbGFzcyhhY3RpdmUpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCBjbGljayBoYW5kbGVyIGF0IHBhZ2luYXRpb24gbnVtYmVyc1xuXHQgKiBAcGFyYW0gU3RyaW5nIHBhZyAtIGlkIG5hbWUgb2YgcGFnaW5hdGlvbiBkaXZcblx0ICogQHBhcmFtIFN0cmluZyBhY3RpdmUgLSBjc3MgY2xhc3MgbmFtZSBvZiBhY3RpdmUgcGFnZSBpbiBwYWdpbmF0aW9uXG5cdCAqL1xuXHRwYWdpbmF0aW9uTnVtSGFuZGxlcihwYWcsIGFjdGl2ZSkge1xuXHRcdGxldCBwYWdBY3RpdmUgPSBgJHtwYWd9IC4ke2FjdGl2ZX1gO1xuXHRcdCQocGFnQWN0aXZlKS5vbignY2xpY2snLCAnYScsIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0JChwYWdBY3RpdmUpLnJlbW92ZUNsYXNzKGFjdGl2ZSk7XG5cdFx0XHR0aGlzLmNsYXNzTGlzdC5hZGQoYWN0aXZlKTtcblx0XHR9KTtcblx0fVxufVxuXG4vKipcbiAqIFJlbmRlciBwcm9kdWN0cycgY2FyZHNcbiAqIEBwYXJhbSB7fSBjb25maWcgaW5pdGlhbCBzZXR0aW5ncyAodXJscywgc2VsZWN0b3JzKVxuICogQHBhcmFtIHt9IGRhdGEgLSB3aGF0IHRvIHJlbmRlciAtIG9iamVjdCBvZiBwcm9kdWN0c1xuICovXG5jbGFzcyBSZW5kZXJQcm9kdWN0cyBleHRlbmRzIFJlbmRlciB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZywgZGF0YSkge1xuXHRcdHN1cGVyKGNvbmZpZywgZGF0YSk7XG5cdH1cblxuXHRpbml0KCkge1xuXHRcdGxldCBzZWxlY3RvcnMgPSB0aGlzLmNvbmZpZy5zZWxlY3RvcnM7XG5cdFx0dGhpcy5jbGVhbihzZWxlY3RvcnMucHJvZHVjdHNEaXYpO1xuXHRcdHRoaXMucmVuZGVyKHNlbGVjdG9ycywgdGhpcy5kYXRhKTtcblxuXHRcdGxldCBjYXJ0ID0gbmV3IENhcnQoKTtcblx0XHRjYXJ0LmluaXQodGhpcy5jb25maWcpO1xuXHR9XG5cblx0cmVuZGVyKHNlbGVjdG9ycywgZGF0YSkge1xuXHRcdGlmICgkKHNlbGVjdG9ycy5wYWdpbmF0aW9uKVswXSkge1xuXHRcdFx0dGhpcy5yZW5kZXJXaXRoUGFnKHNlbGVjdG9ycywgZGF0YSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5yZW5kZXJOb1BhZyhzZWxlY3RvcnMsIGRhdGEpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgcHJvZHVjdHMgd2l0aG91dCBwYWdpbmF0aW9uXG5cdCAqIEBwYXJhbSB7fSBzZWxlY3RvcnNcblx0ICogQHBhcmFtIFtdIGRhdGEgcHJvZHVjdCdzIHByb3BlcnRpZXMgYXJyYXlcblx0ICovXG5cdHJlbmRlck5vUGFnKHNlbGVjdG9ycywgZGF0YSkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCkge1xuXHRcdFx0Zm9yIChsZXQgb25lUHJvZCwgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGxldCBkYXRhUGFnZUl0ZW0gPSBkYXRhW2ldO1xuXG5cdFx0XHRcdG9uZVByb2QgPSAkKHNlbGVjdG9ycy5wcm9kdWN0SXRlbSlbMF0uY2xvbmVOb2RlKHRydWUpO1xuXHRcdFx0XHRvbmVQcm9kLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLnByb2R1Y3RIcmVmKS5ocmVmID0gZGF0YVBhZ2VJdGVtLmhyZWY7XG5cdFx0XHRcdG9uZVByb2QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMucHJvZHVjdEltZykuc3JjID0gZGF0YVBhZ2VJdGVtLmltZ1swXTtcblx0XHRcdFx0b25lUHJvZC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycy5wcm9kdWN0SW1nKS5hbHQgPSBkYXRhUGFnZUl0ZW0ubmFtZTtcblx0XHRcdFx0b25lUHJvZC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycy5hZGRUb0NhcnQpLmlkID0gZGF0YVBhZ2VJdGVtLmlkO1xuXHRcdFx0XHRvbmVQcm9kLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLnByb2R1Y3ROYW1lKS50ZXh0Q29udGVudCA9IGRhdGFQYWdlSXRlbS5uYW1lO1xuXHRcdFx0XHRvbmVQcm9kLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLnByb2R1Y3RQcmljZSkudGV4dENvbnRlbnQgPSAnJCcgKyBkYXRhUGFnZUl0ZW0ucHJpY2UgKyAnLjAwJztcblx0XHRcdFx0b25lUHJvZC5jbGFzc0xpc3QucmVtb3ZlKHNlbGVjdG9ycy5kaXNwbGF5Tm9uZSk7XG5cblx0XHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMucHJvZHVjdHNEaXYpLmFwcGVuZENoaWxkKG9uZVByb2QpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKHNlbGVjdG9ycy5wcm9kdWN0c0RpdilbMF0ucGFyZW50RWxlbWVudC5pbm5lckhUTUwgPSAnJztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVuZGVyIHByb2R1Y3RzIHdpdGggcGFnaW5hdGlvblxuXHQgKiBAcGFyYW0ge30gc2VsZWN0b3JzXG5cdCAqIEBwYXJhbSBbXSBkYXRhIHByb2R1Y3QncyBwcm9wZXJ0aWVzIGFycmF5XG5cdCAqL1xuXHRyZW5kZXJXaXRoUGFnKHNlbGVjdG9ycywgZGF0YSkge1xuXHRcdGxldCBwYWdlID0gJ3BhZ2VfJyArICQoc2VsZWN0b3JzLnBhZ2luYXRpb24gKyAnIC4nICsgc2VsZWN0b3JzLmFjdGl2ZSkudGV4dCgpOyAvLyBmaW5kIGFjdGl2ZSBwYWdlXG5cdFx0bGV0IGRhdGFQYWdlID0gZGF0YVtwYWdlXTtcblxuXHRcdGlmIChkYXRhUGFnZSkge1xuXHRcdFx0Zm9yIChsZXQgb25lUHJvZCwgaSA9IDA7IGkgPCBkYXRhUGFnZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRsZXQgZGF0YVBhZ2VJdGVtID0gZGF0YVBhZ2VbaV07XG5cblx0XHRcdFx0b25lUHJvZCA9ICQoc2VsZWN0b3JzLnByb2R1Y3RJdGVtKVswXS5jbG9uZU5vZGUodHJ1ZSk7XG5cdFx0XHRcdG9uZVByb2QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMucHJvZHVjdEhyZWYpLmhyZWYgPSBkYXRhUGFnZUl0ZW0uaHJlZjtcblx0XHRcdFx0b25lUHJvZC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycy5wcm9kdWN0SW1nKS5zcmMgPSBkYXRhUGFnZUl0ZW0uaW1nWzBdO1xuXHRcdFx0XHRvbmVQcm9kLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLnByb2R1Y3RJbWcpLmFsdCA9IGRhdGFQYWdlSXRlbS5uYW1lO1xuXHRcdFx0XHRvbmVQcm9kLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzLmFkZFRvQ2FydCkuaWQgPSBkYXRhUGFnZUl0ZW0uaWQ7XG5cdFx0XHRcdG9uZVByb2QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMucHJvZHVjdE5hbWUpLnRleHRDb250ZW50ID0gZGF0YVBhZ2VJdGVtLm5hbWU7XG5cdFx0XHRcdG9uZVByb2QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMucHJvZHVjdFByaWNlKS50ZXh0Q29udGVudCA9ICckJyArIGRhdGFQYWdlSXRlbS5wcmljZSArICcuMDAnO1xuXHRcdFx0XHRvbmVQcm9kLmNsYXNzTGlzdC5yZW1vdmUoc2VsZWN0b3JzLmRpc3BsYXlOb25lKTtcblxuXHRcdFx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycy5wcm9kdWN0c0RpdikuYXBwZW5kQ2hpbGQob25lUHJvZCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoc2VsZWN0b3JzLm9vcHMpLnJlbW92ZUNsYXNzKHNlbGVjdG9ycy5kaXNwbGF5Tm9uZSk7XG5cdFx0fVxuXHR9XG59XG5cblwidXNlIHN0cmljdFwiO1xuXG4vL1RPRE8gbWFrZSBhZGQgY2FydCB3b3JrIGZvciBtYWluIHBhZ2Vcbi8vVE9ETyBtYWtlIGFkZCBjYXJ0IHdvcmsgZm9yIHNpbmdsZSBwYWdlXG5cbi8qKlxuICogR2V0IGNhcnQsIHJlbmRlciBjYXJ0LCBhZGQgdG8gY2FydCwgZGVsZXRlIGZyb20gY2FydFxuICovXG5jbGFzcyBDYXJ0IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jYXRhbG9nID0ge307XG4gICAgdGhpcy5jYXJ0ID0ge1xuICAgICAgdG90YWw6IDAsXG4gICAgICBjb3VudEdvb2RzOiAwLFxuICAgICAgY29udGVudHM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICB1cmw6IHt9LFxuICAgICAgc2VsZWN0b3JzOiB7fSxcbiAgICB9O1xuICB9XG5cbiAgaW5pdChjb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmdldENhcnQoJycsIHRoaXMucmVuZGVyQ2FydCk7XG4gICAgdGhpcy5hZGRUb0NhcnRCdXR0b25IYW5kbGVyKCk7XG4gICAgdGhpcy5kZWxldGVCdXR0b25IYW5kbGVyKCk7XG4gICAgdGhpcy5xdWFudGl0eUhhbmRsZXIoJ2lucHV0JyArIHRoaXMuY29uZmlnLnNlbGVjdG9ycy5xdWFudGl0eSk7XG4gIH1cblxuICByZW5kZXJDYXJ0KCkge1xuICAgIGxldCByZW5kZXJDYXJ0ID0gbmV3IFJlbmRlckNhcnQodGhpcy5jYXJ0LmNvbnRlbnRzLCB0aGlzLmNhcnQudG90YWwpO1xuXG4gICAgcmVuZGVyQ2FydC5pbml0KHRoaXMuY29uZmlnLnNlbGVjdG9ycyk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhbGwgXCJBZGQgdG8gY2FydFwiIGJ1dHRvbnMgYW5kIGlmIGNsaWNrZWQgc3RhcnQgY2FsbGJhY2sgd2l0aCBcImlkXCIgYXMgcGFyYW1cbiAgICovXG4gIGFkZFRvQ2FydEJ1dHRvbkhhbmRsZXIoKSB7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgJCh0aGlzLmNvbmZpZy5zZWxlY3RvcnMuYWRkVG9DYXJ0KS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGxldCBpZCA9ICt0aGlzLmdldEF0dHJpYnV0ZSgnaWQnKTsgLy8gZm91bmQgaWQgb2YgYWRkZWQgcHJvZHVjdFxuICAgICAgdGhhdC5nZXRDYXRhbG9nKGlkKTtcbiAgICB9KVxuICB9XG5cbiAgZGVsZXRlQnV0dG9uSGFuZGxlcigpe1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAkKCcuY2FydC1jb250YWluZXInKS5vbignY2xpY2snLCB0aGlzLmNvbmZpZy5zZWxlY3RvcnMuZGVsLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGxldCBpZCA9ICt0aGlzLmdldEF0dHJpYnV0ZSgnaWQnKTsgLy8gZm91bmQgaWQgb2YgYWRkZWQgcHJvZHVjdFxuICAgICAgdGhhdC5kZWxldGVGcm9tQ2FydChpZCk7XG4gICAgfSlcbiAgfVxuXG4gIGRlbGV0ZUZyb21DYXJ0KGlkKXtcbiAgICBsZXQgaWR4ID0gdGhpcy5jaGVja0luQ2FydChpZCk7XG5cbiAgICB0aGlzLmNhcnQuY29udGVudHMuc3BsaWNlKGlkeCwgMSk7XG4gICAgdGhpcy5jYWxjVG90YWwoKTtcbiAgICB0aGlzLnBvc3RUb0NhcnQodGhpcy5jYXJ0KTtcbiAgICB0aGlzLnJlbmRlckNhcnQodGhpcy5jYXJ0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBxdWFudGl0eSBpbnB1dCB2YWx1ZSBjaGFuZ2VkIChhbmQgbG9vc2UgZm9jdXMpIHNlbmQgdG8gY2FsbGJhY2sgcHJvZHVjdCBpZCBhbmQgbmV3IHZhbHVlXG4gICAqIEBwYXJhbSBTdHJpbmcgc2VsZWN0b3Igb2YgcXVhbnRpdHkgaW5wdXRcbiAgICovXG4gIHF1YW50aXR5SGFuZGxlcihzZWxlY3Rvcil7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCBzZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGlkID0gK3RoaXMuZGF0YXNldC5pZDtcbiAgICAgIGxldCBuZXdWYWwgPSArdGhpcy52YWx1ZTtcblxuICAgICAgdGhhdC5zZXROZXdRdWFudGl0eS5jYWxsKHRoYXQsIGlkLCBuZXdWYWwpXG4gICAgfSlcbiAgfVxuXG4gIHNldE5ld1F1YW50aXR5KGlkLCBuZXdWYWwpe1xuICAgIGxldCBpZHggPSB0aGlzLmNoZWNrSW5DYXJ0KGlkKTtcbiAgICB0aGlzLmNhcnQuY29udGVudHNbaWR4XS5xdWFudGl0eSA9IG5ld1ZhbDtcblxuICAgIHRoaXMuY2FsY1RvdGFsKCk7XG4gICAgdGhpcy5wb3N0VG9DYXJ0KHRoaXMuY2FydCk7XG4gICAgdGhpcy5yZW5kZXJDYXJ0KHRoaXMuY2FydCk7XG4gIH1cblxuICBnZXRDYXRhbG9nKGlkKSB7XG5cdFx0bGV0IGdldEFuZFBvc3QgPSBuZXcgR2V0QW5kUG9zdCgpO1xuXG5cdFx0bGV0IHVybCA9IHRoaXMuY29uZmlnLnVybC5wcm9kdWN0cztcblx0XHRsZXQgc3VjY2Vzc0NhbGxiYWNrID0gcmVzcG9uc2UgPT4ge1xuXHRcdFx0dGhpcy5jYXRhbG9nID0gcmVzcG9uc2U7XG5cdFx0XHRjb25zb2xlLmxvZygnOTMgLSBHb3QgZnVsbCBjYXRhbG9nIGZyb20gSlNPTicpO1xuXHRcdFx0dGhpcy5nZXRDYXJ0KGlkLCB0aGlzLmdldFByb2RGcm9tQ2F0YWxvZyk7XG5cdFx0fTtcblxuXHRcdGxldCBlcnJvckNhbGxiYWNrID0gcmVzcG9uc2UgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJzEwMyAtIE1ldGhvZCBnZXRDYXRhbG9nKCkgb2YgZ2V0dGluZyBjYXRhbG9nIEZBSUxFRCcpO1xuXHRcdH07XG5cblx0XHRnZXRBbmRQb3N0LmdldCh1cmwsIHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNhcnQgZnJvbSBKU09OIGFuZCBkbyBnZXRQcm9kRnJvbUNhdGFsb2coaWQpIG9yIHJlbmRlciBjYXJ0XG4gICAqIEBwYXJhbSBudW1iZXIgaWQgLSBpZCBvZiBwcm9kdWN0IHRoYXQgYWRkVG9DYXJ0IGJ1dHRvbiB3YXMgY2xpY2tlZFxuICAgKi9cbiAgZ2V0Q2FydChpZCwgY2FsbGJhY2spIHtcblx0XHRsZXQgZ2V0QW5kUG9zdCA9IG5ldyBHZXRBbmRQb3N0KCk7XG5cblx0XHRsZXQgdXJsID0gdGhpcy5jb25maWcudXJsLmNhcnQ7XG5cdFx0bGV0IHN1Y2Nlc3NDYWxsYmFjayA9IHJlc3BvbnNlID0+IHtcblx0XHRcdHRoaXMuY2FydCA9IHJlc3BvbnNlO1xuXHRcdFx0aWYgKGlkKSB7XG5cdFx0XHRcdGNhbGxiYWNrLmNhbGwodGhpcywgaWQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJzExNCAtIEluaXRpYWwgY2FydCByZW5kZXJpbmcgc3RhcnQnKTtcblx0XHRcdFx0Y2FsbGJhY2suY2FsbCh0aGlzKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0bGV0IGVycm9yQ2FsbGJhY2sgPSByZXNwb25zZSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnMTE0IC0gTWV0aG9kIGdldENhdGFsb2coKSBvZiBnZXR0aW5nIGNhdGFsb2cgRkFJTEVEJyk7XG5cdFx0fTtcblxuXHRcdGdldEFuZFBvc3QuZ2V0KHVybCwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW50IGJ5IGlkIHByb2R1Y3QgaW4gY2F0YWxvZyBhbmQgc2VudCBpdCB0byBwcmVwYXJlRm9yQ2FydCgpXG4gICAqIEBwYXJhbSBJbnQgaWQgLSBpZCBvZiBwcm9kdWN0IHdhcyBjbGlja2VkXG4gICAqL1xuICBnZXRQcm9kRnJvbUNhdGFsb2coaWQpIHtcbiAgICAvLyBmaW5kIGluIGRhdGEgb2JqZWN0IHByb2R1Y3Qgd2l0aCBzdWNoIGlkIGFuZCBwdXNoIGl0IHRvIHRoaXMuY29udGVudHNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY2F0YWxvZy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuY2F0YWxvZ1tpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgdGhpcy5wcmVwYXJlRm9yQ2FydCh0aGlzLmNhdGFsb2dbaV0pOyAvLyBzZW5kIGZvdW5kZWQgcHJvZHVjdCB0byBjYWxsYmFja1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwYXJlIHByb2R1Y3QgZnJvbSBjYXRhbG9nIGZvciBQVVNIaW5nIHRvIGNhcnRcbiAgICogQHBhcmFtIHt9IHByb2QgLSBwcm9kdWN0IGZyb20gY2F0YWxvZ1xuICAgKi9cbiAgcHJlcGFyZUZvckNhcnQocHJvZCkge1xuICAgIGxldCBuZXdUb0NhcnQgPSB7fTtcblxuICAgIG5ld1RvQ2FydC5pZCA9IHByb2QuaWQ7XG4gICAgbmV3VG9DYXJ0Lm5hbWUgPSBwcm9kLm5hbWU7XG4gICAgbmV3VG9DYXJ0LnByaWNlID0gcHJvZC5wcmljZTtcbiAgICBuZXdUb0NhcnQuaHJlZiA9IHByb2QuaHJlZjtcbiAgICBuZXdUb0NhcnQuaW1nID0gcHJvZC5pbWc7XG4gICAgbmV3VG9DYXJ0LnJhdGluZyA9IHByb2QucmF0aW5nO1xuXG4gICAgbGV0IGluQ2FydEluZGV4ID0gdGhpcy5jaGVja0luQ2FydChwcm9kLmlkKTtcbiAgICBpZiAoaW5DYXJ0SW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5jYXJ0LmNvbnRlbnRzW2luQ2FydEluZGV4XS5xdWFudGl0eSArPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdUb0NhcnQucXVhbnRpdHkgPSAxO1xuICAgICAgdGhpcy5jYXJ0LmNvbnRlbnRzLnB1c2gobmV3VG9DYXJ0KVxuICAgIH1cblxuICAgIHRoaXMuY2FsY1RvdGFsKCk7XG4gICAgdGhpcy5wb3N0VG9DYXJ0KHRoaXMuY2FydCk7XG4gICAgdGhpcy5yZW5kZXJDYXJ0KHRoaXMuY2FydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBjYXJ0IGhhcyBzdWNoIHByb2R1Y3RcbiAgICogQHBhcmFtIGlkIC0gcHJvZHVjdCBpZCB0aGF0IGlzIG5lZWRlZCB0byBsb29rIHRocm91Z2ggdGhlIGNhcnRcbiAgICogQHJldHVybnMgbnVtYmVyIC0gMCBpZiBub3QgZm91bmQgRUxTRSBwcm9kdWN0IGluZGV4IG9mIGNhcnQgYXJyYXlcbiAgICovXG4gIGNoZWNrSW5DYXJ0KGlkKSB7XG4gICAgLy8gZmluZCBpbiBkYXRhIG9iamVjdCBwcm9kdWN0IHdpdGggc3VjaCBpZCBhbmQgcHVzaCBpdCB0byB0aGlzLmNvbnRlbnRzXG4gICAgbGV0IGNhcnRBcnIgPSB0aGlzLmNhcnQuY29udGVudHM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYXJ0QXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY2FydEFycltpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdG90YWwgYW5kIGNvdW50R29vZHMgdmFsdWVzIGFuZCBzYXZlIGl0IHRvIHRoaXMuY2FydFxuICAgKi9cbiAgY2FsY1RvdGFsKCkge1xuICAgIGlmICh0aGlzLmNhcnQuY29udGVudHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmNhcnQuY291bnRHb29kcyA9IHRoaXMuY2FydC5jb250ZW50cy5sZW5ndGg7XG5cbiAgICAgIHRoaXMuY2FydC50b3RhbCA9IDA7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY2FydC5jb250ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcHJpY2UgPSB0aGlzLmNhcnQuY29udGVudHNbaV0ucHJpY2U7XG4gICAgICAgIGxldCBxdWFudGl0eSA9IHRoaXMuY2FydC5jb250ZW50c1tpXS5xdWFudGl0eTtcblxuICAgICAgICB0aGlzLmNhcnQudG90YWwgKz0gcHJpY2UgKiBxdWFudGl0eTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYXJ0LnRvdGFsID0gMDtcbiAgICAgIHRoaXMuY2FydC5jb3VudEdvb2RzID0gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUE9TVCBjYXJ0IHRvIEpTT04gZmlsZVxuICAgKiBAcGFyYW0ge30gZGF0YSAtIGNhcnQgZGF0YVxuICAgKi9cbiAgcG9zdFRvQ2FydChkYXRhKSB7XG5cdFx0bGV0IGdldEFuZFBvc3QgPSBuZXcgR2V0QW5kUG9zdCgpO1xuXHRcdGxldCB1cmwgPSB0aGlzLmNvbmZpZy51cmwuY2FydDtcblx0XHRsZXQgc3VjY2Vzc0NhbGxiYWNrID0gKCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJzIxNSAtIENhcnQgd2FzIFNFTlQgdG8gREInKTtcblx0XHR9O1xuXHRcdGxldCBlcnJvckNhbGxiYWNrID0gKCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJ0NhcnQgc2VuZGluZyB0byBEQiBGQUlMRUQnKTtcblx0XHR9O1xuXG5cdFx0Z2V0QW5kUG9zdC5wb3N0KHVybCwgZGF0YSwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgfVxufVxuXG4vKipcbiAqIEZpbmQgY2FydCBkaXYgYW5kIGNhcnQgaXRlbSB0ZW1wbGF0ZSwgY2xvbmUgdGVtcGxhdGUgYW5kIGZpbGwgaXQgd2l0aCBjYXJ0IGl0ZW1zIGRhdGEsIGFwcGVuZCBpdCB0byBET01cbiAqL1xuY2xhc3MgUmVuZGVyQ2FydCB7XG4gIGNvbnN0cnVjdG9yKGl0ZW1zLCB0b3RhbCl7XG4gICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xuICAgIHRoaXMudG90YWwgPSB0b3RhbDtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IHtcbiAgICAgIGNhcnQ6ICcuY2FydC1jb250YWluZXInLFxuICAgICAgaXRlbTogJy5jYXJ0LWl0ZW0udGVtcGxhdGUnLFxuICAgICAgaHJlZjogJy5jYXJ0LWl0ZW0taHJlZicsXG4gICAgICBpbWc6ICcuY2FydC1pdGVtLWltZycsXG4gICAgICBuYW1lOiAnLmNhcnQtaXRlbS1uYW1lJyxcbiAgICAgIHF1YW50aXR5OiAnLmNhcnQtaXRlbS1xdWFudGl0eScsXG4gICAgICBwcmljZTogJy5jYXJ0LWl0ZW0tcHJpY2UnLFxuICAgICAgZGVsOiAnLmNhcnQtaXRlbS1kZWwnLFxuICAgICAgcmF0ZTogJy5yYXRlJyxcbiAgICAgIHN1YnRvdGFsOiAnLmNhcnQtaXRlbS1zdWJ0b3RhbCcsXG4gICAgICB0b3RhbDogJy5jYXJ0LXRvdGFsJyxcbiAgICAgIGRpc3BsYXlOb25lOiAndGVtcGxhdGUnLFxuICAgIH07XG4gIH1cblxuICBpbml0KHNlbGVjdG9ycyl7XG4gICAgdGhpcy5zZWxlY3RvcnMgPSBzZWxlY3RvcnM7XG4gICAgbGV0IGNhcnROb2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuY2FydCk7XG4gICAgbGV0IEl0ZW1Ob2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuaXRlbSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNhcnROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGNhcnROb2RlID0gY2FydE5vZGVzW2ldO1xuICAgICAgbGV0IGl0ZW1Ob2RlID0gSXRlbU5vZGVzW2ldO1xuXG4gICAgICB0aGlzLmNsZWFyQ2FydENvbnRhaW5lcihjYXJ0Tm9kZSk7XG5cbiAgICAgIGZvciAobGV0IGNhcnRJdGVtLCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2FydEl0ZW0gPSB0aGlzLmNsb25lTm9kZShpdGVtTm9kZSk7XG5cbiAgICAgICAgdGhpcy5zZXRJbWcodGhpcy5zZWxlY3RvcnMuaW1nLCBjYXJ0SXRlbSwgdGhpcy5pdGVtc1tpXSk7XG4gICAgICAgIHRoaXMuc2V0TmFtZSh0aGlzLnNlbGVjdG9ycy5uYW1lLCBjYXJ0SXRlbSwgdGhpcy5pdGVtc1tpXSk7XG4gICAgICAgIHRoaXMuc2V0SHJlZih0aGlzLnNlbGVjdG9ycy5ocmVmLCBjYXJ0SXRlbSwgdGhpcy5pdGVtc1tpXS5ocmVmKTtcbiAgICAgICAgdGhpcy5zZXRRdWFudGl0eSh0aGlzLnNlbGVjdG9ycy5xdWFudGl0eSwgY2FydEl0ZW0sIHRoaXMuaXRlbXNbaV0pO1xuICAgICAgICB0aGlzLnNldFByaWNlKHRoaXMuc2VsZWN0b3JzLnByaWNlLCBjYXJ0SXRlbSwgdGhpcy5pdGVtc1tpXSk7XG4gICAgICAgIHRoaXMuZmlsbFJhdGVTdGFycyh0aGlzLnNlbGVjdG9ycy5yYXRlLCBjYXJ0SXRlbSwgdGhpcy5pdGVtc1tpXS5yYXRpbmcpO1xuICAgICAgICB0aGlzLnNldERlbGV0ZUJ1dHRvbklkKHRoaXMuc2VsZWN0b3JzLmRlbCwgY2FydEl0ZW0sIHRoaXMuaXRlbXNbaV0pO1xuICAgICAgICB0aGlzLnNldFN1YlRvdGFsKHRoaXMuc2VsZWN0b3JzLnN1YnRvdGFsLCBjYXJ0SXRlbSwgdGhpcy5pdGVtc1tpXSk7XG5cbiAgICAgICAgdGhpcy5kaXNwbGF5Tm9uZURlbGV0ZSh0aGlzLnNlbGVjdG9ycy5kaXNwbGF5Tm9uZSwgY2FydEl0ZW0pO1xuICAgICAgICB0aGlzLml0ZW1BcHBlbmQoY2FydE5vZGUsIGNhcnRJdGVtKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zaG93VG90YWxQcmljZSh0aGlzLnNlbGVjdG9ycy50b3RhbCwgdGhpcy50b3RhbCk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXJDYXJ0Q29udGFpbmVyKG5vZGUpe1xuICAgIG5vZGUuaW5uZXJIVE1MID0gJyc7XG4gIH1cblxuICBjbG9uZU5vZGUoaXRlbU5vZGUpe1xuICAgIHJldHVybiBpdGVtTm9kZS5jbG9uZU5vZGUodHJ1ZSk7XG4gIH1cblxuICBzZXRJbWcoc2VsZWN0b3IsIGNhcnRJdGVtLCBwcm9kdWN0KXtcbiAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5zcmMgPSBwcm9kdWN0LmltZ1swXTtcbiAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5hbHQgPSBwcm9kdWN0Lm5hbWU7XG4gICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikudGl0bGUgPSBwcm9kdWN0Lm5hbWU7XG4gIH1cblxuICBzZXROYW1lKHNlbGVjdG9yLCBjYXJ0SXRlbSwgcHJvZHVjdCl7XG4gICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikudGV4dENvbnRlbnQgPSBwcm9kdWN0Lm5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGhyZWYgdG8gYWxsIGVsZW1lbnRzIG9mIEhUTUwgY29sbGVjdGlvblxuICAgKiBAcGFyYW0gYXJyIEhUTUwgY29sbGVjdGlvblxuICAgKiBAcGFyYW0gaHJlZlxuICAgKi9cbiAgc2V0SHJlZihzZWxlY3RvciwgY2FydEl0ZW0sIGhyZWYpe1xuICAgIGxldCBhQ29sbGVjdGlvbiA9IGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhQ29sbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgYUNvbGxlY3Rpb25baV0uaHJlZiA9IGhyZWY7XG4gICAgfVxuICB9XG5cbiAgc2V0UXVhbnRpdHkoc2VsZWN0b3IsIGNhcnRJdGVtLCBpdGVtKXtcbiAgICBpZiAoY2FydEl0ZW0ubG9jYWxOYW1lID09PSAnZGl2Jykge1xuICAgICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikudGV4dENvbnRlbnQgPSBpdGVtLnF1YW50aXR5O1xuICAgIH0gZWxzZSBpZiAoY2FydEl0ZW0ubG9jYWxOYW1lID09PSAndHInKSB7XG4gICAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS52YWx1ZSA9IGl0ZW0ucXVhbnRpdHk7XG4gICAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5kYXRhc2V0LmlkID0gaXRlbS5pZDtcbiAgICB9XG4gIH1cblxuICBzZXRQcmljZShzZWxlY3RvciwgY2FydEl0ZW0sIHByb2R1Y3Qpe1xuICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnRleHRDb250ZW50ID0gcHJvZHVjdC5wcmljZTtcbiAgfVxuXG4gIGZpbGxSYXRlU3RhcnMoc2VsZWN0b3IsIGNhcnRJdGVtLCByYXRpbmcpe1xuICAgIGxldCBtYXhXaWR0aCA9ICQoc2VsZWN0b3IpLmNzcygnbWF4LXdpZHRoJyk7XG4gICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3Rvcikuc3R5bGUgPSBgd2lkdGg6IGNhbGMoJHttYXhXaWR0aH0gLyA1ICogJHtyYXRpbmd9KWA7XG4gIH1cblxuICBzZXRTdWJUb3RhbChzZWxlY3RvciwgY2FydEl0ZW0sIHByb2R1Y3Qpe1xuICAgIGlmIChjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgbGV0IHN1YiA9IHByb2R1Y3QucHJpY2UgKiBwcm9kdWN0LnF1YW50aXR5O1xuICAgICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikudGV4dENvbnRlbnQgPSBzdWI7XG4gICAgfVxufVxuXG4gIHNldERlbGV0ZUJ1dHRvbklkKHNlbGVjdG9yLCBjYXJ0SXRlbSwgcHJvZHVjdCl7XG4gICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikuaWQgPSBwcm9kdWN0LmlkO1xuICB9XG5cbiAgZGlzcGxheU5vbmVEZWxldGUoc2VsZWN0b3IsIGNhcnRJdGVtKSB7XG4gICAgY2FydEl0ZW0uY2xhc3NMaXN0LnJlbW92ZShzZWxlY3Rvcik7XG4gIH1cblxuICBpdGVtQXBwZW5kKGNhcnROb2RlLCBpdGVtKXtcbiAgICBjYXJ0Tm9kZS5hcHBlbmRDaGlsZChpdGVtKTtcbiAgfVxuXG4gIHNob3dUb3RhbFByaWNlKHNlbGVjdG9yLCB0b3RhbCl7XG4gICAgbGV0IHRvdGFsTm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblxuICAgIHRvdGFsTm9kZXMuZm9yRWFjaChlbGVtID0+IHtcbiAgICAgIGVsZW0udGV4dENvbnRlbnQgPSB0b3RhbDtcbiAgICB9KTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS50ZXh0Q29udGVudCA9IHRvdGFsO1xuICB9XG59XG5cbi8qISBqQ2Fyb3VzZWwgLSB2MC4zLjggLSAyMDE4LTA1LTMxXG4qIGh0dHA6Ly9zb3JnYWxsYS5jb20vamNhcm91c2VsL1xuKiBDb3B5cmlnaHQgKGMpIDIwMDYtMjAxOCBKYW4gU29yZ2FsbGE7IExpY2Vuc2VkIE1JVCAqL1xuKGZ1bmN0aW9uKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBqQ2Fyb3VzZWwgPSAkLmpDYXJvdXNlbCA9IHt9O1xuXG4gIGpDYXJvdXNlbC52ZXJzaW9uID0gJzAuMy44JztcblxuICB2YXIgclJlbGF0aXZlVGFyZ2V0ID0gL14oWytcXC1dPSk/KC4rKSQvO1xuXG4gIGpDYXJvdXNlbC5wYXJzZVRhcmdldCA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHZhciByZWxhdGl2ZSA9IGZhbHNlLFxuICAgICAgcGFydHMgICAgPSB0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyA/XG4gICAgICAgIHJSZWxhdGl2ZVRhcmdldC5leGVjKHRhcmdldCkgOlxuICAgICAgICBudWxsO1xuXG4gICAgaWYgKHBhcnRzKSB7XG4gICAgICB0YXJnZXQgPSBwYXJzZUludChwYXJ0c1syXSwgMTApIHx8IDA7XG5cbiAgICAgIGlmIChwYXJ0c1sxXSkge1xuICAgICAgICByZWxhdGl2ZSA9IHRydWU7XG4gICAgICAgIGlmIChwYXJ0c1sxXSA9PT0gJy09Jykge1xuICAgICAgICAgIHRhcmdldCAqPSAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRhcmdldCA9IHBhcnNlSW50KHRhcmdldCwgMTApIHx8IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgcmVsYXRpdmU6IHJlbGF0aXZlXG4gICAgfTtcbiAgfTtcblxuICBqQ2Fyb3VzZWwuZGV0ZWN0Q2Fyb3VzZWwgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgdmFyIGNhcm91c2VsO1xuXG4gICAgd2hpbGUgKGVsZW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgY2Fyb3VzZWwgPSBlbGVtZW50LmZpbHRlcignW2RhdGEtamNhcm91c2VsXScpO1xuXG4gICAgICBpZiAoY2Fyb3VzZWwubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gY2Fyb3VzZWw7XG4gICAgICB9XG5cbiAgICAgIGNhcm91c2VsID0gZWxlbWVudC5maW5kKCdbZGF0YS1qY2Fyb3VzZWxdJyk7XG5cbiAgICAgIGlmIChjYXJvdXNlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBjYXJvdXNlbDtcbiAgICAgIH1cblxuICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgakNhcm91c2VsLmJhc2UgPSBmdW5jdGlvbihwbHVnaW5OYW1lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246ICBqQ2Fyb3VzZWwudmVyc2lvbixcbiAgICAgIF9vcHRpb25zOiAge30sXG4gICAgICBfZWxlbWVudDogIG51bGwsXG4gICAgICBfY2Fyb3VzZWw6IG51bGwsXG4gICAgICBfaW5pdDogICAgICQubm9vcCxcbiAgICAgIF9jcmVhdGU6ICAgJC5ub29wLFxuICAgICAgX2Rlc3Ryb3k6ICAkLm5vb3AsXG4gICAgICBfcmVsb2FkOiAgICQubm9vcCxcbiAgICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRcbiAgICAgICAgICAuYXR0cignZGF0YS0nICsgcGx1Z2luTmFtZS50b0xvd2VyQ2FzZSgpLCB0cnVlKVxuICAgICAgICAgIC5kYXRhKHBsdWdpbk5hbWUsIHRoaXMpO1xuXG4gICAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignY3JlYXRlJykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NyZWF0ZSgpO1xuXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ2NyZWF0ZWVuZCcpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ2Rlc3Ryb3knKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZGVzdHJveSgpO1xuXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ2Rlc3Ryb3llbmQnKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50XG4gICAgICAgICAgLnJlbW92ZURhdGEocGx1Z2luTmFtZSlcbiAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS0nICsgcGx1Z2luTmFtZS50b0xvd2VyQ2FzZSgpKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICByZWxvYWQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdyZWxvYWQnKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZWxvYWQoKTtcblxuICAgICAgICB0aGlzLl90cmlnZ2VyKCdyZWxvYWRlbmQnKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICBlbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgICB9LFxuICAgICAgb3B0aW9uczogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiAkLmV4dGVuZCh7fSwgdGhpcy5fb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLl9vcHRpb25zW2tleV0gPT09ICd1bmRlZmluZWQnID9cbiAgICAgICAgICAgICAgbnVsbCA6XG4gICAgICAgICAgICAgIHRoaXMuX29wdGlvbnNba2V5XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl9vcHRpb25zW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuX29wdGlvbnMsIGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICBjYXJvdXNlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5fY2Fyb3VzZWwpIHtcbiAgICAgICAgICB0aGlzLl9jYXJvdXNlbCA9IGpDYXJvdXNlbC5kZXRlY3RDYXJvdXNlbCh0aGlzLm9wdGlvbnMoJ2Nhcm91c2VsJykgfHwgdGhpcy5fZWxlbWVudCk7XG5cbiAgICAgICAgICBpZiAoIXRoaXMuX2Nhcm91c2VsKSB7XG4gICAgICAgICAgICAkLmVycm9yKCdDb3VsZCBub3QgZGV0ZWN0IGNhcm91c2VsIGZvciBwbHVnaW4gXCInICsgcGx1Z2luTmFtZSArICdcIicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9jYXJvdXNlbDtcbiAgICAgIH0sXG4gICAgICBfdHJpZ2dlcjogZnVuY3Rpb24odHlwZSwgZWxlbWVudCwgZGF0YSkge1xuICAgICAgICB2YXIgZXZlbnQsXG4gICAgICAgICAgZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGRhdGEgPSBbdGhpc10uY29uY2F0KGRhdGEgfHwgW10pO1xuXG4gICAgICAgIChlbGVtZW50IHx8IHRoaXMuX2VsZW1lbnQpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXZlbnQgPSAkLkV2ZW50KChwbHVnaW5OYW1lICsgJzonICsgdHlwZSkudG9Mb3dlckNhc2UoKSk7XG5cbiAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoZXZlbnQsIGRhdGEpO1xuXG4gICAgICAgICAgaWYgKGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgICAgICBkZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAhZGVmYXVsdFByZXZlbnRlZDtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIGpDYXJvdXNlbC5wbHVnaW4gPSBmdW5jdGlvbihwbHVnaW5OYW1lLCBwbHVnaW5Qcm90b3R5cGUpIHtcbiAgICB2YXIgUGx1Z2luID0gJFtwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgdGhpcy5vcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB0aGlzLmNyZWF0ZSgpO1xuICAgIH07XG5cbiAgICBQbHVnaW4uZm4gPSBQbHVnaW4ucHJvdG90eXBlID0gJC5leHRlbmQoXG4gICAgICB7fSxcbiAgICAgIGpDYXJvdXNlbC5iYXNlKHBsdWdpbk5hbWUpLFxuICAgICAgcGx1Z2luUHJvdG90eXBlXG4gICAgKTtcblxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgYXJncyAgICAgICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IHRoaXM7XG5cbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBpbnN0YW5jZSA9ICQodGhpcykuZGF0YShwbHVnaW5OYW1lKTtcblxuICAgICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiAkLmVycm9yKFxuICAgICAgICAgICAgICAnQ2Fubm90IGNhbGwgbWV0aG9kcyBvbiAnICsgcGx1Z2luTmFtZSArICcgcHJpb3IgdG8gaW5pdGlhbGl6YXRpb247ICcgK1xuICAgICAgICAgICAgICAnYXR0ZW1wdGVkIHRvIGNhbGwgbWV0aG9kIFwiJyArIG9wdGlvbnMgKyAnXCInXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghJC5pc0Z1bmN0aW9uKGluc3RhbmNlW29wdGlvbnNdKSB8fCBvcHRpb25zLmNoYXJBdCgwKSA9PT0gJ18nKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5lcnJvcihcbiAgICAgICAgICAgICAgJ05vIHN1Y2ggbWV0aG9kIFwiJyArIG9wdGlvbnMgKyAnXCIgZm9yICcgKyBwbHVnaW5OYW1lICsgJyBpbnN0YW5jZSdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG1ldGhvZFZhbHVlID0gaW5zdGFuY2Vbb3B0aW9uc10uYXBwbHkoaW5zdGFuY2UsIGFyZ3MpO1xuXG4gICAgICAgICAgaWYgKG1ldGhvZFZhbHVlICE9PSBpbnN0YW5jZSAmJiB0eXBlb2YgbWV0aG9kVmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IG1ldGhvZFZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGluc3RhbmNlID0gJCh0aGlzKS5kYXRhKHBsdWdpbk5hbWUpO1xuXG4gICAgICAgICAgaWYgKGluc3RhbmNlIGluc3RhbmNlb2YgUGx1Z2luKSB7XG4gICAgICAgICAgICBpbnN0YW5jZS5yZWxvYWQob3B0aW9ucyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldyBQbHVnaW4odGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH07XG5cbiAgICByZXR1cm4gUGx1Z2luO1xuICB9O1xufShqUXVlcnkpKTtcblxuKGZ1bmN0aW9uKCQsIHdpbmRvdykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cbiAgdmFyIHRvRmxvYXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWwpIHx8IDA7XG4gIH07XG5cbiAgJC5qQ2Fyb3VzZWwucGx1Z2luKCdqY2Fyb3VzZWwnLCB7XG4gICAgYW5pbWF0aW5nOiAgIGZhbHNlLFxuICAgIHRhaWw6ICAgICAgICAwLFxuICAgIGluVGFpbDogICAgICBmYWxzZSxcbiAgICByZXNpemVTdGF0ZTogbnVsbCxcbiAgICByZXNpemVUaW1lcjogbnVsbCxcbiAgICBsdDogICAgICAgICAgbnVsbCxcbiAgICB2ZXJ0aWNhbDogICAgZmFsc2UsXG4gICAgcnRsOiAgICAgICAgIGZhbHNlLFxuICAgIGNpcmN1bGFyOiAgICBmYWxzZSxcbiAgICB1bmRlcmZsb3c6ICAgZmFsc2UsXG4gICAgcmVsYXRpdmU6ICAgIGZhbHNlLFxuXG4gICAgX29wdGlvbnM6IHtcbiAgICAgIGxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50KCkuY2hpbGRyZW4oKS5lcSgwKTtcbiAgICAgIH0sXG4gICAgICBpdGVtczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QoKS5jaGlsZHJlbigpO1xuICAgICAgfSxcbiAgICAgIGFuaW1hdGlvbjogICA0MDAsXG4gICAgICB0cmFuc2l0aW9uczogZmFsc2UsXG4gICAgICB3cmFwOiAgICAgICAgbnVsbCxcbiAgICAgIHZlcnRpY2FsOiAgICBudWxsLFxuICAgICAgcnRsOiAgICAgICAgIG51bGwsXG4gICAgICBjZW50ZXI6ICAgICAgZmFsc2VcbiAgICB9LFxuXG4gICAgLy8gUHJvdGVjdGVkLCBkb24ndCBhY2Nlc3MgZGlyZWN0bHlcbiAgICBfbGlzdDogICAgICAgICBudWxsLFxuICAgIF9pdGVtczogICAgICAgIG51bGwsXG4gICAgX3RhcmdldDogICAgICAgJCgpLFxuICAgIF9maXJzdDogICAgICAgICQoKSxcbiAgICBfbGFzdDogICAgICAgICAkKCksXG4gICAgX3Zpc2libGU6ICAgICAgJCgpLFxuICAgIF9mdWxseXZpc2libGU6ICQoKSxcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHNlbGYucmVzaXplU3RhdGUgPSAkd2luZG93LndpZHRoKCkgKyAneCcgKyAkd2luZG93LmhlaWdodCgpO1xuXG4gICAgICB0aGlzLm9uV2luZG93UmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzZWxmLnJlc2l6ZVRpbWVyKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYucmVzaXplVGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5yZXNpemVUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGN1cnJlbnRSZXNpemVTdGF0ZSA9ICR3aW5kb3cud2lkdGgoKSArICd4JyArICR3aW5kb3cuaGVpZ2h0KCk7XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgd2luZG93IHNpemUgYWN0dWFsbHkgY2hhbmdlZC5cbiAgICAgICAgICAvLyBpT1MgbWlnaHQgdHJpZ2dlciByZXNpemUgZXZlbnRzIG9uIHBhZ2Ugc2Nyb2xsLlxuICAgICAgICAgIGlmIChjdXJyZW50UmVzaXplU3RhdGUgPT09IHNlbGYucmVzaXplU3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLnJlc2l6ZVN0YXRlID0gY3VycmVudFJlc2l6ZVN0YXRlO1xuICAgICAgICAgIHNlbGYucmVsb2FkKCk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9jcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVsb2FkKCk7XG5cbiAgICAgICR3aW5kb3cub24oJ3Jlc2l6ZS5qY2Fyb3VzZWwnLCB0aGlzLm9uV2luZG93UmVzaXplKTtcbiAgICB9LFxuICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICR3aW5kb3cub2ZmKCdyZXNpemUuamNhcm91c2VsJywgdGhpcy5vbldpbmRvd1Jlc2l6ZSk7XG4gICAgfSxcbiAgICBfcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudmVydGljYWwgPSB0aGlzLm9wdGlvbnMoJ3ZlcnRpY2FsJyk7XG5cbiAgICAgIGlmICh0aGlzLnZlcnRpY2FsID09IG51bGwpIHtcbiAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IHRvRmxvYXQodGhpcy5saXN0KCkuaGVpZ2h0KCkpID4gdG9GbG9hdCh0aGlzLmxpc3QoKS53aWR0aCgpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5ydGwgPSB0aGlzLm9wdGlvbnMoJ3J0bCcpO1xuXG4gICAgICBpZiAodGhpcy5ydGwgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJ0bCA9IChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgaWYgKCgnJyArIGVsZW1lbnQuYXR0cignZGlyJykpLnRvTG93ZXJDYXNlKCkgPT09ICdydGwnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcblxuICAgICAgICAgIGVsZW1lbnQucGFyZW50cygnW2Rpcl0nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCgvcnRsL2kpLnRlc3QoJCh0aGlzKS5hdHRyKCdkaXInKSkpIHtcbiAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgIH0odGhpcy5fZWxlbWVudCkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmx0ID0gdGhpcy52ZXJ0aWNhbCA/ICd0b3AnIDogJ2xlZnQnO1xuXG4gICAgICAvLyBFbnN1cmUgYmVmb3JlIGNsb3Nlc3QoKSBjYWxsXG4gICAgICB0aGlzLnJlbGF0aXZlID0gdGhpcy5saXN0KCkuY3NzKCdwb3NpdGlvbicpID09PSAncmVsYXRpdmUnO1xuXG4gICAgICAvLyBGb3JjZSBsaXN0IGFuZCBpdGVtcyByZWxvYWRcbiAgICAgIHRoaXMuX2xpc3QgID0gbnVsbDtcbiAgICAgIHRoaXMuX2l0ZW1zID0gbnVsbDtcblxuICAgICAgdmFyIGl0ZW0gPSB0aGlzLmluZGV4KHRoaXMuX3RhcmdldCkgPj0gMCA/XG4gICAgICAgIHRoaXMuX3RhcmdldCA6XG4gICAgICAgIHRoaXMuY2xvc2VzdCgpO1xuXG4gICAgICAvLyBfcHJlcGFyZSgpIG5lZWRzIHRoaXMgaGVyZVxuICAgICAgdGhpcy5jaXJjdWxhciAgPSB0aGlzLm9wdGlvbnMoJ3dyYXAnKSA9PT0gJ2NpcmN1bGFyJztcbiAgICAgIHRoaXMudW5kZXJmbG93ID0gZmFsc2U7XG5cbiAgICAgIHZhciBwcm9wcyA9IHsnbGVmdCc6IDAsICd0b3AnOiAwfTtcblxuICAgICAgaWYgKGl0ZW0ubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9wcmVwYXJlKGl0ZW0pO1xuICAgICAgICB0aGlzLmxpc3QoKS5maW5kKCdbZGF0YS1qY2Fyb3VzZWwtY2xvbmVdJykucmVtb3ZlKCk7XG5cbiAgICAgICAgLy8gRm9yY2UgaXRlbXMgcmVsb2FkXG4gICAgICAgIHRoaXMuX2l0ZW1zID0gbnVsbDtcblxuICAgICAgICB0aGlzLnVuZGVyZmxvdyA9IHRoaXMuX2Z1bGx5dmlzaWJsZS5sZW5ndGggPj0gdGhpcy5pdGVtcygpLmxlbmd0aDtcbiAgICAgICAgdGhpcy5jaXJjdWxhciAgPSB0aGlzLmNpcmN1bGFyICYmICF0aGlzLnVuZGVyZmxvdztcblxuICAgICAgICBwcm9wc1t0aGlzLmx0XSA9IHRoaXMuX3Bvc2l0aW9uKGl0ZW0pICsgJ3B4JztcbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3ZlKHByb3BzKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBsaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9saXN0ID09PSBudWxsKSB7XG4gICAgICAgIHZhciBvcHRpb24gPSB0aGlzLm9wdGlvbnMoJ2xpc3QnKTtcbiAgICAgICAgdGhpcy5fbGlzdCA9ICQuaXNGdW5jdGlvbihvcHRpb24pID8gb3B0aW9uLmNhbGwodGhpcykgOiB0aGlzLl9lbGVtZW50LmZpbmQob3B0aW9uKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX2xpc3Q7XG4gICAgfSxcbiAgICBpdGVtczogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5faXRlbXMgPT09IG51bGwpIHtcbiAgICAgICAgdmFyIG9wdGlvbiA9IHRoaXMub3B0aW9ucygnaXRlbXMnKTtcbiAgICAgICAgdGhpcy5faXRlbXMgPSAoJC5pc0Z1bmN0aW9uKG9wdGlvbikgPyBvcHRpb24uY2FsbCh0aGlzKSA6IHRoaXMubGlzdCgpLmZpbmQob3B0aW9uKSkubm90KCdbZGF0YS1qY2Fyb3VzZWwtY2xvbmVdJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9pdGVtcztcbiAgICB9LFxuICAgIGluZGV4OiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gdGhpcy5pdGVtcygpLmluZGV4KGl0ZW0pO1xuICAgIH0sXG4gICAgY2xvc2VzdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiAgICA9IHRoaXMsXG4gICAgICAgIHBvcyAgICAgPSB0aGlzLmxpc3QoKS5wb3NpdGlvbigpW3RoaXMubHRdLFxuICAgICAgICBjbG9zZXN0ID0gJCgpLCAvLyBFbnN1cmUgd2UncmUgcmV0dXJuaW5nIGEgalF1ZXJ5IGluc3RhbmNlXG4gICAgICAgIHN0b3AgICAgPSBmYWxzZSxcbiAgICAgICAgbHJiICAgICA9IHRoaXMudmVydGljYWwgPyAnYm90dG9tJyA6ICh0aGlzLnJ0bCAmJiAhdGhpcy5yZWxhdGl2ZSA/ICdsZWZ0JyA6ICdyaWdodCcpLFxuICAgICAgICB3aWR0aDtcblxuICAgICAgaWYgKHRoaXMucnRsICYmIHRoaXMucmVsYXRpdmUgJiYgIXRoaXMudmVydGljYWwpIHtcbiAgICAgICAgcG9zICs9IHRvRmxvYXQodGhpcy5saXN0KCkud2lkdGgoKSkgLSB0aGlzLmNsaXBwaW5nKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXRlbXMoKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBjbG9zZXN0ID0gJCh0aGlzKTtcblxuICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkaW0gPSBzZWxmLmRpbWVuc2lvbihjbG9zZXN0KTtcblxuICAgICAgICBwb3MgKz0gZGltO1xuXG4gICAgICAgIGlmIChwb3MgPj0gMCkge1xuICAgICAgICAgIHdpZHRoID0gZGltIC0gdG9GbG9hdChjbG9zZXN0LmNzcygnbWFyZ2luLScgKyBscmIpKTtcblxuICAgICAgICAgIGlmICgoTWF0aC5hYnMocG9zKSAtIGRpbSArICh3aWR0aCAvIDIpKSA8PSAwKSB7XG4gICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgICAgcmV0dXJuIGNsb3Nlc3Q7XG4gICAgfSxcbiAgICB0YXJnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RhcmdldDtcbiAgICB9LFxuICAgIGZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9maXJzdDtcbiAgICB9LFxuICAgIGxhc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2xhc3Q7XG4gICAgfSxcbiAgICB2aXNpYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl92aXNpYmxlO1xuICAgIH0sXG4gICAgZnVsbHl2aXNpYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9mdWxseXZpc2libGU7XG4gICAgfSxcbiAgICBoYXNOZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignaGFzbmV4dCcpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgd3JhcCA9IHRoaXMub3B0aW9ucygnd3JhcCcpLFxuICAgICAgICBlbmQgPSB0aGlzLml0ZW1zKCkubGVuZ3RoIC0gMSxcbiAgICAgICAgY2hlY2sgPSB0aGlzLm9wdGlvbnMoJ2NlbnRlcicpID8gdGhpcy5fdGFyZ2V0IDogdGhpcy5fbGFzdDtcblxuICAgICAgcmV0dXJuIGVuZCA+PSAwICYmICF0aGlzLnVuZGVyZmxvdyAmJlxuICAgICAgKCh3cmFwICYmIHdyYXAgIT09ICdmaXJzdCcpIHx8XG4gICAgICAgICh0aGlzLmluZGV4KGNoZWNrKSA8IGVuZCkgfHxcbiAgICAgICAgKHRoaXMudGFpbCAmJiAhdGhpcy5pblRhaWwpKSA/IHRydWUgOiBmYWxzZTtcbiAgICB9LFxuICAgIGhhc1ByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdoYXNwcmV2JykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciB3cmFwID0gdGhpcy5vcHRpb25zKCd3cmFwJyk7XG5cbiAgICAgIHJldHVybiB0aGlzLml0ZW1zKCkubGVuZ3RoID4gMCAmJiAhdGhpcy51bmRlcmZsb3cgJiZcbiAgICAgICgod3JhcCAmJiB3cmFwICE9PSAnbGFzdCcpIHx8XG4gICAgICAgICh0aGlzLmluZGV4KHRoaXMuX2ZpcnN0KSA+IDApIHx8XG4gICAgICAgICh0aGlzLnRhaWwgJiYgdGhpcy5pblRhaWwpKSA/IHRydWUgOiBmYWxzZTtcbiAgICB9LFxuICAgIGNsaXBwaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0b0Zsb2F0KHRoaXMuX2VsZW1lbnRbJ2lubmVyJyArICh0aGlzLnZlcnRpY2FsID8gJ0hlaWdodCcgOiAnV2lkdGgnKV0oKSk7XG4gICAgfSxcbiAgICBkaW1lbnNpb246IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiB0b0Zsb2F0KGVsZW1lbnRbJ291dGVyJyArICh0aGlzLnZlcnRpY2FsID8gJ0hlaWdodCcgOiAnV2lkdGgnKV0odHJ1ZSkpO1xuICAgIH0sXG4gICAgc2Nyb2xsOiBmdW5jdGlvbih0YXJnZXQsIGFuaW1hdGUsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAodGhpcy5hbmltYXRpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignc2Nyb2xsJywgbnVsbCwgW3RhcmdldCwgYW5pbWF0ZV0pKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKGFuaW1hdGUpKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYW5pbWF0ZTtcbiAgICAgICAgYW5pbWF0ZSAgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcGFyc2VkID0gJC5qQ2Fyb3VzZWwucGFyc2VUYXJnZXQodGFyZ2V0KTtcblxuICAgICAgaWYgKHBhcnNlZC5yZWxhdGl2ZSkge1xuICAgICAgICB2YXIgZW5kICAgID0gdGhpcy5pdGVtcygpLmxlbmd0aCAtIDEsXG4gICAgICAgICAgc2Nyb2xsID0gTWF0aC5hYnMocGFyc2VkLnRhcmdldCksXG4gICAgICAgICAgd3JhcCAgID0gdGhpcy5vcHRpb25zKCd3cmFwJyksXG4gICAgICAgICAgY3VycmVudCxcbiAgICAgICAgICBmaXJzdCxcbiAgICAgICAgICBpbmRleCxcbiAgICAgICAgICBzdGFydCxcbiAgICAgICAgICBjdXJyLFxuICAgICAgICAgIGlzVmlzaWJsZSxcbiAgICAgICAgICBwcm9wcyxcbiAgICAgICAgICBpO1xuXG4gICAgICAgIGlmIChwYXJzZWQudGFyZ2V0ID4gMCkge1xuICAgICAgICAgIHZhciBsYXN0ID0gdGhpcy5pbmRleCh0aGlzLl9sYXN0KTtcblxuICAgICAgICAgIGlmIChsYXN0ID49IGVuZCAmJiB0aGlzLnRhaWwpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pblRhaWwpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsVGFpbChhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAod3JhcCA9PT0gJ2JvdGgnIHx8IHdyYXAgPT09ICdsYXN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbCgwLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcy5pbmRleCh0aGlzLl90YXJnZXQpO1xuXG4gICAgICAgICAgICBpZiAoKHRoaXMudW5kZXJmbG93ICYmIGN1cnJlbnQgPT09IGVuZCAmJiAod3JhcCA9PT0gJ2NpcmN1bGFyJyB8fCB3cmFwID09PSAnYm90aCcgfHwgd3JhcCA9PT0gJ2xhc3QnKSkgfHxcbiAgICAgICAgICAgICAgKCF0aGlzLnVuZGVyZmxvdyAmJiBsYXN0ID09PSBlbmQgJiYgKHdyYXAgPT09ICdib3RoJyB8fCB3cmFwID09PSAnbGFzdCcpKSkge1xuICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoMCwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaW5kZXggPSBjdXJyZW50ICsgc2Nyb2xsO1xuXG4gICAgICAgICAgICAgIGlmICh0aGlzLmNpcmN1bGFyICYmIGluZGV4ID4gZW5kKSB7XG4gICAgICAgICAgICAgICAgaSA9IGVuZDtcbiAgICAgICAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmdldCgtMSk7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAoaSsrIDwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoMCk7XG4gICAgICAgICAgICAgICAgICBpc1Zpc2libGUgPSB0aGlzLl92aXNpYmxlLmluZGV4KGN1cnIpID49IDA7XG5cbiAgICAgICAgICAgICAgICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3Vyci5hZnRlcihjdXJyLmNsb25lKHRydWUpLmF0dHIoJ2RhdGEtamNhcm91c2VsLWNsb25lJywgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICB0aGlzLmxpc3QoKS5hcHBlbmQoY3Vycik7XG5cbiAgICAgICAgICAgICAgICAgIGlmICghaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzID0ge307XG4gICAgICAgICAgICAgICAgICAgIHByb3BzW3RoaXMubHRdID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZUJ5KHByb3BzKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gRm9yY2UgaXRlbXMgcmVsb2FkXG4gICAgICAgICAgICAgICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKGN1cnIsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoTWF0aC5taW4oaW5kZXgsIGVuZCksIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5pblRhaWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbChNYXRoLm1heCgodGhpcy5pbmRleCh0aGlzLl9maXJzdCkgLSBzY3JvbGwpICsgMSwgMCksIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlyc3QgID0gdGhpcy5pbmRleCh0aGlzLl9maXJzdCk7XG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcy5pbmRleCh0aGlzLl90YXJnZXQpO1xuICAgICAgICAgICAgc3RhcnQgID0gdGhpcy51bmRlcmZsb3cgPyBjdXJyZW50IDogZmlyc3Q7XG4gICAgICAgICAgICBpbmRleCAgPSBzdGFydCAtIHNjcm9sbDtcblxuICAgICAgICAgICAgaWYgKHN0YXJ0IDw9IDAgJiYgKCh0aGlzLnVuZGVyZmxvdyAmJiB3cmFwID09PSAnY2lyY3VsYXInKSB8fCB3cmFwID09PSAnYm90aCcgfHwgd3JhcCA9PT0gJ2ZpcnN0JykpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKGVuZCwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuY2lyY3VsYXIgJiYgaW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgaSAgICA9IGluZGV4O1xuICAgICAgICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZ2V0KDApO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkrKyA8IDApIHtcbiAgICAgICAgICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoLTEpO1xuICAgICAgICAgICAgICAgICAgaXNWaXNpYmxlID0gdGhpcy5fdmlzaWJsZS5pbmRleChjdXJyKSA+PSAwO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnIuYWZ0ZXIoY3Vyci5jbG9uZSh0cnVlKS5hdHRyKCdkYXRhLWpjYXJvdXNlbC1jbG9uZScsIHRydWUpKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdGhpcy5saXN0KCkucHJlcGVuZChjdXJyKTtcblxuICAgICAgICAgICAgICAgICAgLy8gRm9yY2UgaXRlbXMgcmVsb2FkXG4gICAgICAgICAgICAgICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgIHZhciBkaW0gPSB0aGlzLmRpbWVuc2lvbihjdXJyKTtcblxuICAgICAgICAgICAgICAgICAgcHJvcHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgIHByb3BzW3RoaXMubHRdID0gLWRpbTtcbiAgICAgICAgICAgICAgICAgIHRoaXMubW92ZUJ5KHByb3BzKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbChjdXJyLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKE1hdGgubWF4KGluZGV4LCAwKSwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zY3JvbGwocGFyc2VkLnRhcmdldCwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl90cmlnZ2VyKCdzY3JvbGxlbmQnKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBtb3ZlQnk6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIG9wdHMpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMubGlzdCgpLnBvc2l0aW9uKCksXG4gICAgICAgIG11bHRpcGxpZXIgPSAxLFxuICAgICAgICBjb3JyZWN0aW9uID0gMDtcblxuICAgICAgaWYgKHRoaXMucnRsICYmICF0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSAtMTtcblxuICAgICAgICBpZiAodGhpcy5yZWxhdGl2ZSkge1xuICAgICAgICAgIGNvcnJlY3Rpb24gPSB0b0Zsb2F0KHRoaXMubGlzdCgpLndpZHRoKCkpIC0gdGhpcy5jbGlwcGluZygpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9wZXJ0aWVzLmxlZnQpIHtcbiAgICAgICAgcHJvcGVydGllcy5sZWZ0ID0gKHRvRmxvYXQocG9zaXRpb24ubGVmdCkgKyBjb3JyZWN0aW9uICsgdG9GbG9hdChwcm9wZXJ0aWVzLmxlZnQpICogbXVsdGlwbGllcikgKyAncHgnO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvcGVydGllcy50b3ApIHtcbiAgICAgICAgcHJvcGVydGllcy50b3AgPSAodG9GbG9hdChwb3NpdGlvbi50b3ApICsgY29ycmVjdGlvbiArIHRvRmxvYXQocHJvcGVydGllcy50b3ApICogbXVsdGlwbGllcikgKyAncHgnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5tb3ZlKHByb3BlcnRpZXMsIG9wdHMpO1xuICAgIH0sXG4gICAgbW92ZTogZnVuY3Rpb24ocHJvcGVydGllcywgb3B0cykge1xuICAgICAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgICAgIHZhciBvcHRpb24gICAgICAgPSB0aGlzLm9wdGlvbnMoJ3RyYW5zaXRpb25zJyksXG4gICAgICAgIHRyYW5zaXRpb25zICA9ICEhb3B0aW9uLFxuICAgICAgICB0cmFuc2Zvcm1zICAgPSAhIW9wdGlvbi50cmFuc2Zvcm1zLFxuICAgICAgICB0cmFuc2Zvcm1zM2QgPSAhIW9wdGlvbi50cmFuc2Zvcm1zM2QsXG4gICAgICAgIGR1cmF0aW9uICAgICA9IG9wdHMuZHVyYXRpb24gfHwgMCxcbiAgICAgICAgbGlzdCAgICAgICAgID0gdGhpcy5saXN0KCk7XG5cbiAgICAgIGlmICghdHJhbnNpdGlvbnMgJiYgZHVyYXRpb24gPiAwKSB7XG4gICAgICAgIGxpc3QuYW5pbWF0ZShwcm9wZXJ0aWVzLCBvcHRzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29tcGxldGUgPSBvcHRzLmNvbXBsZXRlIHx8ICQubm9vcCxcbiAgICAgICAgY3NzID0ge307XG5cbiAgICAgIGlmICh0cmFuc2l0aW9ucykge1xuICAgICAgICB2YXIgYmFja3VwID0ge1xuICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiBsaXN0LmNzcygndHJhbnNpdGlvbkR1cmF0aW9uJyksXG4gICAgICAgICAgICB0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb246IGxpc3QuY3NzKCd0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb24nKSxcbiAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0eTogbGlzdC5jc3MoJ3RyYW5zaXRpb25Qcm9wZXJ0eScpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbGRDb21wbGV0ZSA9IGNvbXBsZXRlO1xuXG4gICAgICAgIGNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJCh0aGlzKS5jc3MoYmFja3VwKTtcbiAgICAgICAgICBvbGRDb21wbGV0ZS5jYWxsKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBjc3MgPSB7XG4gICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiAoZHVyYXRpb24gPiAwID8gZHVyYXRpb24gLyAxMDAwIDogMCkgKyAncycsXG4gICAgICAgICAgdHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBvcHRpb24uZWFzaW5nIHx8IG9wdHMuZWFzaW5nLFxuICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0eTogZHVyYXRpb24gPiAwID8gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybXMgfHwgdHJhbnNmb3JtczNkKSB7XG4gICAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gdXNlICdhbGwnIGJlY2F1c2UgalF1ZXJ5IGRvZXNuJ3QgcHJlZml4XG4gICAgICAgICAgICAgIC8vIGNzcyB2YWx1ZXMsIGxpa2UgdHJhbnNpdGlvbi1wcm9wZXJ0eTogdHJhbnNmb3JtO1xuICAgICAgICAgICAgICByZXR1cm4gJ2FsbCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzLmxlZnQgPyAnbGVmdCcgOiAndG9wJztcbiAgICAgICAgICB9KSgpIDogJ25vbmUnLFxuICAgICAgICAgIHRyYW5zZm9ybTogJ25vbmUnXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmICh0cmFuc2Zvcm1zM2QpIHtcbiAgICAgICAgY3NzLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKHByb3BlcnRpZXMubGVmdCB8fCAwKSArICcsJyArIChwcm9wZXJ0aWVzLnRvcCB8fCAwKSArICcsMCknO1xuICAgICAgfSBlbHNlIGlmICh0cmFuc2Zvcm1zKSB7XG4gICAgICAgIGNzcy50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAocHJvcGVydGllcy5sZWZ0IHx8IDApICsgJywnICsgKHByb3BlcnRpZXMudG9wIHx8IDApICsgJyknO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJC5leHRlbmQoY3NzLCBwcm9wZXJ0aWVzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRyYW5zaXRpb25zICYmIGR1cmF0aW9uID4gMCkge1xuICAgICAgICBsaXN0Lm9uZSgndHJhbnNpdGlvbmVuZCB3ZWJraXRUcmFuc2l0aW9uRW5kIG9UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kIE1TVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKTtcbiAgICAgIH1cblxuICAgICAgbGlzdC5jc3MoY3NzKTtcblxuICAgICAgaWYgKGR1cmF0aW9uIDw9IDApIHtcbiAgICAgICAgbGlzdC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbXBsZXRlLmNhbGwodGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgX3Njcm9sbDogZnVuY3Rpb24oaXRlbSwgYW5pbWF0ZSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGluZykge1xuICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlbSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgaXRlbSA9IHRoaXMuaXRlbXMoKS5lcShpdGVtKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGl0ZW0uanF1ZXJ5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpdGVtID0gJChpdGVtKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdGhpcy5pblRhaWwgPSBmYWxzZTtcblxuICAgICAgdGhpcy5fcHJlcGFyZShpdGVtKTtcblxuICAgICAgdmFyIHBvcyAgICAgPSB0aGlzLl9wb3NpdGlvbihpdGVtKSxcbiAgICAgICAgY3VyclBvcyA9IHRvRmxvYXQodGhpcy5saXN0KCkucG9zaXRpb24oKVt0aGlzLmx0XSk7XG5cbiAgICAgIGlmIChwb3MgPT09IGN1cnJQb3MpIHtcbiAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJvcGVydGllc1t0aGlzLmx0XSA9IHBvcyArICdweCc7XG5cbiAgICAgIHRoaXMuX2FuaW1hdGUocHJvcGVydGllcywgYW5pbWF0ZSwgY2FsbGJhY2spO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9zY3JvbGxUYWlsOiBmdW5jdGlvbihhbmltYXRlLCBjYWxsYmFjaykge1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nIHx8ICF0aGlzLnRhaWwpIHtcbiAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5saXN0KCkucG9zaXRpb24oKVt0aGlzLmx0XTtcblxuICAgICAgaWYgKHRoaXMucnRsICYmIHRoaXMucmVsYXRpdmUgJiYgIXRoaXMudmVydGljYWwpIHtcbiAgICAgICAgcG9zICs9IHRvRmxvYXQodGhpcy5saXN0KCkud2lkdGgoKSkgLSB0aGlzLmNsaXBwaW5nKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnJ0bCAmJiAhdGhpcy52ZXJ0aWNhbCkge1xuICAgICAgICBwb3MgKz0gdGhpcy50YWlsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zIC09IHRoaXMudGFpbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pblRhaWwgPSB0cnVlO1xuXG4gICAgICB2YXIgcHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJvcGVydGllc1t0aGlzLmx0XSA9IHBvcyArICdweCc7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZSh7XG4gICAgICAgIHRhcmdldDogICAgICAgdGhpcy5fdGFyZ2V0Lm5leHQoKSxcbiAgICAgICAgZnVsbHl2aXNpYmxlOiB0aGlzLl9mdWxseXZpc2libGUuc2xpY2UoMSkuYWRkKHRoaXMuX3Zpc2libGUubGFzdCgpKVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2FuaW1hdGUocHJvcGVydGllcywgYW5pbWF0ZSwgY2FsbGJhY2spO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9hbmltYXRlOiBmdW5jdGlvbihwcm9wZXJ0aWVzLCBhbmltYXRlLCBjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCAkLm5vb3A7XG5cbiAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignYW5pbWF0ZScpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdGhpcy5hbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICB2YXIgYW5pbWF0aW9uID0gdGhpcy5vcHRpb25zKCdhbmltYXRpb24nKSxcbiAgICAgICAgY29tcGxldGUgID0gJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLmFuaW1hdGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgdmFyIGMgPSB0aGlzLmxpc3QoKS5maW5kKCdbZGF0YS1qY2Fyb3VzZWwtY2xvbmVdJyk7XG5cbiAgICAgICAgICBpZiAoYy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjLnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5fcmVsb2FkKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fdHJpZ2dlcignYW5pbWF0ZWVuZCcpO1xuXG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCB0cnVlKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHZhciBvcHRzID0gdHlwZW9mIGFuaW1hdGlvbiA9PT0gJ29iamVjdCcgP1xuICAgICAgICAkLmV4dGVuZCh7fSwgYW5pbWF0aW9uKSA6XG4gICAgICAgIHtkdXJhdGlvbjogYW5pbWF0aW9ufSxcbiAgICAgICAgb2xkQ29tcGxldGUgPSBvcHRzLmNvbXBsZXRlIHx8ICQubm9vcDtcblxuICAgICAgaWYgKGFuaW1hdGUgPT09IGZhbHNlKSB7XG4gICAgICAgIG9wdHMuZHVyYXRpb24gPSAwO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgJC5meC5zcGVlZHNbb3B0cy5kdXJhdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG9wdHMuZHVyYXRpb24gPSAkLmZ4LnNwZWVkc1tvcHRzLmR1cmF0aW9uXTtcbiAgICAgIH1cblxuICAgICAgb3B0cy5jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICBvbGRDb21wbGV0ZS5jYWxsKHRoaXMpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5tb3ZlKHByb3BlcnRpZXMsIG9wdHMpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9wcmVwYXJlOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICB2YXIgaW5kZXggID0gdGhpcy5pbmRleChpdGVtKSxcbiAgICAgICAgaWR4ICAgID0gaW5kZXgsXG4gICAgICAgIHdoICAgICA9IHRoaXMuZGltZW5zaW9uKGl0ZW0pLFxuICAgICAgICBjbGlwICAgPSB0aGlzLmNsaXBwaW5nKCksXG4gICAgICAgIGxyYiAgICA9IHRoaXMudmVydGljYWwgPyAnYm90dG9tJyA6ICh0aGlzLnJ0bCA/ICdsZWZ0JyAgOiAncmlnaHQnKSxcbiAgICAgICAgY2VudGVyID0gdGhpcy5vcHRpb25zKCdjZW50ZXInKSxcbiAgICAgICAgdXBkYXRlID0ge1xuICAgICAgICAgIHRhcmdldDogICAgICAgaXRlbSxcbiAgICAgICAgICBmaXJzdDogICAgICAgIGl0ZW0sXG4gICAgICAgICAgbGFzdDogICAgICAgICBpdGVtLFxuICAgICAgICAgIHZpc2libGU6ICAgICAgaXRlbSxcbiAgICAgICAgICBmdWxseXZpc2libGU6IHdoIDw9IGNsaXAgPyBpdGVtIDogJCgpXG4gICAgICAgIH0sXG4gICAgICAgIGN1cnIsXG4gICAgICAgIGlzVmlzaWJsZSxcbiAgICAgICAgbWFyZ2luLFxuICAgICAgICBkaW07XG5cbiAgICAgIGlmIChjZW50ZXIpIHtcbiAgICAgICAgd2ggLz0gMjtcbiAgICAgICAgY2xpcCAvPSAyO1xuICAgICAgfVxuXG4gICAgICBpZiAod2ggPCBjbGlwKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5lcSgrK2lkeCk7XG5cbiAgICAgICAgICBpZiAoY3Vyci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jaXJjdWxhcikge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5lcSgwKTtcblxuICAgICAgICAgICAgaWYgKGl0ZW0uZ2V0KDApID09PSBjdXJyLmdldCgwKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaXNWaXNpYmxlID0gdGhpcy5fdmlzaWJsZS5pbmRleChjdXJyKSA+PSAwO1xuXG4gICAgICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgIGN1cnIuYWZ0ZXIoY3Vyci5jbG9uZSh0cnVlKS5hdHRyKCdkYXRhLWpjYXJvdXNlbC1jbG9uZScsIHRydWUpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5saXN0KCkuYXBwZW5kKGN1cnIpO1xuXG4gICAgICAgICAgICBpZiAoIWlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICB2YXIgcHJvcHMgPSB7fTtcbiAgICAgICAgICAgICAgcHJvcHNbdGhpcy5sdF0gPSB0aGlzLmRpbWVuc2lvbihjdXJyKTtcbiAgICAgICAgICAgICAgdGhpcy5tb3ZlQnkocHJvcHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGb3JjZSBpdGVtcyByZWxvYWRcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1zID0gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaW0gPSB0aGlzLmRpbWVuc2lvbihjdXJyKTtcblxuICAgICAgICAgIGlmIChkaW0gPT09IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdoICs9IGRpbTtcblxuICAgICAgICAgIHVwZGF0ZS5sYXN0ICAgID0gY3VycjtcbiAgICAgICAgICB1cGRhdGUudmlzaWJsZSA9IHVwZGF0ZS52aXNpYmxlLmFkZChjdXJyKTtcblxuICAgICAgICAgIC8vIFJlbW92ZSByaWdodC9ib3R0b20gbWFyZ2luIGZyb20gdG90YWwgd2lkdGhcbiAgICAgICAgICBtYXJnaW4gPSB0b0Zsb2F0KGN1cnIuY3NzKCdtYXJnaW4tJyArIGxyYikpO1xuXG4gICAgICAgICAgaWYgKCh3aCAtIG1hcmdpbikgPD0gY2xpcCkge1xuICAgICAgICAgICAgdXBkYXRlLmZ1bGx5dmlzaWJsZSA9IHVwZGF0ZS5mdWxseXZpc2libGUuYWRkKGN1cnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh3aCA+PSBjbGlwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmNpcmN1bGFyICYmICFjZW50ZXIgJiYgd2ggPCBjbGlwKSB7XG4gICAgICAgIGlkeCA9IGluZGV4O1xuXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgaWYgKC0taWR4IDwgMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5lcShpZHgpO1xuXG4gICAgICAgICAgaWYgKGN1cnIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaW0gPSB0aGlzLmRpbWVuc2lvbihjdXJyKTtcblxuICAgICAgICAgIGlmIChkaW0gPT09IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdoICs9IGRpbTtcblxuICAgICAgICAgIHVwZGF0ZS5maXJzdCAgID0gY3VycjtcbiAgICAgICAgICB1cGRhdGUudmlzaWJsZSA9IHVwZGF0ZS52aXNpYmxlLmFkZChjdXJyKTtcblxuICAgICAgICAgIC8vIFJlbW92ZSByaWdodC9ib3R0b20gbWFyZ2luIGZyb20gdG90YWwgd2lkdGhcbiAgICAgICAgICBtYXJnaW4gPSB0b0Zsb2F0KGN1cnIuY3NzKCdtYXJnaW4tJyArIGxyYikpO1xuXG4gICAgICAgICAgaWYgKCh3aCAtIG1hcmdpbikgPD0gY2xpcCkge1xuICAgICAgICAgICAgdXBkYXRlLmZ1bGx5dmlzaWJsZSA9IHVwZGF0ZS5mdWxseXZpc2libGUuYWRkKGN1cnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh3aCA+PSBjbGlwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fdXBkYXRlKHVwZGF0ZSk7XG5cbiAgICAgIHRoaXMudGFpbCA9IDA7XG5cbiAgICAgIGlmICghY2VudGVyICYmXG4gICAgICAgIHRoaXMub3B0aW9ucygnd3JhcCcpICE9PSAnY2lyY3VsYXInICYmXG4gICAgICAgIHRoaXMub3B0aW9ucygnd3JhcCcpICE9PSAnY3VzdG9tJyAmJlxuICAgICAgICB0aGlzLmluZGV4KHVwZGF0ZS5sYXN0KSA9PT0gKHRoaXMuaXRlbXMoKS5sZW5ndGggLSAxKSkge1xuXG4gICAgICAgIC8vIFJlbW92ZSByaWdodC9ib3R0b20gbWFyZ2luIGZyb20gdG90YWwgd2lkdGhcbiAgICAgICAgd2ggLT0gdG9GbG9hdCh1cGRhdGUubGFzdC5jc3MoJ21hcmdpbi0nICsgbHJiKSk7XG5cbiAgICAgICAgaWYgKHdoID4gY2xpcCkge1xuICAgICAgICAgIHRoaXMudGFpbCA9IHdoIC0gY2xpcDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9wb3NpdGlvbjogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdmFyIGZpcnN0ICA9IHRoaXMuX2ZpcnN0LFxuICAgICAgICBwb3MgICAgPSB0b0Zsb2F0KGZpcnN0LnBvc2l0aW9uKClbdGhpcy5sdF0pLFxuICAgICAgICBjZW50ZXIgPSB0aGlzLm9wdGlvbnMoJ2NlbnRlcicpLFxuICAgICAgICBjZW50ZXJPZmZzZXQgPSBjZW50ZXIgPyAodGhpcy5jbGlwcGluZygpIC8gMikgLSAodGhpcy5kaW1lbnNpb24oZmlyc3QpIC8gMikgOiAwO1xuXG4gICAgICBpZiAodGhpcy5ydGwgJiYgIXRoaXMudmVydGljYWwpIHtcbiAgICAgICAgaWYgKHRoaXMucmVsYXRpdmUpIHtcbiAgICAgICAgICBwb3MgLT0gdG9GbG9hdCh0aGlzLmxpc3QoKS53aWR0aCgpKSAtIHRoaXMuZGltZW5zaW9uKGZpcnN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwb3MgLT0gdGhpcy5jbGlwcGluZygpIC0gdGhpcy5kaW1lbnNpb24oZmlyc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9zICs9IGNlbnRlck9mZnNldDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvcyAtPSBjZW50ZXJPZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIGlmICghY2VudGVyICYmXG4gICAgICAgICh0aGlzLmluZGV4KGl0ZW0pID4gdGhpcy5pbmRleChmaXJzdCkgfHwgdGhpcy5pblRhaWwpICYmXG4gICAgICAgIHRoaXMudGFpbCkge1xuICAgICAgICBwb3MgPSB0aGlzLnJ0bCAmJiAhdGhpcy52ZXJ0aWNhbCA/IHBvcyAtIHRoaXMudGFpbCA6IHBvcyArIHRoaXMudGFpbDtcbiAgICAgICAgdGhpcy5pblRhaWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pblRhaWwgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIC1wb3M7XG4gICAgfSxcbiAgICBfdXBkYXRlOiBmdW5jdGlvbih1cGRhdGUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgY3VycmVudCA9IHtcbiAgICAgICAgICB0YXJnZXQ6ICAgICAgIHRoaXMuX3RhcmdldCxcbiAgICAgICAgICBmaXJzdDogICAgICAgIHRoaXMuX2ZpcnN0LFxuICAgICAgICAgIGxhc3Q6ICAgICAgICAgdGhpcy5fbGFzdCxcbiAgICAgICAgICB2aXNpYmxlOiAgICAgIHRoaXMuX3Zpc2libGUsXG4gICAgICAgICAgZnVsbHl2aXNpYmxlOiB0aGlzLl9mdWxseXZpc2libGVcbiAgICAgICAgfSxcbiAgICAgICAgYmFjayA9IHRoaXMuaW5kZXgodXBkYXRlLmZpcnN0IHx8IGN1cnJlbnQuZmlyc3QpIDwgdGhpcy5pbmRleChjdXJyZW50LmZpcnN0KSxcbiAgICAgICAga2V5LFxuICAgICAgICBkb1VwZGF0ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgIHZhciBlbEluICA9IFtdLFxuICAgICAgICAgICAgZWxPdXQgPSBbXTtcblxuICAgICAgICAgIHVwZGF0ZVtrZXldLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFtrZXldLmluZGV4KHRoaXMpIDwgMCkge1xuICAgICAgICAgICAgICBlbEluLnB1c2godGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjdXJyZW50W2tleV0uZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh1cGRhdGVba2V5XS5pbmRleCh0aGlzKSA8IDApIHtcbiAgICAgICAgICAgICAgZWxPdXQucHVzaCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChiYWNrKSB7XG4gICAgICAgICAgICBlbEluID0gZWxJbi5yZXZlcnNlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsT3V0ID0gZWxPdXQucmV2ZXJzZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX3RyaWdnZXIoa2V5ICsgJ2luJywgJChlbEluKSk7XG4gICAgICAgICAgc2VsZi5fdHJpZ2dlcihrZXkgKyAnb3V0JywgJChlbE91dCkpO1xuXG4gICAgICAgICAgc2VsZlsnXycgKyBrZXldID0gdXBkYXRlW2tleV07XG4gICAgICAgIH07XG5cbiAgICAgIGZvciAoa2V5IGluIHVwZGF0ZSkge1xuICAgICAgICBkb1VwZGF0ZShrZXkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0pO1xufShqUXVlcnksIHdpbmRvdykpO1xuXG4vKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjIuMFxuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0dmFyIHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlcjtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICghcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyKSB7XG5cdFx0dmFyIE9sZENvb2tpZXMgPSB3aW5kb3cuQ29va2llcztcblx0XHR2YXIgYXBpID0gd2luZG93LkNvb2tpZXMgPSBmYWN0b3J5KCk7XG5cdFx0YXBpLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aW5kb3cuQ29va2llcyA9IE9sZENvb2tpZXM7XG5cdFx0XHRyZXR1cm4gYXBpO1xuXHRcdH07XG5cdH1cbn0oZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBleHRlbmQgKCkge1xuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0Zm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzWyBpIF07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAocykge1xuXHRcdHJldHVybiBzLnJlcGxhY2UoLyglWzAtOUEtWl17Mn0pKy9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpKCkge31cblxuXHRcdGZ1bmN0aW9uIHNldCAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRhdHRyaWJ1dGVzID0gZXh0ZW5kKHtcblx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHR9LCBhcGkuZGVmYXVsdHMsIGF0dHJpYnV0ZXMpO1xuXG5cdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gbmV3IERhdGUobmV3IERhdGUoKSAqIDEgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXZSdyZSB1c2luZyBcImV4cGlyZXNcIiBiZWNhdXNlIFwibWF4LWFnZVwiIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGF0dHJpYnV0ZXMuZXhwaXJlcyA/IGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpIDogJyc7XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHZhciByZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHRcdGlmICgvXltcXHtcXFtdLy50ZXN0KHJlc3VsdCkpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZSkge31cblxuXHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUgP1xuXHRcdFx0XHRjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSkgOlxuXHRcdFx0XHRlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSlcblx0XHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblxuXHRcdFx0a2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhrZXkpKVxuXHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuXHRcdFx0XHQucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKTtcblxuXHRcdFx0dmFyIHN0cmluZ2lmaWVkQXR0cmlidXRlcyA9ICcnO1xuXHRcdFx0Zm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnOyAnICsgYXR0cmlidXRlTmFtZTtcblx0XHRcdFx0aWYgKGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0gPT09IHRydWUpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENvbnNpZGVycyBSRkMgNjI2NSBzZWN0aW9uIDUuMjpcblx0XHRcdFx0Ly8gLi4uXG5cdFx0XHRcdC8vIDMuICBJZiB0aGUgcmVtYWluaW5nIHVucGFyc2VkLWF0dHJpYnV0ZXMgY29udGFpbnMgYSAleDNCIChcIjtcIilcblx0XHRcdFx0Ly8gICAgIGNoYXJhY3Rlcjpcblx0XHRcdFx0Ly8gQ29uc3VtZSB0aGUgY2hhcmFjdGVycyBvZiB0aGUgdW5wYXJzZWQtYXR0cmlidXRlcyB1cCB0byxcblx0XHRcdFx0Ly8gbm90IGluY2x1ZGluZywgdGhlIGZpcnN0ICV4M0IgKFwiO1wiKSBjaGFyYWN0ZXIuXG5cdFx0XHRcdC8vIC4uLlxuXHRcdFx0XHRzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJz0nICsgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXS5zcGxpdCgnOycpWzBdO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKGRvY3VtZW50LmNvb2tpZSA9IGtleSArICc9JyArIHZhbHVlICsgc3RyaW5naWZpZWRBdHRyaWJ1dGVzKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBnZXQgKGtleSwganNvbikge1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgamFyID0ge307XG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC5cblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKCFqc29uICYmIGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IGRlY29kZShwYXJ0c1swXSk7XG5cdFx0XHRcdFx0Y29va2llID0gKGNvbnZlcnRlci5yZWFkIHx8IGNvbnZlcnRlcikoY29va2llLCBuYW1lKSB8fFxuXHRcdFx0XHRcdFx0ZGVjb2RlKGNvb2tpZSk7XG5cblx0XHRcdFx0XHRpZiAoanNvbikge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29va2llID0gSlNPTi5wYXJzZShjb29raWUpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRqYXJbbmFtZV0gPSBjb29raWU7XG5cblx0XHRcdFx0XHRpZiAoa2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBrZXkgPyBqYXJba2V5XSA6IGphcjtcblx0XHR9XG5cblx0XHRhcGkuc2V0ID0gc2V0O1xuXHRcdGFwaS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gZ2V0KGtleSwgZmFsc2UgLyogcmVhZCBhcyByYXcgKi8pO1xuXHRcdH07XG5cdFx0YXBpLmdldEpTT04gPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gZ2V0KGtleSwgdHJ1ZSAvKiByZWFkIGFzIGpzb24gKi8pO1xuXHRcdH07XG5cdFx0YXBpLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcblx0XHRcdHNldChrZXksICcnLCBleHRlbmQoYXR0cmlidXRlcywge1xuXHRcdFx0XHRleHBpcmVzOiAtMVxuXHRcdFx0fSkpO1xuXHRcdH07XG5cblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS53aXRoQ29udmVydGVyID0gaW5pdDtcblxuXHRcdHJldHVybiBhcGk7XG5cdH1cblxuXHRyZXR1cm4gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG59KSk7Il0sImZpbGUiOiJtYWluLmpzIn0=
