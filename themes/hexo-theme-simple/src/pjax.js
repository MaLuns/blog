require('jquery-pjax')
const NProgress = require('nprogress')
/* import tcb from './tcb' */

NProgress.configure({
    showSpinner: false,
    easing: 'ease-out',
    speed: 1000
});

$(document).pjax('a._pjax', '.layout-content-content', {
    fragment: '.layout-content-content',
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
   /*  let a = $(arguments[1].responseText).find(".toc");
    if (a) {
        $("#post-toc").append(a)
    } */
    require('./post-details')();
    console.log(arguments)
});