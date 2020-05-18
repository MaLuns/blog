
const zoom = require('zoom-image');
function zoomContent() {
    Array.prototype.forEach.call($('img'), el => {
        zoom(el);
    });
}

module.exports = zoomContent;