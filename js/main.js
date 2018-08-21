"use strict";

class Slider {
  constructor () {

  }

  init() {

  }
}


(function ($) {
  $(function () {
    // let slider = new Slider();
    // slider.init();
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