/* require("./utils"); */
/* require("./pjax"); */
/* require("./scrollspy");
require("./loaded")(); */

$(function () {
    /* var vConsole = new VConsole(); */
    //下拉自动刷新
    $(window).scroll(function () {
        //下面这句主要是获取网页的总高度，主要是考虑兼容性所以把Ie支持的documentElement也写了，这个方法至少支持IE8
        var htmlHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
        //clientHeight是网页在浏览器中的可视高度，
        var clientHeight = $(this).height() + 100;
        //scrollTop是浏览器滚动条的top位置，
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        //如果滚动条高度加上窗口可视高度大于网页高度

        /* console.log(Math.round(scrollTop / (htmlHeight - clientHeight) * 100))

        console.log(scrollTop, clientHeight, htmlHeight); */
        if (scrollTop + clientHeight > htmlHeight) {
            APPX.LoadMore();
        }
        if (scrollTop > 500) {
            $("#back-top").addClass("show")
        } else {
            $("#back-top").removeClass("show")
        }
    })

    APPX.LoadHeaderBg();
    APPX.LoadVideo();
    APPX.BackTop();
})

var APPX = {
    bgvideo: $("#bgvideo"),
    LoadMore() {
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
    },
    SPlay() {
        APPX.bgvideo[0].play();
        $('.video-msg').css({
            "bottom": "-80px"
        })
        $('#user-center').css({
            "top": "-300px"
        })
    },
    Spause() {
        APPX.bgvideo[0].pause();
        $('.video-msg').html('已暂停').css({
            "bottom": "0px"
        });
        $('#user-center').css({
            "top": "30%"
        })
    },
    AddSource() {
        $('.video-msg').html('正在载入视频 ...').css({
            "bottom": "0px"
        });
        let t = IndexConfig.videoUrl, // 视频列表
            _t = t[Math.floor(Math.random() * t.length)]; // 随机抽取视频
        APPX.bgvideo.attr('src', _t);
        APPX.bgvideo.attr('video-name', _t);
    },
    LoadVideo() {
        $('#video-btn').on('click', function () {
            if ($(this).hasClass('loadvideo')) {
                $(this).removeClass('loadvideo').removeClass('cg-bofang').addClass('cg-zanting').hide();
                APPX.AddSource();
                APPX.bgvideo[0].oncanplay = function () { // 数据可用时
                    $('#video-btn').show();
                    APPX.SPlay();
                }
            } else {
                if ($(this).hasClass('cg-zanting')) {
                    APPX.Spause();
                    $(this).removeClass('cg-zanting').addClass('cg-bofang');

                } else {
                    APPX.SPlay();
                    $(this).removeClass('cg-bofang').addClass('cg-zanting');
                }
            }
            APPX.bgvideo[0].onended = function () { // 播放结束后
                APPX.bgvideo.attr('src', '');
            }

        });
    },
    LoadHeaderBg() {
        if (!!window.IndexConfig) {
            let t = IndexConfig.headerbg,
                _t = t[Math.floor(Math.random() * t.length)];
            $("header.header").css({
                "background-image": `url(${_t})`
            });
        }
    },
    BackTop() {
        $("#back-top").on("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        })
    }
}