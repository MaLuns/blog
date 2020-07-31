'use strict';
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
var STEP_LENGTH = 1;
var CELL_SIZE = 3;
var BORDER_WIDTH = 2;
var MAX_FONT_SIZE = 150;
var MAX_ELECTRONS = 100;
var CELL_DISTANCE = CELL_SIZE + BORDER_WIDTH;
var CELL_REPAINT_DURATION = [300, 500];
var BG_COLOR = '#141414';
var BORDER_COLOR = '#000';
var CELL_HIGHLIGHT = '#ff574a';
var ELECTRON_COLOR = '#ff5151';
var FONT_COLOR = '#ff574a';
var FONT_FAMILY = 'Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuan Yi Micro Hei", sans-serif';
var DPR = window.devicePixelRatio || 1;
var ACTIVE_ELECTRONS = [];
var PINNED_CELLS = [];
var MOVE_TRAILS = [[0, 1], [0, -1], [1, 0], [- 1, 0]].map(function (_ref) {
    var x = _ref[0];
    var y = _ref[1];
    return [x * CELL_DISTANCE, y * CELL_DISTANCE]
});
var END_POINTS_OFFSET = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (_ref2) {
    var x = _ref2[0];
    var y = _ref2[1];
    return [x * CELL_DISTANCE - BORDER_WIDTH / 2, y * CELL_DISTANCE - BORDER_WIDTH / 2]
});
var FullscreenCanvas = function () {
    function FullscreenCanvas(disableScale = false) {
        _classCallCheck(this, FullscreenCanvas);
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        this.canvas = canvas;
        this.context = context;
        this.disableScale = disableScale;
        this.resizeHandlers = [];
        this.handleResize = _.debounce(this.handleResize.bind(this), 100);
        this.adjust();
        window.addEventListener('resize', this.handleResize)
    }

    FullscreenCanvas.prototype.adjust = function (height = 350) {
        var canvas = this.canvas;
        var context = this.context;
        var disableScale = this.disableScale;
        var _window = window;
        var innerWidth = _window.innerWidth;
        var innerHeight = height || _window.innerHeight;
        this.width = innerWidth;
        this.height = innerHeight;
        var scale = disableScale ? 1 : DPR;
        this.realWidth = canvas.width = innerWidth * scale;
        this.realHeight = canvas.height = innerHeight * scale;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        context.scale(scale, scale)
    };

    FullscreenCanvas.prototype.clear = function () {
        var context = this.context;
        context.clearRect(0, 0, this.width, this.height)
    };

    FullscreenCanvas.prototype.makeCallback = function (fn) {
        fn(this.context, this)
    };

    FullscreenCanvas.prototype.blendBackground = function (background) {
        var opacity = arguments.length <= 1 || arguments[1] === undefined ? 0.1 : arguments[1];
        return this.paint(function (ctx, _ref3) {
            var realWidth = _ref3.realWidth;
            var realHeight = _ref3.realHeight;
            var width = _ref3.width;
            var height = _ref3.height;
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = opacity;
            ctx.drawImage(background, 0, 0, realWidth, realHeight, 0, 0, width, height);
            ctx.restore()
        })
    };

    FullscreenCanvas.prototype.paint = function (fn) {
        if (!_.isFunction(fn)) return;
        this.makeCallback(fn);
        return this
    };

    FullscreenCanvas.prototype.repaint = function (fn) {
        if (!_.isFunction(fn)) return;
        this.clear();
        return this.paint(fn)
    };

    FullscreenCanvas.prototype.onResize = function (fn) {
        if (!_.isFunction(fn)) return;
        this.resizeHandlers.push(fn)
    };

    FullscreenCanvas.prototype.handleResize = function () {
        var resizeHandlers = this.resizeHandlers;
        if (!resizeHandlers.length) return;
        this.adjust();
        resizeHandlers.forEach(this.makeCallback.bind(this))
    };

    FullscreenCanvas.prototype.renderIntoView = function () {
        this.container = document.querySelector("#header")
        this.container.appendChild(this.canvas)
    };

    FullscreenCanvas.prototype.remove = function () {
        if (!this.container) return;
        try {
            this.container.removeChild(this.canvas)
        } catch (e) { }
    };
    return FullscreenCanvas
}();

var Electron = function () {
    function Electron() {
        var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var _ref4 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
        var _ref4$lifeTime = _ref4.lifeTime;
        var lifeTime = _ref4$lifeTime === undefined ? 3 * 1e3 : _ref4$lifeTime;
        var _ref4$speed = _ref4.speed;
        var speed = _ref4$speed === undefined ? STEP_LENGTH : _ref4$speed;
        var _ref4$color = _ref4.color;
        var color = _ref4$color === undefined ? ELECTRON_COLOR : _ref4$color;
        _classCallCheck(this, Electron);
        if (color.length === 4) {
            color = color.replace(/[0-9a-f]/g,
                function (c) {
                    return '' + c + c
                })
        }
        this.lifeTime = lifeTime;
        this.expireAt = Date.now() + lifeTime;
        this.speed = speed;
        this.color = color;
        this.shadowColor = this.buildShadowColor(color);
        this.radius = BORDER_WIDTH / 2;
        this.current = [x, y];
        this.visited = {};
        this.setDest(this.randomPath())
    }
    Electron.prototype.buildShadowColor = function buildShadowColor(color) {
        var rgb = color.match(/[0-9a-f]{2}/ig).map(function (hex) {
            return parseInt(hex, 16)
        });
        return 'rgba(' + rgb.join(', ') + ', 0.8)'
    };
    Electron.prototype.randomPath = function randomPath() {
        var _current = this.current;
        var x = _current[0];
        var y = _current[1];
        var length = MOVE_TRAILS.length;
        var _MOVE_TRAILS$_$random = MOVE_TRAILS[_.random(length - 1)];
        var deltaX = _MOVE_TRAILS$_$random[0];
        var deltaY = _MOVE_TRAILS$_$random[1];
        return [x + deltaX, y + deltaY]
    };
    Electron.prototype.composeCoord = function composeCoord(coord) {
        return coord.join(',')
    };
    Electron.prototype.hasVisited = function hasVisited(dest) {
        var key = this.composeCoord(dest);
        return this.visited[key]
    };
    Electron.prototype.setDest = function setDest(dest) {
        this.destination = dest;
        this.visited[this.composeCoord(dest)] = true
    };
    Electron.prototype.next = function next() {
        var speed = this.speed;
        var current = this.current;
        var destination = this.destination;
        if (Math.abs(current[0] - destination[0]) <= speed / 2 && Math.abs(current[1] - destination[1]) <= speed / 2) {
            destination = this.randomPath();
            var tryCnt = 1;
            var maxAttempt = 4;
            while (this.hasVisited(destination) && tryCnt <= maxAttempt) {
                tryCnt++;
                destination = this.randomPath()
            }
            this.setDest(destination)
        }
        var deltaX = destination[0] - current[0];
        var deltaY = destination[1] - current[1];
        if (deltaX) {
            current[0] += deltaX / Math.abs(deltaX) * speed
        }
        if (deltaY) {
            current[1] += deltaY / Math.abs(deltaY) * speed
        }
        return [].concat(this.current)
    };
    Electron.prototype.paintNextTo = function paintNextTo() {
        var _ref5 = arguments.length <= 0 || arguments[0] === undefined ? new FullscreenCanvas() : arguments[0];
        var context = _ref5.context;
        var radius = this.radius;
        var color = this.color;
        var shadowColor = this.shadowColor;
        var expireAt = this.expireAt;
        var lifeTime = this.lifeTime;
        var _next = this.next();
        var x = _next[0];
        var y = _next[1];
        context.save();
        context.globalAlpha = Math.max(0, expireAt - Date.now()) / lifeTime;
        context.fillStyle = color;
        context.shadowBlur = radius * 5;
        context.shadowColor = shadowColor;
        context.globalCompositeOperation = 'lighter';
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.closePath();
        context.fill();
        context.restore()
    };
    return Electron
}();

var Cell = function () {
    function Cell() {
        var lineIdx = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var rowIndex = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var _ref6 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
        var _ref6$electronCount = _ref6.electronCount;
        var electronCount = _ref6$electronCount === undefined ? _.random(1, 4) : _ref6$electronCount;
        var _ref6$background = _ref6.background;
        var background = _ref6$background === undefined ? ELECTRON_COLOR : _ref6$background;
        var _ref6$forceElectrons = _ref6.forceElectrons;
        var forceElectrons = _ref6$forceElectrons === undefined ? false : _ref6$forceElectrons;
        var _ref6$electronOptions = _ref6.electronOptions;
        var electronOptions = _ref6$electronOptions === undefined ? {} : _ref6$electronOptions;
        _classCallCheck(this, Cell);
        this.background = background;
        this.electronOptions = electronOptions;
        this.forceElectrons = forceElectrons;
        this.electronCount = Math.min(electronCount, 4);
        this.startX = lineIdx * CELL_DISTANCE;
        this.startY = rowIndex * CELL_DISTANCE
    }
    Cell.prototype.pin = function pin() {
        var lifeTime = arguments.length <= 0 || arguments[0] === undefined ? -1 >>> 1 : arguments[0];
        this.expireAt = Date.now() + lifeTime;
        PINNED_CELLS.push(this)
    };
    Cell.prototype.scheduleUpdate = function scheduleUpdate() {
        var _ref7;
        this.nextUpdate = Date.now() + (_ref7 = _).random.apply(_ref7, CELL_REPAINT_DURATION)
    };
    Cell.prototype.paintNextTo = function paintNextTo() {
        var _ref8 = arguments.length <= 0 || arguments[0] === undefined ? new FullscreenCanvas() : arguments[0];
        var context = _ref8.context;
        var startX = this.startX;
        var startY = this.startY;
        var background = this.background;
        var nextUpdate = this.nextUpdate;
        if (nextUpdate && Date.now() < nextUpdate) return;
        this.scheduleUpdate();
        this.createElectrons();
        context.save();
        context.globalCompositeOperation = 'lighter';
        context.fillStyle = background;
        context.fillRect(startX, startY, CELL_SIZE, CELL_SIZE);
        context.restore()
    };
    Cell.prototype.popRandom = function popRandom() {
        var arr = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
        var ramIdx = _.random(arr.length - 1);
        return arr.splice(ramIdx, 1)[0]
    };
    Cell.prototype.createElectrons = function createElectrons() {
        var startX = this.startX;
        var startY = this.startY;
        var electronCount = this.electronCount;
        var electronOptions = this.electronOptions;
        var forceElectrons = this.forceElectrons;
        if (!electronCount) return;
        var endpoints = [].concat(END_POINTS_OFFSET);
        var max = forceElectrons ? electronCount : Math.min(electronCount, MAX_ELECTRONS - ACTIVE_ELECTRONS.length);
        for (var i = 0; i < max; i++) {
            var _popRandom = this.popRandom(endpoints);
            var offsetX = _popRandom[0];
            var offsetY = _popRandom[1];
            ACTIVE_ELECTRONS.push(new Electron(startX + offsetX, startY + offsetY, electronOptions))
        }
    };
    return Cell
}();

var bgLayer = new FullscreenCanvas();
var mainLayer = new FullscreenCanvas();
var shapeLayer = new FullscreenCanvas(true);

function stripOld() {
    var now = Date.now();
    for (var i = 0,
        max = ACTIVE_ELECTRONS.length; i < max; i++) {
        var e = ACTIVE_ELECTRONS[i];
        if (e.expireAt - now < 1e3) {
            ACTIVE_ELECTRONS.splice(i, 1);
            i--;
            max--
        }
    }
}
function createRandomCell() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    if (ACTIVE_ELECTRONS.length >= MAX_ELECTRONS) return;
    var width = mainLayer.width;
    var height = mainLayer.height;
    var cell = new Cell(_.random(width / CELL_DISTANCE), _.random(height / CELL_DISTANCE), options);
    cell.paintNextTo(mainLayer)
}
function drawGrid() {
    var ctx = arguments.length <= 0 || arguments[0] === undefined ? bgLayer.context : arguments[0];
    var _ref9 = arguments.length <= 1 || arguments[1] === undefined ? bgLayer : arguments[1];
    var width = _ref9.width;
    var height = _ref9.height;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = BORDER_COLOR;
    for (var h = CELL_SIZE; h < height; h += CELL_DISTANCE) {
        ctx.fillRect(0, h, width, BORDER_WIDTH)
    }
    for (var w = CELL_SIZE; w < width; w += CELL_DISTANCE) {
        ctx.fillRect(w, 0, BORDER_WIDTH, height)
    }
}
function iterateItemsIn(list) {
    var now = Date.now();
    for (var i = 0,
        max = list.length; i < max; i++) {
        var item = list[i];
        if (now >= item.expireAt) {
            list.splice(i, 1);
            i--;
            max--
        } else {
            item.paintNextTo(mainLayer)
        }
    }
}
function drawMain() {
    iterateItemsIn(PINNED_CELLS);
    iterateItemsIn(ACTIVE_ELECTRONS)
}
var nextRandomAt = undefined;
function activateRandom() {
    var now = Date.now();
    if (now < nextRandomAt) {
        return
    }
    nextRandomAt = now + _.random(300, 1000);
    createRandomCell()
}
function render() {
    mainLayer.blendBackground(bgLayer.canvas);
    drawMain();
    activateRandom();
    shape.renderID = requestAnimationFrame(render)
}
function handleClick() {
    function print(_ref10) {
        var clientX = _ref10.clientX;
        var clientY = _ref10.clientY;
        var cell = new Cell(Math.floor(clientX / CELL_DISTANCE), Math.floor(clientY / CELL_DISTANCE), {
            background: CELL_HIGHLIGHT,
            forceElectrons: true,
            electronCount: 4,
            electronOptions: {
                speed: 3,
                lifeTime: 1500,
                color: CELL_HIGHLIGHT
            }
        });
        cell.paintNextTo(mainLayer)
    }
    function handler(evt) {
        if (evt.touches) {
            Array.from(evt.touches).forEach(print)
        } else {
            print(evt)
        }
    } ['mousedown', 'touchstart'].forEach(function (name) {
        document.addEventListener(name, handler)
    });
    return function unbind() {
        ['mousedown', 'touchstart'].forEach(function (name) {
            document.removeEventListener(name, handler)
        })
    }
}
var shape = {
    lastText: '',
    lastMatrix: null,
    renderID: undefined,
    appendQueueTimer: undefined,
    isAlive: false,
    get cellOptions() {
        return {
            electronCount: _.random(1, 4),
            background: FONT_COLOR,
            electronOptions: {
                speed: 2,
                lifeTime: _.random(300, 1500),
                color: FONT_COLOR
            }
        }
    },
    init: function init() {
        var _this = this;
        var container = arguments.length <= 0 || arguments[0] === undefined ? document.body : arguments[0];
        if (this.isAlive) {
            return
        }
        bgLayer.paint(drawGrid);
        bgLayer.onResize(drawGrid);
        mainLayer.paint(drawMain);
        mainLayer.onResize(drawMain);
        /*   bgLayer.renderIntoView(0, container); */
        mainLayer.renderIntoView(1, container);
        shapeLayer.onResize(function () {
            if (_this.lastText) {
                _this.print(_this.lastText)
            }
        });
        render();
        activateRandom();
        this.unbindEvents = handleClick();
        this.isAlive = true
    },
    clear: function clear() {
        if (this.lastMatrix) {
            this.explode(this.lastMatrix)
        }
        clearTimeout(this.appendQueueTimer);
        this.lastText = '';
        this.lastMatrix = null;
        PINNED_CELLS.length = 0
    },
    destroy: function destroy() {
        if (!this.isAlive) {
            return
        }
        bgLayer.remove();
        mainLayer.remove();
        shapeLayer.remove();
        this.unbindEvents();
        clearTimeout(this.appendQueueTimer);
        cancelAnimationFrame(this.renderID);
        ACTIVE_ELECTRONS.length = PINNED_CELLS.length = 0;
        this.lastMatrix = null;
        this.lastText = '';
        this.isAlive = false
    },
    getTextMatrix: function getTextMatrix(text) {
        var _ref11 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var _ref11$fontWeight = _ref11.fontWeight;
        var fontWeight = _ref11$fontWeight === undefined ? 'bold' : _ref11$fontWeight;
        var _ref11$fontFamily = _ref11.fontFamily;
        var fontFamily = _ref11$fontFamily === undefined ? FONT_FAMILY : _ref11$fontFamily;
        var width = shapeLayer.width;
        var height = shapeLayer.height;
        shapeLayer.repaint(function (ctx) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = fontWeight + ' ' + MAX_FONT_SIZE + 'px ' + fontFamily;
            var scale = width / ctx.measureText(text).width;
            var fontSize = Math.min(MAX_FONT_SIZE, MAX_FONT_SIZE * scale * 0.8);
            ctx.font = fontWeight + ' ' + fontSize + 'px ' + fontFamily;
            ctx.fillText(text, width / 2, height / 2)
        });
        var pixels = shapeLayer.context.getImageData(0, 0, width, height).data;
        var matrix = [];
        for (var y = 0; y < height; y += CELL_DISTANCE) {
            for (var x = 0; x < width; x += CELL_DISTANCE) {
                var alpha = pixels[(x + y * width) * 4 + 3];
                if (alpha > 0) {
                    matrix.push([Math.floor(x / CELL_DISTANCE), Math.floor(y / CELL_DISTANCE)])
                }
            }
        }
        return matrix
    },
    print: function print(text, options) {
        var _this2 = this;
        this.clear();
        this.lastText = text;
        var matrix = this.lastMatrix = _.shuffle(this.getTextMatrix(text, options));
        var i = 0;
        var max = matrix.length;
        var append = function append() {
            var count = _.random(Math.floor(max / 10), Math.floor(max / 5));
            var j = 0;
            while (j < count && i < max) {
                var _matrix$i = matrix[i];
                var x = _matrix$i[0];
                var y = _matrix$i[1];
                var cell = new Cell(x, y, _this2.cellOptions);
                cell.paintNextTo(mainLayer);
                cell.pin();
                i++;
                j++
            }
            if (i < max) {
                _this2.appendQueueTimer = setTimeout(append, _.random(50, 100))
            }
        };
        append()
    },
    explode: function explode(matrix) {
        stripOld();
        if (matrix) {
            var length = matrix.length;
            var max = Math.min(50, _.random(Math.floor(length / 40), Math.floor(length / 20)));
            for (var i = 0; i < max; i++) {
                var _matrix$i2 = matrix[i];
                var x = _matrix$i2[0];
                var y = _matrix$i2[1];
                var cell = new Cell(x, y, this.cellOptions);
                cell.paintNextTo(mainLayer)
            }
        } else {
            var max = _.random(10, 20);
            for (var i = 0; i < max; i++) {
                this.randomCell(this.cellOptions)
            }
        }
    }
};
function queue() {
    'Coding'.split('').reduce(function (p, v, i) {
        var text = p + v;
        setTimeout(function () {
            shape.print(text)
        }, 500 * i);
        return text
    }, '')
}
/* document.getElementById('input').addEventListener('keypress', function (_ref12) {
    var keyCode = _ref12.keyCode;
    var target = _ref12.target;
    if (keyCode === 13) {
        var value = target.value.trim();
        target.value = '';
        switch (value) {
            case '#destroy':
                return shape.destroy();
            case '#init':
                return shape.init();
            case '#clear':
                return mainLayer.clear();
            case '#reset':
                PINNED_CELLS.length = ACTIVE_ELECTRONS.length = 0;
                return mainLayer.clear();
            case '#queue':
                return queue();
            case '':
                return shape.clear();
            default:
                return shape.print(value)
        }
    }
}); */
shape.init();
shape.print('Coding');