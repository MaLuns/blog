function loaded() {
  $("#toc-content li>a").on("click", function(event) {
    event.preventDefault();
    if (!$(this).hasClass("active")) {
      var tActive = $(this).attr("href");
      $("#toc-content li>a").removeClass("active");
      $(this).addClass("active");

      window.scrollTo({
        top: $(tActive).offset().top,
        behavior: "smooth"
      });

      if (location.hash !== "") {
        history.pushState(
          "",
          document.title,
          window.location.pathname + window.location.search
        );
      }
    }
  });

  $(".post-block img").on("click", ImgToggle);

  initScrollSpy();

  function initScrollSpy() {
    var tocSelector = ".toc-content";

    $(tocSelector).on("activate.bs.scrollspy", function() {
      /* var $currentActiveElement = $(tocSelector + " .active").last();

      $currentActiveElement.addClass("active-current"); */
    });

    $("body").scrollspy({ target: tocSelector });
  }
}

function ImgToggle(event) {
  if ($(".img-wrap").length === 0) {
    let dimg = document.createElement("div");
    dimg.setAttribute("class", "img-wrap");
    dimg.addEventListener("click", ImgToggle);
    document.body.appendChild(dimg);
  }

  if ($(".img-wrap.show").length === 1) {
    $(".img-wrap")
      .empty()
      .removeClass("show");
  } else {
    $(".img-wrap")
      .append(event.target.cloneNode(true))
      .addClass("show");
  }
}

module.exports = loaded;
