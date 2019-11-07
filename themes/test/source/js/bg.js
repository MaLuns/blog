(function () {
    if (document.getElementById('canvasbg')) {
        var c = document.getElementById('canvasbg'),
            ctx = c.getContext('2d'),
            pr = window.devicePixelRatio || 1,
            w = window.innerWidth,
            h = window.innerHeight,
            f = 90,
            q,
            m = Math,
            r = 0,
            u = m.PI * 2,
            cos = m.cos,
            random = m.random
        c.width = w * pr
        c.height = h * pr
        c.style.width = '100%';
        ctx.scale(pr, pr)
        ctx.globalAlpha = 0.6
        function evanyou() {
            ctx.clearRect(0, 0, w, h)
            q = [{ x: 0, y: h * .7 + f }, { x: 0, y: h * .7 - f }]
            while (q[1].x < w + f) d(q[0], q[1])
        }
        function d(i, j) {
            ctx.beginPath()
            ctx.moveTo(i.x, i.y)
            ctx.lineTo(j.x, j.y)
            var k = j.x + (random() * 2 - 0.25) * f,
                n = y(j.y)
            ctx.lineTo(k, n)
            ctx.closePath()
            r -= u / -50
            ctx.fillStyle = '#' + (cos(r) * 127 + 128 << 16 | cos(r + u / 3) * 127 + 128 << 8 | cos(r + u / 3 * 2) * 127 + 128).toString(16)
            ctx.fill()
            q[0] = q[1]
            q[1] = { x: k, y: n }
        }
        function y(p) {
            var t = p + (random() * 2 - 1.1) * f
            return (t > h || t < 0) ? y(p) : t
        }
        document.onclick = evanyou
        document.ontouchstart = evanyou
        evanyou()
    }
})();