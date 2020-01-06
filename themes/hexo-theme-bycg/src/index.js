/* require("./utils"); */
/* require("./pjax"); */
/* require("./scrollspy");
require("./loaded")(); */

$(function () {
    //下拉自动刷新
    $(window).scroll(function () {
        //下面这句主要是获取网页的总高度，主要是考虑兼容性所以把Ie支持的documentElement也写了，这个方法至少支持IE8
        var htmlHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
        //clientHeight是网页在浏览器中的可视高度，
        var clientHeight = $(this).height() + 1;
        //scrollTop是浏览器滚动条的top位置，
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        //如果滚动条高度加上窗口可视高度大于网页高度

        console.log(Math.round(scrollTop /( htmlHeight-clientHeight)*100))
        
        if (scrollTop + clientHeight > htmlHeight) {
            loadMore();
        }
    })
})

function loadMore() {
    if (!!window.IndexConfig && !IndexConfig.loadMore && IndexConfig.current < IndexConfig.total) {
        IndexConfig.loadMore = true;
        $("#loader").addClass('loading').removeClass('loaded')
        $.ajax({
            url: IndexConfig.url + 'page/' + (++IndexConfig.current),
            success: function (res) {
                var result = $(res).find("article");
                $("#posts").append(result.fadeIn(5000))
            },
            error: function () {
                --IndexConfig.current;
            },
            complete: function () {
                IndexConfig.loadMore = false;
                $("#loader").addClass('loaded').removeClass('loading')
            }
        })
    }
}