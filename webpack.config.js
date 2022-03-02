const path = require('path');
const ThreadsPlugin = require('threads-plugin');

module.exports = {
  entry: './src/index.ts',
  plugins: [new ThreadsPlugin()],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
