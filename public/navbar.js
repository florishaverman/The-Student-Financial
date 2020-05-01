$(document).ready(function() {

  /* Resizing of the navigation bar */
  $(window).scroll(function() {
    if ($(document).scrollTop() > 50) {
      $(".navbar").stop();
      $(".navbar").animate({height: "10vh"});
      $(".navbrand").stop();
      $(".navbrand").animate({width: "25vw"});
    } else {
      $(".navbar").stop();
      $(".navbar").animate({height: "12vh"});
      $(".navbrand").stop();
      $(".navbrand").animate({width: "30vw"});
    }
  });

  /* Burgermenu dropdown */
  $(".burgermenu").click(function() {
    $(".container").stop();
    $(".container").css("display", "none");
    $(".container").animate({opacity: "0"}, 1000);
    $(".burger-dropdown").stop();
    $(".burger-dropdown").css("display", "flex");
    $("body").css("max-height", "100vh");
    $(".burger-dropdown").animate({opacity: "1"}, 1000);
  });

  /* Burgermenu close */
  $(".burger-close").click(function() {
    $(".container").stop();
    $(".container").css("display", "block");
    $(".container").animate({opacity: "1"}, 1000);
    $(".burger-dropdown").stop();
    $(".burger-dropdown").css("display", "none");
    $(".body").css("max-height", "none");
    $(".burger-dropdown").animate({opacity: "0"}, 1000);
  });

  /* Obtains the correct year for copyright notice */
  var currentYear = (new Date).getFullYear();
  $("#copyright-year").text(currentYear);

  /* This functions estimates reading time */
  var str = $(".article-body").html();
  //var words = str.trim().split(" ").length;
  var minutes = Math.round(360 / 180); // 180 is the average WPM that one reads on a monitor in English
  $("#reading-time").text(minutes);

});
