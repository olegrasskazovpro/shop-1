/**
 * Get all product's filters and send it to server (json)
 */
class FiltersHandle {
  constructor(callback) {
    this.filters = {
      catItem: null, // string
      category: null, // 'all' or string
      brand: null, // 'all' or string
      designer: null, // 'all' or string
      size: [0], // [0] or [a, (...)]
      price: [], // [a, b]
      showBy: null,
    };
    this.callback = callback;
  }

  init(min, max, step) {
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
      url: 'http://localhost:3002/filters',
      method: 'POST',
      contentType: "application/json",
      data: JSON.stringify(data),
      success: () => {
        console.log('Product filters was SENT to DB');
        this.callback.init();
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
  constructor(callback) {
    this.filters = {};
    this.catalog = {};
    this.render = callback;
  }

  init() {
    this.getFilters()
  }

  getFilters() {
    $.ajax({
      url: 'http://localhost:3002/filters',
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
      url: 'http://localhost:3000/products',
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
    this.postFiltered(this.filteredCatalog); // clean previous filtered catalog

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
      url: 'http://localhost:3002/filteredProducts',
      method: 'POST',
      contentType: "application/json",
      data: JSON.stringify(data),
      success: () => {
        if (data === undefined) {
          console.log('Filtered catalog DB cleaned');
        } else {
          console.log('Filtered catalog posted to DB');
          this.render.init()
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
  constructor(addToCart) {
    this.el = null;
    this.products = [];
    this.addToCart = addToCart;
  }

  init() {
    this.getFilteredCatalog();
  }

  getFilteredCatalog() {
    $.ajax({
      url: 'http://localhost:3002/filteredProducts',
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
    this.addToCart.init();
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
        // this.products.push(this.el);
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