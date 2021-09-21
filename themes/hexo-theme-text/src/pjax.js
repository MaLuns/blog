
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
    require('./post-details')();
});