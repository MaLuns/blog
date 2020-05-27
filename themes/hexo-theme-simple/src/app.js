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
        root.style.setProperty('--filterColor', ev.detail.value + 'px');
        app.setSetting('filterColor', {
            cssKey: '--filterColor',
            cssVal: ev.detail.value + 'px',
            val: ev.detail.value
        })
    })

    $("#radiusSlider").on('input', function (ev) {
        root.style.setProperty('--radius', ev.detail.value + 'px');
        app.setSetting('radiusSlider', {
            cssKey: '--radius',
            cssVal: ev.detail.value + 'px',
            val: ev.detail.value
        })
    })

    $("#boxShadowBlur").on('change', function (ev) {
        root.style.setProperty('--boxShadowBlur', ev.detail.value + 'px');
        app.setSetting('boxShadowBlur', {
            cssKey: '--boxShadowBlur',
            cssVal: ev.detail.value + 'px',
            val: ev.detail.value
        })
    })

    $("#themeColorPicker").on('change', function (ev) {
        let rgba = this.color.toRGBA();
        root.style.setProperty('--baseRgb', `${rgba[0]},${rgba[1]},${rgba[2]}`)
        root.style.setProperty('--base', this.color.toHEXA().toString());
    })

    //下拉自动刷新
    $(window).scroll(function () {
        var htmlHeight = document.body.scrollHeight || root.scrollHeight;
        var clientHeight = $(this).height() + 100;
        var scrollTop = document.body.scrollTop || root.scrollTop;

        if (scrollTop + clientHeight > htmlHeight) {
            app.LoadMore();
        }
        if (scrollTop > 500) {
            $("#back-top").addClass("show")
        } else {
            $("#back-top").removeClass("show")
        }
    })
    app.initSetting()
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
                    $("#filterColor").attr('checked', setting[key].val)
                    break
                case 'radiusSlider':
                    document.getElementById("radiusSlider").value = setting[key].val;
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
