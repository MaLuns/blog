$(function () {
    let root = document.documentElement;
    $("#back-top").on("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    })

    $("#lightSwitch").on('change', function (ev) {
        let checked = ev.detail.checked;
        root.classList[checked ? 'add' : 'remove']('dark')
        app.setSetting('lightSwitch', checked)
    })

    $("#filterColor").on('change', function (ev) {
        let val = ev.detail.value;
        let cssval = val == 'none' ? 'transparent' :
            (val == 'sunset' ? '#cbcca22b' : '#ca7c7c26');
        root.style.setProperty('--filterColor', cssval);
        app.setSetting('filterColor', {
            val, css: [{
                key: '--filterColor', val: cssval
            }]
        })
    })

    $("#radiusSlider").on('input', function (ev) {
        let val = ev.detail.value;
        root.style.setProperty('--radius', val + 'px');
        app.setSetting('radiusSlider', {
            val, css: [{ key: '--radius', val: val + 'px' }]
        })
    })

    $("#boxShadowBlur").on('change', function (ev) {
        let val = ev.detail.value;
        root.style.setProperty('--boxShadowBlur', val + 'px');
        app.setSetting('boxShadowBlur', {
            val, css: [{ key: '--boxShadowBlur', val: val + 'px' }]
        })
    })

    $("#themeColorPicker").on('change', function (ev) {
        let rgba = this.color.toRGBA();
        let rgb = `${rgba[0]},${rgba[1]},${rgba[2]}`;
        let hexa = this.color.toHEXA().toString();
        root.style.setProperty('--baseRgb', rgb)
        root.style.setProperty('--base', hexa);
        app.setSetting('themeColorPicker', {
            css: [{ key: '--baseRgb', val: rgb }, { key: '--base', val: hexa }],
            val: hexa
        })
    })

    $(window).scroll(function () {
        var htmlHeight = document.body.scrollHeight || root.scrollHeight;
        var clientHeight = $(this).height() + 100;
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
    })

    app.initSetting();
})



const app = {
    setting: localStorage.getItem('setting') ? JSON.parse(localStorage.getItem('setting')) : {},
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
                case 'themeColorPicker':
                    document.getElementById(key).value = setting[key].val;
                    break
                default:
                    break
            }

        }
    },
    setSetting(key, value) {
        this.setting[key] = value;
        localStorage.setItem('setting', JSON.stringify(this.setting))
    }
}
