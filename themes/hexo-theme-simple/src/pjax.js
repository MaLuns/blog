
const NProgress = require('nprogress')

NProgress.configure({
    showSpinner: false,
    easing: 'ease-out',
    speed: 1000
});

$(document).pjax('a._pjax', '#main', {
    fragment: '#main',
    timeout: 5000,
});

$(document).on('pjax:start', function () {
    NProgress.start();
    $('html, body').animate({
        scrollTop: 0
    }, 500);
});


$(document).on('pjax:end', function () {
    NProgress.done();
    let html = $(arguments[1].responseText);
    let toc = html.find("#post-toc");
    $("#post-toc").empty().append(toc);
    require('./post-details')();
    /* console.log(toc, arguments) */
});