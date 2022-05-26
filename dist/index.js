
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./peanut-pack.cjs.production.min.js')
} else {
  module.exports = require('./peanut-pack.cjs.development.js')
}
