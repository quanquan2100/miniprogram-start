const path = require('path');
const extracter = require('./utils/extracter');

extracter({
  src: path.resolve(__dirname, '../components'),
  dist: path.resolve(__dirname, '../dist/components'),
  watch: true
});
