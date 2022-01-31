(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else if (typeof exports === "object") {
    factory(require("jquery"));
  } else {
    factory(root.jQuery || root.Zepto);
  }
})(this, function ($) {
  "use strict";

  let ashfak = function (slider, options) {
    let slides = slider.children(),
      orgNumSlides = slides.length,
      numSlides = orgNumSlides,
      width = slider.width(),
      nextSlide = 0,
      current = 0,
      inner,
      timer,
      running = false,
      defaults = {
        afterChange: function () {},
        afterSetup: function () {},
        animation: "slide",
        beforeChange: function () {},
        easing: "swing",
        interval: 5000,
        keyboard: true,
        nextLabel: "Next ",
        // pauseOnHover: true,
        prevLabel: "Previous ",
        reverse: false,
        showBullets: true,
        showControls: true,
        speed: 400,
        startSlide: 1,
      };

    options = $.extend(defaults, options);

    // Setup the slides
    if (orgNumSlides > 1) {
      slides.eq(0).clone().addClass("clone").appendTo(slider);
      slides
        .eq(numSlides - 1)
        .clone()
        .addClass("clone")
        .prependTo(slider);

      if (options.startSlide < orgNumSlides) {
        current = options.startSlide;
      }
    }

    slides = slider.children();
    numSlides = slides.length;

    // CSS setup
    slides.wrapAll('<div class="as-slide-inner"></div>').css("width", width);
    inner = slider.css("overflow", "hidden").find(".as-slide-inner");

    if (options.animation === "fade") {
      // Properties are quoted for consistency since "float" will trigger an error when the script is minified (if unquoted)
      slides
        .css({
          display: "none",
          left: 0,
          position: "absolute",
          top: 0,
        })
        .eq(current)
        .show();

      inner.css("width", width);
    } else {
      slides.css({
        float: "left",
        position: "relative",
      });

      inner.css({
        left: -current * width,
        width: numSlides * width,
      });
    }

    inner.css({
      float: "left",
      position: "relative",
    });

    // Add the arrows
    if (options.showControls && orgNumSlides > 1) {
      slider.prepend(
        '<a href="#" class="as-prev-arrow" title="LABEL"><i class="fas fa-arrow-left"></i></a>'.replace(
          /LABEL/g,
          options.prevLabel
        )
      );
      slider.append(
        '<a href="#" class="as-next-arrow" title="LABEL"><i class="fas fa-arrow-right"></i></a>'.replace(
          /LABEL/g,
          options.nextLabel
        )
      );

      slider.on("click.as", ".as-prev-arrow, .as-next-arrow", function (e) {
        e.preventDefault();

        if (running) {
          return;
        }

        if ($(this).hasClass("as-prev-arrow")) {
          prev();
        } else {
          next();
        }
      });
    }

    // Add navigation bullets
    if (options.showBullets && orgNumSlides > 1) {
      let i,
        active,
        out = '<div class="as-nav"></div>',
        nav = $(out);

      for (i = 1; i <= orgNumSlides; i++) {
        active = "";
        if (i === current) {
          active = ' class="as-active"';
        }

        nav.append('<a href="#"' + active + ">" + i + "</a>");
      }

      nav.on("click.as", "a", function (e) {
        let index = $(this).index();

        e.preventDefault();

        if ($(this).hasClass("as-active") || running) {
          return;
        }

        nav.find("a").removeClass("as-active").eq(index).addClass("as-active");

        goTo(index + 1);
      });

      slider.after(nav);
    }

    // if (options.pauseOnHover) {
    //   slider
    //     .on("mouseenter", function () {
    //       pause();
    //     })
    //     .on("mouseleave", function () {
    //       play();
    //     });
    // }

    // Enable autoplay
    tick();

    options.afterSetup.call(slider[0]);

    // Private methods
    // Animation complete callback
    function animationCallback() {
      current = nextSlide;

      if (nextSlide === 0) {
        current = orgNumSlides;

        if (options.animation !== "fade") {
          inner.css("left", -current * width);
        }
      } else if (nextSlide === numSlides - 1) {
        current = 1;

        if (options.animation !== "fade") {
          inner.css("left", -width);
        }
      }

      // Fix for Zepto hiding the slide
      if (options.animation === "fade") {
        slides.eq(current).show();
      }

      if (options.showBullets) {
        slider
          .next(".as-nav")
          .find("a")
          .removeClass("as-active")
          .eq(current - 1)
          .addClass("as-active");
      }

      running = false;

      options.afterChange.call(slider[0]);
    }

    // The main animation function
    function run() {
      if (running || orgNumSlides <= 1) {
        return;
      }

      running = true;

      options.beforeChange.call(slider[0]);

      if (options.animation === "fade") {
        slides
          .css("z-index", 1)
          .fadeOut(options.speed)
          .eq(nextSlide)
          .css("z-index", 2)
          .fadeIn(options.speed, animationCallback);
      } else {
        inner.animate(
          { left: -nextSlide * width },
          options.speed,
          options.easing,
          animationCallback
        );
      }

      tick();
    }

    // Set the autoplay timer
    function tick() {
      clearTimeout(timer);

      // Check if autoplay is enabled
      if (options.interval && orgNumSlides > 1) {
        timer = setTimeout(function () {
          if (options.reverse) {
            prev();
          } else {
            next();
          }
        }, options.interval);
      }
    }

    // Public methods
    function currentSlide() {
      return current;
    }

    function goTo(slide) {
      nextSlide = slide;

      run();
    }

    function next() {
      nextSlide = current + 1;

      run();
    }

    function pause() {
      clearTimeout(timer);
    }

    function play() {
      tick();
    }

    function prev() {
      nextSlide = current - 1;

      run();
    }

    return {
      currentSlide: currentSlide,
      goTo: goTo,
      next: next,
      pause: pause,
      play: play,
      prev: prev,
    };
  };

  $.fn.ashfak = function (options) {
    return this.each(function () {
      let slider = $(this),
        nothing = new ashfak(slider, options);
    });
  };
});
