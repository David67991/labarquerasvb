(function ($) {
  ("use strict");
  /*=================================
      JS Index Here
  ==================================*/
  /*
    01. On Load Function
    02. Preloader
    03. Mobile Menu Active
    04. Sticky fix
    05. Scroll To Top
    06. Set Background Image
    07. Hero Slider Active 
    08. Global Slider
    09. Ajax Contact Form
    10. Magnific Popup
    11. Filter
    12. Popup Sidemenu
    13. Search Box Popup
    14. Accordion Class Toggle
    15. Count Down
    16. Shape Mockup
    17. Range Slider
    18. Woocommerce Toggle
    19. Quantity Added
  */
  /*=================================
      JS Index End
  ==================================*/
  /*

  /*---------- 01. On Load Function ----------*/
  $(window).on("load", function () {
    $(".preloader").fadeOut();
  });

  /*---------- 02. Preloader ----------*/
  if ($(".preloader").length > 0) {
    $(".preloaderCls").each(function () {
      $(this).on("click", function (e) {
        e.preventDefault();
        $(".preloader").css("display", "none");
      });
    });
  }

  /*---------- 03. Mobile Menu Active ----------*/
  $.fn.vsmobilemenu = function (options) {
    var opt = $.extend({
        menuToggleBtn: ".vs-menu-toggle",
        bodyToggleClass: "vs-body-visible",
        subMenuClass: "vs-submenu",
        subMenuParent: "vs-item-has-children",
        subMenuParentToggle: "vs-active",
        meanExpandClass: "vs-mean-expand",
        appendElement: '<span class="vs-mean-expand"></span>',
        subMenuToggleClass: "vs-open",
        toggleSpeed: 400,
      },
      options
    );

    return this.each(function () {
      var menu = $(this); // Select menu

      // Menu Show & Hide
      function menuToggle() {
        menu.toggleClass(opt.bodyToggleClass);

        // collapse submenu on menu hide or show
        var subMenu = "." + opt.subMenuClass;
        $(subMenu).each(function () {
          if ($(this).hasClass(opt.subMenuToggleClass)) {
            $(this).removeClass(opt.subMenuToggleClass);
            $(this).css("display", "none");
            $(this).parent().removeClass(opt.subMenuParentToggle);
          }
        });
      }

      // Class Set Up for every submenu
      menu.find("li").each(function () {
        var submenu = $(this).find("ul");
        submenu.addClass(opt.subMenuClass);
        submenu.css("display", "none");
        submenu.parent().addClass(opt.subMenuParent);
        submenu.prev("a").append(opt.appendElement);
        submenu.next("a").append(opt.appendElement);
      });

      // Toggle Submenu
      function toggleDropDown($element) {
        if ($($element).next("ul").length > 0) {
          $($element).parent().toggleClass(opt.subMenuParentToggle);
          $($element).next("ul").slideToggle(opt.toggleSpeed);
          $($element).next("ul").toggleClass(opt.subMenuToggleClass);
        } else if ($($element).prev("ul").length > 0) {
          $($element).parent().toggleClass(opt.subMenuParentToggle);
          $($element).prev("ul").slideToggle(opt.toggleSpeed);
          $($element).prev("ul").toggleClass(opt.subMenuToggleClass);
        }
      }

      // Submenu toggle Button
      var expandToggler = "." + opt.meanExpandClass;
      $(expandToggler).each(function () {
        $(this).on("click", function (e) {
          e.preventDefault();
          toggleDropDown($(this).parent());
        });
      });

      // Menu Show & Hide On Toggle Btn click
      $(opt.menuToggleBtn).each(function () {
        $(this).on("click", function () {
          menuToggle();
        });
      });

      // Hide Menu On out side click
      menu.on("click", function (e) {
        e.stopPropagation();
        menuToggle();
      });

      // Stop Hide full menu on menu click
      menu.find("div").on("click", function (e) {
        e.stopPropagation();
      });
    });
  };

  $(".vs-menu-wrapper").vsmobilemenu();

  /*---------- 04. Sticky fix ----------*/
  var lastScrollTop = "";
  var scrollToTopBtn = ".scrollToTop";

  function stickyMenu($targetMenu, $toggleClass, $parentClass) {
    if (!$targetMenu.length) return;
    var st = $(window).scrollTop();
    var height = $targetMenu.outerHeight(true);
    var $parent = $targetMenu.parent();

    if (height) {
      $parent.css("min-height", height + "px");
    }

    $parent.addClass($parentClass);
    $targetMenu.addClass($toggleClass);
    lastScrollTop = st;
  }
  stickyMenu($(".sticky-active"), "active", "will-sticky");
  $(window).on("resize", function () {
    stickyMenu($(".sticky-active"), "active", "will-sticky");
  });
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 500) {
      $(scrollToTopBtn).addClass("show");
    } else {
      $(scrollToTopBtn).removeClass("show");
    }
  });

  /*---------- 05. Scroll To Top ----------*/
  $(scrollToTopBtn).each(function () {
    $(this).on("click", function (e) {
      e.preventDefault();
      $("html, body").animate({
          scrollTop: 0,
        },
        lastScrollTop / 3
      );
      return false;
    });
  });

  /*---------- 06. Set Background Image ----------*/
  if ($("[data-bg-src]").length > 0) {
    $("[data-bg-src]").each(function () {
      var src = $(this).attr("data-bg-src");
      $(this).css("background-image", "url(" + src + ")");
      $(this).removeAttr("data-bg-src").addClass("background-image");
    });
  }

  /*----------- 07. Hero Slider Active ----------*/
  $(".vs-hero-carousel").each(function () {
    var vsHslide = $(this);

    // Get Data From Dom
    function d(data) {
      return vsHslide.data(data);
    }

    vsHslide.layerSlider({
      globalBGColor: d('globalbgcolor') ? d('globalbgcolor'): false,
      allowRestartOnResize: true,
      maxRatio: d("maxratio") ? d("maxratio") : 1,
      type: d("slidertype") ? d("slidertype") : "responsive",
      pauseOnHover: d("pauseonhover") ? true : false,
      navPrevNext: d("navprevnext") ? true : false,
      hoverPrevNext: d("hoverprevnext") ? true : false,
      hoverBottomNav: d("hoverbottomnav") ? true : false,
      navStartStop: d("navstartstop") ? true : false,
      navButtons: d("navbuttons") ? true : false,
      loop: d("loop") === false ? false : true,
      autostart: d("autostart") ? true : false,
      height: d("height") ? d("height") : 1080,
      responsiveUnder: d("responsiveunder") ? d("responsiveunder") : 1220,
      layersContainer: d("container") ? d("container") : 1220,
      showCircleTimer: d("showcircletimer") ? true : false,
      skinsPath: "layerslider/skins/",
      thumbnailNavigation: d("thumbnailnavigation") === false ? false : true,
    });
  });

  /*----------- 08. Global Slider ----------*/
  $(".vs-carousel").each(function () {
    var asSlide = $(this);

    // Collect Data
    function d(data) {
      return asSlide.data(data);
    }

    // Custom Arrow Button
    var prevButton =
      '<button type="button" class="slick-prev"><i class="' +
      d("prev-arrow") +
      '"></i></button>',
      nextButton =
      '<button type="button" class="slick-next"><i class="' +
      d("next-arrow") +
      '"></i></button>';

    // Function For Custom Arrow Btn
    $("[data-slick-next]").each(function () {
      $(this).on("click", function (e) {
        e.preventDefault();
        $($(this).data("slick-next")).slick("slickNext");
      });
    });

    $("[data-slick-prev]").each(function () {
      $(this).on("click", function (e) {
        e.preventDefault();
        $($(this).data("slick-prev")).slick("slickPrev");
      });
    });

    // Check for arrow wrapper
    if (d("arrows") == true) {
      if (!asSlide.closest(".arrow-wrap").length) {
        asSlide.closest(".container").parent().addClass("arrow-wrap");
      }
    }

    asSlide.slick({
      dots: d("dots") ? true : false,
      fade: d("fade") ? true : false,
      arrows: d("arrows") ? true : false,
      speed: d("speed") ? d("speed") : 1000,
      asNavFor: d("asnavfor") ? d("asnavfor") : false,
      autoplay: d("autoplay") == false ? false : false,
      infinite: d("infinite") == false ? false : true,
      slidesToShow: d("slide-show") ? d("slide-show") : 1,
      adaptiveHeight: d("adaptive-height") ? true : false,
      centerMode: d("center-mode") ? true : false,
      autoplaySpeed: d("autoplay-speed") ? d("autoplay-speed") : 8000,
      centerPadding: d("center-padding") ? d("center-padding") : "0",
      focusOnSelect: d("focuson-select") == false ? false : true,
      pauseOnFocus: d("pauseon-focus") ? true : false,
      pauseOnHover: d("pauseon-hover") ? true : false,
      variableWidth: d("variable-width") ? true : false,
      vertical: d("vertical") ? true : false,
      verticalSwiping: d("vertical") ? true : false,
      prevArrow: d("prev-arrow") ?
        prevButton : '<button type="button" class="slick-prev"><i class="far fa-chevron-left"></i></button>',
      nextArrow: d("next-arrow") ?
        nextButton : '<button type="button" class="slick-next"><i class="far fa-chevron-right"></i></button>',
      rtl: $("html").attr("dir") == "rtl" ? true : false,
      responsive: [{
          breakpoint: 1600,
          settings: {
            arrows: d("xl-arrows") ? true : false,
            dots: d("xl-dots") ? true : false,
            slidesToShow: d("xl-slide-show") ?
              d("xl-slide-show") : d("slide-show"),
            centerMode: d("xl-center-mode") ? true : false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 1400,
          settings: {
            arrows: d("ml-arrows") ? true : false,
            dots: d("ml-dots") ? true : false,
            slidesToShow: d("ml-slide-show") ?
              d("ml-slide-show") : d("slide-show"),
            centerMode: d("ml-center-mode") ? true : false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 1200,
          settings: {
            arrows: d("lg-arrows") ? true : false,
            dots: d("lg-dots") ? true : false,
            slidesToShow: d("lg-slide-show") ?
              d("lg-slide-show") : d("slide-show"),
            centerMode: d("lg-center-mode") ? d("lg-center-mode") : false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 992,
          settings: {
            arrows: d("md-arrows") ? true : false,
            dots: d("md-dots") ? true : false,
            slidesToShow: d("md-slide-show") ? d("md-slide-show") : 1,
            centerMode: d("md-center-mode") ? d("md-center-mode") : false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 767,
          settings: {
            arrows: d("sm-arrows") ? true : false,
            dots: d("sm-dots") ? true : false,
            slidesToShow: d("sm-slide-show") ? d("sm-slide-show") : 1,
            centerMode: d("sm-center-mode") ? d("sm-center-mode") : false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 576,
          settings: {
            arrows: d("xs-arrows") ? true : false,
            dots: d("xs-dots") ? true : false,
            slidesToShow: d("xs-slide-show") ? d("xs-slide-show") : 1,
            centerMode: d("xs-center-mode") ? d("xs-center-mode") : false,
            centerPadding: 0,
          },
        },
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
      ],
    });
  });

  /*----------- 09. Ajax Contact Form ----------*/
  var form = ".ajax-contact";
  var invalidCls = "is-invalid";
  var $email = '[name="email"]';
  var $validation = '[name="firstname"],[name="lastname"],[name="email"],[name="number"],[name="message"]'; // Must be use (,) without any space
  var formMessages = $(".form-messages");

  function sendContact() {
    var formData = $(form).serialize();
    var valid;
    valid = validateContact();
    if (valid) {
      jQuery
        .ajax({
          url: $(form).attr("action"),
          data: formData,
          type: "POST",
        })
        .done(function (response) {
          // Make sure that the formMessages div has the 'success' class.
          formMessages.removeClass("error");
          formMessages.addClass("success");
          // Set the message text.
          formMessages.text(response);
          // Clear the form.
          $(form + ' input:not([type="submit"]),' + form + " textarea").val("");
        })
        .fail(function (data) {
          // Make sure that the formMessages div has the 'error' class.
          formMessages.removeClass("success");
          formMessages.addClass("error");
          // Set the message text.
          if (data.responseText !== "") {
            formMessages.html(data.responseText);
          } else {
            formMessages.html(
              "Oops! An error occured and your message could not be sent."
            );
          }
        });
    }
  }

  function validateContact() {
    var valid = true;
    var formInput;

    function unvalid($validation) {
      $validation = $validation.split(",");
      for (var i = 0; i < $validation.length; i++) {
        formInput = form + " " + $validation[i];
        if (!$(formInput).val()) {
          $(formInput).addClass(invalidCls);
          valid = false;
        } else {
          $(formInput).removeClass(invalidCls);
          valid = true;
        }
      }
    }
    unvalid($validation);

    if (
      !$($email).val() ||
      !$($email)
      .val()
      .match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/)
    ) {
      $($email).addClass(invalidCls);
      valid = false;
    } else {
      $($email).removeClass(invalidCls);
      valid = true;
    }
    return valid;
  }

  $(form).on("submit", function (element) {
    element.preventDefault();
    sendContact();
  });

  /*----------- 10. Magnific Popup ----------*/
  /* magnificPopup img view */
  $(".popup-image").magnificPopup({
    type: "image",
    gallery: {
      enabled: true,
    },
  });

  /* magnificPopup video view */
  $(".popup-video").magnificPopup({
    type: "iframe",
  });

  /*----------- 11. Filter ----------*/
  $(".filter-active").imagesLoaded(function () {
    var $filter = ".filter-active",
      $filterItem = ".filter-item",
      $filterMenu = ".filter-menu-active";

    if ($($filter).length > 0) {
      var $grid = $($filter).isotope({
        itemSelector: $filterItem,
        filter: "*",
        masonry: {
          // use outer width of grid-sizer for columnWidth
          columnWidth: $filterItem,
        },
      });

      // filter items on button click
      $($filterMenu).on("click", "button", function () {
        var filterValue = $(this).attr("data-filter");
        $grid.isotope({
          filter: filterValue,
        });
      });

      // Menu Active Class
      $($filterMenu).on("click", "button", function (event) {
        event.preventDefault();
        $(this).addClass("active");
        $(this).siblings(".active").removeClass("active");
      });
    }
  });


  /*---------- 12. Popup Sidemenu ----------*/
  function popupSideMenu($sideMenu, $sideMunuOpen, $sideMenuCls, $toggleCls) {
    // Sidebar Popup
    $($sideMunuOpen).on("click", function (e) {
      e.preventDefault();
      $($sideMenu).addClass($toggleCls);
    });
    $($sideMenu).on("click", function (e) {
      e.stopPropagation();
      $($sideMenu).removeClass($toggleCls);
    });
    var sideMenuChild = $sideMenu + " > div";
    $(sideMenuChild).on("click", function (e) {
      e.stopPropagation();
      $($sideMenu).addClass($toggleCls);
    });
    $($sideMenuCls).on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $($sideMenu).removeClass($toggleCls);
    });
  }
  popupSideMenu(
    ".sidemenu-wrapper",
    ".sideMenuToggler",
    ".sideMenuCls",
    "show"
  );


  /*---------- 13. Search Box Popup ----------*/
  function popupSarchBox($searchBox, $searchOpen, $searchCls, $toggleCls) {
    $($searchOpen).on("click", function (e) {
      e.preventDefault();
      $($searchBox).addClass($toggleCls);
    });
    $($searchBox).on("click", function (e) {
      e.stopPropagation();
      $($searchBox).removeClass($toggleCls);
    });
    $($searchBox)
      .find("form")
      .on("click", function (e) {
        e.stopPropagation();
        $($searchBox).addClass($toggleCls);
      });
    $($searchCls).on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $($searchBox).removeClass($toggleCls);
    });
  }
  popupSarchBox(
    ".popup-search-box",
    ".searchBoxTggler",
    ".searchClose",
    "show"
  );



  /*----------- 14. Accordion Class Toggle ----------*/
  $(".accordion-button").on("click", function () {
    let btn = $(this).closest(".accordion-item");
    btn.toggleClass("active").siblings().removeClass("active");
  });



  /*----------- 15. Count Down ----------*/
  $.fn.countdown = function () {
    $(this).each(function () {
      var $counter = $(this),
        countDownDate = new Date($counter.data('end-date')).getTime(), // Set the date we're counting down toz
        exprireCls = 'expired';

      // Finding Function
      function s$(element) {
        return $counter.find(element);
      }

      // Update the count down every 1 second
      var counter = setInterval(function () {
        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // if low than 10 add zero
        function addZero(element) {
          return element < 10 ? '0' + element : element;
        }

        // If the count down is over, write some text 
        if (distance < 0) {
          clearInterval(counter);
          $counter.addClass(exprireCls);
          $counter.find('.message').css('display', 'block');
        } else {
          // Output the result in elements
          s$('.day').html(addZero(days))
          s$('.hour').html(addZero(hours))
          s$('.minute').html(addZero(minutes))
          s$('.seconds').html(addZero(seconds))
        }
      }, 1000);
    })
  }

  if ($('.countdown-active').length) {
    $('.countdown-active').countdown();
  }




  /*----------- 16. Shape Mockup ----------*/
  $.fn.shapeMockup = function () {
    var $shape = $(this);
    $shape.each(function () {
      var $currentShape = $(this),
        shapeTop = $currentShape.data("top"),
        shapeRight = $currentShape.data("right"),
        shapeBottom = $currentShape.data("bottom"),
        shapeLeft = $currentShape.data("left");
      $currentShape
        .css({
          top: shapeTop,
          right: shapeRight,
          bottom: shapeBottom,
          left: shapeLeft,
        })
        .removeAttr("data-top")
        .removeAttr("data-right")
        .removeAttr("data-bottom")
        .removeAttr("data-left")
        .parent()
        .addClass("shape-mockup-wrap");
    });
  };

  if ($(".shape-mockup")) {
    $(".shape-mockup").shapeMockup();
  }




  /*----------- 17. Range Slider ----------*/
  $("#slider-range").slider({
    range: true,
    min: 40,
    max: 300,
    values: [60, 570],
    slide: function (event, ui) {
      $("#minAmount").text("$" + ui.values[0]);
      $("#maxAmount").text("$" + ui.values[1]);
    },
  });
  $("#minAmount").text("$" + $("#slider-range").slider("values", 0));
  $("#maxAmount").text("$" + $("#slider-range").slider("values", 1));




  /*----------- 18. Woocommerce Toggle ----------*/
  // Ship To Different Address
  $("#ship-to-different-address-checkbox").on("change", function () {
    if ($(this).is(":checked")) {
      $("#ship-to-different-address").next(".shipping_address").slideDown();
    } else {
      $("#ship-to-different-address").next(".shipping_address").slideUp();
    }
  });

  // Login Toggle
  $(".woocommerce-form-login-toggle a").on("click", function (e) {
    e.preventDefault();
    $(".woocommerce-form-login").slideToggle();
  });

  // Coupon Toggle
  $(".woocommerce-form-coupon-toggle a").on("click", function (e) {
    e.preventDefault();
    $(".woocommerce-form-coupon").slideToggle();
  });

  // Woocommerce Shipping Method
  $(".shipping-calculator-button").on("click", function (e) {
    e.preventDefault();
    $(this).next(".shipping-calculator-form").slideToggle();
  });

  // Woocommerce Payment Toggle
  $('.wc_payment_methods input[type="radio"]:checked')
    .siblings(".payment_box")
    .show();
  $('.wc_payment_methods input[type="radio"]').each(function () {
    $(this).on("change", function () {
      $(".payment_box").slideUp();
      $(this).siblings(".payment_box").slideDown();
    });
  });

  // Woocommerce Rating Toggle
  $(".rating-select .stars a").each(function () {
    $(this).on("click", function (e) {
      e.preventDefault();
      $(this).siblings().removeClass("active");
      $(this).parent().parent().addClass("selected");
      $(this).addClass("active");
    });
  });

  /*---------- 19. Quantity Added ----------*/
  $(".quantity-plus").each(function () {
    $(this).on("click", function (e) {
      e.preventDefault();
      var $qty = $(this).siblings(".qty-input");
      var currentVal = parseInt($qty.val());
      if (!isNaN(currentVal)) {
        $qty.val(currentVal + 1);
      }
    });
  });

  $(".quantity-minus").each(function () {
    $(this).on("click", function (e) {
      e.preventDefault();
      var $qty = $(this).siblings(".qty-input");
      var currentVal = parseInt($qty.val());
      if (!isNaN(currentVal) && currentVal > 1) {
        $qty.val(currentVal - 1);
      }
    });
  });






  /*---------- 20. School Chatbot ----------*/
  function initSchoolChatbot() {
    var existingButton = document.querySelector(".schoolbot-float");
    if (existingButton && existingButton.dataset.chatbotReady === "1") {
      return true;
    }

    var whatsappButtons = document.querySelectorAll(".whatsapp-float");
    if (!whatsappButtons.length) {
      return false;
    }

    var whatsappBtn = whatsappButtons[whatsappButtons.length - 1];

    var chatbotButton = existingButton;
    if (!chatbotButton) {
      chatbotButton = document.createElement("button");
      chatbotButton.type = "button";
      chatbotButton.className = "schoolbot-float";
      chatbotButton.setAttribute("aria-label", "Abrir asistente virtual");
      chatbotButton.innerHTML =
        '<span class="schoolbot-avatar-wrap"><img class="schoolbot-avatar" src="/assets/images/chatbot_icon_256.png" loading="eager" decoding="sync" fetchpriority="high" alt="VicentinoBot" /></span>' +
        '<span class="schoolbot-badge">Hola soy VicentinoBot</span>';
      document.body.appendChild(chatbotButton);
    } else {
      chatbotButton.type = "button";
      chatbotButton.setAttribute("aria-label", "Abrir asistente virtual");
      if (!chatbotButton.querySelector(".schoolbot-avatar-wrap")) {
        chatbotButton.innerHTML =
          '<span class="schoolbot-avatar-wrap"><img class="schoolbot-avatar" src="/assets/images/chatbot_icon_256.png" loading="eager" decoding="sync" fetchpriority="high" alt="VicentinoBot" /></span>' +
          '<span class="schoolbot-badge">Hola soy VicentinoBot</span>';
      }
    }

    var avatarEl = chatbotButton.querySelector(".schoolbot-avatar");
    if (avatarEl) {
      avatarEl.setAttribute("loading", "eager");
      avatarEl.setAttribute("decoding", "sync");
      avatarEl.setAttribute("fetchpriority", "high");

      var avatarSources = [];
      function pushAvatarSource(src) {
        if (!src || avatarSources.indexOf(src) >= 0) return;
        avatarSources.push(src);
      }

      var mainScriptEl = null;
      for (var si = document.scripts.length - 1; si >= 0; si--) {
        var scriptSrcAttr = document.scripts[si].getAttribute("src") || "";
        if (/assets\/js\/main\.js$/i.test(scriptSrcAttr)) {
          mainScriptEl = document.scripts[si];
          break;
        }
      }

      pushAvatarSource("/assets/images/chatbot_icon_256.png");

      if (mainScriptEl && mainScriptEl.src) {
        try {
          pushAvatarSource(new URL("../images/chatbot_icon_256.png", mainScriptEl.src).href);
        } catch (e) {}
      }

      var currentAvatarSrc = (avatarEl.getAttribute("src") || "").trim();
      pushAvatarSource(currentAvatarSrc);
      pushAvatarSource("assets/images/chatbot_icon_256.png");
      pushAvatarSource("../assets/images/chatbot_icon_256.png");

      var avatarSourceIndex = 0;
      function loadNextAvatarSource() {
        if (avatarSourceIndex >= avatarSources.length) {
          return;
        }
        avatarEl.src = avatarSources[avatarSourceIndex++];
      }

      avatarEl.addEventListener("error", loadNextAvatarSource);
      loadNextAvatarSource();
    }

    var chatbotPanel = document.querySelector(".schoolbot-panel");
    if (!chatbotPanel) {
      chatbotPanel = document.createElement("section");
      chatbotPanel.className = "schoolbot-panel";
      chatbotPanel.setAttribute("aria-hidden", "true");
      chatbotPanel.innerHTML =
        '<div class="schoolbot-header">' +
        '<strong>Asistente del colegio</strong>' +
        '<button type="button" class="schoolbot-close" aria-label="Cerrar asistente">&times;</button>' +
        "</div>" +
        '<div class="schoolbot-messages"></div>' +
        '<form class="schoolbot-form">' +
        '<input type="text" class="schoolbot-input" placeholder="Escribe tu pregunta..." autocomplete="off" />' +
        '<button type="submit" class="schoolbot-send">Enviar</button>' +
        "</form>";
      document.body.appendChild(chatbotPanel);
    }

    var messagesEl = chatbotPanel.querySelector(".schoolbot-messages");
    var formEl = chatbotPanel.querySelector(".schoolbot-form");
    var inputEl = chatbotPanel.querySelector(".schoolbot-input");
    var closeEl = chatbotPanel.querySelector(".schoolbot-close");
    var eventGuardTargets = [chatbotPanel, messagesEl, formEl, inputEl, chatbotButton];

    function stopEventPropagation(event) {
      if (!event) return;
      event.stopPropagation();
    }

    function isolateChatEvents(element, eventNames) {
      if (!element || !Array.isArray(eventNames)) return;
      eventNames.forEach(function (eventName) {
        element.addEventListener(eventName, stopEventPropagation);
      });
    }

    var pointerAndScrollEvents = [
      "mousedown",
      "mousemove",
      "mouseup",
      "click",
      "dblclick",
      "pointerdown",
      "pointermove",
      "pointerup",
      "touchstart",
      "touchmove",
      "touchend",
      "wheel"
    ];

    eventGuardTargets.forEach(function (target) {
      isolateChatEvents(target, pointerAndScrollEvents);
    });

    isolateChatEvents(inputEl, ["keydown", "keyup", "keypress"]);
    isolateChatEvents(formEl, ["keydown", "keyup", "keypress"]);

    function isTargetInsideChat(target) {
      return !!(target && chatbotPanel && chatbotPanel.contains(target));
    }

    function guardSliderHotkeys(event) {
      if (!chatbotPanel || !chatbotPanel.classList.contains("is-open")) {
        return;
      }
      if (!isTargetInsideChat(event.target || document.activeElement)) {
        return;
      }

      var key = String(event.key || "");
      var navigationKeys = {
        ArrowLeft: true,
        ArrowRight: true,
        ArrowUp: true,
        ArrowDown: true,
        Home: true,
        End: true,
        PageUp: true,
        PageDown: true
      };

      if (!navigationKeys[key]) {
        return;
      }

      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    }

    window.addEventListener("keydown", guardSliderHotkeys, true);

    var corpusEntries = [];
    var corpusIndex = {};
    var maxCorpusPages = 24;
    var botGreeting =
      "Hola, soy el asistente virtual. Puedes hacer preguntas libres y tambien preguntas del colegio con respuestas basadas en la web.";

    function escapeHtml(text) {
      return (text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function repairMojibake(text) {
      var value = String(text || "");
      if (!/[ÃÂâ€]/.test(value)) {
        return value;
      }

      return value
        .replace(/Ã¡/g, "á")
        .replace(/Ã©/g, "é")
        .replace(/Ã­/g, "í")
        .replace(/Ã³/g, "ó")
        .replace(/Ãº/g, "ú")
        .replace(/Ã/g, "Á")
        .replace(/Ã‰/g, "É")
        .replace(/Ã/g, "Í")
        .replace(/Ã“/g, "Ó")
        .replace(/Ãš/g, "Ú")
        .replace(/Ã±/g, "ñ")
        .replace(/Ã‘/g, "Ñ")
        .replace(/â€œ|â€/g, "\"")
        .replace(/â€˜|â€™/g, "'")
        .replace(/â€“/g, "-")
        .replace(/Â¿/g, "¿")
        .replace(/Â¡/g, "¡")
        .replace(/Â/g, "");
    }

    function normalize(text) {
      return repairMojibake(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    var stopWords = {
      de: true,
      la: true,
      el: true,
      los: true,
      las: true,
      en: true,
      y: true,
      o: true,
      a: true,
      al: true,
      del: true,
      un: true,
      una: true,
      por: true,
      para: true,
      con: true,
      que: true,
      se: true,
      su: true,
      sus: true,
      es: true,
      son: true,
      como: true,
      cual: true,
      cuales: true,
      donde: true,
      cuando: true,
      quiero: true,
      me: true,
      mi: true,
      tu: true,
      tus: true,
      sobre: true,
      del: true,
      por: true,
      mas: true,
      informacion: true
    };

    var synonymMap = {
      inversion: ["costo", "costos", "precio", "pension", "mensual", "mensualidad", "importe", "pago", "cuota"],
      invercion: ["inversion", "costo", "pension"],
      costo: ["inversion", "precio", "pension", "importe", "mensualidad"],
      costos: ["costo", "inversion", "pension"],
      precio: ["costo", "inversion", "importe", "pension"],
      pension: ["mensual", "mensualidad", "cuota", "inversion", "importe", "costo"],
      mensual: ["mensualidad", "mes", "pension", "cuota"],
      mensualidad: ["mensual", "pension", "cuota", "mes"],
      cuota: ["mensual", "mensualidad", "pension"],
      matricula: ["inscripcion", "pago"],
      inicial: ["costoi", "nivel"],
      incial: ["inicial", "costoi", "nivel"],
      inicila: ["inicial", "costoi", "nivel"],
      primaria: ["costop", "nivel"],
      secundaria: ["costos1", "costos2", "nivel"],
      convenio: ["pnp", "descuento"],
      pnp: ["convenio", "descuento"]
    };

    var tokenCanonicalMap = {
      incial: "inicial",
      inicila: "inicial",
      inical: "inicial",
      invercion: "inversion",
      invesion: "inversion",
      divimatca: "divimatica",
      divimaticaa: "divimatica",
      penson: "pension",
      pencion: "pension",
      matriculas: "matricula",
      pensiones: "pension",
      costos: "costo",
      cuotas: "cuota",
      admisiones: "admision",
      vacantes: "vacante"
    };

    function canonicalizeToken(token) {
      if (!token) return "";
      return tokenCanonicalMap[token] || token;
    }

    function singularizeToken(token) {
      if (!token || token.length < 5) return token;
      if (token.slice(-2) === "es" && token.length > 6) {
        return token.slice(0, -2);
      }
      if (token.slice(-1) === "s") {
        return token.slice(0, -1);
      }
      return token;
    }

    var tuitionData = {
      inicial: {
        label: "Nivel Inicial",
        source: "pages/costoi.html",
        reservaMensual: "S/ 20.00",
        rows: [
          { hermano: "1er Hermano", matricula: "S/ 500.00", pension: "S/ 500.00", descuento: "S/ 0.00", pensionReserva: "S/ 480.00" },
          { hermano: "2do Hermano", matricula: "S/ 250.00", pension: "S/ 470.00", descuento: "S/ 30.00", pensionReserva: "S/ 450.00" },
          { hermano: "3er Hermano", matricula: "No paga", pension: "S/ 440.00", descuento: "S/ 60.00", pensionReserva: "S/ 420.00" },
          { hermano: "4to Hermano", matricula: "No paga", pension: "S/ 410.00", descuento: "S/ 90.00", pensionReserva: "S/ 390.00" },
          { hermano: "5to Hermano", matricula: "No paga", pension: "S/ 380.00", descuento: "S/ 120.00", pensionReserva: "S/ 360.00" }
        ],
        convenio: { descuento25: "S/ 125.00", pensionConvenio: "S/ 375.00", descuentoAdicional: "S/ 20.00", pensionFinal: "S/ 355.00" }
      },
      primaria: {
        label: "Nivel Primaria",
        source: "pages/costop.html",
        reservaMensual: "S/ 25.00",
        rows: [
          { hermano: "1er Hermano", matricula: "S/ 570.00", pension: "S/ 570.00", descuento: "S/ 0.00", pensionReserva: "S/ 548.00" },
          { hermano: "2do Hermano", matricula: "S/ 285.00", pension: "S/ 540.00", descuento: "S/ 30.00", pensionReserva: "S/ 515.00" },
          { hermano: "3er Hermano", matricula: "No paga", pension: "S/ 510.00", descuento: "S/ 60.00", pensionReserva: "S/ 485.00" },
          { hermano: "4to Hermano", matricula: "No paga", pension: "S/ 480.00", descuento: "S/ 90.00", pensionReserva: "S/ 455.00" },
          { hermano: "5to Hermano", matricula: "No paga", pension: "S/ 450.00", descuento: "S/ 120.00", pensionReserva: "S/ 425.00" }
        ],
        convenio: { descuento25: "S/ 142.50", pensionConvenio: "S/ 428.00", descuentoAdicional: "S/ 25.00", pensionFinal: "S/ 403.00" }
      },
      secundaria13: {
        label: "Secundaria 1ro - 3ro",
        source: "pages/costos1.html",
        reservaMensual: "S/ 25.00",
        rows: [
          { hermano: "1er Hermano", matricula: "S/ 590.00", pension: "S/ 590.00", descuento: "S/ 0.00", pensionReserva: "S/ 565.00" },
          { hermano: "2do Hermano", matricula: "S/ 295.00", pension: "S/ 560.00", descuento: "S/ 30.00", pensionReserva: "S/ 535.00" },
          { hermano: "3er Hermano", matricula: "No paga", pension: "S/ 530.00", descuento: "S/ 60.00", pensionReserva: "S/ 505.00" },
          { hermano: "4to Hermano", matricula: "No paga", pension: "S/ 500.00", descuento: "S/ 90.00", pensionReserva: "S/ 475.00" },
          { hermano: "5to Hermano", matricula: "No paga", pension: "S/ 470.00", descuento: "S/ 120.00", pensionReserva: "S/ 445.00" }
        ],
        convenio: { descuento25: "S/ 147.50", pensionConvenio: "S/ 443.00", descuentoAdicional: "S/ 25.00", pensionFinal: "S/ 418.00" }
      },
      secundaria45: {
        label: "Secundaria 4to - 5to",
        source: "pages/costos2.html",
        reservaMensual: "S/ 25.00",
        rows: [
          { hermano: "1er Hermano", matricula: "S/ 610.00", pension: "S/ 610.00", descuento: "S/ 0.00", pensionReserva: "S/ 585.00" },
          { hermano: "2do Hermano", matricula: "S/ 305.00", pension: "S/ 580.00", descuento: "S/ 30.00", pensionReserva: "S/ 555.00" },
          { hermano: "3er Hermano", matricula: "No paga", pension: "S/ 550.00", descuento: "S/ 60.00", pensionReserva: "S/ 525.00" },
          { hermano: "4to Hermano", matricula: "No paga", pension: "S/ 520.00", descuento: "S/ 90.00", pensionReserva: "S/ 495.00" },
          { hermano: "5to Hermano", matricula: "No paga", pension: "S/ 490.00", descuento: "S/ 120.00", pensionReserva: "S/ 465.00" }
        ],
        convenio: { descuento25: "S/ 152.50", pensionConvenio: "S/ 458.00", descuentoAdicional: "S/ 25.00", pensionFinal: "S/ 433.00" }
      }
    };

    function tokenize(text) {
      return normalize(text)
        .split(" ")
        .map(function (token) {
          return canonicalizeToken(singularizeToken(token));
        })
        .filter(function (token) {
          if (!token || stopWords[token]) {
            return false;
          }
          return token.length > 2 || /^[0-9]+$/.test(token);
        });
    }

    function expandTokens(tokens) {
      var expanded = {};
      tokens.forEach(function (token) {
        expanded[token] = true;
        var aliases = synonymMap[token] || [];
        aliases.forEach(function (alias) {
          expanded[alias] = true;
        });
      });
      return Object.keys(expanded);
    }

    function tokensFromQuestion(question) {
      return expandTokens(tokenize(question));
    }

    function containsAnyToken(queryTokens, terms) {
      return terms.some(function (term) {
        return queryTokens.indexOf(term) !== -1;
      });
    }

    function detectTuitionLevels(queryTokens, normalizedQuestion) {
      var levels = [];
      var wantsSec = containsAnyToken(queryTokens, ["secundaria", "secundario", "costos1", "costos2"]);
      var asks13 = /secundaria[^0-9]{0,20}(1|2|3)|1\s*[-a]\s*3|1ro|2do|3ro/.test(normalizedQuestion);
      var asks45 = /secundaria[^0-9]{0,20}(4|5)|4\s*[-a]\s*5|4to|5to/.test(normalizedQuestion);

      if (containsAnyToken(queryTokens, ["inicial", "costoi"])) {
        levels.push("inicial");
      }
      if (containsAnyToken(queryTokens, ["primaria", "costop"])) {
        levels.push("primaria");
      }
      if (wantsSec && (asks13 || (!asks13 && !asks45))) {
        levels.push("secundaria13");
      }
      if (wantsSec && (asks45 || (!asks13 && !asks45))) {
        levels.push("secundaria45");
      }
      if (asks13 && levels.indexOf("secundaria13") === -1) {
        levels.push("secundaria13");
      }
      if (asks45 && levels.indexOf("secundaria45") === -1) {
        levels.push("secundaria45");
      }
      return levels;
    }

    function formatRowsForResponse(rows, valueKey) {
      return rows
        .map(function (row) {
          return row.hermano + ": " + row[valueKey];
        })
        .join("; ");
    }

    function answerFromTuitionData(normalizedQuestion, queryTokens) {
      var isTuitionQuestion = containsAnyToken(queryTokens, [
        "inversion",
        "costo",
        "costos",
        "precio",
        "pension",
        "mensual",
        "mensualidad",
        "importe",
        "pago",
        "cuota",
        "matricula",
        "inscripcion",
        "convenio",
        "pnp",
        "descuento"
      ]);

      if (!isTuitionQuestion) {
        return null;
      }

      var levels = detectTuitionLevels(queryTokens, normalizedQuestion);
      var wantsConvenio = containsAnyToken(queryTokens, ["convenio", "pnp"]);
      var wantsMatricula = containsAnyToken(queryTokens, ["matricula", "inscripcion"]);
      var wantsMensual = containsAnyToken(queryTokens, [
        "mensual",
        "mensualidad",
        "mes",
        "pension",
        "inversion",
        "costo",
        "precio",
        "importe",
        "cuota"
      ]);

      if (!wantsConvenio && !wantsMatricula && !wantsMensual) {
        wantsMensual = true;
      }

      if (!levels.length) {
        return (
          "Puedo responderte costos exactos por nivel. Resumen rapido (1er hermano, pension):\n" +
          "1. Nivel Inicial: S/ 500.00 (con reserva: S/ 480.00)\n" +
          "2. Nivel Primaria: S/ 570.00 (con reserva: S/ 548.00)\n" +
          "3. Secundaria 1ro-3ro: S/ 590.00 (con reserva: S/ 565.00)\n" +
          "4. Secundaria 4to-5to: S/ 610.00 (con reserva: S/ 585.00)\n\n" +
          "Indica el nivel para darte el detalle completo por hermano.\nFuente: pages/costoi.html, pages/costop.html, pages/costos1.html, pages/costos2.html"
        );
      }

      var selectedLevels = levels.filter(function (levelKey, index) {
        return levels.indexOf(levelKey) === index && !!tuitionData[levelKey];
      });

      var sections = selectedLevels.map(function (levelKey) {
        var level = tuitionData[levelKey];
        var lines = [level.label + ":"];

        if (wantsConvenio) {
          lines.push(
            "Convenio PNP 25%: descuento " +
            level.convenio.descuento25 +
            ", pension por convenio " +
            level.convenio.pensionConvenio +
            ", descuento adicional " +
            level.convenio.descuentoAdicional +
            ", pension final " +
            level.convenio.pensionFinal +
            "."
          );
        } else if (wantsMatricula) {
          lines.push("Matricula general por hermano: " + formatRowsForResponse(level.rows, "matricula") + ".");
        } else {
          lines.push("Pension mensual establecida: " + formatRowsForResponse(level.rows, "pension") + ".");
          lines.push(
            "Con reserva en plazo y pago segun cronograma: " +
            formatRowsForResponse(level.rows, "pensionReserva") +
            "."
          );
          lines.push("Descuento mensual de reserva: " + level.reservaMensual + ".");
        }

        lines.push("Fuente: " + level.source);
        return lines.join("\n");
      });

      return sections.join("\n\n");
    }

    var noisyMenuTerms = [
      "inicio",
      "quienes somos",
      "mision y vision",
      "propuesta educativa",
      "vida estudiantil",
      "niveles educativos",
      "admision",
      "admisiones",
      "noticias",
      "contactenos",
      "sieweb",
      "reserva de vacante",
      "buscar palabra",
      "cancelar precarga",
      "escribenos",
      "coro misericordiano",
      "divimatica",
      "banda",
      "cadetes",
      "olimpiadas"
    ];

    var noisyMenuTokenSet = {
      inicio: true,
      quienes: true,
      somos: true,
      historia: true,
      mision: true,
      vision: true,
      propuesta: true,
      educativa: true,
      perfil: true,
      estudiante: true,
      vida: true,
      estudiantil: true,
      nivel: true,
      inicial: true,
      primaria: true,
      secundaria: true,
      admision: true,
      noticia: true,
      contacto: true,
      contactenos: true,
      sieweb: true,
      reserva: true,
      vacante: true,
      escribenos: true,
      cancelar: true,
      precarga: true,
      divimatica: true,
      coro: true,
      banda: true,
      cadete: true,
      olimpiada: true,
      taller: true,
      departamento: true,
      sacramento: true
    };

    function isLikelyNavigationNoiseClient(text) {
      var raw = repairMojibake(text || "");
      var normalizedText = normalize(raw);
      if (!normalizedText) {
        return true;
      }

      var termHits = 0;
      noisyMenuTerms.forEach(function (term) {
        if (normalizedText.indexOf(term) !== -1) {
          termHits += 1;
        }
      });

      var tokens = tokenize(raw);
      var unique = {};
      var noisyHits = 0;
      tokens.forEach(function (token) {
        unique[token] = true;
        if (noisyMenuTokenSet[token]) {
          noisyHits += 1;
        }
      });
      var uniqueRatio = Object.keys(unique).length / Math.max(tokens.length, 1);
      var looksMenuList = termHits >= 3 && tokens.length >= 14;
      var tooRepetitive = tokens.length >= 24 && uniqueRatio < 0.4;
      var noSentencePunctuation = !/[.!?]/.test(raw) && tokens.length >= 12;
      var tokenDominatedByNav = tokens.length >= 12 && noisyHits >= Math.ceil(tokens.length * 0.45);
      var mostlyNavWords =
        /(inicio|quienes|somos|propuesta|educativa|vida|estudiantil|admision|noticias|contactenos)/.test(
          normalizedText
        ) && !/(S\/|matricula|pension|convenio|descuento|importe)/i.test(raw);

      return looksMenuList || tooRepetitive || tokenDominatedByNav || (mostlyNavWords && noSentencePunctuation);
    }

    function sentenceListFromText(text) {
      if (!text) return [];
      return text
        .replace(/\r/g, "\n")
        .split(/[\n]+|[.!?]+\s+/)
        .map(function (sentence) {
          return repairMojibake(sentence).replace(/\s+/g, " ").trim();
        })
        .filter(function (sentence) {
          return sentence.length >= 20 && sentence.length <= 360 && !isLikelyNavigationNoiseClient(sentence);
        });
    }

    function addCorpusEntry(text, sourceLabel) {
      var cleanText = (text || "").replace(/\s+/g, " ").trim();
      if (!cleanText) {
        return;
      }

      var normalizedText = normalize(cleanText);
      if (!normalizedText || corpusIndex[normalizedText]) {
        return;
      }

      var tokens = tokenize(normalizedText);
      if (!tokens.length) {
        return;
      }

      corpusEntries.push({
        text: cleanText,
        source: sourceLabel,
        tokenSet: new Set(tokens)
      });
      corpusIndex[normalizedText] = true;
    }

    function addCorpusText(text, sourceLabel) {
      var sentences = sentenceListFromText(text);
      sentences.forEach(function (sentence) {
        addCorpusEntry(sentence, sourceLabel);
      });
    }

    function getTableHeading(table) {
      var parent = table.parentElement;
      var depth = 0;
      while (parent && depth < 6) {
        var heading = parent.querySelector("h1, h2, h3, h4");
        if (heading && heading.textContent) {
          var headingText = heading.textContent.replace(/\s+/g, " ").trim();
          if (headingText) {
            return headingText;
          }
        }
        parent = parent.parentElement;
        depth += 1;
      }
      return "";
    }

    function addCorpusFromTables(doc, sourceLabel) {
      if (!doc || !doc.querySelectorAll) {
        return;
      }

      var tables = doc.querySelectorAll("table");
      tables.forEach(function (table) {
        var heading = getTableHeading(table);
        var headers = Array.from(table.querySelectorAll("thead th"))
          .map(function (cell) {
            return cell.textContent.replace(/\s+/g, " ").trim();
          })
          .filter(Boolean);

        table.querySelectorAll("tbody tr").forEach(function (row) {
          var cells = Array.from(row.querySelectorAll("th, td"))
            .map(function (cell) {
              return cell.textContent.replace(/\s+/g, " ").trim();
            })
            .filter(Boolean);

          if (!cells.length) {
            return;
          }

          var rowText = cells.join(" | ");
          var chunk = "";
          if (heading) {
            chunk += heading + " | ";
          }
          if (headers.length) {
            chunk += headers.join(" | ") + " | ";
          }
          chunk += rowText;
          addCorpusEntry(chunk, sourceLabel);
        });
      });
    }

    function seedTuitionKnowledge() {
      Object.keys(tuitionData).forEach(function (levelKey) {
        var level = tuitionData[levelKey];
        level.rows.forEach(function (row) {
          addCorpusEntry(
            level.label +
              " " +
              row.hermano +
              " matricula " +
              row.matricula +
              " pension " +
              row.pension +
              " descuento " +
              row.descuento +
              " pension con reserva " +
              row.pensionReserva,
            level.source
          );
        });

        addCorpusEntry(
          level.label +
            " descuento mensual por reserva " +
            level.reservaMensual +
            " convenio pnp pension final " +
            level.convenio.pensionFinal,
          level.source
        );
      });
    }

    function cleanDocumentText(doc) {
      if (!doc || !doc.body) return "";
      var clone = doc.body.cloneNode(true);
      var noisyNodes = clone.querySelectorAll(
        "script, style, noscript, iframe, svg, canvas, header, nav, footer, aside, .vs-menu-wrapper, .whatsapp-float, .schoolbot-float, .schoolbot-panel"
      );
      noisyNodes.forEach(function (node) {
        node.remove();
      });
      return repairMojibake(clone.textContent || "").replace(/\s+/g, " ").trim();
    }

    function fileNameFromPath(pathname) {
      var cleaned = pathname.split("?")[0].split("#")[0];
      var name = cleaned.substring(cleaned.lastIndexOf("/") + 1);
      return name || "index.html";
    }

    function addCorpusFromDocument(doc, sourceLabel) {
      var text = cleanDocumentText(doc);
      addCorpusText(text, sourceLabel);
      addCorpusFromTables(doc, sourceLabel);
    }

    function collectInternalPages() {
      var urls = [];
      var seen = {};
      var anchors = document.querySelectorAll("a[href]");

      function pushUrl(url) {
        var key = url.href.split("#")[0];
        if (!seen[key]) {
          seen[key] = true;
          urls.push(url);
        }
      }

      pushUrl(new URL(window.location.href));

      anchors.forEach(function (link) {
        var href = (link.getAttribute("href") || "").trim();
        if (!href || href.indexOf("javascript:") === 0 || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) {
          return;
        }
        var parsed;
        try {
          parsed = new URL(href, window.location.href);
        } catch (error) {
          return;
        }

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:" && parsed.protocol !== "file:") {
          return;
        }

        var isFileMode = window.location.protocol === "file:";
        if (!isFileMode && parsed.origin !== window.location.origin) {
          return;
        }
        if (isFileMode && parsed.protocol !== "file:") {
          return;
        }

        var pagePath = parsed.pathname.toLowerCase();
        if (pagePath && !pagePath.endsWith(".html") && !pagePath.endsWith("/")) {
          return;
        }
        pushUrl(parsed);
      });

      return urls.slice(0, maxCorpusPages);
    }

    function isNumericToken(token) {
      return /^[0-9]+([.,][0-9]+)?$/.test(token);
    }

    function scoreEntry(queryTokens, entry) {
      var weightedOverlap = 0;
      var totalWeight = 0;
      var textualOverlap = 0;

      queryTokens.forEach(function (token) {
        var numeric = isNumericToken(token);
        var weight = numeric ? 0.25 : 1;
        totalWeight += weight;
        if (entry.tokenSet.has(token)) {
          weightedOverlap += weight;
          if (!numeric) {
            textualOverlap += 1;
          }
        }
      });

      if (!weightedOverlap || !totalWeight) {
        return { score: 0, textualOverlap: 0 };
      }

      var coverage = weightedOverlap / totalWeight;
      var density = weightedOverlap / Math.max(entry.tokenSet.size, queryTokens.length);
      return {
        score: coverage * 0.8 + density * 0.2,
        textualOverlap: textualOverlap
      };
    }

    function tokenOverlapCountClient(text, queryTokens) {
      var tokenSet = {};
      tokenize(text || "").forEach(function (token) {
        tokenSet[token] = true;
      });
      var overlap = 0;
      queryTokens.forEach(function (token) {
        if (tokenSet[token]) {
          overlap += 1;
        }
      });
      return overlap;
    }

    function pickRelevantSnippetClient(entry, queryTokens) {
      var cleanText = repairMojibake(entry && entry.text ? entry.text : "");
      if (!cleanText) return "";

      var sentences = sentenceListFromText(cleanText);
      var ranked = sentences
        .map(function (sentence) {
          return {
            sentence: sentence,
            overlap: tokenOverlapCountClient(sentence, queryTokens)
          };
        })
        .filter(function (item) {
          return item.overlap > 0;
        })
        .sort(function (a, b) {
          if (b.overlap !== a.overlap) return b.overlap - a.overlap;
          return b.sentence.length - a.sentence.length;
        })
        .slice(0, 2);

      if (ranked.length) {
        return ranked
          .map(function (item) {
            return item.sentence;
          })
          .join(". ");
      }

      if (!isLikelyNavigationNoiseClient(cleanText) && tokenOverlapCountClient(cleanText, queryTokens) > 0) {
        return cleanText.replace(/\s+/g, " ").trim().slice(0, 420);
      }

      return "";
    }

    function answerFromSiteCorpus(queryTokens) {
      var minimumScore = queryTokens.length <= 2 ? 0.28 : 0.2;

      var ranked = corpusEntries
        .map(function (entry) {
          var scoreMeta = scoreEntry(queryTokens, entry);
          return {
            entry: entry,
            score: scoreMeta.score,
            textualOverlap: scoreMeta.textualOverlap
          };
        })
        .filter(function (item) {
          return item.score >= minimumScore && item.textualOverlap > 0;
        })
        .sort(function (a, b) {
          return b.score - a.score;
        })
        .slice(0, 3);

      if (!ranked.length) {
        return null;
      }

      var lines = [];
      var uniqueSources = [];
      ranked.forEach(function (item) {
        var snippet = pickRelevantSnippetClient(item.entry, queryTokens);
        if (!snippet) {
          return;
        }
        lines.push((lines.length + 1) + ". " + snippet);
        if (uniqueSources.indexOf(item.entry.source) === -1) {
          uniqueSources.push(item.entry.source);
        }
      });

      if (!lines.length) {
        return null;
      }

      return (
        lines.join("\n") +
        "\n\nFuente: " +
        uniqueSources.join(", ")
      );
    }

    var schoolCoreTerms = [
      "colegio",
      "escuela",
      "institucion",
      "misericordia",
      "svb",
      "san",
      "vicente",
      "barquera",
      "huanuco",
      "divimatica",
      "florales",
      "leno",
      "banda",
      "cadetes",
      "coro",
      "olimpiadas",
      "sacramentos",
      "taller",
      "perfil",
      "departamento",
      "admision",
      "admisiones",
      "vacante",
      "vacantes",
      "contacto",
      "telefono",
      "direccion",
      "quienes",
      "somos",
      "propuesta",
      "educativa",
      "vida",
      "estudiantil",
      "noticias",
      "reserva",
      "historia",
      "mision",
      "vision"
    ];

    var sitePathTokenSet = {};

    function tokenizePathForSchoolIntent(pathText) {
      return normalize(pathText || "")
        .split(" ")
        .filter(function (token) {
          return token && token.length >= 3;
        });
    }

    function addPathTokensFromHref(href) {
      if (!href) return;
      var parsed;
      try {
        parsed = new URL(href, window.location.href);
      } catch (error) {
        return;
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:" && parsed.protocol !== "file:") {
        return;
      }
      var rawPath = String(parsed.pathname || "").replace(/\.html?$/i, "").replace(/[\/._-]+/g, " ");
      tokenizePathForSchoolIntent(rawPath).forEach(function (token) {
        sitePathTokenSet[token] = true;
      });
    }

    function refreshSitePathTokenSet() {
      sitePathTokenSet = {};
      addPathTokensFromHref(window.location.href);
      var anchors = document.querySelectorAll("a[href]");
      anchors.forEach(function (anchor) {
        addPathTokensFromHref(anchor.getAttribute("href"));
      });
    }

    refreshSitePathTokenSet();

    var schoolAcademicTerms = [
      "matricula",
      "pension",
      "inversion",
      "costos",
      "nivel",
      "inicial",
      "primaria",
      "secundaria",
      "convenio",
      "pnp"
    ];

    var schoolFinancialTerms = [
      "matricula",
      "pension",
      "inversion",
      "costo",
      "costos",
      "precio",
      "importe",
      "mensual",
      "mensualidad",
      "cuota",
      "descuento",
      "convenio",
      "pnp"
    ];

    var schoolLevelTerms = [
      "inicial",
      "primaria",
      "secundaria",
      "alumno",
      "estudiante",
      "grado",
      "nivel"
    ];

    function isSchoolIntent(normalizedQuestion, queryTokens) {
      if (containsAnyToken(queryTokens, schoolCoreTerms)) {
        return true;
      }

      if (
        queryTokens.some(function (token) {
          return !!sitePathTokenSet[token];
        })
      ) {
        return true;
      }

      var hasAcademicTerm = containsAnyToken(queryTokens, schoolAcademicTerms);
      var hasFinancialTerm = containsAnyToken(queryTokens, schoolFinancialTerms);
      var hasLevelTerm = containsAnyToken(queryTokens, schoolLevelTerms);

      if (hasAcademicTerm && (hasLevelTerm || hasFinancialTerm)) {
        return true;
      }

      return /(colegio|la divina misericordia|san vicente de la barquera|admisiones|reserva de vacante|quienes somos|propuesta educativa|vida estudiantil|noticias|contactenos)/.test(
        normalizedQuestion
      );
    }

    function isBalancedParentheses(text) {
      var balance = 0;
      for (var i = 0; i < text.length; i += 1) {
        if (text[i] === "(") balance += 1;
        if (text[i] === ")") balance -= 1;
        if (balance < 0) return false;
      }
      return balance === 0;
    }

    function solveMathQuestion(rawQuestion) {
      var original = (rawQuestion || "").trim();
      if (!original) {
        return { handled: false };
      }

      var q = original
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      var hasNumber = /[0-9]/.test(q);
      var hasOperatorSymbol = /[\+\-\*\/xX()]/.test(original);
      var hasMathWords = /(cuanto es|cuanto da|calcula|resuelve|resultado|suma|resta|multiplica|divide|dividido|mas|menos|entre)/.test(q);
      var hasPorExpression = /[0-9][0-9\s.,()]*\spor\s[0-9][0-9\s.,()]*/.test(q);
      var likelyMath = hasNumber && (hasOperatorSymbol || hasMathWords || hasPorExpression);

      if (!likelyMath) {
        return { handled: false };
      }

      var expr = q
        .replace(/[¿?=]/g, " ")
        .replace(/cuanto es|cuanto da|cuanto|calcula|resuelve|resultado|por favor|hola|oye|dime|me dices|cual es|cual|que es/g, " ")
        .replace(/\bdividido\s+entre\b/g, "/")
        .replace(/\bdividido\s+por\b/g, "/")
        .replace(/\bmas\b/g, "+")
        .replace(/\bmenos\b/g, "-")
        .replace(/\bentre\b/g, "/")
        .replace(/\bpor\b/g, "*")
        .replace(/x/g, "*")
        .replace(/,/g, ".")
        .replace(/[^0-9+\-*/().\s]/g, " ")
        .replace(/\s+/g, "");

      if (!expr || !/[0-9]/.test(expr) || !/[+\-*/]/.test(expr)) {
        return {
          handled: true,
          answer: "Puedo resolver operaciones. Escribe la expresion como `8+5`, `12/3` o `7*4`."
        };
      }

      if (/[^0-9+\-*/().]/.test(expr) || !isBalancedParentheses(expr)) {
        return {
          handled: true,
          answer: "No pude interpretar la operacion. Intenta con un formato como `15-7` o `(8+2)*3`."
        };
      }

      if (/^[+\-*/.]/.test(expr) || /[+\-*/.]$/.test(expr) || /[+\-*/.]{2,}/.test(expr)) {
        return {
          handled: true,
          answer: "La operacion parece incompleta. Intenta escribirla otra vez, por ejemplo `1+1`."
        };
      }

      try {
        var result = Function('"use strict"; return (' + expr + ");")();
        if (typeof result === "number" && isFinite(result)) {
          var rounded = Math.round(result * 1000000) / 1000000;
          return { handled: true, answer: "El resultado es " + rounded + "." };
        }
      } catch (error) {
        return {
          handled: true,
          answer: "No pude resolver esa operacion. Prueba con un formato simple como `24/6`."
        };
      }

      return {
        handled: true,
        answer: "No pude resolver esa operacion. Prueba con un formato simple como `24/6`."
      };
    }

    function answerDateTimeQuestion(question) {
      var normalizedQuestion = normalize(question);
      var now = new Date();
      var hasExplicitWeekday = /lunes|martes|miercoles|jueves|viernes|sabado|domingo/.test(normalizedQuestion);
      var asksSimpleRelativeDay =
        (/\b(que|cual)\s+dia\s+(es|sera|fue)\b/.test(normalizedQuestion) ||
          /\b(que|cual)\s+dia\b/.test(normalizedQuestion) ||
          /\bdia\s+de\s+la\s+semana\b/.test(normalizedQuestion)) &&
        !hasExplicitWeekday;
      var relativeMatch = normalizedQuestion.match(
        /\b(antes de ayer|anteayer|pasado manana|pasadomanana|manana|ayer|hoy)\b/
      );

      if (asksSimpleRelativeDay && relativeMatch) {
        var ref = normalize(relativeMatch[1] || "");
        if (ref === "pasadomanana") ref = "pasado manana";
        if (ref === "anteayer") ref = "antes de ayer";

        var relativeOffsets = {
          hoy: 0,
          manana: 1,
          "pasado manana": 2,
          ayer: -1,
          "antes de ayer": -2
        };
        var offset = relativeOffsets[ref];
        if (offset !== undefined) {
          var targetDate = new Date(now);
          targetDate.setDate(targetDate.getDate() + offset);
          var dayName = targetDate.toLocaleDateString("es-PE", { weekday: "long" });
          var fullDate = targetDate.toLocaleDateString("es-PE", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
          var labelMap = {
            hoy: "Hoy",
            manana: "Manana",
            "pasado manana": "Pasado manana",
            ayer: "Ayer",
            "antes de ayer": "Antes de ayer"
          };
          var label = labelMap[ref] || "Ese dia";
          return label + " es " + dayName + ", " + fullDate + ".";
        }
      }

      var asksDate =
        /(que fecha|fecha de hoy|hoy que fecha|dia de hoy|fecha actual|en que fecha estamos|que dia es hoy|hoy que dia es|que dia estamos hoy|que dia estamos|dia actual|fecha de ahora)/.test(
          normalizedQuestion
        ) ||
        /\b(cual|que)\s+es\s+la\s+fecha\b/.test(normalizedQuestion) ||
        /\b(cual|que)\s+dia\s+de\s+la\s+semana\s+es\s+hoy\b/.test(normalizedQuestion);

      if (asksDate) {
        var todayText = now.toLocaleDateString("es-PE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        return "Hoy es " + todayText + ".";
      }

      var asksTime =
        /(que hora|hora actual|hora es|hora de ahora|que hora tenemos|en que hora estamos|hora exacta|hora peru)/.test(
          normalizedQuestion
        ) || /\b(cual|que)\s+es\s+la\s+hora\b/.test(normalizedQuestion);

      if (asksTime) {
        var timeText = now.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        return "La hora actual es " + timeText + ".";
      }

      return null;
    }

    function fetchWithTimeout(url, options, timeoutMs) {
      return new Promise(function (resolve, reject) {
        var done = false;
        var timer = setTimeout(function () {
          if (!done) {
            done = true;
            reject(new Error("timeout"));
          }
        }, timeoutMs || 6000);

        fetch(url, options)
          .then(function (response) {
            if (done) return;
            done = true;
            clearTimeout(timer);
            resolve(response);
          })
          .catch(function (error) {
            if (done) return;
            done = true;
            clearTimeout(timer);
            reject(error);
          });
      });
    }

    function buildChatApiCandidates() {
      var candidates = [];
      var seen = {};

      function push(url) {
        if (!url || seen[url]) return;
        seen[url] = true;
        candidates.push(url);
      }

      var configured = "";
      try {
        configured = (window.localStorage && localStorage.getItem("CHATBOT_API_URL")) || "";
      } catch (error) {
        configured = "";
      }
      if (configured) {
        push(configured.replace(/\/+$/, "") + "/api/chat");
      }

      if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        push("/api/chat");
      }

      push("http://localhost:3011/api/chat");
      push("http://127.0.0.1:3011/api/chat");
      push("http://localhost:3000/api/chat");
      push("http://127.0.0.1:3000/api/chat");

      return candidates;
    }

    async function askServerAssistant(question) {
      var candidates = buildChatApiCandidates();
      for (var i = 0; i < candidates.length; i += 1) {
        var endpoint = candidates[i];
        try {
          var response = await fetchWithTimeout(
            endpoint,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                question: question,
                page: window.location.pathname
              })
            },
            6500
          );

          if (!response || !response.ok) {
            try {
              var errData = await response.json();
              if (errData && (errData.details || errData.error)) {
                return (errData.details || errData.error || "").trim();
              }
            } catch (error) {
              // ignore parse and continue trying next candidate
            }
            continue;
          }

          var data = await response.json();
          if (data && data.answer) {
            return (data.answer || "").trim();
          }
        } catch (error) {
          // Try next endpoint candidate
        }
      }
      return null;
    }

    async function fetchJsonWithTimeoutClient(url, timeoutMs) {
      return new Promise(function (resolve, reject) {
        var done = false;
        var timer = setTimeout(function () {
          if (!done) {
            done = true;
            reject(new Error("timeout"));
          }
        }, timeoutMs || 8000);

        fetch(url)
          .then(function (response) {
            if (done) return;
            if (!response || !response.ok) {
              done = true;
              clearTimeout(timer);
              resolve(null);
              return;
            }
            response
              .json()
              .then(function (jsonData) {
                if (done) return;
                done = true;
                clearTimeout(timer);
                resolve(jsonData);
              })
              .catch(function () {
                if (done) return;
                done = true;
                clearTimeout(timer);
                resolve(null);
              });
          })
          .catch(function (error) {
            if (done) return;
            done = true;
            clearTimeout(timer);
            reject(error);
          });
      });
    }

    function isWeatherQuestionClient(normalizedQuestion) {
      return /(llovera|lluvia|clima|tiempo|pronostico|temperatura|tormenta|viento|humedad|nieve)/.test(
        normalizedQuestion
      );
    }

    function weatherDayOffsetClient(normalizedQuestion) {
      if (/pasado manana|pasadomanana/.test(normalizedQuestion)) {
        return 2;
      }
      if (/manana/.test(normalizedQuestion)) {
        return 1;
      }
      return 0;
    }

    function weatherLocationFromQuestionClient(normalizedQuestion) {
      var match = normalizedQuestion.match(/\ben\s+([a-z\s]{2,40})/i);
      if (!match || !match[1]) {
        return null;
      }
      var cleaned = String(match[1] || "")
        .replace(/\b(hoy|manana|pasado manana|pasadomanana|pronostico|clima|tiempo|llovera|lluvia|temperatura)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return cleaned || null;
    }

    function weatherCodeLabelClient(code) {
      var map = {
        0: "despejado",
        1: "mayormente despejado",
        2: "parcialmente nublado",
        3: "nublado",
        45: "niebla",
        48: "niebla con escarcha",
        51: "llovizna ligera",
        53: "llovizna moderada",
        55: "llovizna intensa",
        61: "lluvia ligera",
        63: "lluvia moderada",
        65: "lluvia intensa",
        80: "chubascos ligeros",
        81: "chubascos moderados",
        82: "chubascos fuertes",
        95: "tormenta",
        96: "tormenta con granizo",
        99: "tormenta fuerte con granizo"
      };
      return map[code] || "condicion variable";
    }

    function weatherDateTextClient(dateRaw) {
      if (!dateRaw || !/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
        return dateRaw || "";
      }
      var date = new Date(dateRaw + "T00:00:00");
      if (isNaN(date.getTime())) {
        return dateRaw;
      }
      return date.toLocaleDateString("es-PE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    }

    function weatherRainLikelyClient(code, prob, sumMm) {
      var rainCodes = {
        51: true,
        53: true,
        55: true,
        56: true,
        57: true,
        61: true,
        63: true,
        65: true,
        66: true,
        67: true,
        80: true,
        81: true,
        82: true,
        95: true,
        96: true,
        99: true
      };
      if (rainCodes[code]) return true;
      if (Number(prob || 0) >= 45) return true;
      if (Number(sumMm || 0) >= 0.8) return true;
      return false;
    }

    async function answerWeatherClient(question, normalizedQuestion) {
      if (!isWeatherQuestionClient(normalizedQuestion)) {
        return null;
      }

      var dayOffset = weatherDayOffsetClient(normalizedQuestion);
      var detectedLocation = weatherLocationFromQuestionClient(normalizedQuestion);
      var locationQuery = detectedLocation || "Huánuco Peru";

      var geocodeUrl =
        "https://geocoding-api.open-meteo.com/v1/search?name=" +
        encodeURIComponent(locationQuery) +
        "&count=3&language=es&format=json";
      var geoData = await fetchJsonWithTimeoutClient(geocodeUrl, 8500);
      var geoResults = geoData && Array.isArray(geoData.results) ? geoData.results : [];
      if (!geoResults.length) {
        return "No pude identificar la ciudad del pronostico. Intenta por ejemplo: `manana llovera en Lima?`";
      }

      var geo = geoResults[0];
      var forecastUrl =
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        encodeURIComponent(geo.latitude) +
        "&longitude=" +
        encodeURIComponent(geo.longitude) +
        "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=7";
      var forecastData = await fetchJsonWithTimeoutClient(forecastUrl, 9000);
      var daily = forecastData && forecastData.daily ? forecastData.daily : null;
      if (!daily || !Array.isArray(daily.time) || !daily.time.length) {
        return "No pude obtener el pronostico del tiempo en este momento.";
      }

      var idx = Math.min(dayOffset, daily.time.length - 1);
      var weatherCode = Number((daily.weathercode || [])[idx]);
      var rainProb = Number((daily.precipitation_probability_max || [])[idx] || 0);
      var rainMm = Number((daily.precipitation_sum || [])[idx] || 0);
      var tMax = Number((daily.temperature_2m_max || [])[idx]);
      var tMin = Number((daily.temperature_2m_min || [])[idx]);
      var rainLikely = weatherRainLikelyClient(weatherCode, rainProb, rainMm);
      var whenText = dayOffset === 0 ? "hoy" : dayOffset === 1 ? "manana" : "pasado manana";
      var dateText = weatherDateTextClient((daily.time || [])[idx]);
      var place = [geo.name, geo.admin1, geo.country].filter(Boolean).join(", ");
      var rainText = rainLikely ? "si hay probabilidad de lluvia" : "no se espera lluvia importante";

      return (
        "Para " +
        place +
        ", " +
        whenText +
        " (" +
        dateText +
        ") " +
        rainText +
        ". " +
        "Probabilidad maxima: " +
        rainProb +
        "%, precipitacion estimada: " +
        rainMm.toFixed(1) +
        " mm. " +
        "Temperatura: minima " +
        tMin.toFixed(1) +
        "°C y maxima " +
        tMax.toFixed(1) +
        "°C. " +
        "Condicion: " +
        weatherCodeLabelClient(weatherCode) +
        ".\n\nFuente: Open-Meteo"
      );
    }

    var weekDaysClient = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    var dayOffsetsClient = {
      hoy: 0,
      ayer: -1,
      manana: 1,
      "pasado manana": 2,
      pasadomanana: 2,
      "antes de ayer": -2,
      anteayer: -2
    };

    function normalizeDayReferenceClient(value) {
      var ref = normalize(value || "");
      if (ref === "pasadomanana") return "pasado manana";
      if (ref === "anteayer") return "antes de ayer";
      return ref;
    }

    function parseRelativeDayCluesClient(normalizedQuestion) {
      var regex =
        /\b(antes de ayer|anteayer|pasado manana|pasadomanana|manana|ayer|hoy)\b(?:\s+(?:es|fue|sera|seria))?\s+\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/g;
      var clues = [];
      var match = regex.exec(normalizedQuestion);
      while (match) {
        var ref = normalizeDayReferenceClient(match[1] || "");
        var day = normalize(match[2] || "");
        var offset = dayOffsetsClient[ref];
        var dayIndex = weekDaysClient.indexOf(day);
        if (offset !== undefined && dayIndex !== -1) {
          var todayIndex = (dayIndex - offset + 700) % 7;
          clues.push(todayIndex);
        }
        match = regex.exec(normalizedQuestion);
      }
      return clues;
    }

    function answerRelativeDayQuestionClient(normalizedQuestion) {
      var looksLikeRelativeDayQuestion =
        /(si\s+)?(hoy|ayer|manana|pasado manana|pasadomanana|antes de ayer|anteayer)/.test(normalizedQuestion) &&
        /lunes|martes|miercoles|jueves|viernes|sabado|domingo/.test(normalizedQuestion);

      if (!looksLikeRelativeDayQuestion) {
        return null;
      }

      var clues = parseRelativeDayCluesClient(normalizedQuestion);
      if (!clues.length) {
        return null;
      }

      var uniqueToday = [];
      clues.forEach(function (value) {
        if (uniqueToday.indexOf(value) === -1) {
          uniqueToday.push(value);
        }
      });

      if (uniqueToday.length > 1) {
        return "La premisa es inconsistente: las condiciones indican dias distintos para hoy.";
      }

      return "Con esa premisa, hoy es " + weekDaysClient[uniqueToday[0]] + ".";
    }

    var familyRelationAliasesClient = {
      padre: "father",
      papa: "father",
      madre: "mother",
      mama: "mother",
      hermano: "brother",
      hermana: "sister",
      hijo: "son",
      hija: "daughter",
      abuelo: "grandfather",
      abuela: "grandmother",
      tio: "uncle",
      tia: "aunt",
      sobrino: "nephew",
      sobrina: "niece",
      nieto: "grandson",
      nieta: "granddaughter"
    };

    function looksLikeFamilyQuestionClient(normalizedQuestion) {
      return (
        /papa|padre|mama|madre|hermano|hermana|hijo|hija|abuelo|abuela|tio|tia|sobrino|sobrina|nieto|nieta/.test(
          normalizedQuestion
        ) && /(mi|de mi|para mi|que seria|quien seria|que es para mi)/.test(normalizedQuestion)
      );
    }

    function extractFamilyRelationChainClient(normalizedQuestion) {
      var relationRegex =
        /\b(padre|papa|madre|mama|hermano|hermana|hijo|hija|abuelo|abuela|tio|tia|sobrino|sobrina|nieto|nieta)\b/g;
      var matches = normalizedQuestion.match(relationRegex) || [];
      return matches
        .map(function (term) {
          return familyRelationAliasesClient[term] || "";
        })
        .filter(Boolean)
        .reverse();
    }

    function resolveFamilyRelationClient(chain) {
      if (!chain || !chain.length) {
        return "";
      }

      var direct = {
        father: "padre",
        mother: "madre",
        brother: "hermano",
        sister: "hermana",
        son: "hijo",
        daughter: "hija",
        grandfather: "abuelo",
        grandmother: "abuela",
        uncle: "tio",
        aunt: "tia",
        nephew: "sobrino",
        niece: "sobrina",
        grandson: "nieto",
        granddaughter: "nieta"
      };

      if (chain.length === 1) {
        return direct[chain[0]] || "";
      }

      var twoStep = {
        "mother>father": "abuelo",
        "father>father": "abuelo",
        "mother>mother": "abuela",
        "father>mother": "abuela",
        "mother>brother": "tio",
        "mother>sister": "tia",
        "father>brother": "tio",
        "father>sister": "tia",
        "mother>son": "hermano",
        "father>son": "hermano",
        "mother>daughter": "hermana",
        "father>daughter": "hermana",
        "brother>son": "sobrino",
        "brother>daughter": "sobrina",
        "sister>son": "sobrino",
        "sister>daughter": "sobrina",
        "son>son": "nieto",
        "son>daughter": "nieta",
        "daughter>son": "nieto",
        "daughter>daughter": "nieta"
      };
      var key2 = chain[0] + ">" + chain[1];
      if (twoStep[key2]) {
        return twoStep[key2];
      }

      if (chain.length >= 3) {
        var key3 = chain[0] + ">" + chain[1] + ">" + chain[2];
        var threeStep = {
          "mother>father>father": "bisabuelo",
          "mother>father>mother": "bisabuela",
          "mother>mother>father": "bisabuelo",
          "mother>mother>mother": "bisabuela",
          "father>father>father": "bisabuelo",
          "father>father>mother": "bisabuela",
          "father>mother>father": "bisabuelo",
          "father>mother>mother": "bisabuela",
          "mother>brother>son": "primo",
          "mother>brother>daughter": "prima",
          "mother>sister>son": "primo",
          "mother>sister>daughter": "prima",
          "father>brother>son": "primo",
          "father>brother>daughter": "prima",
          "father>sister>son": "primo",
          "father>sister>daughter": "prima"
        };
        if (threeStep[key3]) {
          return threeStep[key3];
        }
      }

      return "";
    }

    function answerFamilyRelationshipClient(normalizedQuestion) {
      if (!looksLikeFamilyQuestionClient(normalizedQuestion)) {
        return null;
      }

      var chain = extractFamilyRelationChainClient(normalizedQuestion);
      if (!chain.length) {
        return null;
      }

      var relation = resolveFamilyRelationClient(chain);
      if (!relation) {
        return "Puedo resolver parentescos directos. Prueba con una frase simple como: `el hermano de mi mama que es para mi`.";
      }

      return "Por parentesco, eso corresponde a tu " + relation + ".";
    }

    function isReasoningOrRelationalQuestionClient(normalizedQuestion) {
      if (
        /si\s+.*(ayer|hoy|manana|pasado manana|pasadomanana).*(que\s+dia|dia\s+es\s+hoy)/.test(
          normalizedQuestion
        )
      ) {
        return true;
      }
      if (looksLikeFamilyQuestionClient(normalizedQuestion)) {
        return true;
      }
      return /que seria para mi|que es para mi|quien seria para mi/.test(normalizedQuestion);
    }

    var ambiguousSearchTokensClient = {
      hoy: true,
      dia: true,
      fecha: true,
      hora: true,
      actual: true,
      actualmente: true,
      ayer: true,
      manana: true,
      pasado: true,
      semana: true,
      mes: true,
      ano: true
    };

    function getMeaningfulQuestionTokensClient(question) {
      return tokenize(question || "")
        .filter(function (token) {
          return token && token.length >= 3;
        })
        .filter(function (token) {
          return !ambiguousSearchTokensClient[token];
        });
    }

    function isTopicallyAlignedClient(question, candidateText) {
      var qTokens = tokenize(question).filter(function (token) {
        return token && token.length >= 3;
      });
      var meaningfulTokens = qTokens.filter(function (token) {
        return !ambiguousSearchTokensClient[token];
      });
      var cTokenSet = {};
      tokenize(candidateText || "").forEach(function (token) {
        cTokenSet[token] = true;
      });

      if (!qTokens.length) {
        return false;
      }

      var shared = 0;
      qTokens.forEach(function (token) {
        if (cTokenSet[token]) {
          shared += 1;
        }
      });

      var coverage = shared / qTokens.length;
      if (qTokens.length <= 2) {
        if (!meaningfulTokens.length) return false;
        return shared >= Math.max(1, Math.min(2, meaningfulTokens.length));
      }
      if (!meaningfulTokens.length && coverage < 0.9) {
        return false;
      }
      return shared >= 2 || coverage >= 0.45;
    }

    function pickCountryFromQuestionClient(normalizedQuestion) {
      var match = normalizedQuestion.match(/presidente(?:\s+actual)?(?:\s+de(?:l|la)?\s+)([a-z\s]+)/i);
      if (!match || !match[1]) {
        return null;
      }
      var cleaned = match[1]
        .replace(/\b(hoy|ahora|actual|actualmente)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return cleaned || null;
    }

    function getEntityLabelClient(entity, lang) {
      var targetLang = lang || "es";
      if (!entity || !entity.labels) {
        return "";
      }
      if (entity.labels[targetLang] && entity.labels[targetLang].value) {
        return entity.labels[targetLang].value;
      }
      if (entity.labels.en && entity.labels.en.value) {
        return entity.labels.en.value;
      }
      var firstKey = Object.keys(entity.labels)[0];
      if (!firstKey || !entity.labels[firstKey]) {
        return "";
      }
      return entity.labels[firstKey].value || "";
    }

    function chooseCurrentHeadClaimClient(claims) {
      if (!Array.isArray(claims) || !claims.length) {
        return null;
      }
      var valid = claims.filter(function (claim) {
        return (
          claim &&
          claim.mainsnak &&
          claim.mainsnak.snaktype === "value" &&
          claim.mainsnak.datavalue &&
          claim.mainsnak.datavalue.value &&
          claim.mainsnak.datavalue.value.id
        );
      });
      if (!valid.length) {
        return null;
      }
      var noEnd = valid.filter(function (claim) {
        var qualifiers = claim.qualifiers || {};
        return !Array.isArray(qualifiers.P582) || qualifiers.P582.length === 0;
      });
      var base = noEnd.length ? noEnd : valid;
      var preferred = base.filter(function (claim) {
        return claim.rank === "preferred";
      });
      return preferred[0] || base[0] || null;
    }

    async function answerCurrentPresidentClient(normalizedQuestion) {
      if (!/presidente/.test(normalizedQuestion)) {
        return null;
      }

      var country = pickCountryFromQuestionClient(normalizedQuestion);
      if (!country && /peru/.test(normalizedQuestion)) {
        country = "peru";
      }
      if (!country) {
        return null;
      }

      var searchUrl =
        "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=es&type=item&limit=8&search=" +
        encodeURIComponent(country) +
        "&origin=*";
      var searchData = await fetchJsonWithTimeoutClient(searchUrl, 8000);
      var searchItems = searchData && Array.isArray(searchData.search) ? searchData.search : [];
      if (!searchItems.length) {
        return null;
      }

      var selected = searchItems[0];
      for (var i = 0; i < searchItems.length; i += 1) {
        var desc = normalize(searchItems[i].description || "");
        if (desc.indexOf("pais") !== -1 || desc.indexOf("estado soberano") !== -1 || desc.indexOf("country") !== -1) {
          selected = searchItems[i];
          break;
        }
      }

      var countryId = selected && selected.id ? selected.id : "";
      if (!countryId) {
        return null;
      }

      var countryEntityData = await fetchJsonWithTimeoutClient(
        "https://www.wikidata.org/wiki/Special:EntityData/" + encodeURIComponent(countryId) + ".json",
        9000
      );
      var countryEntity =
        countryEntityData &&
        countryEntityData.entities &&
        countryEntityData.entities[countryId]
          ? countryEntityData.entities[countryId]
          : null;
      if (!countryEntity || !countryEntity.claims || !countryEntity.claims.P35) {
        return null;
      }

      var claim = chooseCurrentHeadClaimClient(countryEntity.claims.P35);
      if (!claim) {
        return null;
      }

      var personId = claim.mainsnak.datavalue.value.id;
      if (!personId) {
        return null;
      }

      var personEntityData = await fetchJsonWithTimeoutClient(
        "https://www.wikidata.org/wiki/Special:EntityData/" + encodeURIComponent(personId) + ".json",
        9000
      );
      var personEntity =
        personEntityData &&
        personEntityData.entities &&
        personEntityData.entities[personId]
          ? personEntityData.entities[personId]
          : null;
      if (!personEntity) {
        return null;
      }

      var personName = getEntityLabelClient(personEntity, "es");
      var countryName = getEntityLabelClient(countryEntity, "es") || country;
      if (!personName) {
        return null;
      }

      return (
        "El presidente actual de " +
        countryName +
        " es " +
        personName +
        ".\n\nFuente: Wikidata (" +
        countryId +
        ", " +
        personId +
        ")"
      );
    }

    async function answerFromWikipediaClient(question) {
      if (!getMeaningfulQuestionTokensClient(question).length) {
        return null;
      }

      var searchUrl =
        "https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
        encodeURIComponent(question) +
        "&utf8=1&format=json&origin=*";
      var searchData = await fetchJsonWithTimeoutClient(searchUrl, 8000);
      var results =
        searchData &&
        searchData.query &&
        Array.isArray(searchData.query.search)
          ? searchData.query.search
          : [];
      if (!results.length) {
        return null;
      }

      var title = results[0].title;
      var summaryUrl = "https://es.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title);
      var summaryData = await fetchJsonWithTimeoutClient(summaryUrl, 9000);
      var extract = summaryData && summaryData.extract ? String(summaryData.extract).trim() : "";
      if (!extract) {
        return null;
      }
      if (extract.length > 520) {
        extract = extract.slice(0, 520).trim() + "...";
      }
      if (!isTopicallyAlignedClient(question, title + " " + extract)) {
        return null;
      }
      return extract + "\n\nFuente: Wikipedia (" + title + ")";
    }

    async function answerWithFreeWebIntelligenceClient(question, normalizedQuestion) {
      var dateTimeAnswer = answerDateTimeQuestion(question);
      if (dateTimeAnswer) {
        return dateTimeAnswer;
      }

      var weatherAnswer = await answerWeatherClient(question, normalizedQuestion);
      if (weatherAnswer) {
        return weatherAnswer;
      }

      var relativeDayAnswer = answerRelativeDayQuestionClient(normalizedQuestion);
      if (relativeDayAnswer) {
        return relativeDayAnswer;
      }

      var familyAnswer = answerFamilyRelationshipClient(normalizedQuestion);
      if (familyAnswer) {
        return familyAnswer;
      }

      var reasoningOrRelational = isReasoningOrRelationalQuestionClient(normalizedQuestion);

      var presidentAnswer = await answerCurrentPresidentClient(normalizedQuestion);
      if (presidentAnswer) {
        return presidentAnswer;
      }

      if (reasoningOrRelational) {
        return "No pude resolver esa pregunta capciosa con suficiente confianza en modo basico. Si activas un proveedor IA en la nube en el backend, respondere con mejor razonamiento.";
      }

      var wikiAnswer = await answerFromWikipediaClient(question);
      if (wikiAnswer) {
        return wikiAnswer;
      }

      return null;
    }

    async function generateAssistantAnswer(question) {
      var normalizedQuestion = normalize(question);
      var mathResult = solveMathQuestion(question);
      if (mathResult.handled) {
        return mathResult.answer;
      }

      var dateTimeAnswer = answerDateTimeQuestion(question);
      if (dateTimeAnswer) {
        return dateTimeAnswer;
      }

      var serverAnswer = await askServerAssistant(question);
      if (serverAnswer) {
        return serverAnswer;
      }

      var queryTokens = tokensFromQuestion(question);
      if (!queryTokens.length) {
        return "Hazme una pregunta mas especifica y te ayudare.";
      }

      var schoolIntent = isSchoolIntent(normalizedQuestion, queryTokens);
      if (schoolIntent) {
        var tuitionAnswer = answerFromTuitionData(normalizedQuestion, queryTokens);
        if (tuitionAnswer) {
          return tuitionAnswer;
        }

        var siteAnswer = answerFromSiteCorpus(queryTokens);
        if (siteAnswer) {
          return siteAnswer;
        }

        return "No encontre esa informacion exacta en el contenido del sitio. Prueba con otra formulacion y te doy la respuesta con la fuente.";
      }

      var freeWebAnswer = await answerWithFreeWebIntelligenceClient(question, normalizedQuestion);
      if (freeWebAnswer) {
        return freeWebAnswer;
      }

      return "No estoy conectado al motor inteligente en este momento. Verifica que el backend del chatbot este activo y recarga la pagina (Ctrl+F5).";
    }

    function addMessage(text, role) {
      var item = document.createElement("div");
      item.className = "schoolbot-msg schoolbot-msg-" + role;
      item.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");
      messagesEl.appendChild(item);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function openPanel() {
      chatbotPanel.classList.add("is-open");
      chatbotPanel.setAttribute("aria-hidden", "false");
      inputEl.focus();
    }

    function closePanel() {
      chatbotPanel.classList.remove("is-open");
      chatbotPanel.setAttribute("aria-hidden", "true");
    }

    function updatePosition() {
      var rect = whatsappBtn.getBoundingClientRect();
      var whatsappBottomGap = Math.max(10, window.innerHeight - rect.bottom);
      var whatsappRightGap = Math.max(10, window.innerWidth - rect.right);
      var botWidth = chatbotButton.offsetWidth || 56;
      var verticalGap = 10;
      var chatbotBottom = whatsappBottomGap + rect.height + verticalGap;
      var alignedRight = whatsappRightGap + (rect.width - botWidth) / 2;
      var maxRight = Math.max(12, window.innerWidth - botWidth - 12);
      var chatbotRight = Math.min(maxRight, Math.max(12, alignedRight));
      var panelRight = Math.max(12, window.innerWidth - rect.right);
      var panelBottom = Math.max(95, window.innerHeight - rect.top + 12);

      chatbotButton.style.bottom = chatbotBottom + "px";
      chatbotButton.style.right = chatbotRight + "px";
      chatbotPanel.style.right = panelRight + "px";
      chatbotPanel.style.bottom = panelBottom + "px";
    }

    async function loadExtraPages() {
      var pages = collectInternalPages();
      var fetchTasks = pages.map(function (url) {
        return fetch(url.href)
          .then(function (response) {
            if (!response.ok) return "";
            return response.text();
          })
          .then(function (html) {
            if (!html) return;
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, "text/html");
            addCorpusFromDocument(doc, fileNameFromPath(url.pathname));
          })
          .catch(function () {
            return null;
          });
      });

      await Promise.all(fetchTasks);
    }

    seedTuitionKnowledge();
    addCorpusFromDocument(document, fileNameFromPath(window.location.pathname));
    addMessage(botGreeting, "bot");
    updatePosition();
    setTimeout(updatePosition, 400);

    loadExtraPages();

    chatbotButton.addEventListener("click", function () {
      if (chatbotPanel.classList.contains("is-open")) {
        closePanel();
      } else {
        openPanel();
      }
    });

    closeEl.addEventListener("click", closePanel);

    var isThinking = false;

    formEl.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (isThinking) {
        return;
      }
      var question = (inputEl.value || "").trim();
      if (!question) {
        return;
      }

      isThinking = true;
      addMessage(question, "user");
      inputEl.value = "";

      var sendButton = formEl.querySelector(".schoolbot-send");
      if (sendButton) {
        sendButton.disabled = true;
      }
      inputEl.disabled = true;

      var answer;
      try {
        answer = await generateAssistantAnswer(question);
      } catch (error) {
        answer = "Ocurrio un error al procesar la pregunta. Intenta nuevamente.";
      }

      addMessage(answer, "bot");

      inputEl.disabled = false;
      if (sendButton) {
        sendButton.disabled = false;
      }
      inputEl.focus();
      isThinking = false;
    });

    window.addEventListener("resize", updatePosition);
    chatbotButton.dataset.chatbotReady = "1";
    return true;
  }

  var schoolbotInitObserver = null;

  function bootSchoolChatbot() {
    if (initSchoolChatbot()) {
      if (schoolbotInitObserver) {
        schoolbotInitObserver.disconnect();
        schoolbotInitObserver = null;
      }
      return;
    }

    setTimeout(initSchoolChatbot, 0);
    setTimeout(initSchoolChatbot, 60);

    if (!window.MutationObserver || schoolbotInitObserver) {
      return;
    }

    var observeTarget = document.body || document.documentElement;
    schoolbotInitObserver = new MutationObserver(function () {
      if (initSchoolChatbot()) {
        schoolbotInitObserver.disconnect();
        schoolbotInitObserver = null;
      }
    });

    schoolbotInitObserver.observe(observeTarget, { childList: true, subtree: true });

    setTimeout(function () {
      if (!schoolbotInitObserver) return;
      schoolbotInitObserver.disconnect();
      schoolbotInitObserver = null;
    }, 4000);
  }

  bootSchoolChatbot();
  $(window).on("load", bootSchoolChatbot);

})(jQuery);

