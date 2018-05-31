const path = require('path');
const extracter = require('./utils/extracter');

extracter({
  src: path.resolve(__dirname, '../src'),
  dist: path.resolve(__dirname, '../dist'),
  watch: true
});
