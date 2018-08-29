"use strict";

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
      showBy: 3,
    };
    this.callback = callback;
  }

  init() {
    this.filters.catItem = this.getCatItem();
    this.filters.category = this.getCategory();
    this.filters.brand = this.getBrand();
    this.filters.designer = this.getDesigner();
    this.getSize();
    this.filters.price = this.getPrice();
    this.getShowBy();
    this.postFilters(this.filters);
  }

  /**
   * Setting up price-range slider
   */
  initPriceSlider(min, max, step) {
    $('.price-range__slider').slider({
      range: true,
      values: [(max * 0.05), (max * 0.4)],
      min: min,
      max: max,
      step: step,
      slide: () => {
        this.showPriceRangeValues();
      },
      change: () => {
        this.showPriceRangeValues();
        this.filters.price = $('.price-range__slider').slider('values');
        this.postFilters(this.filters);
      }
    });
    this.showPriceRangeValues();
  }

  /**
   * Show/Update min and max price range values
   */
  showPriceRangeValues() {
    $('#price-min').text($('.price-range__slider').slider('values')[0]);
    $('#price-max').text($('.price-range__slider').slider('values')[1]);
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

  getSize() {
    let that = this;
    // set update sizes Arr for every size checkbox click
    $('.size-checkbox').on('click', function () {
      this.classList.toggle('checked'); // if Checked set class 'checked' and back

      if ($('.checked').length) {
        let sizes = []; // clear size Arr
        for (let i = 0; i < $('.checked').length; i++) {
          sizes.push($('.checked')[i].dataset.name);
        }
        that.filters.size = sizes;
      } else {
        that.filters.size = [0];
      }
      that.postFilters(that.filters);
    });
  }

  getPrice() {
    return $('.price-range__slider').slider('values');
  }

  getShowBy() {
    this.filters.showBy = +$('#showBy option:selected').text();
    // set update showBy for every selection changed
    $('#showBy').on('change', () => {
      this.filters.showBy = +$('#showBy option:selected').text();
      this.postFilters(this.filters);
    })
  }

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
    this.showInFrontend = callback;
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
    console.log('177');
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
        // add this product to this.filteredCatalog
        filteredCatalog.push(this.catalog[i]);
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
        }
        //this.callback.getFilters(); // сюда передать коллбэк для отображения в фронтэнде
      },
      error: () => {
        console.log('Method postFiltered(data) of filtered catalog saving to DB FAILED');
      }
    })
  }
}

class ShowFiltered {
  constructor() {

  }

  init() {

  }
}

(function ($) {
  $(function () {
    let showFiltered = new ShowFiltered();
    let filterProducts = new ServerFilterProducts(showFiltered);
    let filtersHandle = new FiltersHandle(filterProducts);

    filtersHandle.initPriceSlider(0, 1000, 1);
    filtersHandle.init();

  })
})(jQuery);