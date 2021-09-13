import data from './light.json'
export default {
    data,
    parse: str => String(str).replace(/:(.+?):/g, (placeholder, key) => Emoji.data[key] || placeholder)
}
