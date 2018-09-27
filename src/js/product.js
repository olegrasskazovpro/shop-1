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