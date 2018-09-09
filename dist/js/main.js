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

(function ($) {
  $(function () {
    let pageInit = new SetActiveLinks();
    pageInit.setActiveClass();

    $('.jcarousel').jcarousel({
      wrap: 'circular'
    });
    $('.jcarousel-prev').click(function() {
      $('.jcarousel').jcarousel('scroll', '-=1');
    });

    $('.jcarousel-next').click(function() {
      $('.jcarousel').jcarousel('scroll', '+=1');
    });
  })
})(jQuery);

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
  constructor() {
    this.el = null;
    this.products = [];
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

  render(data) {
    this.setPagination(data);
    this.cleanProducts();
    this.renderProducts(data);// fill template
    // append el
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
        oneProd.getElementsByTagName('h3')[0].textContent = data[page][i].name;
        oneProd.getElementsByTagName('h4')[0].textContent = '$' + data[page][i].price + '.00';
        oneProd.classList.remove('template');
        // this.products.push(this.el);
        document.querySelector('.product-box').appendChild(oneProd);
      }
    } else {
      $('#oops').removeClass('template');
    }

      
    //TODO если товары не найдены - выводить сообщение об этом
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
    // this.paginationArrowsHandler(data);
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

(function ($) {
  $(function () {
    let render = new Render();
    let filterProducts = new ServerFilterProducts(render);
    let filtersHandle = new FiltersHandle(filterProducts);

    filtersHandle.init(0, 1000, 1);

  })
})(jQuery);

"use strict";

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5jbGFzcyBTZXRBY3RpdmVMaW5rcyB7XG4gIGNvbnN0cnVjdG9yICgpIHtcblxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBjbGFzcz1cImFjdGl2ZVwiIHRvIG5hdiBsaW5rcyBmb3IgcGFnZSBvcGVuZWRcbiAgICovXG4gIHNldEFjdGl2ZUNsYXNzKCkge1xuICAgIGlmICh0aGlzLmNoZWNrVXJsKCdwcm9kdWN0Lmh0bWwnKSl7XG4gICAgICAkKCcubWVudSBhJykucmVtb3ZlQXR0cignY2xhc3MnKTtcbiAgICAgICQoJy5tZW51PmxpIGFbaHJlZj1cInByb2R1Y3QuaHRtbFwiXScpLmFkZENsYXNzKCdtZW51LWFjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EtbGlzdCBhOmZpcnN0JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EgYTpmaXJzdCcpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICB9XG4gICAgaWYodGhpcy5jaGVja1VybCgnaW5kZXguaHRtbCcpKXtcbiAgICAgICQoJy5tZW51PmxpIGFbaHJlZj1cImluZGV4Lmh0bWxcIl0nKS5hZGRDbGFzcygnbWVudS1hY3RpdmUnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgcGFnZSBVUkwgY29udGFpbnMgc29tZSBzdHJpbmdcbiAgICogQHBhcmFtIHN0cmluZyB1cmwgLSByZWdFeHAgY29uZGl0aW9uXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIFVSTCBjb250YWlucyByZWdFeHBcbiAgICovXG4gIGNoZWNrVXJsKHVybCkge1xuICAgIGxldCBjaGVja1VybCA9IG5ldyBSZWdFeHAodXJsKTtcbiAgICByZXR1cm4gY2hlY2tVcmwudGVzdChkb2N1bWVudC5sb2NhdGlvbi5ocmVmKVxuICB9XG59XG5cbihmdW5jdGlvbiAoJCkge1xuICAkKGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgcGFnZUluaXQgPSBuZXcgU2V0QWN0aXZlTGlua3MoKTtcbiAgICBwYWdlSW5pdC5zZXRBY3RpdmVDbGFzcygpO1xuXG4gICAgJCgnLmpjYXJvdXNlbCcpLmpjYXJvdXNlbCh7XG4gICAgICB3cmFwOiAnY2lyY3VsYXInXG4gICAgfSk7XG4gICAgJCgnLmpjYXJvdXNlbC1wcmV2JykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAkKCcuamNhcm91c2VsJykuamNhcm91c2VsKCdzY3JvbGwnLCAnLT0xJyk7XG4gICAgfSk7XG5cbiAgICAkKCcuamNhcm91c2VsLW5leHQnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICQoJy5qY2Fyb3VzZWwnKS5qY2Fyb3VzZWwoJ3Njcm9sbCcsICcrPTEnKTtcbiAgICB9KTtcbiAgfSlcbn0pKGpRdWVyeSk7XG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEdldCBhbGwgcHJvZHVjdCdzIGZpbHRlcnMgYW5kIHNlbmQgaXQgdG8gc2VydmVyIChqc29uKVxuICovXG5jbGFzcyBGaWx0ZXJzSGFuZGxlIHtcbiAgY29uc3RydWN0b3IoY2FsbGJhY2spIHtcbiAgICB0aGlzLmZpbHRlcnMgPSB7XG4gICAgICBjYXRJdGVtOiBudWxsLCAvLyBzdHJpbmdcbiAgICAgIGNhdGVnb3J5OiBudWxsLCAvLyAnYWxsJyBvciBzdHJpbmdcbiAgICAgIGJyYW5kOiBudWxsLCAvLyAnYWxsJyBvciBzdHJpbmdcbiAgICAgIGRlc2lnbmVyOiBudWxsLCAvLyAnYWxsJyBvciBzdHJpbmdcbiAgICAgIHNpemU6IFswXSwgLy8gWzBdIG9yIFthLCAoLi4uKV1cbiAgICAgIHByaWNlOiBbXSwgLy8gW2EsIGJdXG4gICAgICBzaG93Qnk6IG51bGwsXG4gICAgfTtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gIH1cblxuICBpbml0KG1pbiwgbWF4LCBzdGVwKSB7XG4gICAgdGhpcy5zZXRDb29raWVzRmlsdGVycygpO1xuICAgIHRoaXMuaW5pdFByaWNlU2xpZGVyKG1pbiwgbWF4LCBzdGVwKTtcbiAgICB0aGlzLmZpbHRlcnMuY2F0SXRlbSA9IHRoaXMuZ2V0Q2F0SXRlbSgpO1xuICAgIHRoaXMuZmlsdGVycy5jYXRlZ29yeSA9IHRoaXMuZ2V0Q2F0ZWdvcnkoKTtcbiAgICB0aGlzLmZpbHRlcnMuYnJhbmQgPSB0aGlzLmdldEJyYW5kKCk7XG4gICAgdGhpcy5maWx0ZXJzLmRlc2lnbmVyID0gdGhpcy5nZXREZXNpZ25lcigpO1xuICAgIHRoaXMuc2V0U2l6ZUNoZWNrYm94SGFuZGxlcigpO1xuICAgIHRoaXMuZmlsdGVycy5wcmljZSA9IHRoaXMuZ2V0UHJpY2VSYW5nZSgpO1xuICAgIHRoaXMuc2V0U2hvd0J5SGFuZGxlcigpO1xuICAgIHRoaXMucG9zdEZpbHRlcnModGhpcy5maWx0ZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXR0aW5nIGluIERPTSBhbGwgZmlsdGVycyBmcm9tIGNvb2tpZXNcbiAgICovXG4gIHNldENvb2tpZXNGaWx0ZXJzKCkge1xuICAgIHRoaXMuZ2V0Q29va2llc0ZpbHRlcnMoKTtcbiAgICB0aGlzLnNldFNpemVDaGVja2VkKCk7XG4gICAgdGhpcy5zZXRTaG93QnlTZWxlY3RlZCh0aGlzLmZpbHRlcnMuc2hvd0J5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIGluIHRoaXMuZmlsdGVycyBhbGwgZmlsdGVycyBmcm9tIGNvb2tpZXNcbiAgICovXG4gIGdldENvb2tpZXNGaWx0ZXJzKCkge1xuICAgIGNvbnN0IGNvb2tpZXNGaWx0ZXJzID0gQ29va2llcy5nZXQoKTtcbiAgICBpZiAoY29va2llc0ZpbHRlcnMucHJpY2UpIHtcbiAgICAgIGNvb2tpZXNGaWx0ZXJzLnByaWNlID0gY29va2llc0ZpbHRlcnMucHJpY2Uuc3BsaXQoJ18nKTtcbiAgICB9XG4gICAgaWYgKGNvb2tpZXNGaWx0ZXJzLnNpemUpIHtcbiAgICAgIGNvb2tpZXNGaWx0ZXJzLnNpemUgPSBjb29raWVzRmlsdGVycy5zaXplLnNwbGl0KCdfJyk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBwcm9wQyBpbiBjb29raWVzRmlsdGVycykge1xuICAgICAgZm9yIChjb25zdCBwcm9wRiBpbiB0aGlzLmZpbHRlcnMpIHtcbiAgICAgICAgaWYgKHByb3BDID09PSBwcm9wRikge1xuICAgICAgICAgIHRoaXMuZmlsdGVyc1twcm9wRl0gPSBjb29raWVzRmlsdGVyc1twcm9wQ107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0dGluZyB1cCBwcmljZS1yYW5nZSBzbGlkZXIuXG4gICAqIElmIHByaWNlIGNvb2tpZSBpcyAtIHNldCBtaW5WYWwgYW5kIG1heFZhbCBmcm9tIGNvb2tpZXNcbiAgICovXG4gIGluaXRQcmljZVNsaWRlcihtaW4sIG1heCwgc3RlcCkge1xuICAgIGxldCBtaW5WYWwsIG1heFZhbDtcblxuICAgIGlmICh0aGlzLmZpbHRlcnMucHJpY2UubGVuZ3RoKSB7XG4gICAgICBtaW5WYWwgPSB0aGlzLmZpbHRlcnMucHJpY2VbMF07XG4gICAgICBtYXhWYWwgPSB0aGlzLmZpbHRlcnMucHJpY2VbMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIG1pblZhbCA9IG1heCAqIDAuMDU7XG4gICAgICBtYXhWYWwgPSBtYXggKiAwLjQ7XG4gICAgfVxuXG4gICAgJCgnLnByaWNlLXJhbmdlX19zbGlkZXInKS5zbGlkZXIoe1xuICAgICAgcmFuZ2U6IHRydWUsXG4gICAgICB2YWx1ZXM6IFttaW5WYWwsIG1heFZhbF0sXG4gICAgICBtaW46IG1pbixcbiAgICAgIG1heDogbWF4LFxuICAgICAgc3RlcDogc3RlcCxcbiAgICAgIHNsaWRlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2hvd1ByaWNlUmFuZ2VWYWx1ZXMoKTtcbiAgICAgIH0sXG4gICAgICBjaGFuZ2U6ICgpID0+IHtcbiAgICAgICAgdGhpcy5zaG93UHJpY2VSYW5nZVZhbHVlcygpO1xuICAgICAgICB0aGlzLmZpbHRlcnMucHJpY2UgPSB0aGlzLmdldFByaWNlUmFuZ2UoKTtcbiAgICAgICAgdGhpcy5zZXRDb29raWVzKCdwcmljZScsIHRoaXMuZmlsdGVycy5wcmljZS5qb2luKCdfJykpO1xuICAgICAgICAkKCcjb29wcycpLmFkZENsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICB0aGlzLnBvc3RGaWx0ZXJzKHRoaXMuZmlsdGVycyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5zaG93UHJpY2VSYW5nZVZhbHVlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3cvVXBkYXRlIG1pbiBhbmQgbWF4IHByaWNlIHJhbmdlIHZhbHVlc1xuICAgKi9cbiAgc2hvd1ByaWNlUmFuZ2VWYWx1ZXMoKSB7XG4gICAgJCgnI3ByaWNlLW1pbicpLnRleHQodGhpcy5nZXRQcmljZVJhbmdlKClbMF0pO1xuICAgICQoJyNwcmljZS1tYXgnKS50ZXh0KHRoaXMuZ2V0UHJpY2VSYW5nZSgpWzFdKTtcbiAgfVxuXG4gIGdldENhdEl0ZW0oKSB7XG4gICAgcmV0dXJuICQoJy5tZW51LWFjdGl2ZScpLnRleHQoKVxuICB9XG5cbiAgZ2V0Q2F0ZWdvcnkoKSB7XG4gICAgaWYgKCQoJy5tZW51IC5hY3RpdmUnKVswXSkge1xuICAgICAgcmV0dXJuICQoJy5tZW51IC5hY3RpdmUnKS50ZXh0KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdhbGwnXG4gICAgfVxuICB9XG5cbiAgZ2V0QnJhbmQoKSB7XG4gICAgaWYgKCQoJyNicmFuZCAuYWN0aXZlJylbMF0pIHtcbiAgICAgIGNvbnNvbGUubG9nKCQoJyNicmFuZCAuYWN0aXZlJykudGV4dCgpKTtcbiAgICAgIHJldHVybiAkKCcjYnJhbmQgLmFjdGl2ZScpLnRleHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ2FsbCdcbiAgICB9XG4gIH1cblxuICBnZXREZXNpZ25lcigpIHtcbiAgICBpZiAoJCgnI2Rlc2lnbmVyIC5hY3RpdmUnKVswXSkge1xuICAgICAgcmV0dXJuICQoJyNkZXNpZ25lciAuYWN0aXZlJykudGV4dCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnYWxsJ1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJZiAobm8gc2l6ZSBjb29raWUpIHNldCBhbGwgc2l6ZXMsIGVsc2Ugc2V0IHNpemVzIGZyb20gY29va2llc1xuICAgKi9cbiAgc2V0U2l6ZUNoZWNrZWQoKSB7XG4gICAgaWYgKENvb2tpZXMuZ2V0KCdzaXplJykpIHtcbiAgICAgIGxldCBjb29raWVzU2l6ZSA9IENvb2tpZXMuZ2V0KCdzaXplJykuc3BsaXQoJ18nKTsgLy8gdHVybiBzaXplIGNvb2tpZSB0byBhcnJheVxuICAgICAgLy8gZmluZCBhbGwgY2hlY2tib3hlcyB3aGljaCBkYXRhLW5hbWUgaXMgb25lIG9mIGNvb2tpZXNTaXplIGFuZCBzZXQgaXQgY2hlY2tlZFxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb29raWVzU2l6ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8ICQoJy5zaXplLWNoZWNrYm94JykubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAoY29va2llc1NpemVbaV0gPT09ICQoJy5zaXplLWNoZWNrYm94Jylbal0uZGF0YXNldC5uYW1lKSB7XG4gICAgICAgICAgICAkKCcuc2l6ZS1jaGVja2JveCcpW2pdLnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIiwgXCJcIik7XG4gICAgICAgICAgICAkKCcuc2l6ZS1jaGVja2JveCcpW2pdLmNsYXNzTGlzdC5hZGQoXCJjaGVja2VkXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8ICQoJy5zaXplLWNoZWNrYm94JykubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgJCgnLnNpemUtY2hlY2tib3gnKVtqXS5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsIFwiXCIpO1xuICAgICAgICAkKCcuc2l6ZS1jaGVja2JveCcpW2pdLmNsYXNzTGlzdC5hZGQoXCJjaGVja2VkXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgaGFuZGxlcnMgb2Ygc2l6ZSBjaGVja2JveGVzIHN0YXRlIGNoYW5naW5nXG4gICAqIFVwZGF0ZXMgc2l6ZSBjb29raWUsIHRoaXMuZmlsdGVycyBhbmQgc2VuZHMgUE9TVCB0byBzZXJ2ZXJcbiAgICovXG4gIHNldFNpemVDaGVja2JveEhhbmRsZXIoKSB7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIC8vIHNldCB1cGRhdGUgc2l6ZXMgQXJyIGZvciBldmVyeSBzaXplIGNoZWNrYm94IGNsaWNrXG4gICAgJCgnLnNpemUtY2hlY2tib3gnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2NoZWNrZWQnKTsgLy8gaWYgQ2hlY2tlZCBzZXQgY2xhc3MgJ2NoZWNrZWQnIGFuZCBiYWNrXG4gICAgICAkKCcjb29wcycpLmFkZENsYXNzKCd0ZW1wbGF0ZScpO1xuXG4gICAgICBpZiAoJCgnLmNoZWNrZWQnKS5sZW5ndGgpIHtcbiAgICAgICAgbGV0IHNpemVzID0gW107IC8vIGNsZWFyIHNpemUgQXJyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgJCgnLmNoZWNrZWQnKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHNpemVzLnB1c2goJCgnLmNoZWNrZWQnKVtpXS5kYXRhc2V0Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoYXQuZmlsdGVycy5zaXplID0gc2l6ZXM7XG4gICAgICAgIHRoYXQuc2V0Q29va2llcygnc2l6ZScsIHNpemVzLmpvaW4oJ18nKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGF0LmZpbHRlcnMuc2l6ZSA9IFswXTtcbiAgICAgIH1cbiAgICAgIHRoYXQucG9zdEZpbHRlcnModGhhdC5maWx0ZXJzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHByaWNlIHNsaWRlciByYW5nZVxuICAgKiBAcmV0dXJucyBbXSB7alF1ZXJ5fVxuICAgKi9cbiAgZ2V0UHJpY2VSYW5nZSgpIHtcbiAgICByZXR1cm4gJCgnLnByaWNlLXJhbmdlX19zbGlkZXInKS5zbGlkZXIoJ3ZhbHVlcycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgXCJzZWxlY3RlZFwiIGF0dHJpYnV0ZSBmb3Igc2hvd0J5IG9wdGlvblxuICAgKiBAcGFyYW0gSW50IHZhbHVlIHZhbHVlIG9mIG9wdGlvbidzIHZhbHVlIHByb3BlcnR5XG4gICAqL1xuICBzZXRTaG93QnlTZWxlY3RlZCh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5maWx0ZXJzLnNob3dCeSA9IDM7XG4gICAgICAkKGAjc2hvd0J5IG9wdGlvblt2YWx1ZT1cIjNcIl1gKVswXS5zZXRBdHRyaWJ1dGUoXCJzZWxlY3RlZFwiLCBcIlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJChgI3Nob3dCeSBvcHRpb246c2VsZWN0ZWRgKS5yZW1vdmVBdHRyKFwic2VsZWN0ZWRcIik7XG4gICAgICAkKGAjc2hvd0J5IG9wdGlvblt2YWx1ZT0ke3ZhbHVlfV1gKVswXS5zZXRBdHRyaWJ1dGUoXCJzZWxlY3RlZFwiLCBcIlwiKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2hvd0J5IHNlbGVjdG9yIGNoYW5nZSBoYW5kbGVyLiBJZiBjaGFuZ2VkOlxuICAgKiByZW1vdmUgXCJzZWxlY3RlZFwiIGF0dHIsXG4gICAqIHVwZGF0ZSB0aGlzLmZpbHRlcnMuc2hvd0J5LFxuICAgKiB1cGRhdGUgc2hvd0J5IGluIENvb2tpZXNcbiAgICogcG9zdCB1cGRhdGVkIGZpbHRlcnMgdG8gc2VydmVyXG4gICAqL1xuICBzZXRTaG93QnlIYW5kbGVyKCkge1xuICAgICQoJyNzaG93QnknKS5vbignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgJChgI3Nob3dCeSBvcHRpb25bc2VsZWN0ZWRdYCkucmVtb3ZlQXR0cihcInNlbGVjdGVkXCIpO1xuICAgICAgdGhpcy5maWx0ZXJzLnNob3dCeSA9ICskKCcjc2hvd0J5IG9wdGlvbjpzZWxlY3RlZCcpLnRleHQoKTtcbiAgICAgICQoYCNzaG93Qnkgb3B0aW9uW3ZhbHVlPSR7dGhpcy5maWx0ZXJzLnNob3dCeX1dYClbMF0uc2V0QXR0cmlidXRlKFwic2VsZWN0ZWRcIiwgXCJcIik7XG5cbiAgICAgIHRoaXMuc2V0Q29va2llcygnc2hvd0J5JywgdGhpcy5maWx0ZXJzLnNob3dCeSk7XG4gICAgICB0aGlzLnBvc3RGaWx0ZXJzKHRoaXMuZmlsdGVycyk7XG4gICAgfSlcbiAgfVxuXG4gIHNldENvb2tpZXMobmFtZSwgdmFsKSB7XG4gICAgQ29va2llcy5zZXQobmFtZSwgdmFsLCB7ZXhwaXJlczogN30pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgZmlsdGVycyB0byBzZXJ2ZXJcbiAgICogQHBhcmFtIHt9IGRhdGEgLSBmaWx0ZXJzXG4gICAqL1xuICBwb3N0RmlsdGVycyhkYXRhKSB7XG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMi9maWx0ZXJzJyxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICBzdWNjZXNzOiAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQcm9kdWN0IGZpbHRlcnMgd2FzIFNFTlQgdG8gREInKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5pbml0KCk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Byb2R1Y3QgZmlsdGVycyBzZW5kaW5nIHRvIERCIEZBSUxFRCcpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBTZXJ2ZXIgc2lkZSB3b3JrIGVtdWxhdGlvbiAtIGZpbHRlcnMgY2F0YWxvZyB3aXRoIGZpbHRlcnMgYW5kIHNhdmUgcmVzdWx0IHRvIERCXG4gKi9cbmNsYXNzIFNlcnZlckZpbHRlclByb2R1Y3RzIHtcbiAgY29uc3RydWN0b3IoY2FsbGJhY2spIHtcbiAgICB0aGlzLmZpbHRlcnMgPSB7fTtcbiAgICB0aGlzLmNhdGFsb2cgPSB7fTtcbiAgICB0aGlzLnJlbmRlciA9IGNhbGxiYWNrO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLmdldEZpbHRlcnMoKVxuICB9XG5cbiAgZ2V0RmlsdGVycygpIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDozMDAyL2ZpbHRlcnMnLFxuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICBzdWNjZXNzOiBkYXRhID0+IHtcbiAgICAgICAgdGhpcy5maWx0ZXJzID0gZGF0YTtcbiAgICAgICAgY29uc29sZS5sb2coJzE0NiAtIFNlcnZlciBnb3QgZmlsdGVycyBmcm9tIERCJyk7XG4gICAgICAgIHRoaXMuZ2V0Q2F0YWxvZygpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxNTAgLSBNZXRob2QgZ2V0RmlsdGVycygpIG9mIGdldHRpbmcgZmlsdGVycyBGQUlMRUQnKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZ2V0Q2F0YWxvZygpIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwL3Byb2R1Y3RzJyxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgc3VjY2VzczogZGF0YSA9PiB7XG4gICAgICAgIHRoaXMuY2F0YWxvZyA9IGRhdGE7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxNjIgLSBTZXJ2ZXIgZ290IHByb2R1Y3RzIGNhdGFsb2cgZnJvbSBEQicpO1xuICAgICAgICB0aGlzLmZpbHRlckNhdGFsb2coKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnMTY2IC0gTWV0aG9kIGdldENhdGFsb2coKSBvZiBnZXR0aW5nIGNhdGFsb2cgRkFJTEVEJyk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWx0ZXJzIGFsbCBwcm9kdWN0cyBpbiBjYXRhbG9nIHdpdGggZXZlcnkgZmlsdGVycyBwcm9wZXJ0eSBhbmQgcHV0IHJlc3VsdCB0byB0aGlzLmZpbHRlcmVkQ2F0YWxvZ1xuICAgKi9cbiAgZmlsdGVyQ2F0YWxvZygpIHtcbiAgICBsZXQgZmlsdGVyZWRDYXRhbG9nID0gW107XG4gICAgY29uc29sZS5sb2coJzE3NycpO1xuICAgIHRoaXMucG9zdEZpbHRlcmVkKHRoaXMuZmlsdGVyZWRDYXRhbG9nKTsgLy8gY2xlYW4gcHJldmlvdXMgZmlsdGVyZWQgY2F0YWxvZ1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNhdGFsb2cubGVuZ3RoOyBpKyspIHsgLy8gYW5kIGZpbHRlciB3aXRoIHRoZW0gY2F0YWxvZy4gSW50ZXJtZWRpYXRlIHJlc3VsdHMgcHV0XG4gICAgICAvLyBjaGVjayBpZiB0aGUgcHJvZHVjdCBzYXRpc2Z5IGFsbCBmaWx0ZXJzXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuY2hlY2tQcm9kV2l0aEZpbHRlcih0aGlzLmZpbHRlcnMuY2F0SXRlbSwgdGhpcy5jYXRhbG9nW2ldLmNhdEl0ZW0pICYmXG4gICAgICAgIHRoaXMuY2hlY2tQcm9kV2l0aEZpbHRlcih0aGlzLmZpbHRlcnMuY2F0ZWdvcnksIHRoaXMuY2F0YWxvZ1tpXS5jYXRlZ29yeSkgJiZcbiAgICAgICAgdGhpcy5jaGVja1Byb2RXaXRoRmlsdGVyKHRoaXMuZmlsdGVycy5icmFuZCwgdGhpcy5jYXRhbG9nW2ldLmJyYW5kKSAmJlxuICAgICAgICB0aGlzLmNoZWNrUHJvZFdpdGhGaWx0ZXIodGhpcy5maWx0ZXJzLmRlc2lnbmVyLCB0aGlzLmNhdGFsb2dbaV0uZGVzaWduZXIpICYmXG4gICAgICAgIHRoaXMuY2hlY2tQcm9kQnlTaXplKHRoaXMuZmlsdGVycy5zaXplLCB0aGlzLmNhdGFsb2dbaV0uc2l6ZSkgJiZcbiAgICAgICAgdGhpcy5jaGVja1Byb2RCeVByaWNlKHRoaXMuZmlsdGVycy5wcmljZSwgdGhpcy5jYXRhbG9nW2ldLnByaWNlKVxuICAgICAgKSB7XG4gICAgICAgIC8vIGFkZCB0aGlzIHByb2R1Y3QgdG8gdGhpcy5maWx0ZXJlZENhdGFsb2dcbiAgICAgICAgZmlsdGVyZWRDYXRhbG9nLnB1c2godGhpcy5jYXRhbG9nW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnBhZ2luYXRlKGZpbHRlcmVkQ2F0YWxvZyk7XG5cbiAgICAvLyB0aGlzLnBvc3RGaWx0ZXJlZCh0aGlzLmZpbHRlcmVkQ2F0YWxvZyk7IC8vIHRoaXMuZmlsdGVyZWRDYXRhbG9nINGB0L7RhdGA0LDQvdGP0LXRgtGB0Y8g0L/RgNCw0LLQuNC70YzQvdC+XG4gIH1cblxuICAvKipcbiAgICogRGV2aWRlIGZpbHRlcmVkQ2F0YWxvZyBieSBwYWdlcyBhY2NvcmRpbmcgdG8gU2hvdyBzZWxlY3RvciB2YWx1ZVxuICAgKiBAcGFyYW0ge30gZmlsdGVyZWRDYXRhbG9nXG4gICAqL1xuICBwYWdpbmF0ZShmaWx0ZXJlZENhdGFsb2cpIHtcbiAgICBsZXQgZmlsdENhdFdpdGhQYWcgPSB7fTtcbiAgICBsZXQgbiA9IDE7IC8vIGZpcnN0IHBhZ2UgbnVtYmVyXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbHRlcmVkQ2F0YWxvZy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcGFnZV9udW0gPSAncGFnZV8nICsgbjtcbiAgICAgIGZpbHRDYXRXaXRoUGFnW3BhZ2VfbnVtXSA9IFtdO1xuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuZmlsdGVycy5zaG93QnkgJiYgaSA8IGZpbHRlcmVkQ2F0YWxvZy5sZW5ndGg7IGorKywgaSsrKSB7XG4gICAgICAgIGZpbHRDYXRXaXRoUGFnW3BhZ2VfbnVtXS5wdXNoKGZpbHRlcmVkQ2F0YWxvZ1tpXSk7XG4gICAgICB9XG4gICAgICBpLS07XG4gICAgICBuKys7XG4gICAgfVxuXG4gICAgdGhpcy5wb3N0RmlsdGVyZWQoZmlsdENhdFdpdGhQYWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHNpbXBsZSBmaWx0ZXIgcGFyYW1ldGVycyBpZiB0aGUgcHJvZHVjdCBzYXRpc2Z5XG4gICAqIEBwYXJhbSBzdHJpbmcgZmlsdGVyIGZpbHRlciBwcm9wZXJ0eSB2YWx1ZVxuICAgKiBAcGFyYW0gc3RyaW5nIHByb2R1Y3QgcHJvcGVydHkgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgZmlsdGVyID0gJ2FsbCcgb3Igc2F0aXNmeSB0byBwcm9kdWN0XG4gICAqL1xuICBjaGVja1Byb2RXaXRoRmlsdGVyKGZpbHRlciwgcHJvZHVjdCkge1xuICAgIGlmIChmaWx0ZXIgPT09ICdhbGwnKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSByZXR1cm4gKGZpbHRlciA9PT0gcHJvZHVjdCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIHByb2R1Y3QgaGFzIG9uZSBvZiBmaWx0ZXIncyBzaXplXG4gICAqIEBwYXJhbSBzdHJpbmcgW10gZmlsdGVyU2l6ZXMgLSBhcnJheSBvZiBzaXplcyBpbiBmaWx0ZXJcbiAgICogQHBhcmFtIHN0cmluZyBbXSBwcm9kU2l6ZXMgLSBhcnJheSBvZiBwcm9kdWN0J3Mgc2l6ZXNcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHByb2R1Y3QgaGFzIG9uZSBvZiBmaWx0ZXJlZCBzaXplc1xuICAgKi9cbiAgY2hlY2tQcm9kQnlTaXplKGZpbHRlclNpemVzLCBwcm9kU2l6ZXMpIHtcbiAgICBpZiAoZmlsdGVyU2l6ZXNbMF0gIT09IDApIHtcbiAgICAgIC8vIGNoZWNrIGlmIGFueSBzaXplIG9mIGZpbHRlciBpcyBpbnRvIHByb2R1Y3Qgc2l6ZXNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVyU2l6ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2RTaXplcy5pbmNsdWRlcyhmaWx0ZXJTaXplc1tpXSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmlsdGVyIHByb2R1Y3Qgd2l0aCBwcmljZSBmaWx0ZXJcbiAgICogQHBhcmFtIEludCBbXSBmaWx0ZXJQcmljZVJhbmdlIC0gZmlsdGVyJ3MgYXJyYXkgb2YgbWluIGFuZCBtYXggcHJvZHVjdCBwcmljZVxuICAgKiBAcGFyYW0gSW50IHByb2RQcmljZSAtIHByb2R1Y3QncyBwcmljZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcHJvZHVjdCdzIHByaWNlIGJldHdlZW4gbWluIGFuZCBtYXhcbiAgICovXG4gIGNoZWNrUHJvZEJ5UHJpY2UoZmlsdGVyUHJpY2VSYW5nZSwgcHJvZFByaWNlKSB7XG4gICAgaWYgKGZpbHRlclByaWNlUmFuZ2VbMF0gPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNoZWNrIGlmIGFueSBzaXplIG9mIGZpbHRlciBpcyBpbnRvIHByb2R1Y3Qgc2l6ZXNcbiAgICAgIHJldHVybiBwcm9kUHJpY2UgPj0gZmlsdGVyUHJpY2VSYW5nZVswXSAmJiBwcm9kUHJpY2UgPD0gZmlsdGVyUHJpY2VSYW5nZVsxXTtcbiAgICB9XG4gIH1cblxuICBwb3N0RmlsdGVyZWQoZGF0YSkge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjMwMDIvZmlsdGVyZWRQcm9kdWN0cycsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgc3VjY2VzczogKCkgPT4ge1xuICAgICAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0ZpbHRlcmVkIGNhdGFsb2cgREIgY2xlYW5lZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdGaWx0ZXJlZCBjYXRhbG9nIHBvc3RlZCB0byBEQicpO1xuICAgICAgICAgIHRoaXMucmVuZGVyLmluaXQoKVxuICAgICAgICB9XG4gICAgICAgIC8vdGhpcy5jYWxsYmFjay5nZXRGaWx0ZXJzKCk7IC8vINGB0Y7QtNCwINC/0LXRgNC10LTQsNGC0Ywg0LrQvtC70LvQsdGN0Log0LTQu9GPINC+0YLQvtCx0YDQsNC20LXQvdC40Y8g0LIg0YTRgNC+0L3RgtGN0L3QtNC1XG4gICAgICB9LFxuICAgICAgZXJyb3I6ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ01ldGhvZCBwb3N0RmlsdGVyZWQoZGF0YSkgb2YgZmlsdGVyZWQgY2F0YWxvZyBzYXZpbmcgdG8gREIgRkFJTEVEJyk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBSZW5kZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVsID0gbnVsbDtcbiAgICB0aGlzLnByb2R1Y3RzID0gW107XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMuZ2V0RmlsdGVyZWRDYXRhbG9nKCk7XG4gIH1cblxuICBnZXRGaWx0ZXJlZENhdGFsb2coKSB7XG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMi9maWx0ZXJlZFByb2R1Y3RzJyxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgc3VjY2VzczogZGF0YSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCczMjAgLSBGcm9udGVuZCBnb3QgZmlsdGVyZWQgY2F0YWxvZyBmcm9tIERCJyk7XG4gICAgICAgIHRoaXMucmVuZGVyKGRhdGEpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCczMjQgLSBNZXRob2QgZ2V0RmlsdGVyZWRDYXRhbG9nKCkgb2YgZ2V0dGluZyBmaWx0ZXJlZCBjYXRhbG9nIEZBSUxFRCcpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZW5kZXIoZGF0YSkge1xuICAgIHRoaXMuc2V0UGFnaW5hdGlvbihkYXRhKTtcbiAgICB0aGlzLmNsZWFuUHJvZHVjdHMoKTtcbiAgICB0aGlzLnJlbmRlclByb2R1Y3RzKGRhdGEpOy8vIGZpbGwgdGVtcGxhdGVcbiAgICAvLyBhcHBlbmQgZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGFuZCByZXR1cm4gcHJvZHVjdCA8ZmlndXJlPiB0ZW1wbGF0ZVxuICAgKiBAcmV0dXJucyB7Kn0gSFRNTCBvZiBwcm9kdWN0IDxmaWd1cmU+XG4gICAqL1xuICBjbGVhblByb2R1Y3RzKCkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWJveCcpLmlubmVySFRNTCA9ICcnO1xuICB9XG5cbiAgcmVuZGVyUHJvZHVjdHMoZGF0YSkge1xuICAgIGxldCBwYWdlID0gJ3BhZ2VfJyArICQoJyNwYWdpbmF0aW9uIC5hY3RpdmUnKS50ZXh0KCk7IC8vIGZpbmQgYWN0aXZlIHBhZ2VcblxuICAgIGlmIChkYXRhW3BhZ2VdKSB7XG4gICAgICBmb3IgKGxldCBvbmVQcm9kLCBpID0gMDsgaSA8IGRhdGFbcGFnZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgb25lUHJvZCA9ICQoJyNwcm9kX3RlbXBsYXRlJylbMF0uY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBvbmVQcm9kLnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0X2hyZWYnKS5ocmVmID0gZGF0YVtwYWdlXVtpXS5ocmVmO1xuICAgICAgICBvbmVQcm9kLnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWltZycpLnNyYyA9IGRhdGFbcGFnZV1baV0uaW1nWzBdO1xuICAgICAgICBvbmVQcm9kLnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWltZycpLmFsdCA9IGRhdGFbcGFnZV1baV0ubmFtZTtcbiAgICAgICAgb25lUHJvZC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaDMnKVswXS50ZXh0Q29udGVudCA9IGRhdGFbcGFnZV1baV0ubmFtZTtcbiAgICAgICAgb25lUHJvZC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaDQnKVswXS50ZXh0Q29udGVudCA9ICckJyArIGRhdGFbcGFnZV1baV0ucHJpY2UgKyAnLjAwJztcbiAgICAgICAgb25lUHJvZC5jbGFzc0xpc3QucmVtb3ZlKCd0ZW1wbGF0ZScpO1xuICAgICAgICAvLyB0aGlzLnByb2R1Y3RzLnB1c2godGhpcy5lbCk7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWJveCcpLmFwcGVuZENoaWxkKG9uZVByb2QpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkKCcjb29wcycpLnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgIH1cblxuICAgICAgXG4gICAgLy9UT0RPINC10YHQu9C4INGC0L7QstCw0YDRiyDQvdC1INC90LDQudC00LXQvdGLIC0g0LLRi9Cy0L7QtNC40YLRjCDRgdC+0L7QsdGJ0LXQvdC40LUg0L7QsSDRjdGC0L7QvFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHBhZ2UgVVJMIGNvbnRhaW5zIHNvbWUgc3RyaW5nXG4gICAqIEBwYXJhbSBzdHJpbmcgZXhwIC0gcmVnRXhwIGNvbmRpdGlvblxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBVUkwgY29udGFpbnMgcmVnRXhwXG4gICAqL1xuICBjaGVja1VybChleHApIHtcbiAgICBsZXQgY2hlY2tVcmwgPSBuZXcgUmVnRXhwKGV4cCk7XG4gICAgcmV0dXJuIGNoZWNrVXJsLnRlc3QoZG9jdW1lbnQubG9jYXRpb24uaHJlZilcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBzdHJpbmcgYW5kIHJldHVybiBSZWdFeHAgc3V0aXNmaWVkIHJlc3VsdCBvciBudWxsXG4gICAqIEBwYXJhbSBzdHJpbmcgZm9yIHBhcnNpbmdcbiAgICogQHBhcmFtIHN0cmluZyBleHAgcmVndWxhciBleHByZXNzaW9uIGZvciBzZWFyY2hcbiAgICogQHJldHVybnMgeyp9IHJldHVybnMgZm91bmRlZCBwYXJ0IG9mIHN0cmluZyBvciBudWxsXG4gICAqL1xuICBwYXJzZVVybChzdHJpbmcsIGV4cCkge1xuICAgIGxldCBwYXJzZSA9IHN0cmluZy5tYXRjaChleHApO1xuICAgIHJldHVybiBwYXJzZVswXVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwYWdpbmF0aW9uIGRpdiAtIGZpbGwgaXQgd2l0aCA8YT5OdW08L2E+XG4gICAqIEBwYXJhbSB7fSBkYXRhIGZpbHRlcmVkIGNhdGFsb2dcbiAgICovXG4gIHNldFBhZ2luYXRpb24oZGF0YSkge1xuICAgICQoJyNwYWdpbmF0aW9uJykuaHRtbCgnJyk7IC8vIGNsZWFyIGh0bWwgb2YgcGFnaW5hdGlvblxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGhyZWYgPSAnPycgKyBPYmplY3Qua2V5cyhkYXRhKVtpXTtcbiAgICAgIGxldCBhID0gYDxhIGhyZWY9XCIke2hyZWZ9XCI+JHtpICsgMX08L2E+YDtcblxuICAgICAgaWYgKGkgPT09IDApIHsgLy9hZGQgZmlyc3QgcGFnZSBudW1iZXJcbiAgICAgICAgJCgnI3BhZ2luYXRpb24nKS5hcHBlbmQoYSk7XG4gICAgICAgICQoJyNwYWdpbmF0aW9uIGEnKS5hZGRDbGFzcygnYWN0aXZlJyk7IC8vc2V0IHRoZSBmaXJzdCBhY3RpdmVcblxuICAgICAgfSBlbHNlIHsgLy9hZGQgYW5vdGhlciBwYWdlIG51bWJlcnNcbiAgICAgICAgJCgnI3BhZ2luYXRpb24nKS5hcHBlbmQoYSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cmxQYWdpbmF0aW9uKGRhdGEpO1xuICAgIHRoaXMucGFnaW5hdGlvbk51bUhhbmRsZXIoZGF0YSk7XG4gICAgLy8gdGhpcy5wYWdpbmF0aW9uQXJyb3dzSGFuZGxlcihkYXRhKTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgVVJMIGhhcyBwYWdlXyogYW5kIHNldCBhY3RpdmUgcGFnZSArIGFkZCBocmVmIHRvIHBhZ2luYXRpb24gc2xpZGVyIGFycm93c1xuICAgKiBAcGFyYW0ge30gZGF0YSBmaWx0ZXJlZCBjYXRhbG9nXG4gICAqL1xuICB1cmxQYWdpbmF0aW9uKGRhdGEpIHtcbiAgICAvLyBnZXQgcGFnZV9OIGZyb20gVVJMXG4gICAgbGV0IGV4cCA9IC9wYWdlX1xcZCsvaTtcblxuICAgIGlmICh0aGlzLmNoZWNrVXJsKGV4cCkpIHsgLy8gY2hlY2sgaWYgVVJMIGhhcyBwYWdlXypcbiAgICAgIGxldCBwYWdlSW5VUkwgPSB0aGlzLnBhcnNlVXJsKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIGV4cCk7XG4gICAgICBsZXQgcGFnZU5vSW5VUkwgPSArdGhpcy5wYXJzZVVybChwYWdlSW5VUkwsIC9cXGQrL2kpOyAvLyBwYXJzZSBudW1iZXIgb2YgcGFnZV8gZnJvbSBVUkxcbiAgICAgIGlmIChwYWdlTm9JblVSTCA+IDAgJiYgcGFnZU5vSW5VUkwgPD0gT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlSW5QYWdpbmF0aW9uKHBhZ2VOb0luVVJMKTtcbiAgICAgICAgdGhpcy5zZXRQYWdpbmF0aW9uQXJyb3dzSHJlZihwYWdlTm9JblVSTCwgZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldEFjdGl2ZUluUGFnaW5hdGlvbigxKTtcbiAgICAgICAgdGhpcy5zZXRQYWdpbmF0aW9uQXJyb3dzSHJlZigxLCBkYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IC5hY3RpdmUgY2xhc3MgZm9yIG4tdGggcGFnZSBpbiBwYWdpbmF0aW9uXG4gICAqIEBwYXJhbSBJbnQgbiBudW1iZXIgb2YgcGFnZSBmcm9tIFVSTFxuICAgKi9cbiAgc2V0QWN0aXZlSW5QYWdpbmF0aW9uKG4pIHtcbiAgICAkKCcjcGFnaW5hdGlvbiAuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpOyAvL3JlbW92ZSBjdXJyZW50IGFjdGl2ZSBjbGFzc1xuICAgICQoYCNwYWdpbmF0aW9uIGE6bnRoLWNoaWxkKCR7bn0pYCkuYWRkQ2xhc3MoJ2FjdGl2ZScpOyAvL2FkZCBuZXcgYWN0aXZlIGNsYXNzXG4gIH1cblxuICAvKipcbiAgICogU2V0IGhyZWYgdG8gPGE+IGluIHBhZ2luYXRpb24gc2xpZGVyXG4gICAqIEBwYXJhbSBJbnQgbiBudW1iZXIgb2YgcGFnZSBmcm9tIFVSTFxuICAgKiBAcGFyYW0ge30gZGF0YSBmaWx0ZXJlZCBjYXRhbG9nXG4gICAqL1xuICBzZXRQYWdpbmF0aW9uQXJyb3dzSHJlZihuLCBkYXRhKSB7XG4gICAgbGV0IHByZXYgPSAnJztcbiAgICBsZXQgbmV4dCA9ICcnO1xuICAgIGxldCB1cmxIdG1sID0gdGhpcy5wYXJzZVVybChkb2N1bWVudC5sb2NhdGlvbi5ocmVmLCAvXFwvW15cXC9dKz9cXC5odG1sL2kpOyAvLyBnZXQgLyouaHRtbCBmcm9tIHVybFxuXG4gICAgLy8gc2V0IGxlZnQgYnV0dHRvbiBocmVmXG4gICAgaWYgKG4gPiAxKSB7XG4gICAgICBwcmV2ID0gYCR7dXJsSHRtbH0/cGFnZV8ke24gLSAxfWA7XG4gICAgICAkKCcucGFnZXMgLmxlZnQnKS5hdHRyKCdocmVmJywgcHJldik7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoJy5wYWdlcyAubGVmdCcpLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgIH1cblxuICAgIC8vIHNldCByaWdodCBidXR0dG9uIGhyZWZcbiAgICBpZiAobiA8IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCkge1xuICAgICAgbmV4dCA9IGAke3VybEh0bWx9P3BhZ2VfJHtuICsgMX1gO1xuICAgICAgJCgnLnBhZ2VzIC5yaWdodCcpLmF0dHIoJ2hyZWYnLCBuZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnLnBhZ2VzIC5yaWdodCcpLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgY2xpY2sgaGFuZGxlciBhdCBwYWdpbmF0aW9uIG51bWJlcnNcbiAgICovXG4gIHBhZ2luYXRpb25OdW1IYW5kbGVyKCkge1xuICAgICQoJyNwYWdpbmF0aW9uJykub24oJ2NsaWNrJywgJ2EnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcjcGFnaW5hdGlvbiAuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB9KTtcbiAgfVxufVxuXG4oZnVuY3Rpb24gKCQpIHtcbiAgJChmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHJlbmRlciA9IG5ldyBSZW5kZXIoKTtcbiAgICBsZXQgZmlsdGVyUHJvZHVjdHMgPSBuZXcgU2VydmVyRmlsdGVyUHJvZHVjdHMocmVuZGVyKTtcbiAgICBsZXQgZmlsdGVyc0hhbmRsZSA9IG5ldyBGaWx0ZXJzSGFuZGxlKGZpbHRlclByb2R1Y3RzKTtcblxuICAgIGZpbHRlcnNIYW5kbGUuaW5pdCgwLCAxMDAwLCAxKTtcblxuICB9KVxufSkoalF1ZXJ5KTtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qISBqQ2Fyb3VzZWwgLSB2MC4zLjggLSAyMDE4LTA1LTMxXG4qIGh0dHA6Ly9zb3JnYWxsYS5jb20vamNhcm91c2VsL1xuKiBDb3B5cmlnaHQgKGMpIDIwMDYtMjAxOCBKYW4gU29yZ2FsbGE7IExpY2Vuc2VkIE1JVCAqL1xuKGZ1bmN0aW9uKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBqQ2Fyb3VzZWwgPSAkLmpDYXJvdXNlbCA9IHt9O1xuXG4gIGpDYXJvdXNlbC52ZXJzaW9uID0gJzAuMy44JztcblxuICB2YXIgclJlbGF0aXZlVGFyZ2V0ID0gL14oWytcXC1dPSk/KC4rKSQvO1xuXG4gIGpDYXJvdXNlbC5wYXJzZVRhcmdldCA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHZhciByZWxhdGl2ZSA9IGZhbHNlLFxuICAgICAgcGFydHMgICAgPSB0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyA/XG4gICAgICAgIHJSZWxhdGl2ZVRhcmdldC5leGVjKHRhcmdldCkgOlxuICAgICAgICBudWxsO1xuXG4gICAgaWYgKHBhcnRzKSB7XG4gICAgICB0YXJnZXQgPSBwYXJzZUludChwYXJ0c1syXSwgMTApIHx8IDA7XG5cbiAgICAgIGlmIChwYXJ0c1sxXSkge1xuICAgICAgICByZWxhdGl2ZSA9IHRydWU7XG4gICAgICAgIGlmIChwYXJ0c1sxXSA9PT0gJy09Jykge1xuICAgICAgICAgIHRhcmdldCAqPSAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRhcmdldCA9IHBhcnNlSW50KHRhcmdldCwgMTApIHx8IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgcmVsYXRpdmU6IHJlbGF0aXZlXG4gICAgfTtcbiAgfTtcblxuICBqQ2Fyb3VzZWwuZGV0ZWN0Q2Fyb3VzZWwgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgdmFyIGNhcm91c2VsO1xuXG4gICAgd2hpbGUgKGVsZW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgY2Fyb3VzZWwgPSBlbGVtZW50LmZpbHRlcignW2RhdGEtamNhcm91c2VsXScpO1xuXG4gICAgICBpZiAoY2Fyb3VzZWwubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gY2Fyb3VzZWw7XG4gICAgICB9XG5cbiAgICAgIGNhcm91c2VsID0gZWxlbWVudC5maW5kKCdbZGF0YS1qY2Fyb3VzZWxdJyk7XG5cbiAgICAgIGlmIChjYXJvdXNlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBjYXJvdXNlbDtcbiAgICAgIH1cblxuICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgakNhcm91c2VsLmJhc2UgPSBmdW5jdGlvbihwbHVnaW5OYW1lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246ICBqQ2Fyb3VzZWwudmVyc2lvbixcbiAgICAgIF9vcHRpb25zOiAge30sXG4gICAgICBfZWxlbWVudDogIG51bGwsXG4gICAgICBfY2Fyb3VzZWw6IG51bGwsXG4gICAgICBfaW5pdDogICAgICQubm9vcCxcbiAgICAgIF9jcmVhdGU6ICAgJC5ub29wLFxuICAgICAgX2Rlc3Ryb3k6ICAkLm5vb3AsXG4gICAgICBfcmVsb2FkOiAgICQubm9vcCxcbiAgICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRcbiAgICAgICAgICAuYXR0cignZGF0YS0nICsgcGx1Z2luTmFtZS50b0xvd2VyQ2FzZSgpLCB0cnVlKVxuICAgICAgICAgIC5kYXRhKHBsdWdpbk5hbWUsIHRoaXMpO1xuXG4gICAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignY3JlYXRlJykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NyZWF0ZSgpO1xuXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ2NyZWF0ZWVuZCcpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ2Rlc3Ryb3knKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZGVzdHJveSgpO1xuXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ2Rlc3Ryb3llbmQnKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50XG4gICAgICAgICAgLnJlbW92ZURhdGEocGx1Z2luTmFtZSlcbiAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS0nICsgcGx1Z2luTmFtZS50b0xvd2VyQ2FzZSgpKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICByZWxvYWQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdyZWxvYWQnKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZWxvYWQoKTtcblxuICAgICAgICB0aGlzLl90cmlnZ2VyKCdyZWxvYWRlbmQnKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICBlbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgICB9LFxuICAgICAgb3B0aW9uczogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiAkLmV4dGVuZCh7fSwgdGhpcy5fb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLl9vcHRpb25zW2tleV0gPT09ICd1bmRlZmluZWQnID9cbiAgICAgICAgICAgICAgbnVsbCA6XG4gICAgICAgICAgICAgIHRoaXMuX29wdGlvbnNba2V5XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl9vcHRpb25zW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuX29wdGlvbnMsIGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICBjYXJvdXNlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5fY2Fyb3VzZWwpIHtcbiAgICAgICAgICB0aGlzLl9jYXJvdXNlbCA9IGpDYXJvdXNlbC5kZXRlY3RDYXJvdXNlbCh0aGlzLm9wdGlvbnMoJ2Nhcm91c2VsJykgfHwgdGhpcy5fZWxlbWVudCk7XG5cbiAgICAgICAgICBpZiAoIXRoaXMuX2Nhcm91c2VsKSB7XG4gICAgICAgICAgICAkLmVycm9yKCdDb3VsZCBub3QgZGV0ZWN0IGNhcm91c2VsIGZvciBwbHVnaW4gXCInICsgcGx1Z2luTmFtZSArICdcIicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9jYXJvdXNlbDtcbiAgICAgIH0sXG4gICAgICBfdHJpZ2dlcjogZnVuY3Rpb24odHlwZSwgZWxlbWVudCwgZGF0YSkge1xuICAgICAgICB2YXIgZXZlbnQsXG4gICAgICAgICAgZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGRhdGEgPSBbdGhpc10uY29uY2F0KGRhdGEgfHwgW10pO1xuXG4gICAgICAgIChlbGVtZW50IHx8IHRoaXMuX2VsZW1lbnQpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXZlbnQgPSAkLkV2ZW50KChwbHVnaW5OYW1lICsgJzonICsgdHlwZSkudG9Mb3dlckNhc2UoKSk7XG5cbiAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoZXZlbnQsIGRhdGEpO1xuXG4gICAgICAgICAgaWYgKGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgICAgICBkZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAhZGVmYXVsdFByZXZlbnRlZDtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIGpDYXJvdXNlbC5wbHVnaW4gPSBmdW5jdGlvbihwbHVnaW5OYW1lLCBwbHVnaW5Qcm90b3R5cGUpIHtcbiAgICB2YXIgUGx1Z2luID0gJFtwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgdGhpcy5vcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB0aGlzLmNyZWF0ZSgpO1xuICAgIH07XG5cbiAgICBQbHVnaW4uZm4gPSBQbHVnaW4ucHJvdG90eXBlID0gJC5leHRlbmQoXG4gICAgICB7fSxcbiAgICAgIGpDYXJvdXNlbC5iYXNlKHBsdWdpbk5hbWUpLFxuICAgICAgcGx1Z2luUHJvdG90eXBlXG4gICAgKTtcblxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgYXJncyAgICAgICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IHRoaXM7XG5cbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBpbnN0YW5jZSA9ICQodGhpcykuZGF0YShwbHVnaW5OYW1lKTtcblxuICAgICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiAkLmVycm9yKFxuICAgICAgICAgICAgICAnQ2Fubm90IGNhbGwgbWV0aG9kcyBvbiAnICsgcGx1Z2luTmFtZSArICcgcHJpb3IgdG8gaW5pdGlhbGl6YXRpb247ICcgK1xuICAgICAgICAgICAgICAnYXR0ZW1wdGVkIHRvIGNhbGwgbWV0aG9kIFwiJyArIG9wdGlvbnMgKyAnXCInXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghJC5pc0Z1bmN0aW9uKGluc3RhbmNlW29wdGlvbnNdKSB8fCBvcHRpb25zLmNoYXJBdCgwKSA9PT0gJ18nKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5lcnJvcihcbiAgICAgICAgICAgICAgJ05vIHN1Y2ggbWV0aG9kIFwiJyArIG9wdGlvbnMgKyAnXCIgZm9yICcgKyBwbHVnaW5OYW1lICsgJyBpbnN0YW5jZSdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG1ldGhvZFZhbHVlID0gaW5zdGFuY2Vbb3B0aW9uc10uYXBwbHkoaW5zdGFuY2UsIGFyZ3MpO1xuXG4gICAgICAgICAgaWYgKG1ldGhvZFZhbHVlICE9PSBpbnN0YW5jZSAmJiB0eXBlb2YgbWV0aG9kVmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IG1ldGhvZFZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGluc3RhbmNlID0gJCh0aGlzKS5kYXRhKHBsdWdpbk5hbWUpO1xuXG4gICAgICAgICAgaWYgKGluc3RhbmNlIGluc3RhbmNlb2YgUGx1Z2luKSB7XG4gICAgICAgICAgICBpbnN0YW5jZS5yZWxvYWQob3B0aW9ucyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldyBQbHVnaW4odGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH07XG5cbiAgICByZXR1cm4gUGx1Z2luO1xuICB9O1xufShqUXVlcnkpKTtcblxuKGZ1bmN0aW9uKCQsIHdpbmRvdykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cbiAgdmFyIHRvRmxvYXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWwpIHx8IDA7XG4gIH07XG5cbiAgJC5qQ2Fyb3VzZWwucGx1Z2luKCdqY2Fyb3VzZWwnLCB7XG4gICAgYW5pbWF0aW5nOiAgIGZhbHNlLFxuICAgIHRhaWw6ICAgICAgICAwLFxuICAgIGluVGFpbDogICAgICBmYWxzZSxcbiAgICByZXNpemVTdGF0ZTogbnVsbCxcbiAgICByZXNpemVUaW1lcjogbnVsbCxcbiAgICBsdDogICAgICAgICAgbnVsbCxcbiAgICB2ZXJ0aWNhbDogICAgZmFsc2UsXG4gICAgcnRsOiAgICAgICAgIGZhbHNlLFxuICAgIGNpcmN1bGFyOiAgICBmYWxzZSxcbiAgICB1bmRlcmZsb3c6ICAgZmFsc2UsXG4gICAgcmVsYXRpdmU6ICAgIGZhbHNlLFxuXG4gICAgX29wdGlvbnM6IHtcbiAgICAgIGxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50KCkuY2hpbGRyZW4oKS5lcSgwKTtcbiAgICAgIH0sXG4gICAgICBpdGVtczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QoKS5jaGlsZHJlbigpO1xuICAgICAgfSxcbiAgICAgIGFuaW1hdGlvbjogICA0MDAsXG4gICAgICB0cmFuc2l0aW9uczogZmFsc2UsXG4gICAgICB3cmFwOiAgICAgICAgbnVsbCxcbiAgICAgIHZlcnRpY2FsOiAgICBudWxsLFxuICAgICAgcnRsOiAgICAgICAgIG51bGwsXG4gICAgICBjZW50ZXI6ICAgICAgZmFsc2VcbiAgICB9LFxuXG4gICAgLy8gUHJvdGVjdGVkLCBkb24ndCBhY2Nlc3MgZGlyZWN0bHlcbiAgICBfbGlzdDogICAgICAgICBudWxsLFxuICAgIF9pdGVtczogICAgICAgIG51bGwsXG4gICAgX3RhcmdldDogICAgICAgJCgpLFxuICAgIF9maXJzdDogICAgICAgICQoKSxcbiAgICBfbGFzdDogICAgICAgICAkKCksXG4gICAgX3Zpc2libGU6ICAgICAgJCgpLFxuICAgIF9mdWxseXZpc2libGU6ICQoKSxcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHNlbGYucmVzaXplU3RhdGUgPSAkd2luZG93LndpZHRoKCkgKyAneCcgKyAkd2luZG93LmhlaWdodCgpO1xuXG4gICAgICB0aGlzLm9uV2luZG93UmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzZWxmLnJlc2l6ZVRpbWVyKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYucmVzaXplVGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5yZXNpemVUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGN1cnJlbnRSZXNpemVTdGF0ZSA9ICR3aW5kb3cud2lkdGgoKSArICd4JyArICR3aW5kb3cuaGVpZ2h0KCk7XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgd2luZG93IHNpemUgYWN0dWFsbHkgY2hhbmdlZC5cbiAgICAgICAgICAvLyBpT1MgbWlnaHQgdHJpZ2dlciByZXNpemUgZXZlbnRzIG9uIHBhZ2Ugc2Nyb2xsLlxuICAgICAgICAgIGlmIChjdXJyZW50UmVzaXplU3RhdGUgPT09IHNlbGYucmVzaXplU3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLnJlc2l6ZVN0YXRlID0gY3VycmVudFJlc2l6ZVN0YXRlO1xuICAgICAgICAgIHNlbGYucmVsb2FkKCk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9jcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVsb2FkKCk7XG5cbiAgICAgICR3aW5kb3cub24oJ3Jlc2l6ZS5qY2Fyb3VzZWwnLCB0aGlzLm9uV2luZG93UmVzaXplKTtcbiAgICB9LFxuICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICR3aW5kb3cub2ZmKCdyZXNpemUuamNhcm91c2VsJywgdGhpcy5vbldpbmRvd1Jlc2l6ZSk7XG4gICAgfSxcbiAgICBfcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudmVydGljYWwgPSB0aGlzLm9wdGlvbnMoJ3ZlcnRpY2FsJyk7XG5cbiAgICAgIGlmICh0aGlzLnZlcnRpY2FsID09IG51bGwpIHtcbiAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IHRvRmxvYXQodGhpcy5saXN0KCkuaGVpZ2h0KCkpID4gdG9GbG9hdCh0aGlzLmxpc3QoKS53aWR0aCgpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5ydGwgPSB0aGlzLm9wdGlvbnMoJ3J0bCcpO1xuXG4gICAgICBpZiAodGhpcy5ydGwgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJ0bCA9IChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgaWYgKCgnJyArIGVsZW1lbnQuYXR0cignZGlyJykpLnRvTG93ZXJDYXNlKCkgPT09ICdydGwnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcblxuICAgICAgICAgIGVsZW1lbnQucGFyZW50cygnW2Rpcl0nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCgvcnRsL2kpLnRlc3QoJCh0aGlzKS5hdHRyKCdkaXInKSkpIHtcbiAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgIH0odGhpcy5fZWxlbWVudCkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmx0ID0gdGhpcy52ZXJ0aWNhbCA/ICd0b3AnIDogJ2xlZnQnO1xuXG4gICAgICAvLyBFbnN1cmUgYmVmb3JlIGNsb3Nlc3QoKSBjYWxsXG4gICAgICB0aGlzLnJlbGF0aXZlID0gdGhpcy5saXN0KCkuY3NzKCdwb3NpdGlvbicpID09PSAncmVsYXRpdmUnO1xuXG4gICAgICAvLyBGb3JjZSBsaXN0IGFuZCBpdGVtcyByZWxvYWRcbiAgICAgIHRoaXMuX2xpc3QgID0gbnVsbDtcbiAgICAgIHRoaXMuX2l0ZW1zID0gbnVsbDtcblxuICAgICAgdmFyIGl0ZW0gPSB0aGlzLmluZGV4KHRoaXMuX3RhcmdldCkgPj0gMCA/XG4gICAgICAgIHRoaXMuX3RhcmdldCA6XG4gICAgICAgIHRoaXMuY2xvc2VzdCgpO1xuXG4gICAgICAvLyBfcHJlcGFyZSgpIG5lZWRzIHRoaXMgaGVyZVxuICAgICAgdGhpcy5jaXJjdWxhciAgPSB0aGlzLm9wdGlvbnMoJ3dyYXAnKSA9PT0gJ2NpcmN1bGFyJztcbiAgICAgIHRoaXMudW5kZXJmbG93ID0gZmFsc2U7XG5cbiAgICAgIHZhciBwcm9wcyA9IHsnbGVmdCc6IDAsICd0b3AnOiAwfTtcblxuICAgICAgaWYgKGl0ZW0ubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9wcmVwYXJlKGl0ZW0pO1xuICAgICAgICB0aGlzLmxpc3QoKS5maW5kKCdbZGF0YS1qY2Fyb3VzZWwtY2xvbmVdJykucmVtb3ZlKCk7XG5cbiAgICAgICAgLy8gRm9yY2UgaXRlbXMgcmVsb2FkXG4gICAgICAgIHRoaXMuX2l0ZW1zID0gbnVsbDtcblxuICAgICAgICB0aGlzLnVuZGVyZmxvdyA9IHRoaXMuX2Z1bGx5dmlzaWJsZS5sZW5ndGggPj0gdGhpcy5pdGVtcygpLmxlbmd0aDtcbiAgICAgICAgdGhpcy5jaXJjdWxhciAgPSB0aGlzLmNpcmN1bGFyICYmICF0aGlzLnVuZGVyZmxvdztcblxuICAgICAgICBwcm9wc1t0aGlzLmx0XSA9IHRoaXMuX3Bvc2l0aW9uKGl0ZW0pICsgJ3B4JztcbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3ZlKHByb3BzKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBsaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9saXN0ID09PSBudWxsKSB7XG4gICAgICAgIHZhciBvcHRpb24gPSB0aGlzLm9wdGlvbnMoJ2xpc3QnKTtcbiAgICAgICAgdGhpcy5fbGlzdCA9ICQuaXNGdW5jdGlvbihvcHRpb24pID8gb3B0aW9uLmNhbGwodGhpcykgOiB0aGlzLl9lbGVtZW50LmZpbmQob3B0aW9uKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX2xpc3Q7XG4gICAgfSxcbiAgICBpdGVtczogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5faXRlbXMgPT09IG51bGwpIHtcbiAgICAgICAgdmFyIG9wdGlvbiA9IHRoaXMub3B0aW9ucygnaXRlbXMnKTtcbiAgICAgICAgdGhpcy5faXRlbXMgPSAoJC5pc0Z1bmN0aW9uKG9wdGlvbikgPyBvcHRpb24uY2FsbCh0aGlzKSA6IHRoaXMubGlzdCgpLmZpbmQob3B0aW9uKSkubm90KCdbZGF0YS1qY2Fyb3VzZWwtY2xvbmVdJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9pdGVtcztcbiAgICB9LFxuICAgIGluZGV4OiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gdGhpcy5pdGVtcygpLmluZGV4KGl0ZW0pO1xuICAgIH0sXG4gICAgY2xvc2VzdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiAgICA9IHRoaXMsXG4gICAgICAgIHBvcyAgICAgPSB0aGlzLmxpc3QoKS5wb3NpdGlvbigpW3RoaXMubHRdLFxuICAgICAgICBjbG9zZXN0ID0gJCgpLCAvLyBFbnN1cmUgd2UncmUgcmV0dXJuaW5nIGEgalF1ZXJ5IGluc3RhbmNlXG4gICAgICAgIHN0b3AgICAgPSBmYWxzZSxcbiAgICAgICAgbHJiICAgICA9IHRoaXMudmVydGljYWwgPyAnYm90dG9tJyA6ICh0aGlzLnJ0bCAmJiAhdGhpcy5yZWxhdGl2ZSA/ICdsZWZ0JyA6ICdyaWdodCcpLFxuICAgICAgICB3aWR0aDtcblxuICAgICAgaWYgKHRoaXMucnRsICYmIHRoaXMucmVsYXRpdmUgJiYgIXRoaXMudmVydGljYWwpIHtcbiAgICAgICAgcG9zICs9IHRvRmxvYXQodGhpcy5saXN0KCkud2lkdGgoKSkgLSB0aGlzLmNsaXBwaW5nKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXRlbXMoKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBjbG9zZXN0ID0gJCh0aGlzKTtcblxuICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkaW0gPSBzZWxmLmRpbWVuc2lvbihjbG9zZXN0KTtcblxuICAgICAgICBwb3MgKz0gZGltO1xuXG4gICAgICAgIGlmIChwb3MgPj0gMCkge1xuICAgICAgICAgIHdpZHRoID0gZGltIC0gdG9GbG9hdChjbG9zZXN0LmNzcygnbWFyZ2luLScgKyBscmIpKTtcblxuICAgICAgICAgIGlmICgoTWF0aC5hYnMocG9zKSAtIGRpbSArICh3aWR0aCAvIDIpKSA8PSAwKSB7XG4gICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgICAgcmV0dXJuIGNsb3Nlc3Q7XG4gICAgfSxcbiAgICB0YXJnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RhcmdldDtcbiAgICB9LFxuICAgIGZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9maXJzdDtcbiAgICB9LFxuICAgIGxhc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2xhc3Q7XG4gICAgfSxcbiAgICB2aXNpYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl92aXNpYmxlO1xuICAgIH0sXG4gICAgZnVsbHl2aXNpYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9mdWxseXZpc2libGU7XG4gICAgfSxcbiAgICBoYXNOZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignaGFzbmV4dCcpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgd3JhcCA9IHRoaXMub3B0aW9ucygnd3JhcCcpLFxuICAgICAgICBlbmQgPSB0aGlzLml0ZW1zKCkubGVuZ3RoIC0gMSxcbiAgICAgICAgY2hlY2sgPSB0aGlzLm9wdGlvbnMoJ2NlbnRlcicpID8gdGhpcy5fdGFyZ2V0IDogdGhpcy5fbGFzdDtcblxuICAgICAgcmV0dXJuIGVuZCA+PSAwICYmICF0aGlzLnVuZGVyZmxvdyAmJlxuICAgICAgKCh3cmFwICYmIHdyYXAgIT09ICdmaXJzdCcpIHx8XG4gICAgICAgICh0aGlzLmluZGV4KGNoZWNrKSA8IGVuZCkgfHxcbiAgICAgICAgKHRoaXMudGFpbCAmJiAhdGhpcy5pblRhaWwpKSA/IHRydWUgOiBmYWxzZTtcbiAgICB9LFxuICAgIGhhc1ByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdoYXNwcmV2JykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciB3cmFwID0gdGhpcy5vcHRpb25zKCd3cmFwJyk7XG5cbiAgICAgIHJldHVybiB0aGlzLml0ZW1zKCkubGVuZ3RoID4gMCAmJiAhdGhpcy51bmRlcmZsb3cgJiZcbiAgICAgICgod3JhcCAmJiB3cmFwICE9PSAnbGFzdCcpIHx8XG4gICAgICAgICh0aGlzLmluZGV4KHRoaXMuX2ZpcnN0KSA+IDApIHx8XG4gICAgICAgICh0aGlzLnRhaWwgJiYgdGhpcy5pblRhaWwpKSA/IHRydWUgOiBmYWxzZTtcbiAgICB9LFxuICAgIGNsaXBwaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0b0Zsb2F0KHRoaXMuX2VsZW1lbnRbJ2lubmVyJyArICh0aGlzLnZlcnRpY2FsID8gJ0hlaWdodCcgOiAnV2lkdGgnKV0oKSk7XG4gICAgfSxcbiAgICBkaW1lbnNpb246IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiB0b0Zsb2F0KGVsZW1lbnRbJ291dGVyJyArICh0aGlzLnZlcnRpY2FsID8gJ0hlaWdodCcgOiAnV2lkdGgnKV0odHJ1ZSkpO1xuICAgIH0sXG4gICAgc2Nyb2xsOiBmdW5jdGlvbih0YXJnZXQsIGFuaW1hdGUsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAodGhpcy5hbmltYXRpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignc2Nyb2xsJywgbnVsbCwgW3RhcmdldCwgYW5pbWF0ZV0pKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKGFuaW1hdGUpKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYW5pbWF0ZTtcbiAgICAgICAgYW5pbWF0ZSAgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcGFyc2VkID0gJC5qQ2Fyb3VzZWwucGFyc2VUYXJnZXQodGFyZ2V0KTtcblxuICAgICAgaWYgKHBhcnNlZC5yZWxhdGl2ZSkge1xuICAgICAgICB2YXIgZW5kICAgID0gdGhpcy5pdGVtcygpLmxlbmd0aCAtIDEsXG4gICAgICAgICAgc2Nyb2xsID0gTWF0aC5hYnMocGFyc2VkLnRhcmdldCksXG4gICAgICAgICAgd3JhcCAgID0gdGhpcy5vcHRpb25zKCd3cmFwJyksXG4gICAgICAgICAgY3VycmVudCxcbiAgICAgICAgICBmaXJzdCxcbiAgICAgICAgICBpbmRleCxcbiAgICAgICAgICBzdGFydCxcbiAgICAgICAgICBjdXJyLFxuICAgICAgICAgIGlzVmlzaWJsZSxcbiAgICAgICAgICBwcm9wcyxcbiAgICAgICAgICBpO1xuXG4gICAgICAgIGlmIChwYXJzZWQudGFyZ2V0ID4gMCkge1xuICAgICAgICAgIHZhciBsYXN0ID0gdGhpcy5pbmRleCh0aGlzLl9sYXN0KTtcblxuICAgICAgICAgIGlmIChsYXN0ID49IGVuZCAmJiB0aGlzLnRhaWwpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pblRhaWwpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsVGFpbChhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAod3JhcCA9PT0gJ2JvdGgnIHx8IHdyYXAgPT09ICdsYXN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbCgwLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcy5pbmRleCh0aGlzLl90YXJnZXQpO1xuXG4gICAgICAgICAgICBpZiAoKHRoaXMudW5kZXJmbG93ICYmIGN1cnJlbnQgPT09IGVuZCAmJiAod3JhcCA9PT0gJ2NpcmN1bGFyJyB8fCB3cmFwID09PSAnYm90aCcgfHwgd3JhcCA9PT0gJ2xhc3QnKSkgfHxcbiAgICAgICAgICAgICAgKCF0aGlzLnVuZGVyZmxvdyAmJiBsYXN0ID09PSBlbmQgJiYgKHdyYXAgPT09ICdib3RoJyB8fCB3cmFwID09PSAnbGFzdCcpKSkge1xuICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoMCwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaW5kZXggPSBjdXJyZW50ICsgc2Nyb2xsO1xuXG4gICAgICAgICAgICAgIGlmICh0aGlzLmNpcmN1bGFyICYmIGluZGV4ID4gZW5kKSB7XG4gICAgICAgICAgICAgICAgaSA9IGVuZDtcbiAgICAgICAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmdldCgtMSk7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAoaSsrIDwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoMCk7XG4gICAgICAgICAgICAgICAgICBpc1Zpc2libGUgPSB0aGlzLl92aXNpYmxlLmluZGV4KGN1cnIpID49IDA7XG5cbiAgICAgICAgICAgICAgICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3Vyci5hZnRlcihjdXJyLmNsb25lKHRydWUpLmF0dHIoJ2RhdGEtamNhcm91c2VsLWNsb25lJywgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICB0aGlzLmxpc3QoKS5hcHBlbmQoY3Vycik7XG5cbiAgICAgICAgICAgICAgICAgIGlmICghaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzID0ge307XG4gICAgICAgICAgICAgICAgICAgIHByb3BzW3RoaXMubHRdID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZUJ5KHByb3BzKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gRm9yY2UgaXRlbXMgcmVsb2FkXG4gICAgICAgICAgICAgICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKGN1cnIsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoTWF0aC5taW4oaW5kZXgsIGVuZCksIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5pblRhaWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbChNYXRoLm1heCgodGhpcy5pbmRleCh0aGlzLl9maXJzdCkgLSBzY3JvbGwpICsgMSwgMCksIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlyc3QgID0gdGhpcy5pbmRleCh0aGlzLl9maXJzdCk7XG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcy5pbmRleCh0aGlzLl90YXJnZXQpO1xuICAgICAgICAgICAgc3RhcnQgID0gdGhpcy51bmRlcmZsb3cgPyBjdXJyZW50IDogZmlyc3Q7XG4gICAgICAgICAgICBpbmRleCAgPSBzdGFydCAtIHNjcm9sbDtcblxuICAgICAgICAgICAgaWYgKHN0YXJ0IDw9IDAgJiYgKCh0aGlzLnVuZGVyZmxvdyAmJiB3cmFwID09PSAnY2lyY3VsYXInKSB8fCB3cmFwID09PSAnYm90aCcgfHwgd3JhcCA9PT0gJ2ZpcnN0JykpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKGVuZCwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuY2lyY3VsYXIgJiYgaW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgaSAgICA9IGluZGV4O1xuICAgICAgICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZ2V0KDApO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkrKyA8IDApIHtcbiAgICAgICAgICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoLTEpO1xuICAgICAgICAgICAgICAgICAgaXNWaXNpYmxlID0gdGhpcy5fdmlzaWJsZS5pbmRleChjdXJyKSA+PSAwO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnIuYWZ0ZXIoY3Vyci5jbG9uZSh0cnVlKS5hdHRyKCdkYXRhLWpjYXJvdXNlbC1jbG9uZScsIHRydWUpKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdGhpcy5saXN0KCkucHJlcGVuZChjdXJyKTtcblxuICAgICAgICAgICAgICAgICAgLy8gRm9yY2UgaXRlbXMgcmVsb2FkXG4gICAgICAgICAgICAgICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgIHZhciBkaW0gPSB0aGlzLmRpbWVuc2lvbihjdXJyKTtcblxuICAgICAgICAgICAgICAgICAgcHJvcHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgIHByb3BzW3RoaXMubHRdID0gLWRpbTtcbiAgICAgICAgICAgICAgICAgIHRoaXMubW92ZUJ5KHByb3BzKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbChjdXJyLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKE1hdGgubWF4KGluZGV4LCAwKSwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zY3JvbGwocGFyc2VkLnRhcmdldCwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl90cmlnZ2VyKCdzY3JvbGxlbmQnKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBtb3ZlQnk6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIG9wdHMpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMubGlzdCgpLnBvc2l0aW9uKCksXG4gICAgICAgIG11bHRpcGxpZXIgPSAxLFxuICAgICAgICBjb3JyZWN0aW9uID0gMDtcblxuICAgICAgaWYgKHRoaXMucnRsICYmICF0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSAtMTtcblxuICAgICAgICBpZiAodGhpcy5yZWxhdGl2ZSkge1xuICAgICAgICAgIGNvcnJlY3Rpb24gPSB0b0Zsb2F0KHRoaXMubGlzdCgpLndpZHRoKCkpIC0gdGhpcy5jbGlwcGluZygpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9wZXJ0aWVzLmxlZnQpIHtcbiAgICAgICAgcHJvcGVydGllcy5sZWZ0ID0gKHRvRmxvYXQocG9zaXRpb24ubGVmdCkgKyBjb3JyZWN0aW9uICsgdG9GbG9hdChwcm9wZXJ0aWVzLmxlZnQpICogbXVsdGlwbGllcikgKyAncHgnO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvcGVydGllcy50b3ApIHtcbiAgICAgICAgcHJvcGVydGllcy50b3AgPSAodG9GbG9hdChwb3NpdGlvbi50b3ApICsgY29ycmVjdGlvbiArIHRvRmxvYXQocHJvcGVydGllcy50b3ApICogbXVsdGlwbGllcikgKyAncHgnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5tb3ZlKHByb3BlcnRpZXMsIG9wdHMpO1xuICAgIH0sXG4gICAgbW92ZTogZnVuY3Rpb24ocHJvcGVydGllcywgb3B0cykge1xuICAgICAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgICAgIHZhciBvcHRpb24gICAgICAgPSB0aGlzLm9wdGlvbnMoJ3RyYW5zaXRpb25zJyksXG4gICAgICAgIHRyYW5zaXRpb25zICA9ICEhb3B0aW9uLFxuICAgICAgICB0cmFuc2Zvcm1zICAgPSAhIW9wdGlvbi50cmFuc2Zvcm1zLFxuICAgICAgICB0cmFuc2Zvcm1zM2QgPSAhIW9wdGlvbi50cmFuc2Zvcm1zM2QsXG4gICAgICAgIGR1cmF0aW9uICAgICA9IG9wdHMuZHVyYXRpb24gfHwgMCxcbiAgICAgICAgbGlzdCAgICAgICAgID0gdGhpcy5saXN0KCk7XG5cbiAgICAgIGlmICghdHJhbnNpdGlvbnMgJiYgZHVyYXRpb24gPiAwKSB7XG4gICAgICAgIGxpc3QuYW5pbWF0ZShwcm9wZXJ0aWVzLCBvcHRzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29tcGxldGUgPSBvcHRzLmNvbXBsZXRlIHx8ICQubm9vcCxcbiAgICAgICAgY3NzID0ge307XG5cbiAgICAgIGlmICh0cmFuc2l0aW9ucykge1xuICAgICAgICB2YXIgYmFja3VwID0ge1xuICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiBsaXN0LmNzcygndHJhbnNpdGlvbkR1cmF0aW9uJyksXG4gICAgICAgICAgICB0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb246IGxpc3QuY3NzKCd0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb24nKSxcbiAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0eTogbGlzdC5jc3MoJ3RyYW5zaXRpb25Qcm9wZXJ0eScpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbGRDb21wbGV0ZSA9IGNvbXBsZXRlO1xuXG4gICAgICAgIGNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJCh0aGlzKS5jc3MoYmFja3VwKTtcbiAgICAgICAgICBvbGRDb21wbGV0ZS5jYWxsKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBjc3MgPSB7XG4gICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiAoZHVyYXRpb24gPiAwID8gZHVyYXRpb24gLyAxMDAwIDogMCkgKyAncycsXG4gICAgICAgICAgdHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBvcHRpb24uZWFzaW5nIHx8IG9wdHMuZWFzaW5nLFxuICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0eTogZHVyYXRpb24gPiAwID8gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybXMgfHwgdHJhbnNmb3JtczNkKSB7XG4gICAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gdXNlICdhbGwnIGJlY2F1c2UgalF1ZXJ5IGRvZXNuJ3QgcHJlZml4XG4gICAgICAgICAgICAgIC8vIGNzcyB2YWx1ZXMsIGxpa2UgdHJhbnNpdGlvbi1wcm9wZXJ0eTogdHJhbnNmb3JtO1xuICAgICAgICAgICAgICByZXR1cm4gJ2FsbCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzLmxlZnQgPyAnbGVmdCcgOiAndG9wJztcbiAgICAgICAgICB9KSgpIDogJ25vbmUnLFxuICAgICAgICAgIHRyYW5zZm9ybTogJ25vbmUnXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmICh0cmFuc2Zvcm1zM2QpIHtcbiAgICAgICAgY3NzLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKHByb3BlcnRpZXMubGVmdCB8fCAwKSArICcsJyArIChwcm9wZXJ0aWVzLnRvcCB8fCAwKSArICcsMCknO1xuICAgICAgfSBlbHNlIGlmICh0cmFuc2Zvcm1zKSB7XG4gICAgICAgIGNzcy50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAocHJvcGVydGllcy5sZWZ0IHx8IDApICsgJywnICsgKHByb3BlcnRpZXMudG9wIHx8IDApICsgJyknO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJC5leHRlbmQoY3NzLCBwcm9wZXJ0aWVzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRyYW5zaXRpb25zICYmIGR1cmF0aW9uID4gMCkge1xuICAgICAgICBsaXN0Lm9uZSgndHJhbnNpdGlvbmVuZCB3ZWJraXRUcmFuc2l0aW9uRW5kIG9UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kIE1TVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKTtcbiAgICAgIH1cblxuICAgICAgbGlzdC5jc3MoY3NzKTtcblxuICAgICAgaWYgKGR1cmF0aW9uIDw9IDApIHtcbiAgICAgICAgbGlzdC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbXBsZXRlLmNhbGwodGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgX3Njcm9sbDogZnVuY3Rpb24oaXRlbSwgYW5pbWF0ZSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGluZykge1xuICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlbSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgaXRlbSA9IHRoaXMuaXRlbXMoKS5lcShpdGVtKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGl0ZW0uanF1ZXJ5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpdGVtID0gJChpdGVtKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdGhpcy5pblRhaWwgPSBmYWxzZTtcblxuICAgICAgdGhpcy5fcHJlcGFyZShpdGVtKTtcblxuICAgICAgdmFyIHBvcyAgICAgPSB0aGlzLl9wb3NpdGlvbihpdGVtKSxcbiAgICAgICAgY3VyclBvcyA9IHRvRmxvYXQodGhpcy5saXN0KCkucG9zaXRpb24oKVt0aGlzLmx0XSk7XG5cbiAgICAgIGlmIChwb3MgPT09IGN1cnJQb3MpIHtcbiAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJvcGVydGllc1t0aGlzLmx0XSA9IHBvcyArICdweCc7XG5cbiAgICAgIHRoaXMuX2FuaW1hdGUocHJvcGVydGllcywgYW5pbWF0ZSwgY2FsbGJhY2spO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9zY3JvbGxUYWlsOiBmdW5jdGlvbihhbmltYXRlLCBjYWxsYmFjaykge1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nIHx8ICF0aGlzLnRhaWwpIHtcbiAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5saXN0KCkucG9zaXRpb24oKVt0aGlzLmx0XTtcblxuICAgICAgaWYgKHRoaXMucnRsICYmIHRoaXMucmVsYXRpdmUgJiYgIXRoaXMudmVydGljYWwpIHtcbiAgICAgICAgcG9zICs9IHRvRmxvYXQodGhpcy5saXN0KCkud2lkdGgoKSkgLSB0aGlzLmNsaXBwaW5nKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnJ0bCAmJiAhdGhpcy52ZXJ0aWNhbCkge1xuICAgICAgICBwb3MgKz0gdGhpcy50YWlsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zIC09IHRoaXMudGFpbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pblRhaWwgPSB0cnVlO1xuXG4gICAgICB2YXIgcHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJvcGVydGllc1t0aGlzLmx0XSA9IHBvcyArICdweCc7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZSh7XG4gICAgICAgIHRhcmdldDogICAgICAgdGhpcy5fdGFyZ2V0Lm5leHQoKSxcbiAgICAgICAgZnVsbHl2aXNpYmxlOiB0aGlzLl9mdWxseXZpc2libGUuc2xpY2UoMSkuYWRkKHRoaXMuX3Zpc2libGUubGFzdCgpKVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2FuaW1hdGUocHJvcGVydGllcywgYW5pbWF0ZSwgY2FsbGJhY2spO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9hbmltYXRlOiBmdW5jdGlvbihwcm9wZXJ0aWVzLCBhbmltYXRlLCBjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCAkLm5vb3A7XG5cbiAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignYW5pbWF0ZScpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdGhpcy5hbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICB2YXIgYW5pbWF0aW9uID0gdGhpcy5vcHRpb25zKCdhbmltYXRpb24nKSxcbiAgICAgICAgY29tcGxldGUgID0gJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLmFuaW1hdGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgdmFyIGMgPSB0aGlzLmxpc3QoKS5maW5kKCdbZGF0YS1qY2Fyb3VzZWwtY2xvbmVdJyk7XG5cbiAgICAgICAgICBpZiAoYy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjLnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5fcmVsb2FkKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fdHJpZ2dlcignYW5pbWF0ZWVuZCcpO1xuXG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCB0cnVlKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHZhciBvcHRzID0gdHlwZW9mIGFuaW1hdGlvbiA9PT0gJ29iamVjdCcgP1xuICAgICAgICAkLmV4dGVuZCh7fSwgYW5pbWF0aW9uKSA6XG4gICAgICAgIHtkdXJhdGlvbjogYW5pbWF0aW9ufSxcbiAgICAgICAgb2xkQ29tcGxldGUgPSBvcHRzLmNvbXBsZXRlIHx8ICQubm9vcDtcblxuICAgICAgaWYgKGFuaW1hdGUgPT09IGZhbHNlKSB7XG4gICAgICAgIG9wdHMuZHVyYXRpb24gPSAwO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgJC5meC5zcGVlZHNbb3B0cy5kdXJhdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG9wdHMuZHVyYXRpb24gPSAkLmZ4LnNwZWVkc1tvcHRzLmR1cmF0aW9uXTtcbiAgICAgIH1cblxuICAgICAgb3B0cy5jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICBvbGRDb21wbGV0ZS5jYWxsKHRoaXMpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5tb3ZlKHByb3BlcnRpZXMsIG9wdHMpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9wcmVwYXJlOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICB2YXIgaW5kZXggID0gdGhpcy5pbmRleChpdGVtKSxcbiAgICAgICAgaWR4ICAgID0gaW5kZXgsXG4gICAgICAgIHdoICAgICA9IHRoaXMuZGltZW5zaW9uKGl0ZW0pLFxuICAgICAgICBjbGlwICAgPSB0aGlzLmNsaXBwaW5nKCksXG4gICAgICAgIGxyYiAgICA9IHRoaXMudmVydGljYWwgPyAnYm90dG9tJyA6ICh0aGlzLnJ0bCA/ICdsZWZ0JyAgOiAncmlnaHQnKSxcbiAgICAgICAgY2VudGVyID0gdGhpcy5vcHRpb25zKCdjZW50ZXInKSxcbiAgICAgICAgdXBkYXRlID0ge1xuICAgICAgICAgIHRhcmdldDogICAgICAgaXRlbSxcbiAgICAgICAgICBmaXJzdDogICAgICAgIGl0ZW0sXG4gICAgICAgICAgbGFzdDogICAgICAgICBpdGVtLFxuICAgICAgICAgIHZpc2libGU6ICAgICAgaXRlbSxcbiAgICAgICAgICBmdWxseXZpc2libGU6IHdoIDw9IGNsaXAgPyBpdGVtIDogJCgpXG4gICAgICAgIH0sXG4gICAgICAgIGN1cnIsXG4gICAgICAgIGlzVmlzaWJsZSxcbiAgICAgICAgbWFyZ2luLFxuICAgICAgICBkaW07XG5cbiAgICAgIGlmIChjZW50ZXIpIHtcbiAgICAgICAgd2ggLz0gMjtcbiAgICAgICAgY2xpcCAvPSAyO1xuICAgICAgfVxuXG4gICAgICBpZiAod2ggPCBjbGlwKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5lcSgrK2lkeCk7XG5cbiAgICAgICAgICBpZiAoY3Vyci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jaXJjdWxhcikge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5lcSgwKTtcblxuICAgICAgICAgICAgaWYgKGl0ZW0uZ2V0KDApID09PSBjdXJyLmdldCgwKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaXNWaXNpYmxlID0gdGhpcy5fdmlzaWJsZS5pbmRleChjdXJyKSA+PSAwO1xuXG4gICAgICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgIGN1cnIuYWZ0ZXIoY3Vyci5jbG9uZSh0cnVlKS5hdHRyKCdkYXRhLWpjYXJvdXNlbC1jbG9uZScsIHRydWUpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5saXN0KCkuYXBwZW5kKGN1cnIpO1xuXG4gICAgICAgICAgICBpZiAoIWlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICB2YXIgcHJvcHMgPSB7fTtcbiAgICAgICAgICAgICAgcHJvcHNbdGhpcy5sdF0gPSB0aGlzLmRpbWVuc2lvbihjdXJyKTtcbiAgICAgICAgICAgICAgdGhpcy5tb3ZlQnkocHJvcHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGb3JjZSBpdGVtcyByZWxvYWRcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1zID0gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaW0gPSB0aGlzLmRpbWVuc2lvbihjdXJyKTtcblxuICAgICAgICAgIGlmIChkaW0gPT09IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdoICs9IGRpbTtcblxuICAgICAgICAgIHVwZGF0ZS5sYXN0ICAgID0gY3VycjtcbiAgICAgICAgICB1cGRhdGUudmlzaWJsZSA9IHVwZGF0ZS52aXNpYmxlLmFkZChjdXJyKTtcblxuICAgICAgICAgIC8vIFJlbW92ZSByaWdodC9ib3R0b20gbWFyZ2luIGZyb20gdG90YWwgd2lkdGhcbiAgICAgICAgICBtYXJnaW4gPSB0b0Zsb2F0KGN1cnIuY3NzKCdtYXJnaW4tJyArIGxyYikpO1xuXG4gICAgICAgICAgaWYgKCh3aCAtIG1hcmdpbikgPD0gY2xpcCkge1xuICAgICAgICAgICAgdXBkYXRlLmZ1bGx5dmlzaWJsZSA9IHVwZGF0ZS5mdWxseXZpc2libGUuYWRkKGN1cnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh3aCA+PSBjbGlwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmNpcmN1bGFyICYmICFjZW50ZXIgJiYgd2ggPCBjbGlwKSB7XG4gICAgICAgIGlkeCA9IGluZGV4O1xuXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgaWYgKC0taWR4IDwgMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5lcShpZHgpO1xuXG4gICAgICAgICAgaWYgKGN1cnIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaW0gPSB0aGlzLmRpbWVuc2lvbihjdXJyKTtcblxuICAgICAgICAgIGlmIChkaW0gPT09IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdoICs9IGRpbTtcblxuICAgICAgICAgIHVwZGF0ZS5maXJzdCAgID0gY3VycjtcbiAgICAgICAgICB1cGRhdGUudmlzaWJsZSA9IHVwZGF0ZS52aXNpYmxlLmFkZChjdXJyKTtcblxuICAgICAgICAgIC8vIFJlbW92ZSByaWdodC9ib3R0b20gbWFyZ2luIGZyb20gdG90YWwgd2lkdGhcbiAgICAgICAgICBtYXJnaW4gPSB0b0Zsb2F0KGN1cnIuY3NzKCdtYXJnaW4tJyArIGxyYikpO1xuXG4gICAgICAgICAgaWYgKCh3aCAtIG1hcmdpbikgPD0gY2xpcCkge1xuICAgICAgICAgICAgdXBkYXRlLmZ1bGx5dmlzaWJsZSA9IHVwZGF0ZS5mdWxseXZpc2libGUuYWRkKGN1cnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh3aCA+PSBjbGlwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fdXBkYXRlKHVwZGF0ZSk7XG5cbiAgICAgIHRoaXMudGFpbCA9IDA7XG5cbiAgICAgIGlmICghY2VudGVyICYmXG4gICAgICAgIHRoaXMub3B0aW9ucygnd3JhcCcpICE9PSAnY2lyY3VsYXInICYmXG4gICAgICAgIHRoaXMub3B0aW9ucygnd3JhcCcpICE9PSAnY3VzdG9tJyAmJlxuICAgICAgICB0aGlzLmluZGV4KHVwZGF0ZS5sYXN0KSA9PT0gKHRoaXMuaXRlbXMoKS5sZW5ndGggLSAxKSkge1xuXG4gICAgICAgIC8vIFJlbW92ZSByaWdodC9ib3R0b20gbWFyZ2luIGZyb20gdG90YWwgd2lkdGhcbiAgICAgICAgd2ggLT0gdG9GbG9hdCh1cGRhdGUubGFzdC5jc3MoJ21hcmdpbi0nICsgbHJiKSk7XG5cbiAgICAgICAgaWYgKHdoID4gY2xpcCkge1xuICAgICAgICAgIHRoaXMudGFpbCA9IHdoIC0gY2xpcDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIF9wb3NpdGlvbjogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdmFyIGZpcnN0ICA9IHRoaXMuX2ZpcnN0LFxuICAgICAgICBwb3MgICAgPSB0b0Zsb2F0KGZpcnN0LnBvc2l0aW9uKClbdGhpcy5sdF0pLFxuICAgICAgICBjZW50ZXIgPSB0aGlzLm9wdGlvbnMoJ2NlbnRlcicpLFxuICAgICAgICBjZW50ZXJPZmZzZXQgPSBjZW50ZXIgPyAodGhpcy5jbGlwcGluZygpIC8gMikgLSAodGhpcy5kaW1lbnNpb24oZmlyc3QpIC8gMikgOiAwO1xuXG4gICAgICBpZiAodGhpcy5ydGwgJiYgIXRoaXMudmVydGljYWwpIHtcbiAgICAgICAgaWYgKHRoaXMucmVsYXRpdmUpIHtcbiAgICAgICAgICBwb3MgLT0gdG9GbG9hdCh0aGlzLmxpc3QoKS53aWR0aCgpKSAtIHRoaXMuZGltZW5zaW9uKGZpcnN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwb3MgLT0gdGhpcy5jbGlwcGluZygpIC0gdGhpcy5kaW1lbnNpb24oZmlyc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9zICs9IGNlbnRlck9mZnNldDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvcyAtPSBjZW50ZXJPZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIGlmICghY2VudGVyICYmXG4gICAgICAgICh0aGlzLmluZGV4KGl0ZW0pID4gdGhpcy5pbmRleChmaXJzdCkgfHwgdGhpcy5pblRhaWwpICYmXG4gICAgICAgIHRoaXMudGFpbCkge1xuICAgICAgICBwb3MgPSB0aGlzLnJ0bCAmJiAhdGhpcy52ZXJ0aWNhbCA/IHBvcyAtIHRoaXMudGFpbCA6IHBvcyArIHRoaXMudGFpbDtcbiAgICAgICAgdGhpcy5pblRhaWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pblRhaWwgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIC1wb3M7XG4gICAgfSxcbiAgICBfdXBkYXRlOiBmdW5jdGlvbih1cGRhdGUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgY3VycmVudCA9IHtcbiAgICAgICAgICB0YXJnZXQ6ICAgICAgIHRoaXMuX3RhcmdldCxcbiAgICAgICAgICBmaXJzdDogICAgICAgIHRoaXMuX2ZpcnN0LFxuICAgICAgICAgIGxhc3Q6ICAgICAgICAgdGhpcy5fbGFzdCxcbiAgICAgICAgICB2aXNpYmxlOiAgICAgIHRoaXMuX3Zpc2libGUsXG4gICAgICAgICAgZnVsbHl2aXNpYmxlOiB0aGlzLl9mdWxseXZpc2libGVcbiAgICAgICAgfSxcbiAgICAgICAgYmFjayA9IHRoaXMuaW5kZXgodXBkYXRlLmZpcnN0IHx8IGN1cnJlbnQuZmlyc3QpIDwgdGhpcy5pbmRleChjdXJyZW50LmZpcnN0KSxcbiAgICAgICAga2V5LFxuICAgICAgICBkb1VwZGF0ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgIHZhciBlbEluICA9IFtdLFxuICAgICAgICAgICAgZWxPdXQgPSBbXTtcblxuICAgICAgICAgIHVwZGF0ZVtrZXldLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFtrZXldLmluZGV4KHRoaXMpIDwgMCkge1xuICAgICAgICAgICAgICBlbEluLnB1c2godGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjdXJyZW50W2tleV0uZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh1cGRhdGVba2V5XS5pbmRleCh0aGlzKSA8IDApIHtcbiAgICAgICAgICAgICAgZWxPdXQucHVzaCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChiYWNrKSB7XG4gICAgICAgICAgICBlbEluID0gZWxJbi5yZXZlcnNlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsT3V0ID0gZWxPdXQucmV2ZXJzZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX3RyaWdnZXIoa2V5ICsgJ2luJywgJChlbEluKSk7XG4gICAgICAgICAgc2VsZi5fdHJpZ2dlcihrZXkgKyAnb3V0JywgJChlbE91dCkpO1xuXG4gICAgICAgICAgc2VsZlsnXycgKyBrZXldID0gdXBkYXRlW2tleV07XG4gICAgICAgIH07XG5cbiAgICAgIGZvciAoa2V5IGluIHVwZGF0ZSkge1xuICAgICAgICBkb1VwZGF0ZShrZXkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0pO1xufShqUXVlcnksIHdpbmRvdykpO1xuXG4vKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjIuMFxuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0dmFyIHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlcjtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICghcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyKSB7XG5cdFx0dmFyIE9sZENvb2tpZXMgPSB3aW5kb3cuQ29va2llcztcblx0XHR2YXIgYXBpID0gd2luZG93LkNvb2tpZXMgPSBmYWN0b3J5KCk7XG5cdFx0YXBpLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aW5kb3cuQ29va2llcyA9IE9sZENvb2tpZXM7XG5cdFx0XHRyZXR1cm4gYXBpO1xuXHRcdH07XG5cdH1cbn0oZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBleHRlbmQgKCkge1xuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0Zm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzWyBpIF07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAocykge1xuXHRcdHJldHVybiBzLnJlcGxhY2UoLyglWzAtOUEtWl17Mn0pKy9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpKCkge31cblxuXHRcdGZ1bmN0aW9uIHNldCAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRhdHRyaWJ1dGVzID0gZXh0ZW5kKHtcblx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHR9LCBhcGkuZGVmYXVsdHMsIGF0dHJpYnV0ZXMpO1xuXG5cdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gbmV3IERhdGUobmV3IERhdGUoKSAqIDEgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXZSdyZSB1c2luZyBcImV4cGlyZXNcIiBiZWNhdXNlIFwibWF4LWFnZVwiIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGF0dHJpYnV0ZXMuZXhwaXJlcyA/IGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpIDogJyc7XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHZhciByZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHRcdGlmICgvXltcXHtcXFtdLy50ZXN0KHJlc3VsdCkpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZSkge31cblxuXHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUgP1xuXHRcdFx0XHRjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSkgOlxuXHRcdFx0XHRlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSlcblx0XHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblxuXHRcdFx0a2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhrZXkpKVxuXHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuXHRcdFx0XHQucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKTtcblxuXHRcdFx0dmFyIHN0cmluZ2lmaWVkQXR0cmlidXRlcyA9ICcnO1xuXHRcdFx0Zm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnOyAnICsgYXR0cmlidXRlTmFtZTtcblx0XHRcdFx0aWYgKGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0gPT09IHRydWUpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENvbnNpZGVycyBSRkMgNjI2NSBzZWN0aW9uIDUuMjpcblx0XHRcdFx0Ly8gLi4uXG5cdFx0XHRcdC8vIDMuICBJZiB0aGUgcmVtYWluaW5nIHVucGFyc2VkLWF0dHJpYnV0ZXMgY29udGFpbnMgYSAleDNCIChcIjtcIilcblx0XHRcdFx0Ly8gICAgIGNoYXJhY3Rlcjpcblx0XHRcdFx0Ly8gQ29uc3VtZSB0aGUgY2hhcmFjdGVycyBvZiB0aGUgdW5wYXJzZWQtYXR0cmlidXRlcyB1cCB0byxcblx0XHRcdFx0Ly8gbm90IGluY2x1ZGluZywgdGhlIGZpcnN0ICV4M0IgKFwiO1wiKSBjaGFyYWN0ZXIuXG5cdFx0XHRcdC8vIC4uLlxuXHRcdFx0XHRzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJz0nICsgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXS5zcGxpdCgnOycpWzBdO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKGRvY3VtZW50LmNvb2tpZSA9IGtleSArICc9JyArIHZhbHVlICsgc3RyaW5naWZpZWRBdHRyaWJ1dGVzKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBnZXQgKGtleSwganNvbikge1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgamFyID0ge307XG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC5cblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKCFqc29uICYmIGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IGRlY29kZShwYXJ0c1swXSk7XG5cdFx0XHRcdFx0Y29va2llID0gKGNvbnZlcnRlci5yZWFkIHx8IGNvbnZlcnRlcikoY29va2llLCBuYW1lKSB8fFxuXHRcdFx0XHRcdFx0ZGVjb2RlKGNvb2tpZSk7XG5cblx0XHRcdFx0XHRpZiAoanNvbikge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29va2llID0gSlNPTi5wYXJzZShjb29raWUpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRqYXJbbmFtZV0gPSBjb29raWU7XG5cblx0XHRcdFx0XHRpZiAoa2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBrZXkgPyBqYXJba2V5XSA6IGphcjtcblx0XHR9XG5cblx0XHRhcGkuc2V0ID0gc2V0O1xuXHRcdGFwaS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gZ2V0KGtleSwgZmFsc2UgLyogcmVhZCBhcyByYXcgKi8pO1xuXHRcdH07XG5cdFx0YXBpLmdldEpTT04gPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gZ2V0KGtleSwgdHJ1ZSAvKiByZWFkIGFzIGpzb24gKi8pO1xuXHRcdH07XG5cdFx0YXBpLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcblx0XHRcdHNldChrZXksICcnLCBleHRlbmQoYXR0cmlidXRlcywge1xuXHRcdFx0XHRleHBpcmVzOiAtMVxuXHRcdFx0fSkpO1xuXHRcdH07XG5cblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS53aXRoQ29udmVydGVyID0gaW5pdDtcblxuXHRcdHJldHVybiBhcGk7XG5cdH1cblxuXHRyZXR1cm4gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG59KSk7Il0sImZpbGUiOiJtYWluLmpzIn0=
