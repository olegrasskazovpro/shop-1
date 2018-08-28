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

class PriceSliderInit {
  constructor(min, max, step) {
    this.min = min;
    this.max = max;
    this.step = step;
  }

  init() {
    this.initPriceSlider();
  }

  /**
   * Setting up price-range slider
   */
  initPriceSlider() {
    $('.price-range__slider').slider({
      range: true,
      values: [(this.max * 0.05), (this.max * 0.4)],
      min: this.min,
      max: this.max,
      step: this.step,
      slide: () => {
        this.showPriceRangeValues();
      },
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
}

// class SizeHandler {
//   constructor(){
//     this.sizes = []
//   }
//
//   init() {
//     $('.size-checkbox').click(function () {
//       this.sizes = []; // clear sizer Arr
//       this.classList.toggle('checked'); // if Checked set class 'checked' and back
//       for (let i = 0; i < $('.checked').length; i++) {
//         console.log($('.size-checkbox')[i]);
//         this.sizes.push($('.checked')[i].dataset.name);
//       }
//       console.log(this.sizes);
//     })
//   }
// }

class GetFilters {
  constructor () {
    this.catItem = null;
    this.category = null;
    this.brand = null;
    this.designer = null;
    this.size = [];
    this.priceMin = 10;
    this.priceMax = 200;
  }

  init(){
    this.catItem = this.getCatItem();
    this.category = this.getCategory();
    this.brand = this.getBrand();
    this.designer = this.getDesigner();
    this.getSize();
    console.log(this.size);
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
      let sizes = []; // clear size Arr
      this.classList.toggle('checked'); // if Checked set class 'checked' and back
      for (let i = 0; i < $('.checked').length; i++) {
        sizes.push($('.checked')[i].dataset.name);
      }
      that.size = sizes;
      console.log(that);
    });
  }
}

/*class ShowProducts {
  constructor (gender, category, brand, designer, size, priceMin, priceMax) {
    this.gender = gender;
    this.category = category;
    this.brand = brand;
    this.designer = designer;
    this.size = size;
    this.priceMin = priceMin;
    this.priceMax = priceMax;
  }

  getFilters() {

  }
}*/

(function ($) {
  $(function () {
    let init = new PriceSliderInit(0, 1000, 1);
    init.init();
    // let sizeHandler = new SizeHandler();
    // sizeHandler.init();
    let getFilters = new GetFilters();
    getFilters.init();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5jbGFzcyBTZXRBY3RpdmVMaW5rcyB7XG4gIGNvbnN0cnVjdG9yICgpIHtcblxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBjbGFzcz1cImFjdGl2ZVwiIHRvIG5hdiBsaW5rcyBmb3IgcGFnZSBvcGVuZWRcbiAgICovXG4gIHNldEFjdGl2ZUNsYXNzKCkge1xuICAgIGlmICh0aGlzLmNoZWNrVXJsKCdwcm9kdWN0Lmh0bWwnKSl7XG4gICAgICAkKCcubWVudSBhJykucmVtb3ZlQXR0cignY2xhc3MnKTtcbiAgICAgICQoJy5tZW51PmxpIGFbaHJlZj1cInByb2R1Y3QuaHRtbFwiXScpLmFkZENsYXNzKCdtZW51LWFjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EtbGlzdCBhOmZpcnN0JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJCgnLm1lZ2EgYTpmaXJzdCcpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICB9XG4gICAgaWYodGhpcy5jaGVja1VybCgnaW5kZXguaHRtbCcpKXtcbiAgICAgICQoJy5tZW51PmxpIGFbaHJlZj1cImluZGV4Lmh0bWxcIl0nKS5hZGRDbGFzcygnbWVudS1hY3RpdmUnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgcGFnZSBVUkwgY29udGFpbnMgc29tZSBzdHJpbmdcbiAgICogQHBhcmFtIHN0cmluZyB1cmwgLSByZWdFeHAgY29uZGl0aW9uXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIFVSTCBjb250YWlucyByZWdFeHBcbiAgICovXG4gIGNoZWNrVXJsKHVybCkge1xuICAgIGxldCBjaGVja1VybCA9IG5ldyBSZWdFeHAodXJsKTtcbiAgICByZXR1cm4gY2hlY2tVcmwudGVzdChkb2N1bWVudC5sb2NhdGlvbi5ocmVmKVxuICB9XG59XG5cbihmdW5jdGlvbiAoJCkge1xuICAkKGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgcGFnZUluaXQgPSBuZXcgU2V0QWN0aXZlTGlua3MoKTtcbiAgICBwYWdlSW5pdC5zZXRBY3RpdmVDbGFzcygpO1xuXG4gICAgJCgnLmpjYXJvdXNlbCcpLmpjYXJvdXNlbCh7XG4gICAgICB3cmFwOiAnY2lyY3VsYXInXG4gICAgfSk7XG4gICAgJCgnLmpjYXJvdXNlbC1wcmV2JykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAkKCcuamNhcm91c2VsJykuamNhcm91c2VsKCdzY3JvbGwnLCAnLT0xJyk7XG4gICAgfSk7XG5cbiAgICAkKCcuamNhcm91c2VsLW5leHQnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICQoJy5qY2Fyb3VzZWwnKS5qY2Fyb3VzZWwoJ3Njcm9sbCcsICcrPTEnKTtcbiAgICB9KTtcbiAgfSlcbn0pKGpRdWVyeSk7XG5cblwidXNlIHN0cmljdFwiO1xuXG5jbGFzcyBQcmljZVNsaWRlckluaXQge1xuICBjb25zdHJ1Y3RvcihtaW4sIG1heCwgc3RlcCkge1xuICAgIHRoaXMubWluID0gbWluO1xuICAgIHRoaXMubWF4ID0gbWF4O1xuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMuaW5pdFByaWNlU2xpZGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0dGluZyB1cCBwcmljZS1yYW5nZSBzbGlkZXJcbiAgICovXG4gIGluaXRQcmljZVNsaWRlcigpIHtcbiAgICAkKCcucHJpY2UtcmFuZ2VfX3NsaWRlcicpLnNsaWRlcih7XG4gICAgICByYW5nZTogdHJ1ZSxcbiAgICAgIHZhbHVlczogWyh0aGlzLm1heCAqIDAuMDUpLCAodGhpcy5tYXggKiAwLjQpXSxcbiAgICAgIG1pbjogdGhpcy5taW4sXG4gICAgICBtYXg6IHRoaXMubWF4LFxuICAgICAgc3RlcDogdGhpcy5zdGVwLFxuICAgICAgc2xpZGU6ICgpID0+IHtcbiAgICAgICAgdGhpcy5zaG93UHJpY2VSYW5nZVZhbHVlcygpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICB0aGlzLnNob3dQcmljZVJhbmdlVmFsdWVzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2hvdy9VcGRhdGUgbWluIGFuZCBtYXggcHJpY2UgcmFuZ2UgdmFsdWVzXG4gICAqL1xuICBzaG93UHJpY2VSYW5nZVZhbHVlcygpIHtcbiAgICAgICQoJyNwcmljZS1taW4nKS50ZXh0KCQoJy5wcmljZS1yYW5nZV9fc2xpZGVyJykuc2xpZGVyKCd2YWx1ZXMnKVswXSk7XG4gICAgICAkKCcjcHJpY2UtbWF4JykudGV4dCgkKCcucHJpY2UtcmFuZ2VfX3NsaWRlcicpLnNsaWRlcigndmFsdWVzJylbMV0pO1xuICAgIH1cbn1cblxuLy8gY2xhc3MgU2l6ZUhhbmRsZXIge1xuLy8gICBjb25zdHJ1Y3Rvcigpe1xuLy8gICAgIHRoaXMuc2l6ZXMgPSBbXVxuLy8gICB9XG4vL1xuLy8gICBpbml0KCkge1xuLy8gICAgICQoJy5zaXplLWNoZWNrYm94JykuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICAgICAgdGhpcy5zaXplcyA9IFtdOyAvLyBjbGVhciBzaXplciBBcnJcbi8vICAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnY2hlY2tlZCcpOyAvLyBpZiBDaGVja2VkIHNldCBjbGFzcyAnY2hlY2tlZCcgYW5kIGJhY2tcbi8vICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgJCgnLmNoZWNrZWQnKS5sZW5ndGg7IGkrKykge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygkKCcuc2l6ZS1jaGVja2JveCcpW2ldKTtcbi8vICAgICAgICAgdGhpcy5zaXplcy5wdXNoKCQoJy5jaGVja2VkJylbaV0uZGF0YXNldC5uYW1lKTtcbi8vICAgICAgIH1cbi8vICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2l6ZXMpO1xuLy8gICAgIH0pXG4vLyAgIH1cbi8vIH1cblxuY2xhc3MgR2V0RmlsdGVycyB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLmNhdEl0ZW0gPSBudWxsO1xuICAgIHRoaXMuY2F0ZWdvcnkgPSBudWxsO1xuICAgIHRoaXMuYnJhbmQgPSBudWxsO1xuICAgIHRoaXMuZGVzaWduZXIgPSBudWxsO1xuICAgIHRoaXMuc2l6ZSA9IFtdO1xuICAgIHRoaXMucHJpY2VNaW4gPSAxMDtcbiAgICB0aGlzLnByaWNlTWF4ID0gMjAwO1xuICB9XG5cbiAgaW5pdCgpe1xuICAgIHRoaXMuY2F0SXRlbSA9IHRoaXMuZ2V0Q2F0SXRlbSgpO1xuICAgIHRoaXMuY2F0ZWdvcnkgPSB0aGlzLmdldENhdGVnb3J5KCk7XG4gICAgdGhpcy5icmFuZCA9IHRoaXMuZ2V0QnJhbmQoKTtcbiAgICB0aGlzLmRlc2lnbmVyID0gdGhpcy5nZXREZXNpZ25lcigpO1xuICAgIHRoaXMuZ2V0U2l6ZSgpO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuc2l6ZSk7XG4gIH1cbiAgXG4gIGdldENhdEl0ZW0oKSB7XG4gICAgcmV0dXJuICQoJy5tZW51LWFjdGl2ZScpLnRleHQoKVxuICB9XG5cbiAgZ2V0Q2F0ZWdvcnkoKSB7XG4gICAgaWYgKCQoJy5tZW51IC5hY3RpdmUnKVswXSkge1xuICAgICAgcmV0dXJuICQoJy5tZW51IC5hY3RpdmUnKS50ZXh0KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdhbGwnXG4gICAgfVxuICB9XG5cbiAgZ2V0QnJhbmQoKSB7XG4gICAgaWYgKCQoJyNicmFuZCAuYWN0aXZlJylbMF0pIHtcbiAgICAgIGNvbnNvbGUubG9nKCQoJyNicmFuZCAuYWN0aXZlJykudGV4dCgpKTtcbiAgICAgIHJldHVybiAkKCcjYnJhbmQgLmFjdGl2ZScpLnRleHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ2FsbCdcbiAgICB9XG4gIH1cblxuICBnZXREZXNpZ25lcigpIHtcbiAgICBpZiAoJCgnI2Rlc2lnbmVyIC5hY3RpdmUnKVswXSkge1xuICAgICAgcmV0dXJuICQoJyNkZXNpZ25lciAuYWN0aXZlJykudGV4dCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnYWxsJ1xuICAgIH1cbiAgfVxuICBcbiAgZ2V0U2l6ZSgpIHtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgLy8gc2V0IHVwZGF0ZSBzaXplcyBBcnIgZm9yIGV2ZXJ5IHNpemUgY2hlY2tib3ggY2xpY2tcbiAgICAkKCcuc2l6ZS1jaGVja2JveCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCBzaXplcyA9IFtdOyAvLyBjbGVhciBzaXplIEFyclxuICAgICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdjaGVja2VkJyk7IC8vIGlmIENoZWNrZWQgc2V0IGNsYXNzICdjaGVja2VkJyBhbmQgYmFja1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAkKCcuY2hlY2tlZCcpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNpemVzLnB1c2goJCgnLmNoZWNrZWQnKVtpXS5kYXRhc2V0Lm5hbWUpO1xuICAgICAgfVxuICAgICAgdGhhdC5zaXplID0gc2l6ZXM7XG4gICAgICBjb25zb2xlLmxvZyh0aGF0KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKmNsYXNzIFNob3dQcm9kdWN0cyB7XG4gIGNvbnN0cnVjdG9yIChnZW5kZXIsIGNhdGVnb3J5LCBicmFuZCwgZGVzaWduZXIsIHNpemUsIHByaWNlTWluLCBwcmljZU1heCkge1xuICAgIHRoaXMuZ2VuZGVyID0gZ2VuZGVyO1xuICAgIHRoaXMuY2F0ZWdvcnkgPSBjYXRlZ29yeTtcbiAgICB0aGlzLmJyYW5kID0gYnJhbmQ7XG4gICAgdGhpcy5kZXNpZ25lciA9IGRlc2lnbmVyO1xuICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgdGhpcy5wcmljZU1pbiA9IHByaWNlTWluO1xuICAgIHRoaXMucHJpY2VNYXggPSBwcmljZU1heDtcbiAgfVxuXG4gIGdldEZpbHRlcnMoKSB7XG5cbiAgfVxufSovXG5cbihmdW5jdGlvbiAoJCkge1xuICAkKGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgaW5pdCA9IG5ldyBQcmljZVNsaWRlckluaXQoMCwgMTAwMCwgMSk7XG4gICAgaW5pdC5pbml0KCk7XG4gICAgLy8gbGV0IHNpemVIYW5kbGVyID0gbmV3IFNpemVIYW5kbGVyKCk7XG4gICAgLy8gc2l6ZUhhbmRsZXIuaW5pdCgpO1xuICAgIGxldCBnZXRGaWx0ZXJzID0gbmV3IEdldEZpbHRlcnMoKTtcbiAgICBnZXRGaWx0ZXJzLmluaXQoKTtcbiAgfSlcbn0pKGpRdWVyeSk7XG5cblwidXNlIHN0cmljdFwiO1xuXG4vKiEgakNhcm91c2VsIC0gdjAuMy44IC0gMjAxOC0wNS0zMVxuKiBodHRwOi8vc29yZ2FsbGEuY29tL2pjYXJvdXNlbC9cbiogQ29weXJpZ2h0IChjKSAyMDA2LTIwMTggSmFuIFNvcmdhbGxhOyBMaWNlbnNlZCBNSVQgKi9cbihmdW5jdGlvbigkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgakNhcm91c2VsID0gJC5qQ2Fyb3VzZWwgPSB7fTtcblxuICBqQ2Fyb3VzZWwudmVyc2lvbiA9ICcwLjMuOCc7XG5cbiAgdmFyIHJSZWxhdGl2ZVRhcmdldCA9IC9eKFsrXFwtXT0pPyguKykkLztcblxuICBqQ2Fyb3VzZWwucGFyc2VUYXJnZXQgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICB2YXIgcmVsYXRpdmUgPSBmYWxzZSxcbiAgICAgIHBhcnRzICAgID0gdHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgP1xuICAgICAgICByUmVsYXRpdmVUYXJnZXQuZXhlYyh0YXJnZXQpIDpcbiAgICAgICAgbnVsbDtcblxuICAgIGlmIChwYXJ0cykge1xuICAgICAgdGFyZ2V0ID0gcGFyc2VJbnQocGFydHNbMl0sIDEwKSB8fCAwO1xuXG4gICAgICBpZiAocGFydHNbMV0pIHtcbiAgICAgICAgcmVsYXRpdmUgPSB0cnVlO1xuICAgICAgICBpZiAocGFydHNbMV0gPT09ICctPScpIHtcbiAgICAgICAgICB0YXJnZXQgKj0gLTE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnKSB7XG4gICAgICB0YXJnZXQgPSBwYXJzZUludCh0YXJnZXQsIDEwKSB8fCAwO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgIHJlbGF0aXZlOiByZWxhdGl2ZVxuICAgIH07XG4gIH07XG5cbiAgakNhcm91c2VsLmRldGVjdENhcm91c2VsID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHZhciBjYXJvdXNlbDtcblxuICAgIHdoaWxlIChlbGVtZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgIGNhcm91c2VsID0gZWxlbWVudC5maWx0ZXIoJ1tkYXRhLWpjYXJvdXNlbF0nKTtcblxuICAgICAgaWYgKGNhcm91c2VsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGNhcm91c2VsO1xuICAgICAgfVxuXG4gICAgICBjYXJvdXNlbCA9IGVsZW1lbnQuZmluZCgnW2RhdGEtamNhcm91c2VsXScpO1xuXG4gICAgICBpZiAoY2Fyb3VzZWwubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gY2Fyb3VzZWw7XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudCgpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIGpDYXJvdXNlbC5iYXNlID0gZnVuY3Rpb24ocGx1Z2luTmFtZSkge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiAgakNhcm91c2VsLnZlcnNpb24sXG4gICAgICBfb3B0aW9uczogIHt9LFxuICAgICAgX2VsZW1lbnQ6ICBudWxsLFxuICAgICAgX2Nhcm91c2VsOiBudWxsLFxuICAgICAgX2luaXQ6ICAgICAkLm5vb3AsXG4gICAgICBfY3JlYXRlOiAgICQubm9vcCxcbiAgICAgIF9kZXN0cm95OiAgJC5ub29wLFxuICAgICAgX3JlbG9hZDogICAkLm5vb3AsXG4gICAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9lbGVtZW50XG4gICAgICAgICAgLmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUudG9Mb3dlckNhc2UoKSwgdHJ1ZSlcbiAgICAgICAgICAuZGF0YShwbHVnaW5OYW1lLCB0aGlzKTtcblxuICAgICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ2NyZWF0ZScpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcmVhdGUoKTtcblxuICAgICAgICB0aGlzLl90cmlnZ2VyKCdjcmVhdGVlbmQnKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGZhbHNlID09PSB0aGlzLl90cmlnZ2VyKCdkZXN0cm95JykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3koKTtcblxuICAgICAgICB0aGlzLl90cmlnZ2VyKCdkZXN0cm95ZW5kJyk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudFxuICAgICAgICAgIC5yZW1vdmVEYXRhKHBsdWdpbk5hbWUpXG4gICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUudG9Mb3dlckNhc2UoKSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgcmVsb2FkOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcigncmVsb2FkJykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgdGhpcy5vcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVsb2FkKCk7XG5cbiAgICAgICAgdGhpcy5fdHJpZ2dlcigncmVsb2FkZW5kJyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgZWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gJC5leHRlbmQoe30sIHRoaXMuX29wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5fb3B0aW9uc1trZXldID09PSAndW5kZWZpbmVkJyA/XG4gICAgICAgICAgICAgIG51bGwgOlxuICAgICAgICAgICAgICB0aGlzLl9vcHRpb25zW2tleV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fb3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLl9vcHRpb25zLCBrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgY2Fyb3VzZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2Nhcm91c2VsKSB7XG4gICAgICAgICAgdGhpcy5fY2Fyb3VzZWwgPSBqQ2Fyb3VzZWwuZGV0ZWN0Q2Fyb3VzZWwodGhpcy5vcHRpb25zKCdjYXJvdXNlbCcpIHx8IHRoaXMuX2VsZW1lbnQpO1xuXG4gICAgICAgICAgaWYgKCF0aGlzLl9jYXJvdXNlbCkge1xuICAgICAgICAgICAgJC5lcnJvcignQ291bGQgbm90IGRldGVjdCBjYXJvdXNlbCBmb3IgcGx1Z2luIFwiJyArIHBsdWdpbk5hbWUgKyAnXCInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fY2Fyb3VzZWw7XG4gICAgICB9LFxuICAgICAgX3RyaWdnZXI6IGZ1bmN0aW9uKHR5cGUsIGVsZW1lbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIGV2ZW50LFxuICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcblxuICAgICAgICBkYXRhID0gW3RoaXNdLmNvbmNhdChkYXRhIHx8IFtdKTtcblxuICAgICAgICAoZWxlbWVudCB8fCB0aGlzLl9lbGVtZW50KS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV2ZW50ID0gJC5FdmVudCgocGx1Z2luTmFtZSArICc6JyArIHR5cGUpLnRvTG93ZXJDYXNlKCkpO1xuXG4gICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKGV2ZW50LCBkYXRhKTtcblxuICAgICAgICAgIGlmIChldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgICAgICAgZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gIWRlZmF1bHRQcmV2ZW50ZWQ7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBqQ2Fyb3VzZWwucGx1Z2luID0gZnVuY3Rpb24ocGx1Z2luTmFtZSwgcGx1Z2luUHJvdG90eXBlKSB7XG4gICAgdmFyIFBsdWdpbiA9ICRbcGx1Z2luTmFtZV0gPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICB0aGlzLl9lbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgIHRoaXMub3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICB9O1xuXG4gICAgUGx1Z2luLmZuID0gUGx1Z2luLnByb3RvdHlwZSA9ICQuZXh0ZW5kKFxuICAgICAge30sXG4gICAgICBqQ2Fyb3VzZWwuYmFzZShwbHVnaW5OYW1lKSxcbiAgICAgIHBsdWdpblByb3RvdHlwZVxuICAgICk7XG5cbiAgICAkLmZuW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIGFyZ3MgICAgICAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgcmV0dXJuVmFsdWUgPSB0aGlzO1xuXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgaW5zdGFuY2UgPSAkKHRoaXMpLmRhdGEocGx1Z2luTmFtZSk7XG5cbiAgICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5lcnJvcihcbiAgICAgICAgICAgICAgJ0Nhbm5vdCBjYWxsIG1ldGhvZHMgb24gJyArIHBsdWdpbk5hbWUgKyAnIHByaW9yIHRvIGluaXRpYWxpemF0aW9uOyAnICtcbiAgICAgICAgICAgICAgJ2F0dGVtcHRlZCB0byBjYWxsIG1ldGhvZCBcIicgKyBvcHRpb25zICsgJ1wiJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoISQuaXNGdW5jdGlvbihpbnN0YW5jZVtvcHRpb25zXSkgfHwgb3B0aW9ucy5jaGFyQXQoMCkgPT09ICdfJykge1xuICAgICAgICAgICAgcmV0dXJuICQuZXJyb3IoXG4gICAgICAgICAgICAgICdObyBzdWNoIG1ldGhvZCBcIicgKyBvcHRpb25zICsgJ1wiIGZvciAnICsgcGx1Z2luTmFtZSArICcgaW5zdGFuY2UnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBtZXRob2RWYWx1ZSA9IGluc3RhbmNlW29wdGlvbnNdLmFwcGx5KGluc3RhbmNlLCBhcmdzKTtcblxuICAgICAgICAgIGlmIChtZXRob2RWYWx1ZSAhPT0gaW5zdGFuY2UgJiYgdHlwZW9mIG1ldGhvZFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBtZXRob2RWYWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBpbnN0YW5jZSA9ICQodGhpcykuZGF0YShwbHVnaW5OYW1lKTtcblxuICAgICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIFBsdWdpbikge1xuICAgICAgICAgICAgaW5zdGFuY2UucmVsb2FkKG9wdGlvbnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXcgUGx1Z2luKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFBsdWdpbjtcbiAgfTtcbn0oalF1ZXJ5KSk7XG5cbihmdW5jdGlvbigkLCB3aW5kb3cpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXG4gIHZhciB0b0Zsb2F0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsKSB8fCAwO1xuICB9O1xuXG4gICQuakNhcm91c2VsLnBsdWdpbignamNhcm91c2VsJywge1xuICAgIGFuaW1hdGluZzogICBmYWxzZSxcbiAgICB0YWlsOiAgICAgICAgMCxcbiAgICBpblRhaWw6ICAgICAgZmFsc2UsXG4gICAgcmVzaXplU3RhdGU6IG51bGwsXG4gICAgcmVzaXplVGltZXI6IG51bGwsXG4gICAgbHQ6ICAgICAgICAgIG51bGwsXG4gICAgdmVydGljYWw6ICAgIGZhbHNlLFxuICAgIHJ0bDogICAgICAgICBmYWxzZSxcbiAgICBjaXJjdWxhcjogICAgZmFsc2UsXG4gICAgdW5kZXJmbG93OiAgIGZhbHNlLFxuICAgIHJlbGF0aXZlOiAgICBmYWxzZSxcblxuICAgIF9vcHRpb25zOiB7XG4gICAgICBsaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudCgpLmNoaWxkcmVuKCkuZXEoMCk7XG4gICAgICB9LFxuICAgICAgaXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0KCkuY2hpbGRyZW4oKTtcbiAgICAgIH0sXG4gICAgICBhbmltYXRpb246ICAgNDAwLFxuICAgICAgdHJhbnNpdGlvbnM6IGZhbHNlLFxuICAgICAgd3JhcDogICAgICAgIG51bGwsXG4gICAgICB2ZXJ0aWNhbDogICAgbnVsbCxcbiAgICAgIHJ0bDogICAgICAgICBudWxsLFxuICAgICAgY2VudGVyOiAgICAgIGZhbHNlXG4gICAgfSxcblxuICAgIC8vIFByb3RlY3RlZCwgZG9uJ3QgYWNjZXNzIGRpcmVjdGx5XG4gICAgX2xpc3Q6ICAgICAgICAgbnVsbCxcbiAgICBfaXRlbXM6ICAgICAgICBudWxsLFxuICAgIF90YXJnZXQ6ICAgICAgICQoKSxcbiAgICBfZmlyc3Q6ICAgICAgICAkKCksXG4gICAgX2xhc3Q6ICAgICAgICAgJCgpLFxuICAgIF92aXNpYmxlOiAgICAgICQoKSxcbiAgICBfZnVsbHl2aXNpYmxlOiAkKCksXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBzZWxmLnJlc2l6ZVN0YXRlID0gJHdpbmRvdy53aWR0aCgpICsgJ3gnICsgJHdpbmRvdy5oZWlnaHQoKTtcblxuICAgICAgdGhpcy5vbldpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2VsZi5yZXNpemVUaW1lcikge1xuICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnJlc2l6ZVRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYucmVzaXplVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBjdXJyZW50UmVzaXplU3RhdGUgPSAkd2luZG93LndpZHRoKCkgKyAneCcgKyAkd2luZG93LmhlaWdodCgpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHdpbmRvdyBzaXplIGFjdHVhbGx5IGNoYW5nZWQuXG4gICAgICAgICAgLy8gaU9TIG1pZ2h0IHRyaWdnZXIgcmVzaXplIGV2ZW50cyBvbiBwYWdlIHNjcm9sbC5cbiAgICAgICAgICBpZiAoY3VycmVudFJlc2l6ZVN0YXRlID09PSBzZWxmLnJlc2l6ZVN0YXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5yZXNpemVTdGF0ZSA9IGN1cnJlbnRSZXNpemVTdGF0ZTtcbiAgICAgICAgICBzZWxmLnJlbG9hZCgpO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3JlbG9hZCgpO1xuXG4gICAgICAkd2luZG93Lm9uKCdyZXNpemUuamNhcm91c2VsJywgdGhpcy5vbldpbmRvd1Jlc2l6ZSk7XG4gICAgfSxcbiAgICBfZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAkd2luZG93Lm9mZigncmVzaXplLmpjYXJvdXNlbCcsIHRoaXMub25XaW5kb3dSZXNpemUpO1xuICAgIH0sXG4gICAgX3JlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnZlcnRpY2FsID0gdGhpcy5vcHRpb25zKCd2ZXJ0aWNhbCcpO1xuXG4gICAgICBpZiAodGhpcy52ZXJ0aWNhbCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudmVydGljYWwgPSB0b0Zsb2F0KHRoaXMubGlzdCgpLmhlaWdodCgpKSA+IHRvRmxvYXQodGhpcy5saXN0KCkud2lkdGgoKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucnRsID0gdGhpcy5vcHRpb25zKCdydGwnKTtcblxuICAgICAgaWYgKHRoaXMucnRsID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5ydGwgPSAoZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgIGlmICgoJycgKyBlbGVtZW50LmF0dHIoJ2RpcicpKS50b0xvd2VyQ2FzZSgpID09PSAncnRsJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgICBlbGVtZW50LnBhcmVudHMoJ1tkaXJdJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICgoL3J0bC9pKS50ZXN0KCQodGhpcykuYXR0cignZGlyJykpKSB7XG4gICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9KHRoaXMuX2VsZW1lbnQpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sdCA9IHRoaXMudmVydGljYWwgPyAndG9wJyA6ICdsZWZ0JztcblxuICAgICAgLy8gRW5zdXJlIGJlZm9yZSBjbG9zZXN0KCkgY2FsbFxuICAgICAgdGhpcy5yZWxhdGl2ZSA9IHRoaXMubGlzdCgpLmNzcygncG9zaXRpb24nKSA9PT0gJ3JlbGF0aXZlJztcblxuICAgICAgLy8gRm9yY2UgbGlzdCBhbmQgaXRlbXMgcmVsb2FkXG4gICAgICB0aGlzLl9saXN0ICA9IG51bGw7XG4gICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG5cbiAgICAgIHZhciBpdGVtID0gdGhpcy5pbmRleCh0aGlzLl90YXJnZXQpID49IDAgP1xuICAgICAgICB0aGlzLl90YXJnZXQgOlxuICAgICAgICB0aGlzLmNsb3Nlc3QoKTtcblxuICAgICAgLy8gX3ByZXBhcmUoKSBuZWVkcyB0aGlzIGhlcmVcbiAgICAgIHRoaXMuY2lyY3VsYXIgID0gdGhpcy5vcHRpb25zKCd3cmFwJykgPT09ICdjaXJjdWxhcic7XG4gICAgICB0aGlzLnVuZGVyZmxvdyA9IGZhbHNlO1xuXG4gICAgICB2YXIgcHJvcHMgPSB7J2xlZnQnOiAwLCAndG9wJzogMH07XG5cbiAgICAgIGlmIChpdGVtLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fcHJlcGFyZShpdGVtKTtcbiAgICAgICAgdGhpcy5saXN0KCkuZmluZCgnW2RhdGEtamNhcm91c2VsLWNsb25lXScpLnJlbW92ZSgpO1xuXG4gICAgICAgIC8vIEZvcmNlIGl0ZW1zIHJlbG9hZFxuICAgICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG5cbiAgICAgICAgdGhpcy51bmRlcmZsb3cgPSB0aGlzLl9mdWxseXZpc2libGUubGVuZ3RoID49IHRoaXMuaXRlbXMoKS5sZW5ndGg7XG4gICAgICAgIHRoaXMuY2lyY3VsYXIgID0gdGhpcy5jaXJjdWxhciAmJiAhdGhpcy51bmRlcmZsb3c7XG5cbiAgICAgICAgcHJvcHNbdGhpcy5sdF0gPSB0aGlzLl9wb3NpdGlvbihpdGVtKSArICdweCc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubW92ZShwcm9wcyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fbGlzdCA9PT0gbnVsbCkge1xuICAgICAgICB2YXIgb3B0aW9uID0gdGhpcy5vcHRpb25zKCdsaXN0Jyk7XG4gICAgICAgIHRoaXMuX2xpc3QgPSAkLmlzRnVuY3Rpb24ob3B0aW9uKSA/IG9wdGlvbi5jYWxsKHRoaXMpIDogdGhpcy5fZWxlbWVudC5maW5kKG9wdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9saXN0O1xuICAgIH0sXG4gICAgaXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX2l0ZW1zID09PSBudWxsKSB7XG4gICAgICAgIHZhciBvcHRpb24gPSB0aGlzLm9wdGlvbnMoJ2l0ZW1zJyk7XG4gICAgICAgIHRoaXMuX2l0ZW1zID0gKCQuaXNGdW5jdGlvbihvcHRpb24pID8gb3B0aW9uLmNhbGwodGhpcykgOiB0aGlzLmxpc3QoKS5maW5kKG9wdGlvbikpLm5vdCgnW2RhdGEtamNhcm91c2VsLWNsb25lXScpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5faXRlbXM7XG4gICAgfSxcbiAgICBpbmRleDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIHRoaXMuaXRlbXMoKS5pbmRleChpdGVtKTtcbiAgICB9LFxuICAgIGNsb3Nlc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgICAgPSB0aGlzLFxuICAgICAgICBwb3MgICAgID0gdGhpcy5saXN0KCkucG9zaXRpb24oKVt0aGlzLmx0XSxcbiAgICAgICAgY2xvc2VzdCA9ICQoKSwgLy8gRW5zdXJlIHdlJ3JlIHJldHVybmluZyBhIGpRdWVyeSBpbnN0YW5jZVxuICAgICAgICBzdG9wICAgID0gZmFsc2UsXG4gICAgICAgIGxyYiAgICAgPSB0aGlzLnZlcnRpY2FsID8gJ2JvdHRvbScgOiAodGhpcy5ydGwgJiYgIXRoaXMucmVsYXRpdmUgPyAnbGVmdCcgOiAncmlnaHQnKSxcbiAgICAgICAgd2lkdGg7XG5cbiAgICAgIGlmICh0aGlzLnJ0bCAmJiB0aGlzLnJlbGF0aXZlICYmICF0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIHBvcyArPSB0b0Zsb2F0KHRoaXMubGlzdCgpLndpZHRoKCkpIC0gdGhpcy5jbGlwcGluZygpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLml0ZW1zKCkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgY2xvc2VzdCA9ICQodGhpcyk7XG5cbiAgICAgICAgaWYgKHN0b3ApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGltID0gc2VsZi5kaW1lbnNpb24oY2xvc2VzdCk7XG5cbiAgICAgICAgcG9zICs9IGRpbTtcblxuICAgICAgICBpZiAocG9zID49IDApIHtcbiAgICAgICAgICB3aWR0aCA9IGRpbSAtIHRvRmxvYXQoY2xvc2VzdC5jc3MoJ21hcmdpbi0nICsgbHJiKSk7XG5cbiAgICAgICAgICBpZiAoKE1hdGguYWJzKHBvcykgLSBkaW0gKyAod2lkdGggLyAyKSkgPD0gMCkge1xuICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG5cbiAgICAgIHJldHVybiBjbG9zZXN0O1xuICAgIH0sXG4gICAgdGFyZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl90YXJnZXQ7XG4gICAgfSxcbiAgICBmaXJzdDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmlyc3Q7XG4gICAgfSxcbiAgICBsYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9sYXN0O1xuICAgIH0sXG4gICAgdmlzaWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmlzaWJsZTtcbiAgICB9LFxuICAgIGZ1bGx5dmlzaWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZnVsbHl2aXNpYmxlO1xuICAgIH0sXG4gICAgaGFzTmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ2hhc25leHQnKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHdyYXAgPSB0aGlzLm9wdGlvbnMoJ3dyYXAnKSxcbiAgICAgICAgZW5kID0gdGhpcy5pdGVtcygpLmxlbmd0aCAtIDEsXG4gICAgICAgIGNoZWNrID0gdGhpcy5vcHRpb25zKCdjZW50ZXInKSA/IHRoaXMuX3RhcmdldCA6IHRoaXMuX2xhc3Q7XG5cbiAgICAgIHJldHVybiBlbmQgPj0gMCAmJiAhdGhpcy51bmRlcmZsb3cgJiZcbiAgICAgICgod3JhcCAmJiB3cmFwICE9PSAnZmlyc3QnKSB8fFxuICAgICAgICAodGhpcy5pbmRleChjaGVjaykgPCBlbmQpIHx8XG4gICAgICAgICh0aGlzLnRhaWwgJiYgIXRoaXMuaW5UYWlsKSkgPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcbiAgICBoYXNQcmV2OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5fdHJpZ2dlcignaGFzcHJldicpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgd3JhcCA9IHRoaXMub3B0aW9ucygnd3JhcCcpO1xuXG4gICAgICByZXR1cm4gdGhpcy5pdGVtcygpLmxlbmd0aCA+IDAgJiYgIXRoaXMudW5kZXJmbG93ICYmXG4gICAgICAoKHdyYXAgJiYgd3JhcCAhPT0gJ2xhc3QnKSB8fFxuICAgICAgICAodGhpcy5pbmRleCh0aGlzLl9maXJzdCkgPiAwKSB8fFxuICAgICAgICAodGhpcy50YWlsICYmIHRoaXMuaW5UYWlsKSkgPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcbiAgICBjbGlwcGluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdG9GbG9hdCh0aGlzLl9lbGVtZW50Wydpbm5lcicgKyAodGhpcy52ZXJ0aWNhbCA/ICdIZWlnaHQnIDogJ1dpZHRoJyldKCkpO1xuICAgIH0sXG4gICAgZGltZW5zaW9uOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICByZXR1cm4gdG9GbG9hdChlbGVtZW50WydvdXRlcicgKyAodGhpcy52ZXJ0aWNhbCA/ICdIZWlnaHQnIDogJ1dpZHRoJyldKHRydWUpKTtcbiAgICB9LFxuICAgIHNjcm9sbDogZnVuY3Rpb24odGFyZ2V0LCBhbmltYXRlLCBjYWxsYmFjaykge1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ3Njcm9sbCcsIG51bGwsIFt0YXJnZXQsIGFuaW1hdGVdKSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgaWYgKCQuaXNGdW5jdGlvbihhbmltYXRlKSkge1xuICAgICAgICBjYWxsYmFjayA9IGFuaW1hdGU7XG4gICAgICAgIGFuaW1hdGUgID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBhcnNlZCA9ICQuakNhcm91c2VsLnBhcnNlVGFyZ2V0KHRhcmdldCk7XG5cbiAgICAgIGlmIChwYXJzZWQucmVsYXRpdmUpIHtcbiAgICAgICAgdmFyIGVuZCAgICA9IHRoaXMuaXRlbXMoKS5sZW5ndGggLSAxLFxuICAgICAgICAgIHNjcm9sbCA9IE1hdGguYWJzKHBhcnNlZC50YXJnZXQpLFxuICAgICAgICAgIHdyYXAgICA9IHRoaXMub3B0aW9ucygnd3JhcCcpLFxuICAgICAgICAgIGN1cnJlbnQsXG4gICAgICAgICAgZmlyc3QsXG4gICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgY3VycixcbiAgICAgICAgICBpc1Zpc2libGUsXG4gICAgICAgICAgcHJvcHMsXG4gICAgICAgICAgaTtcblxuICAgICAgICBpZiAocGFyc2VkLnRhcmdldCA+IDApIHtcbiAgICAgICAgICB2YXIgbGFzdCA9IHRoaXMuaW5kZXgodGhpcy5fbGFzdCk7XG5cbiAgICAgICAgICBpZiAobGFzdCA+PSBlbmQgJiYgdGhpcy50YWlsKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaW5UYWlsKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFRhaWwoYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHdyYXAgPT09ICdib3RoJyB8fCB3cmFwID09PSAnbGFzdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoMCwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudCA9IHRoaXMuaW5kZXgodGhpcy5fdGFyZ2V0KTtcblxuICAgICAgICAgICAgaWYgKCh0aGlzLnVuZGVyZmxvdyAmJiBjdXJyZW50ID09PSBlbmQgJiYgKHdyYXAgPT09ICdjaXJjdWxhcicgfHwgd3JhcCA9PT0gJ2JvdGgnIHx8IHdyYXAgPT09ICdsYXN0JykpIHx8XG4gICAgICAgICAgICAgICghdGhpcy51bmRlcmZsb3cgJiYgbGFzdCA9PT0gZW5kICYmICh3cmFwID09PSAnYm90aCcgfHwgd3JhcCA9PT0gJ2xhc3QnKSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKDAsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGluZGV4ID0gY3VycmVudCArIHNjcm9sbDtcblxuICAgICAgICAgICAgICBpZiAodGhpcy5jaXJjdWxhciAmJiBpbmRleCA+IGVuZCkge1xuICAgICAgICAgICAgICAgIGkgPSBlbmQ7XG4gICAgICAgICAgICAgICAgY3VyciA9IHRoaXMuaXRlbXMoKS5nZXQoLTEpO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkrKyA8IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmVxKDApO1xuICAgICAgICAgICAgICAgICAgaXNWaXNpYmxlID0gdGhpcy5fdmlzaWJsZS5pbmRleChjdXJyKSA+PSAwO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnIuYWZ0ZXIoY3Vyci5jbG9uZSh0cnVlKS5hdHRyKCdkYXRhLWpjYXJvdXNlbC1jbG9uZScsIHRydWUpKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdGhpcy5saXN0KCkuYXBwZW5kKGN1cnIpO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoIWlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBwcm9wc1t0aGlzLmx0XSA9IHRoaXMuZGltZW5zaW9uKGN1cnIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVCeShwcm9wcyk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIEZvcmNlIGl0ZW1zIHJlbG9hZFxuICAgICAgICAgICAgICAgICAgdGhpcy5faXRlbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbChjdXJyLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKE1hdGgubWluKGluZGV4LCBlbmQpLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuaW5UYWlsKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwoTWF0aC5tYXgoKHRoaXMuaW5kZXgodGhpcy5fZmlyc3QpIC0gc2Nyb2xsKSArIDEsIDApLCBhbmltYXRlLCBjYWxsYmFjayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpcnN0ICA9IHRoaXMuaW5kZXgodGhpcy5fZmlyc3QpO1xuICAgICAgICAgICAgY3VycmVudCA9IHRoaXMuaW5kZXgodGhpcy5fdGFyZ2V0KTtcbiAgICAgICAgICAgIHN0YXJ0ICA9IHRoaXMudW5kZXJmbG93ID8gY3VycmVudCA6IGZpcnN0O1xuICAgICAgICAgICAgaW5kZXggID0gc3RhcnQgLSBzY3JvbGw7XG5cbiAgICAgICAgICAgIGlmIChzdGFydCA8PSAwICYmICgodGhpcy51bmRlcmZsb3cgJiYgd3JhcCA9PT0gJ2NpcmN1bGFyJykgfHwgd3JhcCA9PT0gJ2JvdGgnIHx8IHdyYXAgPT09ICdmaXJzdCcpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3Njcm9sbChlbmQsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmNpcmN1bGFyICYmIGluZGV4IDwgMCkge1xuICAgICAgICAgICAgICAgIGkgICAgPSBpbmRleDtcbiAgICAgICAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmdldCgwKTtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChpKysgPCAwKSB7XG4gICAgICAgICAgICAgICAgICBjdXJyID0gdGhpcy5pdGVtcygpLmVxKC0xKTtcbiAgICAgICAgICAgICAgICAgIGlzVmlzaWJsZSA9IHRoaXMuX3Zpc2libGUuaW5kZXgoY3VycikgPj0gMDtcblxuICAgICAgICAgICAgICAgICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyLmFmdGVyKGN1cnIuY2xvbmUodHJ1ZSkuYXR0cignZGF0YS1qY2Fyb3VzZWwtY2xvbmUnLCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHRoaXMubGlzdCgpLnByZXBlbmQoY3Vycik7XG5cbiAgICAgICAgICAgICAgICAgIC8vIEZvcmNlIGl0ZW1zIHJlbG9hZFxuICAgICAgICAgICAgICAgICAgdGhpcy5faXRlbXMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICB2YXIgZGltID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG5cbiAgICAgICAgICAgICAgICAgIHByb3BzID0ge307XG4gICAgICAgICAgICAgICAgICBwcm9wc1t0aGlzLmx0XSA9IC1kaW07XG4gICAgICAgICAgICAgICAgICB0aGlzLm1vdmVCeShwcm9wcyk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwoY3VyciwgYW5pbWF0ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbChNYXRoLm1heChpbmRleCwgMCksIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsKHBhcnNlZC50YXJnZXQsIGFuaW1hdGUsIGNhbGxiYWNrKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdHJpZ2dlcignc2Nyb2xsZW5kJyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbW92ZUJ5OiBmdW5jdGlvbihwcm9wZXJ0aWVzLCBvcHRzKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmxpc3QoKS5wb3NpdGlvbigpLFxuICAgICAgICBtdWx0aXBsaWVyID0gMSxcbiAgICAgICAgY29ycmVjdGlvbiA9IDA7XG5cbiAgICAgIGlmICh0aGlzLnJ0bCAmJiAhdGhpcy52ZXJ0aWNhbCkge1xuICAgICAgICBtdWx0aXBsaWVyID0gLTE7XG5cbiAgICAgICAgaWYgKHRoaXMucmVsYXRpdmUpIHtcbiAgICAgICAgICBjb3JyZWN0aW9uID0gdG9GbG9hdCh0aGlzLmxpc3QoKS53aWR0aCgpKSAtIHRoaXMuY2xpcHBpbmcoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocHJvcGVydGllcy5sZWZ0KSB7XG4gICAgICAgIHByb3BlcnRpZXMubGVmdCA9ICh0b0Zsb2F0KHBvc2l0aW9uLmxlZnQpICsgY29ycmVjdGlvbiArIHRvRmxvYXQocHJvcGVydGllcy5sZWZ0KSAqIG11bHRpcGxpZXIpICsgJ3B4JztcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BlcnRpZXMudG9wKSB7XG4gICAgICAgIHByb3BlcnRpZXMudG9wID0gKHRvRmxvYXQocG9zaXRpb24udG9wKSArIGNvcnJlY3Rpb24gKyB0b0Zsb2F0KHByb3BlcnRpZXMudG9wKSAqIG11bHRpcGxpZXIpICsgJ3B4JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMubW92ZShwcm9wZXJ0aWVzLCBvcHRzKTtcbiAgICB9LFxuICAgIG1vdmU6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIG9wdHMpIHtcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gICAgICB2YXIgb3B0aW9uICAgICAgID0gdGhpcy5vcHRpb25zKCd0cmFuc2l0aW9ucycpLFxuICAgICAgICB0cmFuc2l0aW9ucyAgPSAhIW9wdGlvbixcbiAgICAgICAgdHJhbnNmb3JtcyAgID0gISFvcHRpb24udHJhbnNmb3JtcyxcbiAgICAgICAgdHJhbnNmb3JtczNkID0gISFvcHRpb24udHJhbnNmb3JtczNkLFxuICAgICAgICBkdXJhdGlvbiAgICAgPSBvcHRzLmR1cmF0aW9uIHx8IDAsXG4gICAgICAgIGxpc3QgICAgICAgICA9IHRoaXMubGlzdCgpO1xuXG4gICAgICBpZiAoIXRyYW5zaXRpb25zICYmIGR1cmF0aW9uID4gMCkge1xuICAgICAgICBsaXN0LmFuaW1hdGUocHJvcGVydGllcywgb3B0cyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbXBsZXRlID0gb3B0cy5jb21wbGV0ZSB8fCAkLm5vb3AsXG4gICAgICAgIGNzcyA9IHt9O1xuXG4gICAgICBpZiAodHJhbnNpdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhY2t1cCA9IHtcbiAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogbGlzdC5jc3MoJ3RyYW5zaXRpb25EdXJhdGlvbicpLFxuICAgICAgICAgICAgdHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBsaXN0LmNzcygndHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uJyksXG4gICAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydHk6IGxpc3QuY3NzKCd0cmFuc2l0aW9uUHJvcGVydHknKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb2xkQ29tcGxldGUgPSBjb21wbGV0ZTtcblxuICAgICAgICBjb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQodGhpcykuY3NzKGJhY2t1cCk7XG4gICAgICAgICAgb2xkQ29tcGxldGUuY2FsbCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgY3NzID0ge1xuICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogKGR1cmF0aW9uID4gMCA/IGR1cmF0aW9uIC8gMTAwMCA6IDApICsgJ3MnLFxuICAgICAgICAgIHRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogb3B0aW9uLmVhc2luZyB8fCBvcHRzLmVhc2luZyxcbiAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydHk6IGR1cmF0aW9uID4gMCA/IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm1zIHx8IHRyYW5zZm9ybXMzZCkge1xuICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRvIHVzZSAnYWxsJyBiZWNhdXNlIGpRdWVyeSBkb2Vzbid0IHByZWZpeFxuICAgICAgICAgICAgICAvLyBjc3MgdmFsdWVzLCBsaWtlIHRyYW5zaXRpb24tcHJvcGVydHk6IHRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgcmV0dXJuICdhbGwnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydGllcy5sZWZ0ID8gJ2xlZnQnIDogJ3RvcCc7XG4gICAgICAgICAgfSkoKSA6ICdub25lJyxcbiAgICAgICAgICB0cmFuc2Zvcm06ICdub25lJ1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZiAodHJhbnNmb3JtczNkKSB7XG4gICAgICAgIGNzcy50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIChwcm9wZXJ0aWVzLmxlZnQgfHwgMCkgKyAnLCcgKyAocHJvcGVydGllcy50b3AgfHwgMCkgKyAnLDApJztcbiAgICAgIH0gZWxzZSBpZiAodHJhbnNmb3Jtcykge1xuICAgICAgICBjc3MudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKHByb3BlcnRpZXMubGVmdCB8fCAwKSArICcsJyArIChwcm9wZXJ0aWVzLnRvcCB8fCAwKSArICcpJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQuZXh0ZW5kKGNzcywgcHJvcGVydGllcyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0cmFuc2l0aW9ucyAmJiBkdXJhdGlvbiA+IDApIHtcbiAgICAgICAgbGlzdC5vbmUoJ3RyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCBNU1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSk7XG4gICAgICB9XG5cbiAgICAgIGxpc3QuY3NzKGNzcyk7XG5cbiAgICAgIGlmIChkdXJhdGlvbiA8PSAwKSB7XG4gICAgICAgIGxpc3QuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb21wbGV0ZS5jYWxsKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9zY3JvbGw6IGZ1bmN0aW9uKGl0ZW0sIGFuaW1hdGUsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAodGhpcy5hbmltYXRpbmcpIHtcbiAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZW0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgIGl0ZW0gPSB0aGlzLml0ZW1zKCkuZXEoaXRlbSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtLmpxdWVyeSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaXRlbSA9ICQoaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5UYWlsID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuX3ByZXBhcmUoaXRlbSk7XG5cbiAgICAgIHZhciBwb3MgICAgID0gdGhpcy5fcG9zaXRpb24oaXRlbSksXG4gICAgICAgIGN1cnJQb3MgPSB0b0Zsb2F0KHRoaXMubGlzdCgpLnBvc2l0aW9uKClbdGhpcy5sdF0pO1xuXG4gICAgICBpZiAocG9zID09PSBjdXJyUG9zKSB7XG4gICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByb3BlcnRpZXNbdGhpcy5sdF0gPSBwb3MgKyAncHgnO1xuXG4gICAgICB0aGlzLl9hbmltYXRlKHByb3BlcnRpZXMsIGFuaW1hdGUsIGNhbGxiYWNrKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfc2Nyb2xsVGFpbDogZnVuY3Rpb24oYW5pbWF0ZSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGluZyB8fCAhdGhpcy50YWlsKSB7XG4gICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIHBvcyA9IHRoaXMubGlzdCgpLnBvc2l0aW9uKClbdGhpcy5sdF07XG5cbiAgICAgIGlmICh0aGlzLnJ0bCAmJiB0aGlzLnJlbGF0aXZlICYmICF0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIHBvcyArPSB0b0Zsb2F0KHRoaXMubGlzdCgpLndpZHRoKCkpIC0gdGhpcy5jbGlwcGluZygpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5ydGwgJiYgIXRoaXMudmVydGljYWwpIHtcbiAgICAgICAgcG9zICs9IHRoaXMudGFpbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvcyAtPSB0aGlzLnRhaWw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5UYWlsID0gdHJ1ZTtcblxuICAgICAgdmFyIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByb3BlcnRpZXNbdGhpcy5sdF0gPSBwb3MgKyAncHgnO1xuXG4gICAgICB0aGlzLl91cGRhdGUoe1xuICAgICAgICB0YXJnZXQ6ICAgICAgIHRoaXMuX3RhcmdldC5uZXh0KCksXG4gICAgICAgIGZ1bGx5dmlzaWJsZTogdGhpcy5fZnVsbHl2aXNpYmxlLnNsaWNlKDEpLmFkZCh0aGlzLl92aXNpYmxlLmxhc3QoKSlcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9hbmltYXRlKHByb3BlcnRpZXMsIGFuaW1hdGUsIGNhbGxiYWNrKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfYW5pbWF0ZTogZnVuY3Rpb24ocHJvcGVydGllcywgYW5pbWF0ZSwgY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgJC5ub29wO1xuXG4gICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ2FuaW1hdGUnKSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgdmFyIGFuaW1hdGlvbiA9IHRoaXMub3B0aW9ucygnYW5pbWF0aW9uJyksXG4gICAgICAgIGNvbXBsZXRlICA9ICQucHJveHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5hbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgIHZhciBjID0gdGhpcy5saXN0KCkuZmluZCgnW2RhdGEtamNhcm91c2VsLWNsb25lXScpO1xuXG4gICAgICAgICAgaWYgKGMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYy5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbG9hZCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2FuaW1hdGVlbmQnKTtcblxuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB2YXIgb3B0cyA9IHR5cGVvZiBhbmltYXRpb24gPT09ICdvYmplY3QnID9cbiAgICAgICAgJC5leHRlbmQoe30sIGFuaW1hdGlvbikgOlxuICAgICAgICB7ZHVyYXRpb246IGFuaW1hdGlvbn0sXG4gICAgICAgIG9sZENvbXBsZXRlID0gb3B0cy5jb21wbGV0ZSB8fCAkLm5vb3A7XG5cbiAgICAgIGlmIChhbmltYXRlID09PSBmYWxzZSkge1xuICAgICAgICBvcHRzLmR1cmF0aW9uID0gMDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mICQuZnguc3BlZWRzW29wdHMuZHVyYXRpb25dICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBvcHRzLmR1cmF0aW9uID0gJC5meC5zcGVlZHNbb3B0cy5kdXJhdGlvbl07XG4gICAgICB9XG5cbiAgICAgIG9wdHMuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgb2xkQ29tcGxldGUuY2FsbCh0aGlzKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMubW92ZShwcm9wZXJ0aWVzLCBvcHRzKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfcHJlcGFyZTogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdmFyIGluZGV4ICA9IHRoaXMuaW5kZXgoaXRlbSksXG4gICAgICAgIGlkeCAgICA9IGluZGV4LFxuICAgICAgICB3aCAgICAgPSB0aGlzLmRpbWVuc2lvbihpdGVtKSxcbiAgICAgICAgY2xpcCAgID0gdGhpcy5jbGlwcGluZygpLFxuICAgICAgICBscmIgICAgPSB0aGlzLnZlcnRpY2FsID8gJ2JvdHRvbScgOiAodGhpcy5ydGwgPyAnbGVmdCcgIDogJ3JpZ2h0JyksXG4gICAgICAgIGNlbnRlciA9IHRoaXMub3B0aW9ucygnY2VudGVyJyksXG4gICAgICAgIHVwZGF0ZSA9IHtcbiAgICAgICAgICB0YXJnZXQ6ICAgICAgIGl0ZW0sXG4gICAgICAgICAgZmlyc3Q6ICAgICAgICBpdGVtLFxuICAgICAgICAgIGxhc3Q6ICAgICAgICAgaXRlbSxcbiAgICAgICAgICB2aXNpYmxlOiAgICAgIGl0ZW0sXG4gICAgICAgICAgZnVsbHl2aXNpYmxlOiB3aCA8PSBjbGlwID8gaXRlbSA6ICQoKVxuICAgICAgICB9LFxuICAgICAgICBjdXJyLFxuICAgICAgICBpc1Zpc2libGUsXG4gICAgICAgIG1hcmdpbixcbiAgICAgICAgZGltO1xuXG4gICAgICBpZiAoY2VudGVyKSB7XG4gICAgICAgIHdoIC89IDI7XG4gICAgICAgIGNsaXAgLz0gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKHdoIDwgY2xpcCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoKytpZHgpO1xuXG4gICAgICAgICAgaWYgKGN1cnIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2lyY3VsYXIpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoMCk7XG5cbiAgICAgICAgICAgIGlmIChpdGVtLmdldCgwKSA9PT0gY3Vyci5nZXQoMCkpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlzVmlzaWJsZSA9IHRoaXMuX3Zpc2libGUuaW5kZXgoY3VycikgPj0gMDtcblxuICAgICAgICAgICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICBjdXJyLmFmdGVyKGN1cnIuY2xvbmUodHJ1ZSkuYXR0cignZGF0YS1qY2Fyb3VzZWwtY2xvbmUnLCB0cnVlKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubGlzdCgpLmFwcGVuZChjdXJyKTtcblxuICAgICAgICAgICAgaWYgKCFpc1Zpc2libGUpIHtcbiAgICAgICAgICAgICAgdmFyIHByb3BzID0ge307XG4gICAgICAgICAgICAgIHByb3BzW3RoaXMubHRdID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG4gICAgICAgICAgICAgIHRoaXMubW92ZUJ5KHByb3BzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9yY2UgaXRlbXMgcmVsb2FkXG4gICAgICAgICAgICB0aGlzLl9pdGVtcyA9IG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGltID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG5cbiAgICAgICAgICBpZiAoZGltID09PSAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aCArPSBkaW07XG5cbiAgICAgICAgICB1cGRhdGUubGFzdCAgICA9IGN1cnI7XG4gICAgICAgICAgdXBkYXRlLnZpc2libGUgPSB1cGRhdGUudmlzaWJsZS5hZGQoY3Vycik7XG5cbiAgICAgICAgICAvLyBSZW1vdmUgcmlnaHQvYm90dG9tIG1hcmdpbiBmcm9tIHRvdGFsIHdpZHRoXG4gICAgICAgICAgbWFyZ2luID0gdG9GbG9hdChjdXJyLmNzcygnbWFyZ2luLScgKyBscmIpKTtcblxuICAgICAgICAgIGlmICgod2ggLSBtYXJnaW4pIDw9IGNsaXApIHtcbiAgICAgICAgICAgIHVwZGF0ZS5mdWxseXZpc2libGUgPSB1cGRhdGUuZnVsbHl2aXNpYmxlLmFkZChjdXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAod2ggPj0gY2xpcCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5jaXJjdWxhciAmJiAhY2VudGVyICYmIHdoIDwgY2xpcCkge1xuICAgICAgICBpZHggPSBpbmRleDtcblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGlmICgtLWlkeCA8IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGN1cnIgPSB0aGlzLml0ZW1zKCkuZXEoaWR4KTtcblxuICAgICAgICAgIGlmIChjdXJyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGltID0gdGhpcy5kaW1lbnNpb24oY3Vycik7XG5cbiAgICAgICAgICBpZiAoZGltID09PSAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aCArPSBkaW07XG5cbiAgICAgICAgICB1cGRhdGUuZmlyc3QgICA9IGN1cnI7XG4gICAgICAgICAgdXBkYXRlLnZpc2libGUgPSB1cGRhdGUudmlzaWJsZS5hZGQoY3Vycik7XG5cbiAgICAgICAgICAvLyBSZW1vdmUgcmlnaHQvYm90dG9tIG1hcmdpbiBmcm9tIHRvdGFsIHdpZHRoXG4gICAgICAgICAgbWFyZ2luID0gdG9GbG9hdChjdXJyLmNzcygnbWFyZ2luLScgKyBscmIpKTtcblxuICAgICAgICAgIGlmICgod2ggLSBtYXJnaW4pIDw9IGNsaXApIHtcbiAgICAgICAgICAgIHVwZGF0ZS5mdWxseXZpc2libGUgPSB1cGRhdGUuZnVsbHl2aXNpYmxlLmFkZChjdXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAod2ggPj0gY2xpcCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3VwZGF0ZSh1cGRhdGUpO1xuXG4gICAgICB0aGlzLnRhaWwgPSAwO1xuXG4gICAgICBpZiAoIWNlbnRlciAmJlxuICAgICAgICB0aGlzLm9wdGlvbnMoJ3dyYXAnKSAhPT0gJ2NpcmN1bGFyJyAmJlxuICAgICAgICB0aGlzLm9wdGlvbnMoJ3dyYXAnKSAhPT0gJ2N1c3RvbScgJiZcbiAgICAgICAgdGhpcy5pbmRleCh1cGRhdGUubGFzdCkgPT09ICh0aGlzLml0ZW1zKCkubGVuZ3RoIC0gMSkpIHtcblxuICAgICAgICAvLyBSZW1vdmUgcmlnaHQvYm90dG9tIG1hcmdpbiBmcm9tIHRvdGFsIHdpZHRoXG4gICAgICAgIHdoIC09IHRvRmxvYXQodXBkYXRlLmxhc3QuY3NzKCdtYXJnaW4tJyArIGxyYikpO1xuXG4gICAgICAgIGlmICh3aCA+IGNsaXApIHtcbiAgICAgICAgICB0aGlzLnRhaWwgPSB3aCAtIGNsaXA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBfcG9zaXRpb246IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHZhciBmaXJzdCAgPSB0aGlzLl9maXJzdCxcbiAgICAgICAgcG9zICAgID0gdG9GbG9hdChmaXJzdC5wb3NpdGlvbigpW3RoaXMubHRdKSxcbiAgICAgICAgY2VudGVyID0gdGhpcy5vcHRpb25zKCdjZW50ZXInKSxcbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gY2VudGVyID8gKHRoaXMuY2xpcHBpbmcoKSAvIDIpIC0gKHRoaXMuZGltZW5zaW9uKGZpcnN0KSAvIDIpIDogMDtcblxuICAgICAgaWYgKHRoaXMucnRsICYmICF0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbGF0aXZlKSB7XG4gICAgICAgICAgcG9zIC09IHRvRmxvYXQodGhpcy5saXN0KCkud2lkdGgoKSkgLSB0aGlzLmRpbWVuc2lvbihmaXJzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcG9zIC09IHRoaXMuY2xpcHBpbmcoKSAtIHRoaXMuZGltZW5zaW9uKGZpcnN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvcyArPSBjZW50ZXJPZmZzZXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3MgLT0gY2VudGVyT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICBpZiAoIWNlbnRlciAmJlxuICAgICAgICAodGhpcy5pbmRleChpdGVtKSA+IHRoaXMuaW5kZXgoZmlyc3QpIHx8IHRoaXMuaW5UYWlsKSAmJlxuICAgICAgICB0aGlzLnRhaWwpIHtcbiAgICAgICAgcG9zID0gdGhpcy5ydGwgJiYgIXRoaXMudmVydGljYWwgPyBwb3MgLSB0aGlzLnRhaWwgOiBwb3MgKyB0aGlzLnRhaWw7XG4gICAgICAgIHRoaXMuaW5UYWlsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW5UYWlsID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAtcG9zO1xuICAgIH0sXG4gICAgX3VwZGF0ZTogZnVuY3Rpb24odXBkYXRlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGN1cnJlbnQgPSB7XG4gICAgICAgICAgdGFyZ2V0OiAgICAgICB0aGlzLl90YXJnZXQsXG4gICAgICAgICAgZmlyc3Q6ICAgICAgICB0aGlzLl9maXJzdCxcbiAgICAgICAgICBsYXN0OiAgICAgICAgIHRoaXMuX2xhc3QsXG4gICAgICAgICAgdmlzaWJsZTogICAgICB0aGlzLl92aXNpYmxlLFxuICAgICAgICAgIGZ1bGx5dmlzaWJsZTogdGhpcy5fZnVsbHl2aXNpYmxlXG4gICAgICAgIH0sXG4gICAgICAgIGJhY2sgPSB0aGlzLmluZGV4KHVwZGF0ZS5maXJzdCB8fCBjdXJyZW50LmZpcnN0KSA8IHRoaXMuaW5kZXgoY3VycmVudC5maXJzdCksXG4gICAgICAgIGtleSxcbiAgICAgICAgZG9VcGRhdGUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICB2YXIgZWxJbiAgPSBbXSxcbiAgICAgICAgICAgIGVsT3V0ID0gW107XG5cbiAgICAgICAgICB1cGRhdGVba2V5XS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRba2V5XS5pbmRleCh0aGlzKSA8IDApIHtcbiAgICAgICAgICAgICAgZWxJbi5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY3VycmVudFtrZXldLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodXBkYXRlW2tleV0uaW5kZXgodGhpcykgPCAwKSB7XG4gICAgICAgICAgICAgIGVsT3V0LnB1c2godGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoYmFjaykge1xuICAgICAgICAgICAgZWxJbiA9IGVsSW4ucmV2ZXJzZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbE91dCA9IGVsT3V0LnJldmVyc2UoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl90cmlnZ2VyKGtleSArICdpbicsICQoZWxJbikpO1xuICAgICAgICAgIHNlbGYuX3RyaWdnZXIoa2V5ICsgJ291dCcsICQoZWxPdXQpKTtcblxuICAgICAgICAgIHNlbGZbJ18nICsga2V5XSA9IHVwZGF0ZVtrZXldO1xuICAgICAgICB9O1xuXG4gICAgICBmb3IgKGtleSBpbiB1cGRhdGUpIHtcbiAgICAgICAgZG9VcGRhdGUoa2V5KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9KTtcbn0oalF1ZXJ5LCB3aW5kb3cpKTsiXSwiZmlsZSI6Im1haW4uanMifQ==
