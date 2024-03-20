class DanMuKu {
    box = null // 弹幕容器
    boxSize = {
        width: 0, // 容器宽度
        height: 0 // 容器高度
    }

    rows = 0 // 行数
    dataList = [] // 弹幕数据 二维数组
    indexs = [] // 最新弹幕下标
    idMap = {} // 记录已出现 id

    avatar = false // 是否显示头像
    speed = 20 // 弹幕每秒滚动距离
    height = 36 // 弹幕高度
    gapWidth = 20 // 弹幕前后间隔
    gapHeight = 20// 弹幕上下间隔
    delayRange = 5000 // 延时范围
    align = 'center' // 轨道纵轴对齐方式

    animates = new Map() // 动画执行元素
    stageAnimates = new Map()

    constructor({ el,
        speed = 20,
        gapWidth = 20,
        gapHeight = 20,
        avatar = false,
        height = 36,
        delayRange = 5000,
        mode = 'half',
        align = 'center'
    }) {
        const box = document.querySelector(el)
        if (box) {
            const size = box.getBoundingClientRect()
            this.box = box
            this.boxSize = size
            this.rows = parseInt((size.height * this._divisor(mode)) / (height + gapHeight))
            this.speed = speed
            this.gapWidth = gapWidth
            this.gapHeight = gapHeight
            this.avatar = avatar
            this.height = height
            this.delayRange = delayRange
            this.align = align
        } else {
            throw new Error(`未找到容器 ${el}`)
        }
    }

    _divisor(mode) {
        let divisor = .5
        switch (mode) {
            case 'half':
                divisor = .5
                break
            case 'top':
                divisor = 1 / 3
                break
            case 'full':
                divisor = 1
                break
            default:
                break
        }
        return divisor
    }

    /**
     * 初始化生成弹道
     */
    _initBarrageList() {
        if (!this.box.querySelector(`.barrage-list`)) {
            const barrage = document.createElement('div')
            barrage.className = 'barrage-list'
            barrage.style = `
                display: flex;height: 100%;
                flex-direction: column;
                gap:${this.gapHeight}px;
                justify-content: ${this.align};
                overflow: hidden;`

            for (let i = 0; i < this.rows; i++) {
                const item = document.createElement('div')
                item.classList = ` barrage-list-${i}`
                item.style = `height:${this.height}px;position:relative;`
                barrage.appendChild(item)
                this.dataList[i] = []
            }
            this.box.appendChild(barrage)
        }
    }

    _pushOne(data) {
        const lens = this.dataList.map(item => item.length)
        const min = Math.min(...lens)
        const index = lens.findIndex(i => i === min)
        this.dataList[index].push(data)
    }

    _pushList(data) {
        let list = this._sliceRowList(this.rows, data)
        list.forEach((item, index) => {
            if (this.dataList[index]) {
                this.dataList[index] = this.dataList[index].concat(...item)
            } else {
                this.dataList[index] = item
            }
        })
    }

    _sliceRowList(rows, list) {
        const sliceList = []
        const perNum = Math.round(list.length / rows)
        for (let i = 0; i < rows; i++) {
            let arr = []
            if (i === rows - 1) {
                arr = list.slice(i * perNum)
            } else {
                i === 0 ?
                    arr = list.slice(0, perNum) :
                    arr = list.slice(i * perNum, (i + 1) * perNum)
            }
            sliceList.push(arr)
        }
        return sliceList
    }

    /**
     * 创建弹幕，并执行动画
     * @param {*} item 弹幕数据
     * @param {*} barrageIndex 弹幕轨道下标
     * @param {*} dataIndex 弹幕数据下标
     * @returns 
     */
    _dispatchItem(item, barrageIndex, dataIndex) {
        if (!item || this.idMap[item.id]) {
            return
        }

        this.idMap[item.id] = item.id

        let parent = this.box.querySelector(`.barrage-list-${barrageIndex}`)
        let danmuEl = document.createElement('div')
        danmuEl.className = 'danmu-item'
        danmuEl.style = `
            height:${this.height}px;
            display:inline-flex;
            position: absolute;
            right: 0;
            background-color: var(--danmu-bg-color,#fff);
            color: var(--danmu-color,#000);
            border-radius: 32px;
            padding: 4px 8px 4px 4px;
            align-items: center; `
        danmuEl.innerHTML = `
            <img class="danmu-avatar" style="
            display: inline-block;width:${this.height - 8}px;height:${this.height - 8}px;border-radius:50%;margin-right:6px;" src="${item.avatar}">
            <div class="danmu-text" style="text-wrap:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.text}</div>`
        parent.appendChild(danmuEl)

        const { width } = danmuEl.getBoundingClientRect()
        danmuEl.style.width = `${width}px`
        const allTime = (this.boxSize.width + width) / this.speed * 1000
        const pastTime = (width + this.gapWidth) / (this.boxSize.width + width) * allTime


        if (dataIndex < this.dataList[barrageIndex].length) {
            const animate = danmuEl.animate(
                { transform: ['translateX(100%)', `translateX(-${this.gapWidth}px)`] },
                { duration: pastTime, fill: "forwards", }
            )

            this.stageAnimates.set(animate, animate)

            animate.onfinish = () => {
                this.stageAnimates.delete(animate)
                this.indexs[barrageIndex] = dataIndex + 1
                this._dispatchItem(this.dataList[barrageIndex][dataIndex + 1], barrageIndex, dataIndex + 1)
            }
        }

        const animate = danmuEl.animate(
            { transform: ['translateX(100%)', `translateX(-${this.boxSize.width}px)`] },
            { duration: allTime, fill: "forwards", })

        animate.onfinish = (e) => {
            this.animates.delete(animate)
            danmuEl.remove()
            danmuEl = null
        }

        this.animates.set(animate, animate)
    }


    /**
     * 开始滚动弹幕
     */
    _run() {
        const len = this.dataList.length
        for (let barrageIndex = 0; barrageIndex < len; barrageIndex++) {

            let row = this.dataList[barrageIndex]
            let dataIndex = this.indexs[barrageIndex]

            if (!dataIndex && dataIndex !== 0) {
                dataIndex = this.indexs[barrageIndex] = 0
            }
            console.log(barrageIndex, dataIndex)

            row[dataIndex] && setTimeout(() =>
                this._dispatchItem(row[dataIndex], barrageIndex, dataIndex)
                , Math.random() * this.delayRange)
        }
    }

    /**
     * 暂停滚动
     */
    pause() {
        this.animates.forEach(item => item.pause())
        this.stageAnimates.forEach(item => item.pause())
    }

    /**
     * 开始滚动
     */
    play() {
        this.animates.forEach(item => item.play())
        this.stageAnimates.forEach(item => item.play())
    }

    /**
     * 清除弹幕
     */
    clear() {
        this.dataList = []
        this.indexs = []
        this.idMap = {}
        this.animates.clear()
        this.stageAnimates.clear()
        this.box.innerHTML = ''
    }

    /**
     * 添加弹幕数据
     * @param {*} data 
     */
    pushData(data) {
        this._initBarrageList()
        switch (Object.prototype.toString.apply(data)) {
            case '[object Object]':
                this._pushOne(data)
                break
            case '[object Array]':
                this._pushList(data)
                break
        }
        this._run()
    }
}
