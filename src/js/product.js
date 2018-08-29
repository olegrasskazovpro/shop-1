"use strict";

/**
 * Get all product's filters and send it to server (json)
 */
class FiltersHandle {
  constructor(f) {
    this.filters = {
      catItem: null, // string
      category: null, // 'all' or string
      brand: null, // 'all' or string
      designer: null, // 'all' or string
      size: [0], // [] or [a, (...)]
      price: [0], // [a, b]
    };
    this.callback = f;
  }

  init() {
    console.log(this.callback);
    this.filters.catItem = this.getCatItem();
    this.filters.category = this.getCategory();
    this.filters.brand = this.getBrand();
    this.filters.designer = this.getDesigner();
    this.getSize();
    this.filters.price = this.getPrice();
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

  postFilters(data) {
    // console.log(filters);
    $.ajax({
      url: 'http://localhost:3000/filters',
      method: 'POST',
      dataType: 'json',
      data: data,
      success: () => {
        console.log('Фильтры переданы на сервер');
        this.callback.getFilters();
      },
      error: () => {
        console.log('Ошибка передачи фильтров');
      }
    })
  }
}

class ServerFilterProducts {
  constructor() {
    this.filters = {}
  }

  getFilters() {
    $.ajax({
      url: 'http://localhost:3000/filters',
      method: 'GET',
      dataType: 'json',
      success: data => {
        this.filters = data;
      },
      error: () => {
        console.log('Ошибка получения фильтров');
      }
    })
  }
}

(function ($) {
  $(function () {
    let filterProducts = new ServerFilterProducts();
    let filtersHandle = new FiltersHandle( filterProducts );

    filtersHandle.initPriceSlider(0, 1000, 1);
    filtersHandle.init();

  })
})(jQuery);