const apFixed = new APlayer({
    element: document.getElementById('aplayer-fixed'),
    mutex: true,
    theme: '#97dffd',
    order: 'random',
    lrcType: 0,
    fixed: true,
});
$.ajax({
    url: 'https://api.i-meto.com/meting/api?server=netease&type=playlist&id=450572462',
    success: function (list) {
        apFixed.list.add(list);
    }
});