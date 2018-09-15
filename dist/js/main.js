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

/**
 * Get all product's filters and send it to server (json)
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
    $.ajax({
      url: this.config.url.filters,
      method: 'POST',
      contentType: "application/json",
      data: JSON.stringify(data),
      success: () => {
        console.log('Product filters was SENT to DB');
        let serverFilterProducts = new ServerFilterProducts();
        serverFilterProducts.init(this.config);
      },
      error: () => {
        console.log('Product filters sending to DB FAILED');
      }
    })
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
    $.ajax({
      url: this.config.url.filters,
      method: 'GET',
      dataType: 'json',
      success: data => {
        this.filters = data;
        console.log('146 - Server got filters from DB');
        this.getCatalog();
      },
      error: () => {
        console.log('150 - Method getFilters() of getting filters FAILED');
      }
    })
  }

  getCatalog() {
    $.ajax({
      url: this.config.url.products,
      method: 'GET',
      dataType: 'json',
      success: data => {
        this.catalog = data;
        console.log('162 - Server got products catalog from DB');
        this.filterCatalog();
      },
      error: () => {
        console.log('166 - Method getCatalog() of getting catalog FAILED');
      }
    })
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
    $.ajax({
      url: this.config.url.filteredProducts,
      method: 'POST',
      contentType: "application/json",
      data: JSON.stringify(data),
      success: () => {
        if (data === undefined) {
          console.log('Filtered catalog DB cleaned');
        } else {
          console.log('Filtered catalog posted to DB');
          let render = new Render();
          render.init(this.config);
        }
        //this.callback.getFilters(); // сюда передать коллбэк для отображения в фронтэнде
      },
      error: () => {
        console.log('Method postFiltered(data) of filtered catalog saving to DB FAILED');
      }
    })
  }
}

class Render {
  constructor() {
    this.el = null;
    this.products = [];
    this.config = {
      url: {},
      selectors: {},
    };
  }

  init(config) {
    this.config = config;
    this.getFilteredCatalog();
  }

  getFilteredCatalog() {
    $.ajax({
      url: this.config.url.filteredProducts,
      method: 'GET',
      dataType: 'json',
      success: data => {
        console.log('320 - Frontend got filtered catalog from DB');
        this.render(data);
      },
      error: () => {
        console.log('324 - Method getFilteredCatalog() of getting filtered catalog FAILED');
      }
    })
  }
  /**
   * Render filtered catalog with pagination and set for filtered catalog addToCartHandler
   * @param data
   */
  render(data) {
    this.setPagination(data);
    this.cleanProducts();
    this.renderProducts(data);

    let cart = new Cart();
    cart.init(this.config);
  }

  /**
   * Find and return product <figure> template
   * @returns {*} HTML of product <figure>
   */
  cleanProducts() {
    document.querySelector('.product-box').innerHTML = '';
  }

  renderProducts(data) {
    let page = 'page_' + $('#pagination .active').text(); // find active page

    if (data[page]) {
      for (let oneProd, i = 0; i < data[page].length; i++) {
        oneProd = $('#prod_template')[0].cloneNode(true);
        oneProd.querySelector('.product_href').href = data[page][i].href;
        oneProd.querySelector('.product-img').src = data[page][i].img[0];
        oneProd.querySelector('.product-img').alt = data[page][i].name;
        oneProd.querySelector('.product-to-cart').id = data[page][i].id;
        oneProd.getElementsByTagName('h3')[0].textContent = data[page][i].name;
        oneProd.getElementsByTagName('h4')[0].textContent = '$' + data[page][i].price + '.00';
        oneProd.classList.remove('template');

        document.querySelector('.product-box').appendChild(oneProd);
      }
    } else {
      $('#oops').removeClass('template');
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
   * Set pagination div - fill it with <a>Num</a>
   * @param {} data filtered catalog
   */
  setPagination(data) {
    $('#pagination').html(''); // clear html of pagination

    for (let i = 0; i < Object.keys(data).length; i++) {
      let href = '?' + Object.keys(data)[i];
      let a = `<a href="${href}">${i + 1}</a>`;

      if (i === 0) { //add first page number
        $('#pagination').append(a);
        $('#pagination a').addClass('active'); //set the first active

      } else { //add another page numbers
        $('#pagination').append(a);
      }
    }

    this.urlPagination(data);
    this.paginationNumHandler(data);
  }
  /**
   * Check if URL has page_* and set active page + add href to pagination slider arrows
   * @param {} data filtered catalog
   */
  urlPagination(data) {
    // get page_N from URL
    let exp = /page_\d+/i;

    if (this.checkUrl(exp)) { // check if URL has page_*
      let pageInURL = this.parseUrl(document.location.href, exp);
      let pageNoInURL = +this.parseUrl(pageInURL, /\d+/i); // parse number of page_ from URL
      if (pageNoInURL > 0 && pageNoInURL <= Object.keys(data).length) {
        this.setActiveInPagination(pageNoInURL);
        this.setPaginationArrowsHref(pageNoInURL, data);
      } else {
        this.setActiveInPagination(1);
        this.setPaginationArrowsHref(1, data);
      }
    }
  }

  /**
   * Set .active class for n-th page in pagination
   * @param Int n number of page from URL
   */
  setActiveInPagination(n) {
    $('#pagination .active').removeClass('active'); //remove current active class
    $(`#pagination a:nth-child(${n})`).addClass('active'); //add new active class
  }

  /**
   * Set href to <a> in pagination slider
   * @param Int n number of page from URL
   * @param {} data filtered catalog
   */
  setPaginationArrowsHref(n, data) {
    let prev = '';
    let next = '';
    let urlHtml = this.parseUrl(document.location.href, /\/[^\/]+?\.html/i); // get /*.html from url

    // set left buttton href
    if (n > 1) {
      prev = `${urlHtml}?page_${n - 1}`;
      $('.pages .left').attr('href', prev);
    } else {
      $('.pages .left').addClass('active')
    }

    // set right buttton href
    if (n < Object.keys(data).length) {
      next = `${urlHtml}?page_${n + 1}`;
      $('.pages .right').attr('href', next);
    } else {
      $('.pages .right').addClass('active')
    }
  }

  /**
   * Set click handler at pagination numbers
   */
  paginationNumHandler() {
    $('#pagination').on('click', 'a', function () {
      $('#pagination .active').removeClass('active');
      this.classList.add('active');
    });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5jbGFzcyBTZXRBY3RpdmVMaW5rcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuXG4gIH1cblxuICAvKipcbiAgICogU2V0IGNsYXNzPVwiYWN0aXZlXCIgdG8gbmF2IGxpbmtzIGZvciBwYWdlIG9wZW5lZFxuICAgKi9cbiAgc2V0QWN0aXZlQ2xhc3MoKSB7XG4gICAgaWYgKHRoaXMuY2hlY2tVcmwoJ3Byb2R1Y3QuaHRtbCcpKSB7XG4gICAgICAkKCcubWVudSBhJykucmVtb3ZlQXR0cignY2xhc3MnKTtcbiAgICAgICQoJy5tZW51PmxpIGFbaHJlZj1cInByb2R1Y3QuaHRtbFwiXScpLmFkZENsYXNzKCdtZW51LWFjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EtbGlzdCBhOmZpcnN0JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EgYTpmaXJzdCcpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2hlY2tVcmwoJ2luZGV4Lmh0bWwnKSkge1xuICAgICAgJCgnLm1lbnU+bGkgYVtocmVmPVwiaW5kZXguaHRtbFwiXScpLmFkZENsYXNzKCdtZW51LWFjdGl2ZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBwYWdlIFVSTCBjb250YWlucyBzb21lIHN0cmluZ1xuICAgKiBAcGFyYW0gc3RyaW5nIHVybCAtIHJlZ0V4cCBjb25kaXRpb25cbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgVVJMIGNvbnRhaW5zIHJlZ0V4cFxuICAgKi9cbiAgY2hlY2tVcmwodXJsKSB7XG4gICAgbGV0IGNoZWNrVXJsID0gbmV3IFJlZ0V4cCh1cmwpO1xuICAgIHJldHVybiBjaGVja1VybC50ZXN0KGRvY3VtZW50LmxvY2F0aW9uLmhyZWYpXG4gIH1cbn1cblxuY2xhc3MgQ2Fyb3VzZWwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgJCgnLmpjYXJvdXNlbCcpLmpjYXJvdXNlbCh7XG4gICAgICB3cmFwOiAnY2lyY3VsYXInXG4gICAgfSk7XG4gICAgJCgnLmpjYXJvdXNlbC1wcmV2JykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgJCgnLmpjYXJvdXNlbCcpLmpjYXJvdXNlbCgnc2Nyb2xsJywgJy09MScpO1xuICAgIH0pO1xuXG4gICAgJCgnLmpjYXJvdXNlbC1uZXh0JykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgJCgnLmpjYXJvdXNlbCcpLmpjYXJvdXNlbCgnc2Nyb2xsJywgJys9MScpO1xuICAgIH0pO1xuICB9XG59XG5cbihmdW5jdGlvbiAoJCkge1xuICAkKGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgcGFnZUluaXQgPSBuZXcgU2V0QWN0aXZlTGlua3MoKTtcbiAgICBwYWdlSW5pdC5zZXRBY3RpdmVDbGFzcygpO1xuXG4gICAgbGV0IGNhcm91c2VsID0gbmV3IENhcm91c2VsKCk7XG4gICAgY2Fyb3VzZWwuaW5pdCgpO1xuXG4gICAgbGV0IGlmUHJvZHVjdCA9IG5ldyBSZWdFeHAoJ3Byb2R1Y3QuaHRtbCcpLnRlc3QoZG9jdW1lbnQubG9jYXRpb24uaHJlZik7XG4gICAgbGV0IGlmU2luZ2xlID0gbmV3IFJlZ0V4cCgnc2luZ2xlLmh0bWwnKS50ZXN0KGRvY3VtZW50LmxvY2F0aW9uLmhyZWYpO1xuICAgIGxldCBjb25maWcgPSB7XG4gICAgICB1cmw6IHtcbiAgICAgICAgcHJvZHVjdHM6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAvcHJvZHVjdHMnLFxuICAgICAgICBmaWx0ZXJzOiAnaHR0cDovL2xvY2FsaG9zdDozMDAyL2ZpbHRlcnMnLFxuICAgICAgICBmaWx0ZXJlZFByb2R1Y3RzOiAnaHR0cDovL2xvY2FsaG9zdDozMDAyL2ZpbHRlcmVkUHJvZHVjdHMnLFxuICAgICAgICBjYXJ0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxL2NhcnQnLFxuICAgICAgfSxcbiAgICAgIHNlbGVjdG9yczoge1xuICAgICAgICBhZGRUb0NhcnQ6ICcuYWRkVG9DYXJ0JyxcbiAgICAgICAgY2FydDogJy5jYXJ0LWNvbnRhaW5lcicsXG4gICAgICAgIGl0ZW06ICcuY2FydC1pdGVtLnRlbXBsYXRlJyxcbiAgICAgICAgaHJlZjogJy5jYXJ0LWl0ZW0taHJlZicsXG4gICAgICAgIGltZzogJy5jYXJ0LWl0ZW0taW1nJyxcbiAgICAgICAgbmFtZTogJy5jYXJ0LWl0ZW0tbmFtZScsXG4gICAgICAgIHF1YW50aXR5OiAnLmNhcnQtaXRlbS1xdWFudGl0eScsXG4gICAgICAgIHByaWNlOiAnLmNhcnQtaXRlbS1wcmljZScsXG4gICAgICAgIGRlbDogJy5jYXJ0LWl0ZW0tZGVsJyxcbiAgICAgICAgcmF0ZTogJy5yYXRlJyxcbiAgICAgICAgc3VidG90YWw6ICcuY2FydC1pdGVtLXN1YnRvdGFsJyxcbiAgICAgICAgdG90YWw6ICcuY2FydC10b3RhbCcsXG4gICAgICAgIGRpc3BsYXlOb25lOiAndGVtcGxhdGUnLFxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoaWZQcm9kdWN0KSB7XG4gICAgICBsZXQgZmlsdGVyc0hhbmRsZSA9IG5ldyBGaWx0ZXJzSGFuZGxlKCk7XG5cbiAgICAgIGZpbHRlcnNIYW5kbGUuaW5pdCgwLCAxMDAwLCAxLCBjb25maWcpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBjYXJ0ID0gbmV3IENhcnQoKTtcbiAgICAgIGNhcnQuaW5pdChjb25maWcpO1xuICAgIH1cbiAgfSlcbn0pKGpRdWVyeSk7XG5cbi8qKlxuICogR2V0IGFsbCBwcm9kdWN0J3MgZmlsdGVycyBhbmQgc2VuZCBpdCB0byBzZXJ2ZXIgKGpzb24pXG4gKi9cbmNsYXNzIEZpbHRlcnNIYW5kbGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmZpbHRlcnMgPSB7XG4gICAgICBjYXRJdGVtOiBudWxsLCAvLyBzdHJpbmdcbiAgICAgIGNhdGVnb3J5OiBudWxsLCAvLyAnYWxsJyBvciBzdHJpbmdcbiAgICAgIGJyYW5kOiBudWxsLCAvLyAnYWxsJyBvciBzdHJpbmdcbiAgICAgIGRlc2lnbmVyOiBudWxsLCAvLyAnYWxsJyBvciBzdHJpbmdcbiAgICAgIHNpemU6IFswXSwgLy8gWzBdIG9yIFthLCAoLi4uKV1cbiAgICAgIHByaWNlOiBbXSwgLy8gW2EsIGJdXG4gICAgICBzaG93Qnk6IG51bGwsXG4gICAgfTtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHVybDoge30sXG4gICAgICBzZWxlY3RvcnM6IHt9LFxuICAgIH07XG4gIH1cblxuICBpbml0KG1pbiwgbWF4LCBzdGVwLCBjb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnNldENvb2tpZXNGaWx0ZXJzKCk7XG4gICAgdGhpcy5pbml0UHJpY2VTbGlkZXIobWluLCBtYXgsIHN0ZXApO1xuICAgIHRoaXMuZmlsdGVycy5jYXRJdGVtID0gdGhpcy5nZXRDYXRJdGVtKCk7XG4gICAgdGhpcy5maWx0ZXJzLmNhdGVnb3J5ID0gdGhpcy5nZXRDYXRlZ29yeSgpO1xuICAgIHRoaXMuZmlsdGVycy5icmFuZCA9IHRoaXMuZ2V0QnJhbmQoKTtcbiAgICB0aGlzLmZpbHRlcnMuZGVzaWduZXIgPSB0aGlzLmdldERlc2lnbmVyKCk7XG4gICAgdGhpcy5zZXRTaXplQ2hlY2tib3hIYW5kbGVyKCk7XG4gICAgdGhpcy5maWx0ZXJzLnByaWNlID0gdGhpcy5nZXRQcmljZVJhbmdlKCk7XG4gICAgdGhpcy5zZXRTaG93QnlIYW5kbGVyKCk7XG4gICAgdGhpcy5wb3N0RmlsdGVycyh0aGlzLmZpbHRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRpbmcgaW4gRE9NIGFsbCBmaWx0ZXJzIGZyb20gY29va2llc1xuICAgKi9cbiAgc2V0Q29va2llc0ZpbHRlcnMoKSB7XG4gICAgdGhpcy5nZXRDb29raWVzRmlsdGVycygpO1xuICAgIHRoaXMuc2V0U2l6ZUNoZWNrZWQoKTtcbiAgICB0aGlzLnNldFNob3dCeVNlbGVjdGVkKHRoaXMuZmlsdGVycy5zaG93QnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgaW4gdGhpcy5maWx0ZXJzIGFsbCBmaWx0ZXJzIGZyb20gY29va2llc1xuICAgKi9cbiAgZ2V0Q29va2llc0ZpbHRlcnMoKSB7XG4gICAgY29uc3QgY29va2llc0ZpbHRlcnMgPSBDb29raWVzLmdldCgpO1xuICAgIGlmIChjb29raWVzRmlsdGVycy5wcmljZSkge1xuICAgICAgY29va2llc0ZpbHRlcnMucHJpY2UgPSBjb29raWVzRmlsdGVycy5wcmljZS5zcGxpdCgnXycpO1xuICAgIH1cbiAgICBpZiAoY29va2llc0ZpbHRlcnMuc2l6ZSkge1xuICAgICAgY29va2llc0ZpbHRlcnMuc2l6ZSA9IGNvb2tpZXNGaWx0ZXJzLnNpemUuc3BsaXQoJ18nKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHByb3BDIGluIGNvb2tpZXNGaWx0ZXJzKSB7XG4gICAgICBmb3IgKGNvbnN0IHByb3BGIGluIHRoaXMuZmlsdGVycykge1xuICAgICAgICBpZiAocHJvcEMgPT09IHByb3BGKSB7XG4gICAgICAgICAgdGhpcy5maWx0ZXJzW3Byb3BGXSA9IGNvb2tpZXNGaWx0ZXJzW3Byb3BDXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXR0aW5nIHVwIHByaWNlLXJhbmdlIHNsaWRlci5cbiAgICogSWYgcHJpY2UgY29va2llIGlzIC0gc2V0IG1pblZhbCBhbmQgbWF4VmFsIGZyb20gY29va2llc1xuICAgKi9cbiAgaW5pdFByaWNlU2xpZGVyKG1pbiwgbWF4LCBzdGVwKSB7XG4gICAgbGV0IG1pblZhbCwgbWF4VmFsO1xuXG4gICAgaWYgKHRoaXMuZmlsdGVycy5wcmljZS5sZW5ndGgpIHtcbiAgICAgIG1pblZhbCA9IHRoaXMuZmlsdGVycy5wcmljZVswXTtcbiAgICAgIG1heFZhbCA9IHRoaXMuZmlsdGVycy5wcmljZVsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWluVmFsID0gbWF4ICogMC4wNTtcbiAgICAgIG1heFZhbCA9IG1heCAqIDAuNDtcbiAgICB9XG5cbiAgICAkKCcucHJpY2UtcmFuZ2VfX3NsaWRlcicpLnNsaWRlcih7XG4gICAgICByYW5nZTogdHJ1ZSxcbiAgICAgIHZhbHVlczogW21pblZhbCwgbWF4VmFsXSxcbiAgICAgIG1pbjogbWluLFxuICAgICAgbWF4OiBtYXgsXG4gICAgICBzdGVwOiBzdGVwLFxuICAgICAgc2xpZGU6ICgpID0+IHtcbiAgICAgICAgdGhpcy5zaG93UHJpY2VSYW5nZVZhbHVlcygpO1xuICAgICAgfSxcbiAgICAgIGNoYW5nZTogKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dQcmljZVJhbmdlVmFsdWVzKCk7XG4gICAgICAgIHRoaXMuZmlsdGVycy5wcmljZSA9IHRoaXMuZ2V0UHJpY2VSYW5nZSgpO1xuICAgICAgICB0aGlzLnNldENvb2tpZXMoJ3ByaWNlJywgdGhpcy5maWx0ZXJzLnByaWNlLmpvaW4oJ18nKSk7XG4gICAgICAgICQoJyNvb3BzJykuYWRkQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgIHRoaXMucG9zdEZpbHRlcnModGhpcy5maWx0ZXJzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnNob3dQcmljZVJhbmdlVmFsdWVzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2hvdy9VcGRhdGUgbWluIGFuZCBtYXggcHJpY2UgcmFuZ2UgdmFsdWVzXG4gICAqL1xuICBzaG93UHJpY2VSYW5nZVZhbHVlcygpIHtcbiAgICAkKCcjcHJpY2UtbWluJykudGV4dCh0aGlzLmdldFByaWNlUmFuZ2UoKVswXSk7XG4gICAgJCgnI3ByaWNlLW1heCcpLnRleHQodGhpcy5nZXRQcmljZVJhbmdlKClbMV0pO1xuICB9XG5cbiAgZ2V0Q2F0SXRlbSgpIHtcbiAgICByZXR1cm4gJCgnLm1lbnUtYWN0aXZlJykudGV4dCgpXG4gIH1cblxuICBnZXRDYXRlZ29yeSgpIHtcbiAgICBpZiAoJCgnLm1lbnUgLmFjdGl2ZScpWzBdKSB7XG4gICAgICByZXR1cm4gJCgnLm1lbnUgLmFjdGl2ZScpLnRleHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ2FsbCdcbiAgICB9XG4gIH1cblxuICBnZXRCcmFuZCgpIHtcbiAgICBpZiAoJCgnI2JyYW5kIC5hY3RpdmUnKVswXSkge1xuICAgICAgY29uc29sZS5sb2coJCgnI2JyYW5kIC5hY3RpdmUnKS50ZXh0KCkpO1xuICAgICAgcmV0dXJuICQoJyNicmFuZCAuYWN0aXZlJykudGV4dCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnYWxsJ1xuICAgIH1cbiAgfVxuXG4gIGdldERlc2lnbmVyKCkge1xuICAgIGlmICgkKCcjZGVzaWduZXIgLmFjdGl2ZScpWzBdKSB7XG4gICAgICByZXR1cm4gJCgnI2Rlc2lnbmVyIC5hY3RpdmUnKS50ZXh0KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdhbGwnXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElmIChubyBzaXplIGNvb2tpZSkgc2V0IGFsbCBzaXplcywgZWxzZSBzZXQgc2l6ZXMgZnJvbSBjb29raWVzXG4gICAqL1xuICBzZXRTaXplQ2hlY2tlZCgpIHtcbiAgICBpZiAoQ29va2llcy5nZXQoJ3NpemUnKSkge1xuICAgICAgbGV0IGNvb2tpZXNTaXplID0gQ29va2llcy5nZXQoJ3NpemUnKS5zcGxpdCgnXycpOyAvLyB0dXJuIHNpemUgY29va2llIHRvIGFycmF5XG4gICAgICAvLyBmaW5kIGFsbCBjaGVja2JveGVzIHdoaWNoIGRhdGEtbmFtZSBpcyBvbmUgb2YgY29va2llc1NpemUgYW5kIHNldCBpdCBjaGVja2VkXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvb2tpZXNTaXplLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgJCgnLnNpemUtY2hlY2tib3gnKS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmIChjb29raWVzU2l6ZVtpXSA9PT0gJCgnLnNpemUtY2hlY2tib3gnKVtqXS5kYXRhc2V0Lm5hbWUpIHtcbiAgICAgICAgICAgICQoJy5zaXplLWNoZWNrYm94Jylbal0uc2V0QXR0cmlidXRlKFwiY2hlY2tlZFwiLCBcIlwiKTtcbiAgICAgICAgICAgICQoJy5zaXplLWNoZWNrYm94Jylbal0uY2xhc3NMaXN0LmFkZChcImNoZWNrZWRcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgJCgnLnNpemUtY2hlY2tib3gnKS5sZW5ndGg7IGorKykge1xuICAgICAgICAkKCcuc2l6ZS1jaGVja2JveCcpW2pdLnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIiwgXCJcIik7XG4gICAgICAgICQoJy5zaXplLWNoZWNrYm94Jylbal0uY2xhc3NMaXN0LmFkZChcImNoZWNrZWRcIik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBoYW5kbGVycyBvZiBzaXplIGNoZWNrYm94ZXMgc3RhdGUgY2hhbmdpbmdcbiAgICogVXBkYXRlcyBzaXplIGNvb2tpZSwgdGhpcy5maWx0ZXJzIGFuZCBzZW5kcyBQT1NUIHRvIHNlcnZlclxuICAgKi9cbiAgc2V0U2l6ZUNoZWNrYm94SGFuZGxlcigpIHtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgLy8gc2V0IHVwZGF0ZSBzaXplcyBBcnIgZm9yIGV2ZXJ5IHNpemUgY2hlY2tib3ggY2xpY2tcbiAgICAkKCcuc2l6ZS1jaGVja2JveCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnY2hlY2tlZCcpOyAvLyBpZiBDaGVja2VkIHNldCBjbGFzcyAnY2hlY2tlZCcgYW5kIGJhY2tcbiAgICAgICQoJyNvb3BzJykuYWRkQ2xhc3MoJ3RlbXBsYXRlJyk7XG5cbiAgICAgIGlmICgkKCcuY2hlY2tlZCcpLmxlbmd0aCkge1xuICAgICAgICBsZXQgc2l6ZXMgPSBbXTsgLy8gY2xlYXIgc2l6ZSBBcnJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAkKCcuY2hlY2tlZCcpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgc2l6ZXMucHVzaCgkKCcuY2hlY2tlZCcpW2ldLmRhdGFzZXQubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhhdC5maWx0ZXJzLnNpemUgPSBzaXplcztcbiAgICAgICAgdGhhdC5zZXRDb29raWVzKCdzaXplJywgc2l6ZXMuam9pbignXycpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoYXQuZmlsdGVycy5zaXplID0gWzBdO1xuICAgICAgfVxuICAgICAgdGhhdC5wb3N0RmlsdGVycyh0aGF0LmZpbHRlcnMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgcHJpY2Ugc2xpZGVyIHJhbmdlXG4gICAqIEByZXR1cm5zIFtdIHtqUXVlcnl9XG4gICAqL1xuICBnZXRQcmljZVJhbmdlKCkge1xuICAgIHJldHVybiAkKCcucHJpY2UtcmFuZ2VfX3NsaWRlcicpLnNsaWRlcigndmFsdWVzJyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBcInNlbGVjdGVkXCIgYXR0cmlidXRlIGZvciBzaG93Qnkgb3B0aW9uXG4gICAqIEBwYXJhbSBJbnQgdmFsdWUgdmFsdWUgb2Ygb3B0aW9uJ3MgdmFsdWUgcHJvcGVydHlcbiAgICovXG4gIHNldFNob3dCeVNlbGVjdGVkKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICB0aGlzLmZpbHRlcnMuc2hvd0J5ID0gMztcbiAgICAgICQoYCNzaG93Qnkgb3B0aW9uW3ZhbHVlPVwiM1wiXWApWzBdLnNldEF0dHJpYnV0ZShcInNlbGVjdGVkXCIsIFwiXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKGAjc2hvd0J5IG9wdGlvbjpzZWxlY3RlZGApLnJlbW92ZUF0dHIoXCJzZWxlY3RlZFwiKTtcbiAgICAgICQoYCNzaG93Qnkgb3B0aW9uW3ZhbHVlPSR7dmFsdWV9XWApWzBdLnNldEF0dHJpYnV0ZShcInNlbGVjdGVkXCIsIFwiXCIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93Qnkgc2VsZWN0b3IgY2hhbmdlIGhhbmRsZXIuIElmIGNoYW5nZWQ6XG4gICAqIHJlbW92ZSBcInNlbGVjdGVkXCIgYXR0cixcbiAgICogdXBkYXRlIHRoaXMuZmlsdGVycy5zaG93QnksXG4gICAqIHVwZGF0ZSBzaG93QnkgaW4gQ29va2llc1xuICAgKiBwb3N0IHVwZGF0ZWQgZmlsdGVycyB0byBzZXJ2ZXJcbiAgICovXG4gIHNldFNob3dCeUhhbmRsZXIoKSB7XG4gICAgJCgnI3Nob3dCeScpLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAkKGAjc2hvd0J5IG9wdGlvbltzZWxlY3RlZF1gKS5yZW1vdmVBdHRyKFwic2VsZWN0ZWRcIik7XG4gICAgICB0aGlzLmZpbHRlcnMuc2hvd0J5ID0gKyQoJyNzaG93Qnkgb3B0aW9uOnNlbGVjdGVkJykudGV4dCgpO1xuICAgICAgJChgI3Nob3dCeSBvcHRpb25bdmFsdWU9JHt0aGlzLmZpbHRlcnMuc2hvd0J5fV1gKVswXS5zZXRBdHRyaWJ1dGUoXCJzZWxlY3RlZFwiLCBcIlwiKTtcblxuICAgICAgdGhpcy5zZXRDb29raWVzKCdzaG93QnknLCB0aGlzLmZpbHRlcnMuc2hvd0J5KTtcbiAgICAgIHRoaXMucG9zdEZpbHRlcnModGhpcy5maWx0ZXJzKTtcbiAgICB9KVxuICB9XG5cbiAgc2V0Q29va2llcyhuYW1lLCB2YWwpIHtcbiAgICBDb29raWVzLnNldChuYW1lLCB2YWwsIHtleHBpcmVzOiA3fSk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBmaWx0ZXJzIHRvIHNlcnZlclxuICAgKiBAcGFyYW0ge30gZGF0YSAtIGZpbHRlcnNcbiAgICovXG4gIHBvc3RGaWx0ZXJzKGRhdGEpIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmNvbmZpZy51cmwuZmlsdGVycyxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICBzdWNjZXNzOiAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQcm9kdWN0IGZpbHRlcnMgd2FzIFNFTlQgdG8gREInKTtcbiAgICAgICAgbGV0IHNlcnZlckZpbHRlclByb2R1Y3RzID0gbmV3IFNlcnZlckZpbHRlclByb2R1Y3RzKCk7XG4gICAgICAgIHNlcnZlckZpbHRlclByb2R1Y3RzLmluaXQodGhpcy5jb25maWcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQcm9kdWN0IGZpbHRlcnMgc2VuZGluZyB0byBEQiBGQUlMRUQnKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogU2VydmVyIHNpZGUgd29yayBlbXVsYXRpb24gLSBmaWx0ZXJzIGNhdGFsb2cgd2l0aCBmaWx0ZXJzIGFuZCBzYXZlIHJlc3VsdCB0byBEQlxuICovXG5jbGFzcyBTZXJ2ZXJGaWx0ZXJQcm9kdWN0cyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZmlsdGVycyA9IHt9O1xuICAgIHRoaXMuY2F0YWxvZyA9IHt9O1xuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgdXJsOiB7fSxcbiAgICAgIHNlbGVjdG9yczoge30sXG4gICAgfTtcbiAgfVxuXG4gIGluaXQoY29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5nZXRGaWx0ZXJzKClcbiAgfVxuXG4gIGdldEZpbHRlcnMoKSB7XG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogdGhpcy5jb25maWcudXJsLmZpbHRlcnMsXG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIHN1Y2Nlc3M6IGRhdGEgPT4ge1xuICAgICAgICB0aGlzLmZpbHRlcnMgPSBkYXRhO1xuICAgICAgICBjb25zb2xlLmxvZygnMTQ2IC0gU2VydmVyIGdvdCBmaWx0ZXJzIGZyb20gREInKTtcbiAgICAgICAgdGhpcy5nZXRDYXRhbG9nKCk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJzE1MCAtIE1ldGhvZCBnZXRGaWx0ZXJzKCkgb2YgZ2V0dGluZyBmaWx0ZXJzIEZBSUxFRCcpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBnZXRDYXRhbG9nKCkge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuY29uZmlnLnVybC5wcm9kdWN0cyxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgc3VjY2VzczogZGF0YSA9PiB7XG4gICAgICAgIHRoaXMuY2F0YWxvZyA9IGRhdGE7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxNjIgLSBTZXJ2ZXIgZ290IHByb2R1Y3RzIGNhdGFsb2cgZnJvbSBEQicpO1xuICAgICAgICB0aGlzLmZpbHRlckNhdGFsb2coKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnMTY2IC0gTWV0aG9kIGdldENhdGFsb2coKSBvZiBnZXR0aW5nIGNhdGFsb2cgRkFJTEVEJyk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWx0ZXJzIGFsbCBwcm9kdWN0cyBpbiBjYXRhbG9nIHdpdGggZXZlcnkgZmlsdGVycyBwcm9wZXJ0eSBhbmQgcHV0IHJlc3VsdCB0byB0aGlzLmZpbHRlcmVkQ2F0YWxvZ1xuICAgKi9cbiAgZmlsdGVyQ2F0YWxvZygpIHtcbiAgICBsZXQgZmlsdGVyZWRDYXRhbG9nID0gW107XG4gICAgdGhpcy5wb3N0RmlsdGVyZWQoe30pOyAvLyBjbGVhbiBwcmV2aW91cyBmaWx0ZXJlZCBjYXRhbG9nXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY2F0YWxvZy5sZW5ndGg7IGkrKykgeyAvLyBhbmQgZmlsdGVyIHdpdGggdGhlbSBjYXRhbG9nLiBJbnRlcm1lZGlhdGUgcmVzdWx0cyBwdXRcbiAgICAgIC8vIGNoZWNrIGlmIHRoZSBwcm9kdWN0IHNhdGlzZnkgYWxsIGZpbHRlcnNcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5jaGVja1Byb2RXaXRoRmlsdGVyKHRoaXMuZmlsdGVycy5jYXRJdGVtLCB0aGlzLmNhdGFsb2dbaV0uY2F0SXRlbSkgJiZcbiAgICAgICAgdGhpcy5jaGVja1Byb2RXaXRoRmlsdGVyKHRoaXMuZmlsdGVycy5jYXRlZ29yeSwgdGhpcy5jYXRhbG9nW2ldLmNhdGVnb3J5KSAmJlxuICAgICAgICB0aGlzLmNoZWNrUHJvZFdpdGhGaWx0ZXIodGhpcy5maWx0ZXJzLmJyYW5kLCB0aGlzLmNhdGFsb2dbaV0uYnJhbmQpICYmXG4gICAgICAgIHRoaXMuY2hlY2tQcm9kV2l0aEZpbHRlcih0aGlzLmZpbHRlcnMuZGVzaWduZXIsIHRoaXMuY2F0YWxvZ1tpXS5kZXNpZ25lcikgJiZcbiAgICAgICAgdGhpcy5jaGVja1Byb2RCeVNpemUodGhpcy5maWx0ZXJzLnNpemUsIHRoaXMuY2F0YWxvZ1tpXS5zaXplKSAmJlxuICAgICAgICB0aGlzLmNoZWNrUHJvZEJ5UHJpY2UodGhpcy5maWx0ZXJzLnByaWNlLCB0aGlzLmNhdGFsb2dbaV0ucHJpY2UpXG4gICAgICApIHtcblxuICAgICAgICBmaWx0ZXJlZENhdGFsb2cucHVzaCh0aGlzLmNhdGFsb2dbaV0pOyAvLyBhZGQgdGhpcyBwcm9kdWN0IHRvIHRoaXMuZmlsdGVyZWRDYXRhbG9nXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wYWdpbmF0ZShmaWx0ZXJlZENhdGFsb2cpO1xuXG4gICAgLy8gdGhpcy5wb3N0RmlsdGVyZWQodGhpcy5maWx0ZXJlZENhdGFsb2cpOyAvLyB0aGlzLmZpbHRlcmVkQ2F0YWxvZyDRgdC+0YXRgNCw0L3Rj9C10YLRgdGPINC/0YDQsNCy0LjQu9GM0L3QvlxuICB9XG5cbiAgLyoqXG4gICAqIERldmlkZSBmaWx0ZXJlZENhdGFsb2cgYnkgcGFnZXMgYWNjb3JkaW5nIHRvIFNob3cgc2VsZWN0b3IgdmFsdWVcbiAgICogQHBhcmFtIHt9IGZpbHRlcmVkQ2F0YWxvZ1xuICAgKi9cbiAgcGFnaW5hdGUoZmlsdGVyZWRDYXRhbG9nKSB7XG4gICAgbGV0IGZpbHRDYXRXaXRoUGFnID0ge307XG4gICAgbGV0IG4gPSAxOyAvLyBmaXJzdCBwYWdlIG51bWJlclxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWx0ZXJlZENhdGFsb2cubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhZ2VfbnVtID0gJ3BhZ2VfJyArIG47XG4gICAgICBmaWx0Q2F0V2l0aFBhZ1twYWdlX251bV0gPSBbXTtcblxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmZpbHRlcnMuc2hvd0J5ICYmIGkgPCBmaWx0ZXJlZENhdGFsb2cubGVuZ3RoOyBqKyssIGkrKykge1xuICAgICAgICBmaWx0Q2F0V2l0aFBhZ1twYWdlX251bV0ucHVzaChmaWx0ZXJlZENhdGFsb2dbaV0pO1xuICAgICAgfVxuICAgICAgaS0tO1xuICAgICAgbisrO1xuICAgIH1cblxuICAgIHRoaXMucG9zdEZpbHRlcmVkKGZpbHRDYXRXaXRoUGFnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBzaW1wbGUgZmlsdGVyIHBhcmFtZXRlcnMgaWYgdGhlIHByb2R1Y3Qgc2F0aXNmeVxuICAgKiBAcGFyYW0gc3RyaW5nIGZpbHRlciBmaWx0ZXIgcHJvcGVydHkgdmFsdWVcbiAgICogQHBhcmFtIHN0cmluZyBwcm9kdWN0IHByb3BlcnR5IHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGZpbHRlciA9ICdhbGwnIG9yIHNhdGlzZnkgdG8gcHJvZHVjdFxuICAgKi9cbiAgY2hlY2tQcm9kV2l0aEZpbHRlcihmaWx0ZXIsIHByb2R1Y3QpIHtcbiAgICBpZiAoZmlsdGVyID09PSAnYWxsJykge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgcmV0dXJuIChmaWx0ZXIgPT09IHByb2R1Y3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBwcm9kdWN0IGhhcyBvbmUgb2YgZmlsdGVyJ3Mgc2l6ZVxuICAgKiBAcGFyYW0gc3RyaW5nIFtdIGZpbHRlclNpemVzIC0gYXJyYXkgb2Ygc2l6ZXMgaW4gZmlsdGVyXG4gICAqIEBwYXJhbSBzdHJpbmcgW10gcHJvZFNpemVzIC0gYXJyYXkgb2YgcHJvZHVjdCdzIHNpemVzXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBwcm9kdWN0IGhhcyBvbmUgb2YgZmlsdGVyZWQgc2l6ZXNcbiAgICovXG4gIGNoZWNrUHJvZEJ5U2l6ZShmaWx0ZXJTaXplcywgcHJvZFNpemVzKSB7XG4gICAgaWYgKGZpbHRlclNpemVzWzBdICE9PSAwKSB7XG4gICAgICAvLyBjaGVjayBpZiBhbnkgc2l6ZSBvZiBmaWx0ZXIgaXMgaW50byBwcm9kdWN0IHNpemVzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbHRlclNpemVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9kU2l6ZXMuaW5jbHVkZXMoZmlsdGVyU2l6ZXNbaV0pKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbHRlciBwcm9kdWN0IHdpdGggcHJpY2UgZmlsdGVyXG4gICAqIEBwYXJhbSBJbnQgW10gZmlsdGVyUHJpY2VSYW5nZSAtIGZpbHRlcidzIGFycmF5IG9mIG1pbiBhbmQgbWF4IHByb2R1Y3QgcHJpY2VcbiAgICogQHBhcmFtIEludCBwcm9kUHJpY2UgLSBwcm9kdWN0J3MgcHJpY2VcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHByb2R1Y3QncyBwcmljZSBiZXR3ZWVuIG1pbiBhbmQgbWF4XG4gICAqL1xuICBjaGVja1Byb2RCeVByaWNlKGZpbHRlclByaWNlUmFuZ2UsIHByb2RQcmljZSkge1xuICAgIGlmIChmaWx0ZXJQcmljZVJhbmdlWzBdID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjaGVjayBpZiBhbnkgc2l6ZSBvZiBmaWx0ZXIgaXMgaW50byBwcm9kdWN0IHNpemVzXG4gICAgICByZXR1cm4gcHJvZFByaWNlID49IGZpbHRlclByaWNlUmFuZ2VbMF0gJiYgcHJvZFByaWNlIDw9IGZpbHRlclByaWNlUmFuZ2VbMV07XG4gICAgfVxuICB9XG5cbiAgcG9zdEZpbHRlcmVkKGRhdGEpIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmNvbmZpZy51cmwuZmlsdGVyZWRQcm9kdWN0cyxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICBzdWNjZXNzOiAoKSA9PiB7XG4gICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnRmlsdGVyZWQgY2F0YWxvZyBEQiBjbGVhbmVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0ZpbHRlcmVkIGNhdGFsb2cgcG9zdGVkIHRvIERCJyk7XG4gICAgICAgICAgbGV0IHJlbmRlciA9IG5ldyBSZW5kZXIoKTtcbiAgICAgICAgICByZW5kZXIuaW5pdCh0aGlzLmNvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgICAgLy90aGlzLmNhbGxiYWNrLmdldEZpbHRlcnMoKTsgLy8g0YHRjtC00LAg0L/QtdGA0LXQtNCw0YLRjCDQutC+0LvQu9Cx0Y3QuiDQtNC70Y8g0L7RgtC+0LHRgNCw0LbQtdC90LjRjyDQsiDRhNGA0L7QvdGC0Y3QvdC00LVcbiAgICAgIH0sXG4gICAgICBlcnJvcjogKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnTWV0aG9kIHBvc3RGaWx0ZXJlZChkYXRhKSBvZiBmaWx0ZXJlZCBjYXRhbG9nIHNhdmluZyB0byBEQiBGQUlMRUQnKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIFJlbmRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZWwgPSBudWxsO1xuICAgIHRoaXMucHJvZHVjdHMgPSBbXTtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHVybDoge30sXG4gICAgICBzZWxlY3RvcnM6IHt9LFxuICAgIH07XG4gIH1cblxuICBpbml0KGNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuZ2V0RmlsdGVyZWRDYXRhbG9nKCk7XG4gIH1cblxuICBnZXRGaWx0ZXJlZENhdGFsb2coKSB7XG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogdGhpcy5jb25maWcudXJsLmZpbHRlcmVkUHJvZHVjdHMsXG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIHN1Y2Nlc3M6IGRhdGEgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnMzIwIC0gRnJvbnRlbmQgZ290IGZpbHRlcmVkIGNhdGFsb2cgZnJvbSBEQicpO1xuICAgICAgICB0aGlzLnJlbmRlcihkYXRhKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnMzI0IC0gTWV0aG9kIGdldEZpbHRlcmVkQ2F0YWxvZygpIG9mIGdldHRpbmcgZmlsdGVyZWQgY2F0YWxvZyBGQUlMRUQnKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBSZW5kZXIgZmlsdGVyZWQgY2F0YWxvZyB3aXRoIHBhZ2luYXRpb24gYW5kIHNldCBmb3IgZmlsdGVyZWQgY2F0YWxvZyBhZGRUb0NhcnRIYW5kbGVyXG4gICAqIEBwYXJhbSBkYXRhXG4gICAqL1xuICByZW5kZXIoZGF0YSkge1xuICAgIHRoaXMuc2V0UGFnaW5hdGlvbihkYXRhKTtcbiAgICB0aGlzLmNsZWFuUHJvZHVjdHMoKTtcbiAgICB0aGlzLnJlbmRlclByb2R1Y3RzKGRhdGEpO1xuXG4gICAgbGV0IGNhcnQgPSBuZXcgQ2FydCgpO1xuICAgIGNhcnQuaW5pdCh0aGlzLmNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhbmQgcmV0dXJuIHByb2R1Y3QgPGZpZ3VyZT4gdGVtcGxhdGVcbiAgICogQHJldHVybnMgeyp9IEhUTUwgb2YgcHJvZHVjdCA8ZmlndXJlPlxuICAgKi9cbiAgY2xlYW5Qcm9kdWN0cygpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1ib3gnKS5pbm5lckhUTUwgPSAnJztcbiAgfVxuXG4gIHJlbmRlclByb2R1Y3RzKGRhdGEpIHtcbiAgICBsZXQgcGFnZSA9ICdwYWdlXycgKyAkKCcjcGFnaW5hdGlvbiAuYWN0aXZlJykudGV4dCgpOyAvLyBmaW5kIGFjdGl2ZSBwYWdlXG5cbiAgICBpZiAoZGF0YVtwYWdlXSkge1xuICAgICAgZm9yIChsZXQgb25lUHJvZCwgaSA9IDA7IGkgPCBkYXRhW3BhZ2VdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG9uZVByb2QgPSAkKCcjcHJvZF90ZW1wbGF0ZScpWzBdLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgb25lUHJvZC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdF9ocmVmJykuaHJlZiA9IGRhdGFbcGFnZV1baV0uaHJlZjtcbiAgICAgICAgb25lUHJvZC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbWcnKS5zcmMgPSBkYXRhW3BhZ2VdW2ldLmltZ1swXTtcbiAgICAgICAgb25lUHJvZC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbWcnKS5hbHQgPSBkYXRhW3BhZ2VdW2ldLm5hbWU7XG4gICAgICAgIG9uZVByb2QucXVlcnlTZWxlY3RvcignLnByb2R1Y3QtdG8tY2FydCcpLmlkID0gZGF0YVtwYWdlXVtpXS5pZDtcbiAgICAgICAgb25lUHJvZC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaDMnKVswXS50ZXh0Q29udGVudCA9IGRhdGFbcGFnZV1baV0ubmFtZTtcbiAgICAgICAgb25lUHJvZC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaDQnKVswXS50ZXh0Q29udGVudCA9ICckJyArIGRhdGFbcGFnZV1baV0ucHJpY2UgKyAnLjAwJztcbiAgICAgICAgb25lUHJvZC5jbGFzc0xpc3QucmVtb3ZlKCd0ZW1wbGF0ZScpO1xuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWJveCcpLmFwcGVuZENoaWxkKG9uZVByb2QpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkKCcjb29wcycpLnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBwYWdlIFVSTCBjb250YWlucyBzb21lIHN0cmluZ1xuICAgKiBAcGFyYW0gc3RyaW5nIGV4cCAtIHJlZ0V4cCBjb25kaXRpb25cbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgVVJMIGNvbnRhaW5zIHJlZ0V4cFxuICAgKi9cbiAgY2hlY2tVcmwoZXhwKSB7XG4gICAgbGV0IGNoZWNrVXJsID0gbmV3IFJlZ0V4cChleHApO1xuICAgIHJldHVybiBjaGVja1VybC50ZXN0KGRvY3VtZW50LmxvY2F0aW9uLmhyZWYpXG4gIH1cblxuICAvKipcbiAgICogUGFyc2Ugc3RyaW5nIGFuZCByZXR1cm4gUmVnRXhwIHN1dGlzZmllZCByZXN1bHQgb3IgbnVsbFxuICAgKiBAcGFyYW0gc3RyaW5nIGZvciBwYXJzaW5nXG4gICAqIEBwYXJhbSBzdHJpbmcgZXhwIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3Igc2VhcmNoXG4gICAqIEByZXR1cm5zIHsqfSByZXR1cm5zIGZvdW5kZWQgcGFydCBvZiBzdHJpbmcgb3IgbnVsbFxuICAgKi9cbiAgcGFyc2VVcmwoc3RyaW5nLCBleHApIHtcbiAgICBsZXQgcGFyc2UgPSBzdHJpbmcubWF0Y2goZXhwKTtcbiAgICByZXR1cm4gcGFyc2VbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGFnaW5hdGlvbiBkaXYgLSBmaWxsIGl0IHdpdGggPGE+TnVtPC9hPlxuICAgKiBAcGFyYW0ge30gZGF0YSBmaWx0ZXJlZCBjYXRhbG9nXG4gICAqL1xuICBzZXRQYWdpbmF0aW9uKGRhdGEpIHtcbiAgICAkKCcjcGFnaW5hdGlvbicpLmh0bWwoJycpOyAvLyBjbGVhciBodG1sIG9mIHBhZ2luYXRpb25cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBocmVmID0gJz8nICsgT2JqZWN0LmtleXMoZGF0YSlbaV07XG4gICAgICBsZXQgYSA9IGA8YSBocmVmPVwiJHtocmVmfVwiPiR7aSArIDF9PC9hPmA7XG5cbiAgICAgIGlmIChpID09PSAwKSB7IC8vYWRkIGZpcnN0IHBhZ2UgbnVtYmVyXG4gICAgICAgICQoJyNwYWdpbmF0aW9uJykuYXBwZW5kKGEpO1xuICAgICAgICAkKCcjcGFnaW5hdGlvbiBhJykuYWRkQ2xhc3MoJ2FjdGl2ZScpOyAvL3NldCB0aGUgZmlyc3QgYWN0aXZlXG5cbiAgICAgIH0gZWxzZSB7IC8vYWRkIGFub3RoZXIgcGFnZSBudW1iZXJzXG4gICAgICAgICQoJyNwYWdpbmF0aW9uJykuYXBwZW5kKGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudXJsUGFnaW5hdGlvbihkYXRhKTtcbiAgICB0aGlzLnBhZ2luYXRpb25OdW1IYW5kbGVyKGRhdGEpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiBVUkwgaGFzIHBhZ2VfKiBhbmQgc2V0IGFjdGl2ZSBwYWdlICsgYWRkIGhyZWYgdG8gcGFnaW5hdGlvbiBzbGlkZXIgYXJyb3dzXG4gICAqIEBwYXJhbSB7fSBkYXRhIGZpbHRlcmVkIGNhdGFsb2dcbiAgICovXG4gIHVybFBhZ2luYXRpb24oZGF0YSkge1xuICAgIC8vIGdldCBwYWdlX04gZnJvbSBVUkxcbiAgICBsZXQgZXhwID0gL3BhZ2VfXFxkKy9pO1xuXG4gICAgaWYgKHRoaXMuY2hlY2tVcmwoZXhwKSkgeyAvLyBjaGVjayBpZiBVUkwgaGFzIHBhZ2VfKlxuICAgICAgbGV0IHBhZ2VJblVSTCA9IHRoaXMucGFyc2VVcmwoZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgZXhwKTtcbiAgICAgIGxldCBwYWdlTm9JblVSTCA9ICt0aGlzLnBhcnNlVXJsKHBhZ2VJblVSTCwgL1xcZCsvaSk7IC8vIHBhcnNlIG51bWJlciBvZiBwYWdlXyBmcm9tIFVSTFxuICAgICAgaWYgKHBhZ2VOb0luVVJMID4gMCAmJiBwYWdlTm9JblVSTCA8PSBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5zZXRBY3RpdmVJblBhZ2luYXRpb24ocGFnZU5vSW5VUkwpO1xuICAgICAgICB0aGlzLnNldFBhZ2luYXRpb25BcnJvd3NIcmVmKHBhZ2VOb0luVVJMLCBkYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlSW5QYWdpbmF0aW9uKDEpO1xuICAgICAgICB0aGlzLnNldFBhZ2luYXRpb25BcnJvd3NIcmVmKDEsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgLmFjdGl2ZSBjbGFzcyBmb3Igbi10aCBwYWdlIGluIHBhZ2luYXRpb25cbiAgICogQHBhcmFtIEludCBuIG51bWJlciBvZiBwYWdlIGZyb20gVVJMXG4gICAqL1xuICBzZXRBY3RpdmVJblBhZ2luYXRpb24obikge1xuICAgICQoJyNwYWdpbmF0aW9uIC5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7IC8vcmVtb3ZlIGN1cnJlbnQgYWN0aXZlIGNsYXNzXG4gICAgJChgI3BhZ2luYXRpb24gYTpudGgtY2hpbGQoJHtufSlgKS5hZGRDbGFzcygnYWN0aXZlJyk7IC8vYWRkIG5ldyBhY3RpdmUgY2xhc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgaHJlZiB0byA8YT4gaW4gcGFnaW5hdGlvbiBzbGlkZXJcbiAgICogQHBhcmFtIEludCBuIG51bWJlciBvZiBwYWdlIGZyb20gVVJMXG4gICAqIEBwYXJhbSB7fSBkYXRhIGZpbHRlcmVkIGNhdGFsb2dcbiAgICovXG4gIHNldFBhZ2luYXRpb25BcnJvd3NIcmVmKG4sIGRhdGEpIHtcbiAgICBsZXQgcHJldiA9ICcnO1xuICAgIGxldCBuZXh0ID0gJyc7XG4gICAgbGV0IHVybEh0bWwgPSB0aGlzLnBhcnNlVXJsKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIC9cXC9bXlxcL10rP1xcLmh0bWwvaSk7IC8vIGdldCAvKi5odG1sIGZyb20gdXJsXG5cbiAgICAvLyBzZXQgbGVmdCBidXR0dG9uIGhyZWZcbiAgICBpZiAobiA+IDEpIHtcbiAgICAgIHByZXYgPSBgJHt1cmxIdG1sfT9wYWdlXyR7biAtIDF9YDtcbiAgICAgICQoJy5wYWdlcyAubGVmdCcpLmF0dHIoJ2hyZWYnLCBwcmV2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnLnBhZ2VzIC5sZWZ0JykuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgfVxuXG4gICAgLy8gc2V0IHJpZ2h0IGJ1dHR0b24gaHJlZlxuICAgIGlmIChuIDwgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoKSB7XG4gICAgICBuZXh0ID0gYCR7dXJsSHRtbH0/cGFnZV8ke24gKyAxfWA7XG4gICAgICAkKCcucGFnZXMgLnJpZ2h0JykuYXR0cignaHJlZicsIG5leHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCcucGFnZXMgLnJpZ2h0JykuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBjbGljayBoYW5kbGVyIGF0IHBhZ2luYXRpb24gbnVtYmVyc1xuICAgKi9cbiAgcGFnaW5hdGlvbk51bUhhbmRsZXIoKSB7XG4gICAgJCgnI3BhZ2luYXRpb24nKS5vbignY2xpY2snLCAnYScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJyNwYWdpbmF0aW9uIC5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIH0pO1xuICB9XG59XG5cblwidXNlIHN0cmljdFwiO1xuXG4vL1RPRE8gbWFrZSBhZGQgY2FydCB3b3JrIGZvciBtYWluIHBhZ2Vcbi8vVE9ETyBtYWtlIGFkZCBjYXJ0IHdvcmsgZm9yIHNpbmdsZSBwYWdlXG5cbi8qKlxuICogR2V0IGNhcnQsIHJlbmRlciBjYXJ0LCBhZGQgdG8gY2FydCwgZGVsZXRlIGZyb20gY2FydFxuICovXG5jbGFzcyBDYXJ0IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jYXRhbG9nID0ge307XG4gICAgdGhpcy5jYXJ0ID0ge1xuICAgICAgdG90YWw6IDAsXG4gICAgICBjb3VudEdvb2RzOiAwLFxuICAgICAgY29udGVudHM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICB1cmw6IHt9LFxuICAgICAgc2VsZWN0b3JzOiB7fSxcbiAgICB9O1xuICB9XG5cbiAgaW5pdChjb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmdldENhcnQoJycsIHRoaXMucmVuZGVyQ2FydCk7XG4gICAgdGhpcy5hZGRUb0NhcnRCdXR0b25IYW5kbGVyKCk7XG4gICAgdGhpcy5kZWxldGVCdXR0b25IYW5kbGVyKCk7XG4gICAgdGhpcy5xdWFudGl0eUhhbmRsZXIoJ2lucHV0JyArIHRoaXMuY29uZmlnLnNlbGVjdG9ycy5xdWFudGl0eSk7XG4gIH1cblxuICByZW5kZXJDYXJ0KCkge1xuICAgIGxldCByZW5kZXJDYXJ0ID0gbmV3IFJlbmRlckNhcnQodGhpcy5jYXJ0LmNvbnRlbnRzLCB0aGlzLmNhcnQudG90YWwpO1xuXG4gICAgcmVuZGVyQ2FydC5pbml0KHRoaXMuY29uZmlnLnNlbGVjdG9ycyk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhbGwgXCJBZGQgdG8gY2FydFwiIGJ1dHRvbnMgYW5kIGlmIGNsaWNrZWQgc3RhcnQgY2FsbGJhY2sgd2l0aCBcImlkXCIgYXMgcGFyYW1cbiAgICovXG4gIGFkZFRvQ2FydEJ1dHRvbkhhbmRsZXIoKSB7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgJCh0aGlzLmNvbmZpZy5zZWxlY3RvcnMuYWRkVG9DYXJ0KS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGxldCBpZCA9ICt0aGlzLmdldEF0dHJpYnV0ZSgnaWQnKTsgLy8gZm91bmQgaWQgb2YgYWRkZWQgcHJvZHVjdFxuICAgICAgdGhhdC5nZXRDYXRhbG9nKGlkKTtcbiAgICB9KVxuICB9XG5cbiAgZGVsZXRlQnV0dG9uSGFuZGxlcigpe1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAkKCcuY2FydC1jb250YWluZXInKS5vbignY2xpY2snLCB0aGlzLmNvbmZpZy5zZWxlY3RvcnMuZGVsLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGxldCBpZCA9ICt0aGlzLmdldEF0dHJpYnV0ZSgnaWQnKTsgLy8gZm91bmQgaWQgb2YgYWRkZWQgcHJvZHVjdFxuICAgICAgdGhhdC5kZWxldGVGcm9tQ2FydChpZCk7XG4gICAgfSlcbiAgfVxuXG4gIGRlbGV0ZUZyb21DYXJ0KGlkKXtcbiAgICBsZXQgaWR4ID0gdGhpcy5jaGVja0luQ2FydChpZCk7XG5cbiAgICB0aGlzLmNhcnQuY29udGVudHMuc3BsaWNlKGlkeCwgMSk7XG4gICAgdGhpcy5jYWxjVG90YWwoKTtcbiAgICB0aGlzLnBvc3RUb0NhcnQodGhpcy5jYXJ0KTtcbiAgICB0aGlzLnJlbmRlckNhcnQodGhpcy5jYXJ0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBxdWFudGl0eSBpbnB1dCB2YWx1ZSBjaGFuZ2VkIChhbmQgbG9vc2UgZm9jdXMpIHNlbmQgdG8gY2FsbGJhY2sgcHJvZHVjdCBpZCBhbmQgbmV3IHZhbHVlXG4gICAqIEBwYXJhbSBTdHJpbmcgc2VsZWN0b3Igb2YgcXVhbnRpdHkgaW5wdXRcbiAgICovXG4gIHF1YW50aXR5SGFuZGxlcihzZWxlY3Rvcil7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCBzZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGlkID0gK3RoaXMuZGF0YXNldC5pZDtcbiAgICAgIGxldCBuZXdWYWwgPSArdGhpcy52YWx1ZTtcblxuICAgICAgdGhhdC5zZXROZXdRdWFudGl0eS5jYWxsKHRoYXQsIGlkLCBuZXdWYWwpXG4gICAgfSlcbiAgfVxuXG4gIHNldE5ld1F1YW50aXR5KGlkLCBuZXdWYWwpe1xuICAgIGxldCBpZHggPSB0aGlzLmNoZWNrSW5DYXJ0KGlkKTtcbiAgICB0aGlzLmNhcnQuY29udGVudHNbaWR4XS5xdWFudGl0eSA9IG5ld1ZhbDtcblxuICAgIHRoaXMuY2FsY1RvdGFsKCk7XG4gICAgdGhpcy5wb3N0VG9DYXJ0KHRoaXMuY2FydCk7XG4gICAgdGhpcy5yZW5kZXJDYXJ0KHRoaXMuY2FydCk7XG4gIH1cblxuICBnZXRDYXRhbG9nKGlkKSB7XG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogdGhpcy5jb25maWcudXJsLnByb2R1Y3RzLFxuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICBzdWNjZXNzOiBkYXRhID0+IHtcbiAgICAgICAgdGhpcy5jYXRhbG9nID0gZGF0YTtcbiAgICAgICAgY29uc29sZS5sb2coJ0dvdCBmdWxsIGNhdGFsb2cgZnJvbSBKU09OJyk7XG4gICAgICAgIHRoaXMuZ2V0Q2FydChpZCwgdGhpcy5nZXRQcm9kRnJvbUNhdGFsb2cpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNZXRob2QgZ2V0Q2F0YWxvZygpIEZBSUxFRCcpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGNhcnQgZnJvbSBKU09OIGFuZCBkbyBnZXRQcm9kRnJvbUNhdGFsb2coaWQpIG9yIHJlbmRlciBjYXJ0XG4gICAqIEBwYXJhbSBudW1iZXIgaWQgLSBpZCBvZiBwcm9kdWN0IHRoYXQgYWRkVG9DYXJ0IGJ1dHRvbiB3YXMgY2xpY2tlZFxuICAgKi9cbiAgZ2V0Q2FydChpZCwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmNvbmZpZy51cmwuY2FydCxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgc3VjY2VzczogZGF0YSA9PiB7XG4gICAgICAgIHRoaXMuY2FydCA9IGRhdGE7XG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdJbml0aWFsIGNhcnQgcmVuZGVyaW5nJyk7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGVycm9yOiAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNZXRob2QgZ2V0Q2FydCgpIEZBSUxFRCcpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogRmludCBieSBpZCBwcm9kdWN0IGluIGNhdGFsb2cgYW5kIHNlbnQgaXQgdG8gcHJlcGFyZUZvckNhcnQoKVxuICAgKiBAcGFyYW0gSW50IGlkIC0gaWQgb2YgcHJvZHVjdCB3YXMgY2xpY2tlZFxuICAgKi9cbiAgZ2V0UHJvZEZyb21DYXRhbG9nKGlkKSB7XG4gICAgLy8gZmluZCBpbiBkYXRhIG9iamVjdCBwcm9kdWN0IHdpdGggc3VjaCBpZCBhbmQgcHVzaCBpdCB0byB0aGlzLmNvbnRlbnRzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNhdGFsb2cubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmNhdGFsb2dbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgIHRoaXMucHJlcGFyZUZvckNhcnQodGhpcy5jYXRhbG9nW2ldKTsgLy8gc2VuZCBmb3VuZGVkIHByb2R1Y3QgdG8gY2FsbGJhY2tcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJlcGFyZSBwcm9kdWN0IGZyb20gY2F0YWxvZyBmb3IgUFVTSGluZyB0byBjYXJ0XG4gICAqIEBwYXJhbSB7fSBwcm9kIC0gcHJvZHVjdCBmcm9tIGNhdGFsb2dcbiAgICovXG4gIHByZXBhcmVGb3JDYXJ0KHByb2QpIHtcbiAgICBsZXQgbmV3VG9DYXJ0ID0ge307XG5cbiAgICBuZXdUb0NhcnQuaWQgPSBwcm9kLmlkO1xuICAgIG5ld1RvQ2FydC5uYW1lID0gcHJvZC5uYW1lO1xuICAgIG5ld1RvQ2FydC5wcmljZSA9IHByb2QucHJpY2U7XG4gICAgbmV3VG9DYXJ0LmhyZWYgPSBwcm9kLmhyZWY7XG4gICAgbmV3VG9DYXJ0LmltZyA9IHByb2QuaW1nO1xuICAgIG5ld1RvQ2FydC5yYXRpbmcgPSBwcm9kLnJhdGluZztcblxuICAgIGxldCBpbkNhcnRJbmRleCA9IHRoaXMuY2hlY2tJbkNhcnQocHJvZC5pZCk7XG4gICAgaWYgKGluQ2FydEluZGV4ID49IDApIHtcbiAgICAgIHRoaXMuY2FydC5jb250ZW50c1tpbkNhcnRJbmRleF0ucXVhbnRpdHkgKz0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3VG9DYXJ0LnF1YW50aXR5ID0gMTtcbiAgICAgIHRoaXMuY2FydC5jb250ZW50cy5wdXNoKG5ld1RvQ2FydClcbiAgICB9XG5cbiAgICB0aGlzLmNhbGNUb3RhbCgpO1xuICAgIHRoaXMucG9zdFRvQ2FydCh0aGlzLmNhcnQpO1xuICAgIHRoaXMucmVuZGVyQ2FydCh0aGlzLmNhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgY2FydCBoYXMgc3VjaCBwcm9kdWN0XG4gICAqIEBwYXJhbSBpZCAtIHByb2R1Y3QgaWQgdGhhdCBpcyBuZWVkZWQgdG8gbG9vayB0aHJvdWdoIHRoZSBjYXJ0XG4gICAqIEByZXR1cm5zIG51bWJlciAtIDAgaWYgbm90IGZvdW5kIEVMU0UgcHJvZHVjdCBpbmRleCBvZiBjYXJ0IGFycmF5XG4gICAqL1xuICBjaGVja0luQ2FydChpZCkge1xuICAgIC8vIGZpbmQgaW4gZGF0YSBvYmplY3QgcHJvZHVjdCB3aXRoIHN1Y2ggaWQgYW5kIHB1c2ggaXQgdG8gdGhpcy5jb250ZW50c1xuICAgIGxldCBjYXJ0QXJyID0gdGhpcy5jYXJ0LmNvbnRlbnRzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2FydEFyci5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNhcnRBcnJbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRvdGFsIGFuZCBjb3VudEdvb2RzIHZhbHVlcyBhbmQgc2F2ZSBpdCB0byB0aGlzLmNhcnRcbiAgICovXG4gIGNhbGNUb3RhbCgpIHtcbiAgICBpZiAodGhpcy5jYXJ0LmNvbnRlbnRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5jYXJ0LmNvdW50R29vZHMgPSB0aGlzLmNhcnQuY29udGVudHMubGVuZ3RoO1xuXG4gICAgICB0aGlzLmNhcnQudG90YWwgPSAwO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNhcnQuY29udGVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHByaWNlID0gdGhpcy5jYXJ0LmNvbnRlbnRzW2ldLnByaWNlO1xuICAgICAgICBsZXQgcXVhbnRpdHkgPSB0aGlzLmNhcnQuY29udGVudHNbaV0ucXVhbnRpdHk7XG5cbiAgICAgICAgdGhpcy5jYXJ0LnRvdGFsICs9IHByaWNlICogcXVhbnRpdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FydC50b3RhbCA9IDA7XG4gICAgICB0aGlzLmNhcnQuY291bnRHb29kcyA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBPU1QgY2FydCB0byBKU09OIGZpbGVcbiAgICogQHBhcmFtIHt9IGRhdGEgLSBjYXJ0IGRhdGFcbiAgICovXG4gIHBvc3RUb0NhcnQoZGF0YSkge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuY29uZmlnLnVybC5jYXJ0LFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICAgIHN1Y2Nlc3M6ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ0NhcnQgd2FzIFNFTlQgdG8gREInKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnQ2FydCBzZW5kaW5nIHRvIERCIEZBSUxFRCcpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBGaW5kIGNhcnQgZGl2IGFuZCBjYXJ0IGl0ZW0gdGVtcGxhdGUsIGNsb25lIHRlbXBsYXRlIGFuZCBmaWxsIGl0IHdpdGggY2FydCBpdGVtcyBkYXRhLCBhcHBlbmQgaXQgdG8gRE9NXG4gKi9cbmNsYXNzIFJlbmRlckNhcnQge1xuICBjb25zdHJ1Y3RvcihpdGVtcywgdG90YWwpe1xuICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcbiAgICB0aGlzLnRvdGFsID0gdG90YWw7XG4gICAgdGhpcy5zZWxlY3RvcnMgPSB7XG4gICAgICBjYXJ0OiAnLmNhcnQtY29udGFpbmVyJyxcbiAgICAgIGl0ZW06ICcuY2FydC1pdGVtLnRlbXBsYXRlJyxcbiAgICAgIGhyZWY6ICcuY2FydC1pdGVtLWhyZWYnLFxuICAgICAgaW1nOiAnLmNhcnQtaXRlbS1pbWcnLFxuICAgICAgbmFtZTogJy5jYXJ0LWl0ZW0tbmFtZScsXG4gICAgICBxdWFudGl0eTogJy5jYXJ0LWl0ZW0tcXVhbnRpdHknLFxuICAgICAgcHJpY2U6ICcuY2FydC1pdGVtLXByaWNlJyxcbiAgICAgIGRlbDogJy5jYXJ0LWl0ZW0tZGVsJyxcbiAgICAgIHJhdGU6ICcucmF0ZScsXG4gICAgICBzdWJ0b3RhbDogJy5jYXJ0LWl0ZW0tc3VidG90YWwnLFxuICAgICAgdG90YWw6ICcuY2FydC10b3RhbCcsXG4gICAgICBkaXNwbGF5Tm9uZTogJ3RlbXBsYXRlJyxcbiAgICB9O1xuICB9XG5cbiAgaW5pdChzZWxlY3RvcnMpe1xuICAgIHRoaXMuc2VsZWN0b3JzID0gc2VsZWN0b3JzO1xuICAgIGxldCBjYXJ0Tm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLmNhcnQpO1xuICAgIGxldCBJdGVtTm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLml0ZW0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYXJ0Tm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjYXJ0Tm9kZSA9IGNhcnROb2Rlc1tpXTtcbiAgICAgIGxldCBpdGVtTm9kZSA9IEl0ZW1Ob2Rlc1tpXTtcblxuICAgICAgdGhpcy5jbGVhckNhcnRDb250YWluZXIoY2FydE5vZGUpO1xuXG4gICAgICBmb3IgKGxldCBjYXJ0SXRlbSwgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNhcnRJdGVtID0gdGhpcy5jbG9uZU5vZGUoaXRlbU5vZGUpO1xuXG4gICAgICAgIHRoaXMuc2V0SW1nKHRoaXMuc2VsZWN0b3JzLmltZywgY2FydEl0ZW0sIHRoaXMuaXRlbXNbaV0pO1xuICAgICAgICB0aGlzLnNldE5hbWUodGhpcy5zZWxlY3RvcnMubmFtZSwgY2FydEl0ZW0sIHRoaXMuaXRlbXNbaV0pO1xuICAgICAgICB0aGlzLnNldEhyZWYodGhpcy5zZWxlY3RvcnMuaHJlZiwgY2FydEl0ZW0sIHRoaXMuaXRlbXNbaV0uaHJlZik7XG4gICAgICAgIHRoaXMuc2V0UXVhbnRpdHkodGhpcy5zZWxlY3RvcnMucXVhbnRpdHksIGNhcnRJdGVtLCB0aGlzLml0ZW1zW2ldKTtcbiAgICAgICAgdGhpcy5zZXRQcmljZSh0aGlzLnNlbGVjdG9ycy5wcmljZSwgY2FydEl0ZW0sIHRoaXMuaXRlbXNbaV0pO1xuICAgICAgICB0aGlzLmZpbGxSYXRlU3RhcnModGhpcy5zZWxlY3RvcnMucmF0ZSwgY2FydEl0ZW0sIHRoaXMuaXRlbXNbaV0ucmF0aW5nKTtcbiAgICAgICAgdGhpcy5zZXREZWxldGVCdXR0b25JZCh0aGlzLnNlbGVjdG9ycy5kZWwsIGNhcnRJdGVtLCB0aGlzLml0ZW1zW2ldKTtcbiAgICAgICAgdGhpcy5zZXRTdWJUb3RhbCh0aGlzLnNlbGVjdG9ycy5zdWJ0b3RhbCwgY2FydEl0ZW0sIHRoaXMuaXRlbXNbaV0pO1xuXG4gICAgICAgIHRoaXMuZGlzcGxheU5vbmVEZWxldGUodGhpcy5zZWxlY3RvcnMuZGlzcGxheU5vbmUsIGNhcnRJdGVtKTtcbiAgICAgICAgdGhpcy5pdGVtQXBwZW5kKGNhcnROb2RlLCBjYXJ0SXRlbSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2hvd1RvdGFsUHJpY2UodGhpcy5zZWxlY3RvcnMudG90YWwsIHRoaXMudG90YWwpO1xuICAgIH1cbiAgfVxuXG4gIGNsZWFyQ2FydENvbnRhaW5lcihub2RlKXtcbiAgICBub2RlLmlubmVySFRNTCA9ICcnO1xuICB9XG5cbiAgY2xvbmVOb2RlKGl0ZW1Ob2RlKXtcbiAgICByZXR1cm4gaXRlbU5vZGUuY2xvbmVOb2RlKHRydWUpO1xuICB9XG5cbiAgc2V0SW1nKHNlbGVjdG9yLCBjYXJ0SXRlbSwgcHJvZHVjdCl7XG4gICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3Rvcikuc3JjID0gcHJvZHVjdC5pbWdbMF07XG4gICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikuYWx0ID0gcHJvZHVjdC5uYW1lO1xuICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnRpdGxlID0gcHJvZHVjdC5uYW1lO1xuICB9XG5cbiAgc2V0TmFtZShzZWxlY3RvciwgY2FydEl0ZW0sIHByb2R1Y3Qpe1xuICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnRleHRDb250ZW50ID0gcHJvZHVjdC5uYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBocmVmIHRvIGFsbCBlbGVtZW50cyBvZiBIVE1MIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIGFyciBIVE1MIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIGhyZWZcbiAgICovXG4gIHNldEhyZWYoc2VsZWN0b3IsIGNhcnRJdGVtLCBocmVmKXtcbiAgICBsZXQgYUNvbGxlY3Rpb24gPSBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYUNvbGxlY3Rpb24ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFDb2xsZWN0aW9uW2ldLmhyZWYgPSBocmVmO1xuICAgIH1cbiAgfVxuXG4gIHNldFF1YW50aXR5KHNlbGVjdG9yLCBjYXJ0SXRlbSwgaXRlbSl7XG4gICAgaWYgKGNhcnRJdGVtLmxvY2FsTmFtZSA9PT0gJ2RpdicpIHtcbiAgICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnRleHRDb250ZW50ID0gaXRlbS5xdWFudGl0eTtcbiAgICB9IGVsc2UgaWYgKGNhcnRJdGVtLmxvY2FsTmFtZSA9PT0gJ3RyJykge1xuICAgICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikudmFsdWUgPSBpdGVtLnF1YW50aXR5O1xuICAgICAgY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikuZGF0YXNldC5pZCA9IGl0ZW0uaWQ7XG4gICAgfVxuICB9XG5cbiAgc2V0UHJpY2Uoc2VsZWN0b3IsIGNhcnRJdGVtLCBwcm9kdWN0KXtcbiAgICBjYXJ0SXRlbS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS50ZXh0Q29udGVudCA9IHByb2R1Y3QucHJpY2U7XG4gIH1cblxuICBmaWxsUmF0ZVN0YXJzKHNlbGVjdG9yLCBjYXJ0SXRlbSwgcmF0aW5nKXtcbiAgICBsZXQgbWF4V2lkdGggPSAkKHNlbGVjdG9yKS5jc3MoJ21heC13aWR0aCcpO1xuICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnN0eWxlID0gYHdpZHRoOiBjYWxjKCR7bWF4V2lkdGh9IC8gNSAqICR7cmF0aW5nfSlgO1xuICB9XG5cbiAgc2V0U3ViVG90YWwoc2VsZWN0b3IsIGNhcnRJdGVtLCBwcm9kdWN0KXtcbiAgICBpZiAoY2FydEl0ZW0ucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICAgIGxldCBzdWIgPSBwcm9kdWN0LnByaWNlICogcHJvZHVjdC5xdWFudGl0eTtcbiAgICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnRleHRDb250ZW50ID0gc3ViO1xuICAgIH1cbn1cblxuICBzZXREZWxldGVCdXR0b25JZChzZWxlY3RvciwgY2FydEl0ZW0sIHByb2R1Y3Qpe1xuICAgIGNhcnRJdGVtLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmlkID0gcHJvZHVjdC5pZDtcbiAgfVxuXG4gIGRpc3BsYXlOb25lRGVsZXRlKHNlbGVjdG9yLCBjYXJ0SXRlbSkge1xuICAgIGNhcnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoc2VsZWN0b3IpO1xuICB9XG5cbiAgaXRlbUFwcGVuZChjYXJ0Tm9kZSwgaXRlbSl7XG4gICAgY2FydE5vZGUuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gIH1cblxuICBzaG93VG90YWxQcmljZShzZWxlY3RvciwgdG90YWwpe1xuICAgIGxldCB0b3RhbE5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cbiAgICB0b3RhbE5vZGVzLmZvckVhY2goZWxlbSA9PiB7XG4gICAgICBlbGVtLnRleHRDb250ZW50ID0gdG90YWw7XG4gICAgfSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikudGV4dENvbnRlbnQgPSB0b3RhbDtcbiAgfVxufVxuXG4vKiEgakNhcm91c2VsIC0gdjAuMy44IC0gMjAxOC0wNS0zMVxuKiBodHRwOi8vc29yZ2FsbGEuY29tL2pjYXJvdXNlbC9cbiogQ29weXJpZ2h0IChjKSAyMDA2LTIwMTggSmFuIFNvcmdhbGxhOyBMaWNlbnNlZCBNSVQgKi9cbihmdW5jdGlvbigkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgakNhcm91c2VsID0gJC5qQ2Fyb3VzZWwgPSB7fTtcblxuICBqQ2Fyb3VzZWwudmVyc2lvbiA9ICcwLjMuOCc7XG5cbiAgdmFyIHJSZWxhdGl2ZVRhcmdldCA9IC9eKFsrXFwtXT0pPyguKykkLztcblxuICBqQ2Fyb3VzZWwucGFyc2VUYXJnZXQgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICB2YXIgcmVsYXRpdmUgPSBmYWxzZSxcbiAgICAgIHBhcnRzICAgID0gdHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgP1xuICAgICAgICByUmVsYXRpdmVUYXJnZXQuZXhlYyh0YXJnZXQpIDpcbiAgICAgICAgbnVsbDtcblxuICAgIGlmIChwYXJ0cykge1xuICAgICAgdGFyZ2V0ID0gcGFyc2VJbnQocGFydHNbMl0sIDEwKSB8fCAwO1xuXG4gICAgICBpZiAocGFydHNbMV0pIHtcbiAgICAgICAgcmVsYXRpdmUgPSB0cnVlO1xuICAgICAgICBpZiAocGFydHNbMV0gPT09ICctPScpIHtcbiAgICAgICAgICB0YXJnZXQgKj0gLTE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnKSB7XG4gICAgICB0YXJnZXQgPSBwYXJzZUludCh0YXJnZXQsIDEwKSB8fCAwO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgIHJlbGF0aXZlOiByZWxhdGl2ZVxuICAgIH07XG4gIH07XG5cbiAgakNhcm91c2VsLmRldGVjdENhcm91c2VsID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHZhciBjYXJvdXNlbDtcblxuICAgIHdoaWxlIChlbGVtZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgIGNhcm91c2VsID0gZWxlbWVudC5maWx0ZXIoJ1tkYXRhLWpjYXJvdXNlbF0nKTtcblxuICAgICAgaWYgKGNhcm91c2VsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGNhcm91c2VsO1xuICAgICAgfVxuXG4gICAgICBjYXJvdXNlbCA9IGVsZW1lbnQuZmluZCgnW2RhdGEtamNhcm91c2VsXScpO1xuXG4gICAgICBpZiAoY2Fyb3VzZWwubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gY2Fyb3VzZWw7XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudCgpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIGpDYXJvdXNlbC5iYXNlID0gZnVuY3Rpb24ocGx1Z2luTmFtZSkge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiAgakNhcm91c2VsLnZlcnNpb24sXG4gICAgICBfb3B0aW9uczogIHt9LFxuICAgICAgX2VsZW1lbnQ6ICBudWxsLFxuICAgICAgX2Nhcm91c2VsOiBudWxsLFxuICAgICAgX2luaXQ6ICAgICAkLm5vb3AsXG4gICAgICBfY3JlYXRlOiAgICQubm9vcCxcbiAgICAgIF9kZXN0cm95OiAgJC5ub29wLFxuICAgICAgX3JlbG9hZDogICAkLm5vb3AsXG4gICAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9lbGVtZW50XG4gICAgICAgICAgLmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUudG9Mb3dlckNhc2UoKSwgdHJ1ZSlcbiAgICAgICAgICAuZGF0YShwbHVnaW5OYW1lLCB0aGlzKTtcblxuICAgICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ2NyZWF0ZScpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcmVhdGUoKTtcblxuICAgICAgICB0aGlzLl90cmlnZ2VyKCdjcmVhdGVlbmQnKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdkZXN0cm95JykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3koKTtcblxuICAgICAgICB0aGlzLl90cmlnZ2VyKCdkZXN0cm95ZW5kJyk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudFxuICAgICAgICAgIC5yZW1vdmVEYXRhKHBsdWdpbk5hbWUpXG4gICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUudG9Mb3dlckNhc2UoKSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgcmVsb2FkOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcigncmVsb2FkJykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgdGhpcy5vcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVsb2FkKCk7XG5cbiAgICAgICAgdGhpcy5fdHJpZ2dlcigncmVsb2FkZW5kJyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgZWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gJC5leHRlbmQoe30sIHRoaXMuX29wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5fb3B0aW9uc1trZXldID09PSAndW5kZWZpbmVkJyA/XG4gICAgICAgICAgICAgIG51bGwgOlxuICAgICAgICAgICAgICB0aGlzLl9vcHRpb25zW2tleV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fb3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLl9vcHRpb25zLCBrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgY2Fyb3VzZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2Nhcm91c2VsKSB7XG4gICAgICAgICAgdGhpcy5fY2Fyb3VzZWwgPSBqQ2Fyb3VzZWwuZGV0ZWN0Q2Fyb3VzZWwodGhpcy5vcHRpb25zKCdjYXJvdXNlbCcpIHx8IHRoaXMuX2VsZW1lbnQpO1xuXG4gICAgICAgICAgaWYgKCF0aGlzLl9jYXJvdXNlbCkge1xuICAgICAgICAgICAgJC5lcnJvcignQ291bGQgbm90IGRldGVjdCBjYXJvdXNlbCBmb3IgcGx1Z2luIFwiJyArIHBsdWdpbk5hbWUgKyAnXCInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fY2Fyb3VzZWw7XG4gICAgICB9LFxuICAgICAgX3RyaWdnZXI6IGZ1bmN0aW9uKHR5cGUsIGVsZW1lbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIGV2ZW50LFxuICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcblxuICAgICAgICBkYXRhID0gW3RoaXNdLmNvbmNhdChkYXRhIHx8IFtdKTtcblxuICAgICAgICAoZWxlbWVudCB8fCB0aGlzLl9lbGVtZW50KS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV2ZW50ID0gJC5FdmVudCgocGx1Z2luTmFtZSArICc6JyArIHR5cGUpLnRvTG93ZXJDYXNlKCkpO1xuXG4gICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKGV2ZW50LCBkYXRhKTtcblxuICAgICAgICAgIGlmIChldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgICAgICAgZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gIWRlZmF1bHRQcmV2ZW50ZWQ7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBqQ2Fyb3VzZWwucGx1Z2luID0gZnVuY3Rpb24ocGx1Z2luTmFtZSwgcGx1Z2luUHJvdG90eXBlKSB7XG4gICAgdmFyIFBsdWdpbiA9ICRbcGx1Z2luTmFtZV0gPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICB0aGlzLl9lbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgIHRoaXMub3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICB9O1xuXG4gICAgUGx1Z2luLmZuID0gUGx1Z2luLnByb3RvdHlwZSA9ICQuZXh0ZW5kKFxuICAgICAge30sXG4gICAgICBqQ2Fyb3VzZWwuYmFzZShwbHVnaW5OYW1lKSxcbiAgICAgIHBsdWdpblByb3RvdHlwZVxuICAgICk7XG5cbiAgICAkLmZuW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIGFyZ3MgICAgICAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgcmV0dXJuVmFsdWUgPSB0aGlzO1xuXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgaW5zdGFuY2UgPSAkKHRoaXMpLmRhdGEocGx1Z2luTmFtZSk7XG5cbiAgICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5lcnJvcihcbiAgICAgICAgICAgICAgJ0Nhbm5vdCBjYWxsIG1ldGhvZHMgb24gJyArIHBsdWdpbk5hbWUgKyAnIHByaW9yIHRvIGluaXRpYWxpemF0aW9uOyAnICtcbiAgICAgICAgICAgICAgJ2F0dGVtcHRlZCB0byBjYWxsIG1ldGhvZCBcIicgKyBvcHRpb25zICsgJ1wiJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoISQuaXNGdW5jdGlvbihpbnN0YW5jZVtvcHRpb25zXSkgfHwgb3B0aW9ucy5jaGFyQXQoMCkgPT09ICdfJykge1xuICAgICAgICAgICAgcmV0dXJuICQuZXJyb3IoXG4gICAgICAgICAgICAgICdObyBzdWNoIG1ldGhvZCBcIicgKyBvcHRpb25zICsgJ1wiIGZvciAnICsgcGx1Z2luTmFtZSArICcgaW5zdGFuY2UnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBtZXRob2RWYWx1ZSA9IGluc3RhbmNlW29wdGlvbnNdLmFwcGx5KGluc3RhbmNlLCBhcmdzKTtcblxuICAgICAgICAgIGlmIChtZXRob2RWYWx1ZSAhPT0gaW5zdGFuY2UgJiYgdHlwZW9mIG1ldGhvZFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBtZXRob2RWYWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBpbnN0YW5jZSA9ICQodGhpcykuZGF0YShwbHVnaW5OYW1lKTtcblxuICAgICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIFBsdWdpbikge1xuICAgICAgICAgICAgaW5zdGFuY2UucmVsb2FkKG9wdGlvbnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXcgUGx1Z2luKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFBsdWdpbjtcbiAgfTtcbn0oalF1ZXJ5KSk7XG5cbihmdW5jdGlvbigkLCB3aW5kb3cpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXG4gIHZhciB0b0Zsb2F0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsKSB8fCAwO1xuICB9O1xuXG4gICQuakNhcm91c2VsLnBsdWdpbignamNhcm91c2VsJywge1xuICAgIGFuaW1hdGluZzogICBmYWxzZSxcbiAgICB0YWlsOiAgICAgICAgMCxcbiAgICBpblRhaWw6ICAgICAgZmFsc2UsXG4gICAgcmVzaXplU3RhdGU6IG51bGwsXG4gICAgcmVzaXplVGltZXI6IG51bGwsXG4gICAgbHQ6ICAgICAgICAgIG51bGwsXG4gICAgdmVydGljYWw6ICAgIGZhbHNlLFxuICAgIHJ0bDogICAgICAgICBmYWxzZSxcbiAgICBjaXJjdWxhcjogICAgZmFsc2UsXG4gICAgdW5kZXJmbG93OiAgIGZhbHNlLFxuICAgIHJlbGF0aXZlOiAgICBmYWxzZSxcblxuICAgIF9vcHRpb25zOiB7XG4gICAgICBsaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudCgpLmNoaWxkcmVuKCkuZXEoMCk7XG4gICAgICB9LFxuICAgICAgaXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0KCkuY2hpbGRyZW4oKTtcbiAgICAgIH0sXG4gICAgICBhbmltYXRpb246ICAgNDAwLFxuICAgICAgdHJhbnNpdGlvbnM6IGZhbHNlLFxuICAgICAgd3JhcDogICAgICAgIG51bGwsXG4gICAgICB2ZXJ0aWNhbDogICAgbnVsbCxcbiAgICAgIHJ0bDogICAgICAgICBudWxsLFxuICAgICAgY2VudGVyOiAgICAgIGZhbHNlXG4gICAgfSxcblxuICAgIC8vIFByb3RlY3RlZCwgZG9uJ3QgYWNjZXNzIGRpcmVjdGx5XG4gICAgX2xpc3Q6ICAgICAgICAgbnVsbCxcbiAgICBfaXRlbXM6ICAgICAgICBudWxsLFxuICAgIF90YXJnZXQ6ICAgICAgICQoKSxcbiAgICBfZmlyc3Q6ICAgICAgICAkKCksXG4gICAgX2xhc3Q6ICAgICAgICAgJCgpLFxuICAgIF92aXNpYmxlOiAgICAgICQoKSxcbiAgICBfZnVsbHl2aXNpYmxlOiAkKCksXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBzZWxmLnJlc2l6ZVN0YXRlID0gJHdpbmRvdy53aWR0aCgpICsgJ3gnICsgJHdpbmRvdy5oZWlnaHQoKTtcblxuICAgICAgdGhpcy5vbldpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2VsZi5yZXNpemVUaW1lcikge1xuICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnJlc2l6ZVRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYucmVzaXplVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBjdXJyZW50UmVzaXplU3RhdGUgPSAkd2luZG93LndpZHRoKCkgKyAneCcgKyAkd2luZG93LmhlaWdodCgpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHdpbmRvdyBzaXplIGFjdHVhbGx5IGNoYW5nZWQuXG4gICAgICAgICAgLy8gaU9TIG1pZ2h0IHRyaWdnZXIgcmVzaXplIGV2ZW50cyBvbiBwYWdlIHNjcm9sbC5cbiAgICAgICAgICBpZiAoY3VycmVudFJlc2l6ZVN0YXRlID09PSBzZWxmLnJlc2l6ZVN0YXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5yZXNpemVTdGF0ZSA9IGN1cnJlbnRSZXNpemVTdGF0ZTtcbiAgICAgICAgICBzZWxmLnJlbG9hZCgpO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3JlbG9hZCgpO1xuXG4gICAgICAkd2luZG93Lm9uKCdyZXNpemUuamNhcm91c2VsJywgdGhpcy5vbldpbmRvd1Jlc2l6ZSk7XG4gICAgfSxcbiAgICBfZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAkd2luZG93Lm9mZigncmVzaXplLmpjYXJvdXNlbCcsIHRoaXMub25XaW5kb3dSZXNpemUpO1xuICAgIH0sXG4gICAgX3JlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnZlcnRpY2FsID0gdGhpcy5vcHRpb25zKCd2ZXJ0aWNhbCcpO1xuXG4gICAgICBpZiAodGhpcy52ZXJ0aWNhbCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudmVydGljYWwgPSB0b0Zsb2F0KHRoaXMubGlzdCgpLmhlaWdodCgpKSA+IHRvRmxvYXQodGhpcy5saXN0KCkud2lkdGgoKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucnRsID0gdGhpcy5vcHRpb25zKCdydGwnKTtcblxuICAgICAgaWYgKHRoaXMucnRsID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5ydGwgPSAoZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgIGlmICgoJycgKyBlbGVtZW50LmF0dHIoJ2RpcicpKS50b0xvd2VyQ2FzZSgpID09PSAncnRsJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgICBlbGVtZW50LnBhcmVudHMoJ1tkaXJdJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICgoL3J0bC9pKS50ZXN0KCQodGhpcykuYXR0cignZGlyJykpKSB7XG4gICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9KHRoaXMuX2VsZW1lbnQpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sdCA9IHRoaXMudmVydGljYWwgPyAndG9wJyA6ICdsZWZ0JztcblxuICAgICAgLy8gRW5zdXJlIGJlZm9yZSBjbG9zZXN0KCkgY2FsbFxuICAgICAgdGhpcy5yZWxhdGl2ZSA9IHRoaXMubGlzdCgpLmNzcygncG9zaXRpb24nKSA9PT0gJ3JlbGF0aXZlJztcblxuICAgICAgLy8gRm9yY2UgbGlzdCBhbmQgaXRlbXMgcmVsb2FkXG4gICAgICB0aGlzLl9saXN0ICA9IG51bGw7XG4gICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG5cbiAgICAgIHZhciBpdGVtID0gdGhpcy5pbmRleCh0aGlzLl90YXJnZXQpID49IDAgP1xuICAgICAgICB0aGlzLl90YXJnZXQgOlxuICAgICAgICB0aGlzLmNsb3Nlc3QoKTtcblxuICAgICAgLy8gX3ByZXBhcmUoKSBuZWVkcyB0aGlzIGhlcmVcbiAgICAgIHRoaXMuY2lyY3VsYXIgID0gdGhpcy5vcHRpb25zKCd3cmFwJykgPT09ICdjaXJjdWxhcic7XG4gICAgICB0aGlzLnVuZGVyZmxvdyA9IGZhbHNlO1xuXG4gICAgICB2YXIgcHJvcHMgPSB7J2xlZnQnOiAwLCAndG9wJzogMH07XG5cbiAgICAgIGlmIChpdGVtLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fcHJlcGFyZShpdGVtKTtcbiAgICAgICAgdGhpcy5saXN0KCkuZmluZCgnW2RhdGEtamNhcm91c2VsLWNsb25lXScpLnJlbW92ZSgpO1xuXG4gICAgICAgIC8vIEZvcmNlIGl0ZW1zIHJlbG9hZFxuICAgICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG5cbiAgICAgICAgdGhpcy51bmRlcmZsb3cgPSB0aGlzLl9mdWxseXZpc2libGUubGVuZ3RoID49IHRoaXMuaXRlbXMoKS5sZW5ndGg7XG4gICAgICAgIHRoaXMuY2lyY3VsYXIgID0gdGhpcy5jaXJjdWxhciAmJiAhdGhpcy51bmRlcmZsb3c7XG5cbiAgICAgICAgcHJvcHNbdGhpcy5sdF0gPSB0aGlzLl9wb3NpdGlvbihpdGVtKSArICdweCc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubW92ZShwcm9wcyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fbGlzdCA9PT0gbnVsbCkge1xuICAgICAgICB2YXIgb3B0aW9uID0gdGhpcy5vcHRpb25zKCdsaXN0Jyk7XG4gICAgICAgIHRoaXMuX2xpc3QgPSAkLmlzRnVuY3Rpb24ob3B0aW9uKSA/IG9wdGlvbi5jYWxsKHRoaXMpIDogdGhpcy5fZWxlbWVudC5maW5kKG9wdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9saXN0O1xuICAgIH0sXG4gICAgaXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX2l0ZW1zID09PSBudWxsKSB7XG4gICAgICAgIHZhciBvcHRpb24gPSB0aGlzLm9wdGlvbnMoJ2l0ZW1zJyk7XG4gICAgICAgIHRoaXMuX2l0ZW1zID0gKCQuaXNGdW5jdGlvbihvcHRpb24pID8gb3B0aW9uLmNhbGwodGhpcykgOiB0aGlzLmxpc3QoKS5maW5kKG9wdGlvbikpLm5vdCgnW2RhdGEtamNhcm91c2VsLWNsb25lXScpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5faXRlbXM7XG4gICAgfSxcbiAgICBpbmRleDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIHRoaXMuaXRlbXMoKS5pbmRleChpdGVtKTtcbiAgICB9LFxuICAgIGNsb3Nlc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgICAgPSB0aGlzLFxuICAgICAgICBwb3MgICAgID0gdGhpcy5saXN0KCkucG9zaXRpb24oKVt0aGlzLmx0XSxcbiAgICAgICAgY2xvc2VzdCA9ICQoKSwgLy8gRW5zdXJlIHdlJ3JlIHJldHVybmluZyBhIGpRdWVyeSBpbnN0YW5jZVxuICAgICAgICBzdG9wICAgID0gZmFsc2UsXG4gICAgICAgIGxyYiAgICAgPSB0aGlzLnZlcnRpY2FsID8gJ2JvdHRvbScgOiAodGhpcy5ydGwgJiYgIXRoaXMucmVsYXRpdmUgPyAnbGVmdCcgOiAncmlnaHQnKSxcbiAgICAgICAgd2lkdGg7XG5cbiAgICAgIGlmICh0aGlzLnJ0bCAmJiB0aGlzLnJlbGF0aXZlICYmICF0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIHBvcyArPSB0b0Zsb2F0KHRoaXMubGlzdCgpLndpZHRoKCkpIC0gdGhpcy5jbGlwcGluZygpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLml0ZW1zKCkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgY2xvc2VzdCA9ICQodGhpcyk7XG5cbiAgICAgICAgaWYgKHN0b3ApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGltID0gc2VsZi5kaW1lbnNpb24oY2xvc2VzdCk7XG5cbiAgICAgICAgcG9zICs9IGRpbTtcblxuICAgICAgICBpZiAocG9zID49IDApIHtcbiAgICAgICAgICB3aWR0aCA9IGRpbSAtIHRvRmxvYXQoY2xvc2VzdC5jc3MoJ21hcmdpbi0nICsgbHJiKSk7XG5cbiAgICAgICAgICBpZiAoKE1hdGguYWJzKHBvcykgLSBkaW0gKyAod2lkdGggLyAyKSkgPD0gMCkge1xuICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG5cbiAgICAgIHJldHVybiBjbG9zZXN0O1xuICAgIH0sXG4gICAgdGFyZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl90YXJnZXQ7XG4gICAgfSxcbiAgICBmaXJzdDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmlyc3Q7XG4gICAgfSxcbiAgICBsYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9sYXN0O1xuICAgIH0sXG4gICAgdmlzaWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmlzaWJsZTtcbiAgICB9LFxuICAgIGZ1bGx5dmlzaWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZnVsbHl2aXNpYmxlO1xuICAgIH0sXG4gICAgaGFzTmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ2hhc25leHQnKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHdyYXAgPSB0aGlzLm9wdGlvbnMoJ3dyYXAnKSxcbiAgICAgICAgZW5kID0gdGhpcy5pdGVtcygpLmxlbmd0aCAtIDEsXG4gICAgICAgIGNoZWNrID0gdGhpcy5vcHRpb25zKCdjZW50ZXInKSA/IHRoaXMuX3RhcmdldCA6IHRoaXMuX2xhc3Q7XG5cbiAgICAgIHJldHVybiBlbmQgPj0gMCAmJiAhdGhpcy51bmRlcmZsb3cgJiZcbiAgICAgICgod3JhcCAmJiB3cmFwICE9PSAnZmlyc3QnKSB8fFxuICAgICAgICAodGhpcy5pbmRleChjaGVjaykgPCBlbmQpIHx8XG4gICAgICAgICh0aGlzLnRhaWwgJiYgIXRoaXMuaW5UYWlsKSkgPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcbiAgICBoYXNQcmV2OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignaGFzcHJldicpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgd3JhcCA9IHRoaXMub3B0aW9ucygnd3JhcCcpO1xuXG4gICAgICByZXR1cm4gdGhpcy5pdGVtcygpLmxlbmd0aCA+IDAgJiYgIXRoaXMudW5kZXJmbG93ICYmXG4gICAgICAoKHdyYXAgJiYgd3JhcCAhPT0gJ2xhc3QnKSB8fFxuICAgICAgICAodGhpcy5pbmRleCh0aGlzLl9maXJzdCkgPiAwKSB8fFxuICAgICAgICAodGhpcy50YWlsICYmIHRoaXMuaW5UYWlsKSkgPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcbiAgICBjbGlwcGluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdG9GbG9hdCh0aGlzLl9lbGVtZW50Wydpbm5lcicgKyAodGhpcy52ZXJ0aWNhbCA/ICdIZWlnaHQnIDogJ1dpZHRoJyldKCkpO1xuICAgIH0sXG4gICAgZGltZW5zaW9uOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICByZXR1cm4gdG9GbG9hdChlbGVtZW50WydvdXRlcicgKyAodGhpcy52ZXJ0aWNhbCA/ICdIZWlnaHQnIDogJ1dpZHRoJyldKHRydWUpKTtcbiAgICB9LFxuICAgIHNjcm9sbDogZnVuY3Rpb24odGFyZ2V0LCBhbmltYXRlLCBjYWxsYmFjaykge1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ3Njcm9sbCcsIG51bGwsIFt0YXJnZXQsIGFuaW1hdGVdKSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgaWYgKCQuaXNGdW5jdGlvbihhbmltYXRlKSkge1xuICAgICAgICBjYWxsYmFjayA9IGFuaW1hdGU7XG4gICAgICAgIGFuaW1hdGUgID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBhcnNlZCA9ICQuakNhcm91c2VsLnBhcnNlVGFyZ2V0KHRhcmdldCk7XG5cbiAgICAgIGlmIChwYXJzZWQucmVsYXRpdmUpIHtcbiAgICAgICAgdmFyIGVuZCAgICA9IHRoaXMuaXRlbXMoKS5sZW5ndGggLSAxLFxuICAgICAgICAgIHNjcm9sbCA9IE1hdGguYWJzKHBhcnNlZC50YXJnZXQpLFxuICAgICAgICAgIHdyYXAgICA9IHRoaXMub3B0aW9ucygnd3JhcCcpLFxuICAgICAgICAgIGN1cnJlbnQsXG4gICAgICAgICAgZmlyc3QsXG4gICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgY3VycixcbiAgICAgICAgICBpc1Zpc2libGUsXG4gICAgICAgICAgcHJvcHMsXG4gICAgICAgICAgaTtcblxuICAgICAgICBpZiAocGFyc2VkLnRhcmdldCA+IDApIHtcbiAgICAgICAgICB2YXIgbGFzdCA9IHRoaXMuaW5kZXgodGhpcy5fbGFzdCk7XG5cbiAgICAgICAgICBpZiAobGFzdCA+PSBlbmQgJiYgdGhpcy50YWlsKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaW5UYWlsKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFRhaWwoYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHdyYXAgPT09ICdib3RoJyB8fCB3cmFwID09PSAnbGFzdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoMCwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudCA9IHRoaXMuaW5kZXgodGhpcy5fdGFyZ2V0KTtcblxuICAgICAgICAgICAgaWYgKCh0aGlzLnVuZGVyZmxvdyAmJiBjdXJyZW50ID09PSBlbmQgJiYgKHdyYXAgPT09ICdjaXJjdWxhcicgfHwgd3JhcCA9PT0gJ2JvdGgnIHx8IHdyYXAgPT09ICdsYXN0JykpIHx8XG4gICAgICAgICAgICAgICghdGhpcy51bmRlcmZsb3cgJiYgbGFzdCA9PT0gZW5kICYmICh3cmFwID09PSAnYm90aCcgfHwgd3JhcCA9PT0gJ2xhc3QnKSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKDAsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGluZGV4ID0gY3VycmVudCArIHNjcm9sbDtcblxuICAgICAgICAgICAgICBpZiAodGhpcy5jaXJjdWxhciAmJiBpbmRleCA+IGVuZCkge1xuICAgICAgICAgICAgICAgIGkgPSBlbmQ7XG4gICAgICAgICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5nZXQoLTEpO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkrKyA8IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmVxKDApO1xuICAgICAgICAgICAgICAgICAgaXNWaXNpYmxlID0gdGhpcy5fdmlzaWJsZS5pbmRleChjdXJyKSA+PSAwO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnIuYWZ0ZXIoY3Vyci5jbG9uZSh0cnVlKS5hdHRyKCdkYXRhLWpjYXJvdXNlbC1jbG9uZScsIHRydWUpKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdGhpcy5saXN0KCkuYXBwZW5kKGN1cnIpO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoIWlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBwcm9wc1t0aGlzLmx0XSA9IHRoaXMuZGltZW5zaW9uKGN1cnIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVCeShwcm9wcyk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIEZvcmNlIGl0ZW1zIHJlbG9hZFxuICAgICAgICAgICAgICAgICAgdGhpcy5faXRlbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbChjdXJyLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKE1hdGgubWluKGluZGV4LCBlbmQpLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuaW5UYWlsKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwoTWF0aC5tYXgoKHRoaXMuaW5kZXgodGhpcy5fZmlyc3QpIC0gc2Nyb2xsKSArIDEsIDApLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpcnN0ICA9IHRoaXMuaW5kZXgodGhpcy5fZmlyc3QpO1xuICAgICAgICAgICAgY3VycmVudCA9IHRoaXMuaW5kZXgodGhpcy5fdGFyZ2V0KTtcbiAgICAgICAgICAgIHN0YXJ0ICA9IHRoaXMudW5kZXJmbG93ID8gY3VycmVudCA6IGZpcnN0O1xuICAgICAgICAgICAgaW5kZXggID0gc3RhcnQgLSBzY3JvbGw7XG5cbiAgICAgICAgICAgIGlmIChzdGFydCA8PSAwICYmICgodGhpcy51bmRlcmZsb3cgJiYgd3JhcCA9PT0gJ2NpcmN1bGFyJykgfHwgd3JhcCA9PT0gJ2JvdGgnIHx8IHdyYXAgPT09ICdmaXJzdCcpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3Njcm9sbChlbmQsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmNpcmN1bGFyICYmIGluZGV4IDwgMCkge1xuICAgICAgICAgICAgICAgIGkgICAgPSBpbmRleDtcbiAgICAgICAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmdldCgwKTtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChpKysgPCAwKSB7XG4gICAgICAgICAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmVxKC0xKTtcbiAgICAgICAgICAgICAgICAgIGlzVmlzaWJsZSA9IHRoaXMuX3Zpc2libGUuaW5kZXgoY3VycikgPj0gMDtcblxuICAgICAgICAgICAgICAgICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyLmFmdGVyKGN1cnIuY2xvbmUodHJ1ZSkuYXR0cignZGF0YS1qY2Fyb3VzZWwtY2xvbmUnLCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHRoaXMubGlzdCgpLnByZXBlbmQoY3Vycik7XG5cbiAgICAgICAgICAgICAgICAgIC8vIEZvcmNlIGl0ZW1zIHJlbG9hZFxuICAgICAgICAgICAgICAgICAgdGhpcy5faXRlbXMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICB2YXIgZGltID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG5cbiAgICAgICAgICAgICAgICAgIHByb3BzID0ge307XG4gICAgICAgICAgICAgICAgICBwcm9wc1t0aGlzLmx0XSA9IC1kaW07XG4gICAgICAgICAgICAgICAgICB0aGlzLm1vdmVCeShwcm9wcyk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoY3VyciwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbChNYXRoLm1heChpbmRleCwgMCksIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsKHBhcnNlZC50YXJnZXQsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdHJpZ2dlcignc2Nyb2xsZW5kJyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbW92ZUJ5OiBmdW5jdGlvbihwcm9wZXJ0aWVzLCBvcHRzKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmxpc3QoKS5wb3NpdGlvbigpLFxuICAgICAgICBtdWx0aXBsaWVyID0gMSxcbiAgICAgICAgY29ycmVjdGlvbiA9IDA7XG5cbiAgICAgIGlmICh0aGlzLnJ0bCAmJiAhdGhpcy52ZXJ0aWNhbCkge1xuICAgICAgICBtdWx0aXBsaWVyID0gLTE7XG5cbiAgICAgICAgaWYgKHRoaXMucmVsYXRpdmUpIHtcbiAgICAgICAgICBjb3JyZWN0aW9uID0gdG9GbG9hdCh0aGlzLmxpc3QoKS53aWR0aCgpKSAtIHRoaXMuY2xpcHBpbmcoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocHJvcGVydGllcy5sZWZ0KSB7XG4gICAgICAgIHByb3BlcnRpZXMubGVmdCA9ICh0b0Zsb2F0KHBvc2l0aW9uLmxlZnQpICsgY29ycmVjdGlvbiArIHRvRmxvYXQocHJvcGVydGllcy5sZWZ0KSAqIG11bHRpcGxpZXIpICsgJ3B4JztcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BlcnRpZXMudG9wKSB7XG4gICAgICAgIHByb3BlcnRpZXMudG9wID0gKHRvRmxvYXQocG9zaXRpb24udG9wKSArIGNvcnJlY3Rpb24gKyB0b0Zsb2F0KHByb3BlcnRpZXMudG9wKSAqIG11bHRpcGxpZXIpICsgJ3B4JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMubW92ZShwcm9wZXJ0aWVzLCBvcHRzKTtcbiAgICB9LFxuICAgIG1vdmU6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIG9wdHMpIHtcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gICAgICB2YXIgb3B0aW9uICAgICAgID0gdGhpcy5vcHRpb25zKCd0cmFuc2l0aW9ucycpLFxuICAgICAgICB0cmFuc2l0aW9ucyAgPSAhIW9wdGlvbixcbiAgICAgICAgdHJhbnNmb3JtcyAgID0gISFvcHRpb24udHJhbnNmb3JtcyxcbiAgICAgICAgdHJhbnNmb3JtczNkID0gISFvcHRpb24udHJhbnNmb3JtczNkLFxuICAgICAgICBkdXJhdGlvbiAgICAgPSBvcHRzLmR1cmF0aW9uIHx8IDAsXG4gICAgICAgIGxpc3QgICAgICAgICA9IHRoaXMubGlzdCgpO1xuXG4gICAgICBpZiAoIXRyYW5zaXRpb25zICYmIGR1cmF0aW9uID4gMCkge1xuICAgICAgICBsaXN0LmFuaW1hdGUocHJvcGVydGllcywgb3B0cyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbXBsZXRlID0gb3B0cy5jb21wbGV0ZSB8fCAkLm5vb3AsXG4gICAgICAgIGNzcyA9IHt9O1xuXG4gICAgICBpZiAodHJhbnNpdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhY2t1cCA9IHtcbiAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogbGlzdC5jc3MoJ3RyYW5zaXRpb25EdXJhdGlvbicpLFxuICAgICAgICAgICAgdHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBsaXN0LmNzcygndHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uJyksXG4gICAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydHk6IGxpc3QuY3NzKCd0cmFuc2l0aW9uUHJvcGVydHknKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb2xkQ29tcGxldGUgPSBjb21wbGV0ZTtcblxuICAgICAgICBjb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQodGhpcykuY3NzKGJhY2t1cCk7XG4gICAgICAgICAgb2xkQ29tcGxldGUuY2FsbCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgY3NzID0ge1xuICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogKGR1cmF0aW9uID4gMCA/IGR1cmF0aW9uIC8gMTAwMCA6IDApICsgJ3MnLFxuICAgICAgICAgIHRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogb3B0aW9uLmVhc2luZyB8fCBvcHRzLmVhc2luZyxcbiAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydHk6IGR1cmF0aW9uID4gMCA/IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm1zIHx8IHRyYW5zZm9ybXMzZCkge1xuICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRvIHVzZSAnYWxsJyBiZWNhdXNlIGpRdWVyeSBkb2Vzbid0IHByZWZpeFxuICAgICAgICAgICAgICAvLyBjc3MgdmFsdWVzLCBsaWtlIHRyYW5zaXRpb24tcHJvcGVydHk6IHRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgcmV0dXJuICdhbGwnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydGllcy5sZWZ0ID8gJ2xlZnQnIDogJ3RvcCc7XG4gICAgICAgICAgfSkoKSA6ICdub25lJyxcbiAgICAgICAgICB0cmFuc2Zvcm06ICdub25lJ1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZiAodHJhbnNmb3JtczNkKSB7XG4gICAgICAgIGNzcy50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIChwcm9wZXJ0aWVzLmxlZnQgfHwgMCkgKyAnLCcgKyAocHJvcGVydGllcy50b3AgfHwgMCkgKyAnLDApJztcbiAgICAgIH0gZWxzZSBpZiAodHJhbnNmb3Jtcykge1xuICAgICAgICBjc3MudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKHByb3BlcnRpZXMubGVmdCB8fCAwKSArICcsJyArIChwcm9wZXJ0aWVzLnRvcCB8fCAwKSArICcpJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQuZXh0ZW5kKGNzcywgcHJvcGVydGllcyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0cmFuc2l0aW9ucyAmJiBkdXJhdGlvbiA+IDApIHtcbiAgICAgICAgbGlzdC5vbmUoJ3RyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCBNU1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSk7XG4gICAgICB9XG5cbiAgICAgIGxpc3QuY3NzKGNzcyk7XG5cbiAgICAgIGlmIChkdXJhdGlvbiA8PSAwKSB7XG4gICAgICAgIGxpc3QuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb21wbGV0ZS5jYWxsKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9zY3JvbGw6IGZ1bmN0aW9uKGl0ZW0sIGFuaW1hdGUsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAodGhpcy5hbmltYXRpbmcpIHtcbiAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZW0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgIGl0ZW0gPSB0aGlzLml0ZW1zKCkuZXEoaXRlbSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtLmpxdWVyeSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaXRlbSA9ICQoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5UYWlsID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuX3ByZXBhcmUoaXRlbSk7XG5cbiAgICAgIHZhciBwb3MgICAgID0gdGhpcy5fcG9zaXRpb24oaXRlbSksXG4gICAgICAgIGN1cnJQb3MgPSB0b0Zsb2F0KHRoaXMubGlzdCgpLnBvc2l0aW9uKClbdGhpcy5sdF0pO1xuXG4gICAgICBpZiAocG9zID09PSBjdXJyUG9zKSB7XG4gICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByb3BlcnRpZXNbdGhpcy5sdF0gPSBwb3MgKyAncHgnO1xuXG4gICAgICB0aGlzLl9hbmltYXRlKHByb3BlcnRpZXMsIGFuaW1hdGUsIGNhbGxiYWNrKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfc2Nyb2xsVGFpbDogZnVuY3Rpb24oYW5pbWF0ZSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGluZyB8fCAhdGhpcy50YWlsKSB7XG4gICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIHBvcyA9IHRoaXMubGlzdCgpLnBvc2l0aW9uKClbdGhpcy5sdF07XG5cbiAgICAgIGlmICh0aGlzLnJ0bCAmJiB0aGlzLnJlbGF0aXZlICYmICF0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIHBvcyArPSB0b0Zsb2F0KHRoaXMubGlzdCgpLndpZHRoKCkpIC0gdGhpcy5jbGlwcGluZygpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5ydGwgJiYgIXRoaXMudmVydGljYWwpIHtcbiAgICAgICAgcG9zICs9IHRoaXMudGFpbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvcyAtPSB0aGlzLnRhaWw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5UYWlsID0gdHJ1ZTtcblxuICAgICAgdmFyIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByb3BlcnRpZXNbdGhpcy5sdF0gPSBwb3MgKyAncHgnO1xuXG4gICAgICB0aGlzLl91cGRhdGUoe1xuICAgICAgICB0YXJnZXQ6ICAgICAgIHRoaXMuX3RhcmdldC5uZXh0KCksXG4gICAgICAgIGZ1bGx5dmlzaWJsZTogdGhpcy5fZnVsbHl2aXNpYmxlLnNsaWNlKDEpLmFkZCh0aGlzLl92aXNpYmxlLmxhc3QoKSlcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9hbmltYXRlKHByb3BlcnRpZXMsIGFuaW1hdGUsIGNhbGxiYWNrKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfYW5pbWF0ZTogZnVuY3Rpb24ocHJvcGVydGllcywgYW5pbWF0ZSwgY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgJC5ub29wO1xuXG4gICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ2FuaW1hdGUnKSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgdmFyIGFuaW1hdGlvbiA9IHRoaXMub3B0aW9ucygnYW5pbWF0aW9uJyksXG4gICAgICAgIGNvbXBsZXRlICA9ICQucHJveHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5hbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgIHZhciBjID0gdGhpcy5saXN0KCkuZmluZCgnW2RhdGEtamNhcm91c2VsLWNsb25lXScpO1xuXG4gICAgICAgICAgaWYgKGMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYy5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbG9hZCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2FuaW1hdGVlbmQnKTtcblxuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB2YXIgb3B0cyA9IHR5cGVvZiBhbmltYXRpb24gPT09ICdvYmplY3QnID9cbiAgICAgICAgJC5leHRlbmQoe30sIGFuaW1hdGlvbikgOlxuICAgICAgICB7ZHVyYXRpb246IGFuaW1hdGlvbn0sXG4gICAgICAgIG9sZENvbXBsZXRlID0gb3B0cy5jb21wbGV0ZSB8fCAkLm5vb3A7XG5cbiAgICAgIGlmIChhbmltYXRlID09PSBmYWxzZSkge1xuICAgICAgICBvcHRzLmR1cmF0aW9uID0gMDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mICQuZnguc3BlZWRzW29wdHMuZHVyYXRpb25dICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBvcHRzLmR1cmF0aW9uID0gJC5meC5zcGVlZHNbb3B0cy5kdXJhdGlvbl07XG4gICAgICB9XG5cbiAgICAgIG9wdHMuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgb2xkQ29tcGxldGUuY2FsbCh0aGlzKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMubW92ZShwcm9wZXJ0aWVzLCBvcHRzKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfcHJlcGFyZTogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdmFyIGluZGV4ICA9IHRoaXMuaW5kZXgoaXRlbSksXG4gICAgICAgIGlkeCAgICA9IGluZGV4LFxuICAgICAgICB3aCAgICAgPSB0aGlzLmRpbWVuc2lvbihpdGVtKSxcbiAgICAgICAgY2xpcCAgID0gdGhpcy5jbGlwcGluZygpLFxuICAgICAgICBscmIgICAgPSB0aGlzLnZlcnRpY2FsID8gJ2JvdHRvbScgOiAodGhpcy5ydGwgPyAnbGVmdCcgIDogJ3JpZ2h0JyksXG4gICAgICAgIGNlbnRlciA9IHRoaXMub3B0aW9ucygnY2VudGVyJyksXG4gICAgICAgIHVwZGF0ZSA9IHtcbiAgICAgICAgICB0YXJnZXQ6ICAgICAgIGl0ZW0sXG4gICAgICAgICAgZmlyc3Q6ICAgICAgICBpdGVtLFxuICAgICAgICAgIGxhc3Q6ICAgICAgICAgaXRlbSxcbiAgICAgICAgICB2aXNpYmxlOiAgICAgIGl0ZW0sXG4gICAgICAgICAgZnVsbHl2aXNpYmxlOiB3aCA8PSBjbGlwID8gaXRlbSA6ICQoKVxuICAgICAgICB9LFxuICAgICAgICBjdXJyLFxuICAgICAgICBpc1Zpc2libGUsXG4gICAgICAgIG1hcmdpbixcbiAgICAgICAgZGltO1xuXG4gICAgICBpZiAoY2VudGVyKSB7XG4gICAgICAgIHdoIC89IDI7XG4gICAgICAgIGNsaXAgLz0gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKHdoIDwgY2xpcCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoKytpZHgpO1xuXG4gICAgICAgICAgaWYgKGN1cnIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2lyY3VsYXIpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoMCk7XG5cbiAgICAgICAgICAgIGlmIChpdGVtLmdldCgwKSA9PT0gY3Vyci5nZXQoMCkpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlzVmlzaWJsZSA9IHRoaXMuX3Zpc2libGUuaW5kZXgoY3VycikgPj0gMDtcblxuICAgICAgICAgICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICBjdXJyLmFmdGVyKGN1cnIuY2xvbmUodHJ1ZSkuYXR0cignZGF0YS1qY2Fyb3VzZWwtY2xvbmUnLCB0cnVlKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubGlzdCgpLmFwcGVuZChjdXJyKTtcblxuICAgICAgICAgICAgaWYgKCFpc1Zpc2libGUpIHtcbiAgICAgICAgICAgICAgdmFyIHByb3BzID0ge307XG4gICAgICAgICAgICAgIHByb3BzW3RoaXMubHRdID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG4gICAgICAgICAgICAgIHRoaXMubW92ZUJ5KHByb3BzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9yY2UgaXRlbXMgcmVsb2FkXG4gICAgICAgICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGltID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG5cbiAgICAgICAgICBpZiAoZGltID09PSAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aCArPSBkaW07XG5cbiAgICAgICAgICB1cGRhdGUubGFzdCAgICA9IGN1cnI7XG4gICAgICAgICAgdXBkYXRlLnZpc2libGUgPSB1cGRhdGUudmlzaWJsZS5hZGQoY3Vycik7XG5cbiAgICAgICAgICAvLyBSZW1vdmUgcmlnaHQvYm90dG9tIG1hcmdpbiBmcm9tIHRvdGFsIHdpZHRoXG4gICAgICAgICAgbWFyZ2luID0gdG9GbG9hdChjdXJyLmNzcygnbWFyZ2luLScgKyBscmIpKTtcblxuICAgICAgICAgIGlmICgod2ggLSBtYXJnaW4pIDw9IGNsaXApIHtcbiAgICAgICAgICAgIHVwZGF0ZS5mdWxseXZpc2libGUgPSB1cGRhdGUuZnVsbHl2aXNpYmxlLmFkZChjdXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAod2ggPj0gY2xpcCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5jaXJjdWxhciAmJiAhY2VudGVyICYmIHdoIDwgY2xpcCkge1xuICAgICAgICBpZHggPSBpbmRleDtcblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGlmICgtLWlkeCA8IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoaWR4KTtcblxuICAgICAgICAgIGlmIChjdXJyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGltID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG5cbiAgICAgICAgICBpZiAoZGltID09PSAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aCArPSBkaW07XG5cbiAgICAgICAgICB1cGRhdGUuZmlyc3QgICA9IGN1cnI7XG4gICAgICAgICAgdXBkYXRlLnZpc2libGUgPSB1cGRhdGUudmlzaWJsZS5hZGQoY3Vycik7XG5cbiAgICAgICAgICAvLyBSZW1vdmUgcmlnaHQvYm90dG9tIG1hcmdpbiBmcm9tIHRvdGFsIHdpZHRoXG4gICAgICAgICAgbWFyZ2luID0gdG9GbG9hdChjdXJyLmNzcygnbWFyZ2luLScgKyBscmIpKTtcblxuICAgICAgICAgIGlmICgod2ggLSBtYXJnaW4pIDw9IGNsaXApIHtcbiAgICAgICAgICAgIHVwZGF0ZS5mdWxseXZpc2libGUgPSB1cGRhdGUuZnVsbHl2aXNpYmxlLmFkZChjdXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAod2ggPj0gY2xpcCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3VwZGF0ZSh1cGRhdGUpO1xuXG4gICAgICB0aGlzLnRhaWwgPSAwO1xuXG4gICAgICBpZiAoIWNlbnRlciAmJlxuICAgICAgICB0aGlzLm9wdGlvbnMoJ3dyYXAnKSAhPT0gJ2NpcmN1bGFyJyAmJlxuICAgICAgICB0aGlzLm9wdGlvbnMoJ3dyYXAnKSAhPT0gJ2N1c3RvbScgJiZcbiAgICAgICAgdGhpcy5pbmRleCh1cGRhdGUubGFzdCkgPT09ICh0aGlzLml0ZW1zKCkubGVuZ3RoIC0gMSkpIHtcblxuICAgICAgICAvLyBSZW1vdmUgcmlnaHQvYm90dG9tIG1hcmdpbiBmcm9tIHRvdGFsIHdpZHRoXG4gICAgICAgIHdoIC09IHRvRmxvYXQodXBkYXRlLmxhc3QuY3NzKCdtYXJnaW4tJyArIGxyYikpO1xuXG4gICAgICAgIGlmICh3aCA+IGNsaXApIHtcbiAgICAgICAgICB0aGlzLnRhaWwgPSB3aCAtIGNsaXA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfcG9zaXRpb246IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHZhciBmaXJzdCAgPSB0aGlzLl9maXJzdCxcbiAgICAgICAgcG9zICAgID0gdG9GbG9hdChmaXJzdC5wb3NpdGlvbigpW3RoaXMubHRdKSxcbiAgICAgICAgY2VudGVyID0gdGhpcy5vcHRpb25zKCdjZW50ZXInKSxcbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gY2VudGVyID8gKHRoaXMuY2xpcHBpbmcoKSAvIDIpIC0gKHRoaXMuZGltZW5zaW9uKGZpcnN0KSAvIDIpIDogMDtcblxuICAgICAgaWYgKHRoaXMucnRsICYmICF0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbGF0aXZlKSB7XG4gICAgICAgICAgcG9zIC09IHRvRmxvYXQodGhpcy5saXN0KCkud2lkdGgoKSkgLSB0aGlzLmRpbWVuc2lvbihmaXJzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcG9zIC09IHRoaXMuY2xpcHBpbmcoKSAtIHRoaXMuZGltZW5zaW9uKGZpcnN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvcyArPSBjZW50ZXJPZmZzZXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3MgLT0gY2VudGVyT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICBpZiAoIWNlbnRlciAmJlxuICAgICAgICAodGhpcy5pbmRleChpdGVtKSA+IHRoaXMuaW5kZXgoZmlyc3QpIHx8IHRoaXMuaW5UYWlsKSAmJlxuICAgICAgICB0aGlzLnRhaWwpIHtcbiAgICAgICAgcG9zID0gdGhpcy5ydGwgJiYgIXRoaXMudmVydGljYWwgPyBwb3MgLSB0aGlzLnRhaWwgOiBwb3MgKyB0aGlzLnRhaWw7XG4gICAgICAgIHRoaXMuaW5UYWlsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW5UYWlsID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAtcG9zO1xuICAgIH0sXG4gICAgX3VwZGF0ZTogZnVuY3Rpb24odXBkYXRlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGN1cnJlbnQgPSB7XG4gICAgICAgICAgdGFyZ2V0OiAgICAgICB0aGlzLl90YXJnZXQsXG4gICAgICAgICAgZmlyc3Q6ICAgICAgICB0aGlzLl9maXJzdCxcbiAgICAgICAgICBsYXN0OiAgICAgICAgIHRoaXMuX2xhc3QsXG4gICAgICAgICAgdmlzaWJsZTogICAgICB0aGlzLl92aXNpYmxlLFxuICAgICAgICAgIGZ1bGx5dmlzaWJsZTogdGhpcy5fZnVsbHl2aXNpYmxlXG4gICAgICAgIH0sXG4gICAgICAgIGJhY2sgPSB0aGlzLmluZGV4KHVwZGF0ZS5maXJzdCB8fCBjdXJyZW50LmZpcnN0KSA8IHRoaXMuaW5kZXgoY3VycmVudC5maXJzdCksXG4gICAgICAgIGtleSxcbiAgICAgICAgZG9VcGRhdGUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICB2YXIgZWxJbiAgPSBbXSxcbiAgICAgICAgICAgIGVsT3V0ID0gW107XG5cbiAgICAgICAgICB1cGRhdGVba2V5XS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRba2V5XS5pbmRleCh0aGlzKSA8IDApIHtcbiAgICAgICAgICAgICAgZWxJbi5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY3VycmVudFtrZXldLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodXBkYXRlW2tleV0uaW5kZXgodGhpcykgPCAwKSB7XG4gICAgICAgICAgICAgIGVsT3V0LnB1c2godGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoYmFjaykge1xuICAgICAgICAgICAgZWxJbiA9IGVsSW4ucmV2ZXJzZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbE91dCA9IGVsT3V0LnJldmVyc2UoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl90cmlnZ2VyKGtleSArICdpbicsICQoZWxJbikpO1xuICAgICAgICAgIHNlbGYuX3RyaWdnZXIoa2V5ICsgJ291dCcsICQoZWxPdXQpKTtcblxuICAgICAgICAgIHNlbGZbJ18nICsga2V5XSA9IHVwZGF0ZVtrZXldO1xuICAgICAgICB9O1xuXG4gICAgICBmb3IgKGtleSBpbiB1cGRhdGUpIHtcbiAgICAgICAgZG9VcGRhdGUoa2V5KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9KTtcbn0oalF1ZXJ5LCB3aW5kb3cpKTtcblxuLyohXG4gKiBKYXZhU2NyaXB0IENvb2tpZSB2Mi4yLjBcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qcy1jb29raWUvanMtY29va2llXG4gKlxuICogQ29weXJpZ2h0IDIwMDYsIDIwMTUgS2xhdXMgSGFydGwgJiBGYWduZXIgQnJhY2tcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG47KGZ1bmN0aW9uIChmYWN0b3J5KSB7XG5cdHZhciByZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXI7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAoIXJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlcikge1xuXHRcdHZhciBPbGRDb29raWVzID0gd2luZG93LkNvb2tpZXM7XG5cdFx0dmFyIGFwaSA9IHdpbmRvdy5Db29raWVzID0gZmFjdG9yeSgpO1xuXHRcdGFwaS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2luZG93LkNvb2tpZXMgPSBPbGRDb29raWVzO1xuXHRcdFx0cmV0dXJuIGFwaTtcblx0XHR9O1xuXHR9XG59KGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gZXh0ZW5kICgpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IGFyZ3VtZW50c1sgaSBdO1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWNvZGUgKHMpIHtcblx0XHRyZXR1cm4gcy5yZXBsYWNlKC8oJVswLTlBLVpdezJ9KSsvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGluaXQgKGNvbnZlcnRlcikge1xuXHRcdGZ1bmN0aW9uIGFwaSgpIHt9XG5cblx0XHRmdW5jdGlvbiBzZXQgKGtleSwgdmFsdWUsIGF0dHJpYnV0ZXMpIHtcblx0XHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0YXR0cmlidXRlcyA9IGV4dGVuZCh7XG5cdFx0XHRcdHBhdGg6ICcvJ1xuXHRcdFx0fSwgYXBpLmRlZmF1bHRzLCBhdHRyaWJ1dGVzKTtcblxuXHRcdFx0aWYgKHR5cGVvZiBhdHRyaWJ1dGVzLmV4cGlyZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IG5ldyBEYXRlKG5ldyBEYXRlKCkgKiAxICsgYXR0cmlidXRlcy5leHBpcmVzICogODY0ZSs1KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV2UncmUgdXNpbmcgXCJleHBpcmVzXCIgYmVjYXVzZSBcIm1heC1hZ2VcIiBpcyBub3Qgc3VwcG9ydGVkIGJ5IElFXG5cdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBhdHRyaWJ1dGVzLmV4cGlyZXMgPyBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKSA6ICcnO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHR2YXIgcmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0XHRpZiAoL15bXFx7XFxbXS8udGVzdChyZXN1bHQpKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSByZXN1bHQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cblx0XHRcdHZhbHVlID0gY29udmVydGVyLndyaXRlID9cblx0XHRcdFx0Y29udmVydGVyLndyaXRlKHZhbHVlLCBrZXkpIDpcblx0XHRcdFx0ZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpXG5cdFx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cblx0XHRcdGtleSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoa2V5KSlcblx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8NUV8NjB8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudClcblx0XHRcdFx0LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSk7XG5cblx0XHRcdHZhciBzdHJpbmdpZmllZEF0dHJpYnV0ZXMgPSAnJztcblx0XHRcdGZvciAodmFyIGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRpZiAoIWF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0pIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJzsgJyArIGF0dHJpYnV0ZU5hbWU7XG5cdFx0XHRcdGlmIChhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDb25zaWRlcnMgUkZDIDYyNjUgc2VjdGlvbiA1LjI6XG5cdFx0XHRcdC8vIC4uLlxuXHRcdFx0XHQvLyAzLiAgSWYgdGhlIHJlbWFpbmluZyB1bnBhcnNlZC1hdHRyaWJ1dGVzIGNvbnRhaW5zIGEgJXgzQiAoXCI7XCIpXG5cdFx0XHRcdC8vICAgICBjaGFyYWN0ZXI6XG5cdFx0XHRcdC8vIENvbnN1bWUgdGhlIGNoYXJhY3RlcnMgb2YgdGhlIHVucGFyc2VkLWF0dHJpYnV0ZXMgdXAgdG8sXG5cdFx0XHRcdC8vIG5vdCBpbmNsdWRpbmcsIHRoZSBmaXJzdCAleDNCIChcIjtcIikgY2hhcmFjdGVyLlxuXHRcdFx0XHQvLyAuLi5cblx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc9JyArIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0uc3BsaXQoJzsnKVswXTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBrZXkgKyAnPScgKyB2YWx1ZSArIHN0cmluZ2lmaWVkQXR0cmlidXRlcyk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZ2V0IChrZXksIGpzb24pIHtcblx0XHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGphciA9IHt9O1xuXHRcdFx0Ly8gVG8gcHJldmVudCB0aGUgZm9yIGxvb3AgaW4gdGhlIGZpcnN0IHBsYWNlIGFzc2lnbiBhbiBlbXB0eSBhcnJheVxuXHRcdFx0Ly8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuXG5cdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuXHRcdFx0dmFyIGkgPSAwO1xuXG5cdFx0XHRmb3IgKDsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHBhcnRzID0gY29va2llc1tpXS5zcGxpdCgnPScpO1xuXHRcdFx0XHR2YXIgY29va2llID0gcGFydHMuc2xpY2UoMSkuam9pbignPScpO1xuXG5cdFx0XHRcdGlmICghanNvbiAmJiBjb29raWUuY2hhckF0KDApID09PSAnXCInKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llLnNsaWNlKDEsIC0xKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dmFyIG5hbWUgPSBkZWNvZGUocGFydHNbMF0pO1xuXHRcdFx0XHRcdGNvb2tpZSA9IChjb252ZXJ0ZXIucmVhZCB8fCBjb252ZXJ0ZXIpKGNvb2tpZSwgbmFtZSkgfHxcblx0XHRcdFx0XHRcdGRlY29kZShjb29raWUpO1xuXG5cdFx0XHRcdFx0aWYgKGpzb24pIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvb2tpZSA9IEpTT04ucGFyc2UoY29va2llKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0amFyW25hbWVdID0gY29va2llO1xuXG5cdFx0XHRcdFx0aWYgKGtleSA9PT0gbmFtZSkge1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ga2V5ID8gamFyW2tleV0gOiBqYXI7XG5cdFx0fVxuXG5cdFx0YXBpLnNldCA9IHNldDtcblx0XHRhcGkuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGdldChrZXksIGZhbHNlIC8qIHJlYWQgYXMgcmF3ICovKTtcblx0XHR9O1xuXHRcdGFwaS5nZXRKU09OID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGdldChrZXksIHRydWUgLyogcmVhZCBhcyBqc29uICovKTtcblx0XHR9O1xuXHRcdGFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRzZXQoa2V5LCAnJywgZXh0ZW5kKGF0dHJpYnV0ZXMsIHtcblx0XHRcdFx0ZXhwaXJlczogLTFcblx0XHRcdH0pKTtcblx0XHR9O1xuXG5cdFx0YXBpLmRlZmF1bHRzID0ge307XG5cblx0XHRhcGkud2l0aENvbnZlcnRlciA9IGluaXQ7XG5cblx0XHRyZXR1cm4gYXBpO1xuXHR9XG5cblx0cmV0dXJuIGluaXQoZnVuY3Rpb24gKCkge30pO1xufSkpOyJdLCJmaWxlIjoibWFpbi5qcyJ9
