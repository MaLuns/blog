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

            //菜单
            $("#asideMenu").on("click", function () {
                $("#layout-content-aside").addClass('show');
                $("#sidebar-mask").addClass('show');
            })
            $("#sidebar-mask").on("click", function () {
                $("#layout-content-aside").removeClass('show');
                $("#sidebar-mask").removeClass('show');
            })

            //昼夜
            $("#lightBtn").on("click", function () {
                let checked = !app.setting.lightSwitch;
                root.classList[checked ? 'add' : 'remove']('dark')
                app.setSetting('lightSwitch', checked)
                $("#lightSwitch").attr('checked', checked)
            })
            $("#lightSwitch").on('change', function (ev) {
                let checked = ev.detail.checked;
                root.classList[checked ? 'add' : 'remove']('dark')
                app.setSetting('lightSwitch', checked)
            })

            //滤镜色
            $("#filterColor").on('change', function (ev) {
                let val = ev.detail.value;
                let cssval = val == 'none' ? 'transparent' :
                    (val == 'sunset' ? '#cbcca20f' : '#ca7c7c0f');
                root.style.setProperty('--filterColor', cssval);
                app.setSetting('filterColor', {
                    val,
                    css: [{
                        key: '--filterColor', val: cssval
                    }]
                })
            })

            //圆角
            $("#radiusSlider").on('input', function (ev) {
                let val = ev.detail.value;
                root.style.setProperty('--radius', val + 'px');
                app.setSetting('radiusSlider', {
                    val, css: [{ key: '--radius', val: val + 'px' }]
                })
            })

            //阴影
            $("#boxShadowBlur").on('change', function (ev) {
                let val = ev.detail.value;
                root.style.setProperty('--boxShadowBlur', val + 'px');
                app.setSetting('boxShadowBlur', {
                    val, css: [{ key: '--boxShadowBlur', val: val + 'px' }]
                })
            })

            //主题色
            /*  $("#themeColorPicker").on('change', function (ev) {
                 let rgba = this.color.toRGBA();
                 let rgb = `${rgba[0]},${rgba[1]},${rgba[2]}`;
                 let hexa = this.color.toHEXA().toString();
                 root.style.setProperty('--baseRgb', rgb)
                 root.style.setProperty('--base', hexa);
                 app.setSetting('themeColorPicker', {
                     css: [{ key: '--baseRgb', val: rgb }, { key: '--base', val: hexa }],
                     val: hexa
                 })
             }) */

            //字体
            $("#fontFamily").on("change", function (ev) {
                let val = ev.detail.value;
                root.style.setProperty('--fontFamily', val);
                app.setSetting('fontFamily', {
                    val, css: [{ key: '--fontFamily', val }]
                })
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