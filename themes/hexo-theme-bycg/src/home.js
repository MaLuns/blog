
$(function () {
    /* var vConsole = new VConsole(); */
    //下拉自动刷新
    $(window).scroll(function () {
        var htmlHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
        var clientHeight = $(this).height() + 100;
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

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
        APPX.bgvideo.css({
            "background": "#000"
        });
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