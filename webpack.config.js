const path = require('path');

module.exports = {
  entry: './test/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
  }
};