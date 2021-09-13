$(function () {

    const app = {
        setting: localStorage.getItem('setting') ? JSON.parse(localStorage.getItem('setting')) : {},
        initSettingEvent() {
            let root = document.documentElement;
            $("#back-top").on("click", function () {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            })

            $("#lightSwitch").on('click', function (ev) {
                let that = $(ev.delegateTarget)
                let checked = that.hasClass('theme-toggle--checked')
                if (checked) {
                    that.removeClass('theme-toggle--checked')
                } else {
                    that.addClass('theme-toggle--checked')
                }
                root.classList[checked ? 'add' : 'remove']('dark')
                app.setSetting('lightSwitch', checked)
            })
        },
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
        initSetting() {
            let setting = this.setting;
            for (const key in setting) {
                switch (key) {
                    case 'lightSwitch':
                        $("#lightSwitch").attr('checked', setting[key])
                        break
                    case 'filterColor':
                    case 'radiusSlider':
                    case 'boxShadowBlur':
                    case 'fontFamily':
                    /* case 'themeColorPicker':
                        document.getElementById(key).value = setting[key].val;
                        break */
                    default:
                        break
                }

            }
        },
        setSetting(key, value) {
            this.setting[key] = value;
            localStorage.setItem('setting', JSON.stringify(this.setting))
        },
        scroll() {
            let root = document.documentElement;

            var htmlHeight = document.body.scrollHeight || root.scrollHeight;
            var clientHeight = $(window).height() + 100;
            var scrollTop = document.body.scrollTop || root.scrollTop;

            if (scrollTop + clientHeight > htmlHeight) {
                app.LoadMore();
            }
            if (scrollTop > 100) {
                $(".layout-header").addClass('fixed')
            } else {
                $(".layout-header").removeClass('fixed')
            }
            if (scrollTop > 500) {
                $(".backtop").addClass("show")
            } else {
                $(".backtop").removeClass("show")
            }
        }
    }

    $(window).scroll(app.scroll)

    app.initSetting();
    app.initSettingEvent();
    app.scroll();

    mediumZoom('article img', {
        margin: 24,
        background: '#00000077',
        scrollOffset: 0
    })
})