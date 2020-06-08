require('jquery-pjax')
const NProgress = require('nprogress')

NProgress.configure({
    showSpinner: false,
    easing: 'ease-out',
    speed: 1000
});

$(document).pjax('a', '#main', {
    fragment: '#main',
    timeout: 5000,
});

$(document).on('pjax:start', function () {
    NProgress.start();
    $('html, body').animate({
        scrollTop: $('#main').position().top / 2
    }, 500);
});

$(document).on('pjax:end', function () {
     NProgress.done();
    /* window.originTitle = document.title; */
});