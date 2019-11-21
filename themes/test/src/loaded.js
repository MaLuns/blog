function loaded() {
    $('#toc-content li>a').on('click', function (event) {
        event.preventDefault();
        if (!$(this).hasClass('active')) {

            var tActive = $(this).attr('href');
            $('#toc-content li>a').removeClass('active');
            $(this).addClass('active');

            window.scrollTo({
                top: $(tActive).offset().top,
                behavior: "smooth"
            });

            if (location.hash !== '') {
                history.pushState('', document.title, window.location.pathname + window.location.search);
            }
        }
    });
}
module.exports = loaded;