function postDetails() {

    $(document).ready(function () {

        initScrollSpy();

        function initScrollSpy() {
            var tocSelector = '#post-toc';
            var $tocElement = $(tocSelector);
            var activeCurrentSelector = '.active-current';

            $tocElement
                .on('activate.bs.scrollspy', function () {
                    var $currentActiveElement = $(tocSelector + ' .active').last();

                    removeCurrentActiveClass();
                    $currentActiveElement.addClass('active-current');

                    // Scrolling to center active TOC element if TOC content is taller then viewport.
                    $tocElement.scrollTop($currentActiveElement.offset().top - $tocElement.offset().top + $tocElement.scrollTop() - ($tocElement.height() / 2));
                })
                .on('clear.bs.scrollspy', removeCurrentActiveClass);

            $('body').scrollspy({ target: tocSelector });

            function removeCurrentActiveClass() {
                $(tocSelector + ' ' + activeCurrentSelector)
                    .removeClass(activeCurrentSelector.substring(1));
            }
        }

    });

    $(document).ready(function () {

        $('#post-toc a').on('click', function (e) {
            e.preventDefault();
            var offset = $(this.getAttribute('href')).offset().top;
            $('html, body').stop().animate({
                scrollTop: offset - 100
            }, 500);
        });


    });
}

module.exports = postDetails;
