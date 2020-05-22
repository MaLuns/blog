const path = require('path');
const withDefaults = require('../shared.webpack.config');

module.exports = withDefaults({
    context: path.join(__dirname),
    mode: 'production',
    resolve: {
        mainFields: ['module', 'main']
    },
    entry: {
        extension: './src/extension.ts',
    }
});
