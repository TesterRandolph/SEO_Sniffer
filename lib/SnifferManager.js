'use struct'

const fs = require('fs')

const PredefineRules = require('./PredefineRules')
const Ruler = require('./Ruler')

class SnifferManager {
  constructor (ioSet = {}) {
    this._encoding = 'utf8'

    this._reader = null
    this._writer = null

    if (typeof ioSet.input !== 'undefined') {
      this.setInput(ioSet.input)
    }

    if (typeof ioSet.output !== 'undefined') {
      this.setOutput(ioSet.output)
    }

    this._manager = []

    this._initRules([])
  }

  setInput (input) {
    if (
      typeof input === 'string' &&
      fs.existsSync(input) === true
    ) {
      this._reader = fs.createReadStream(input.toLowerCase())
    } else if (input instanceof fs.ReadStream) {
      this._reader = input
    }

    if (!(this._reader instanceof fs.ReadStream)) {
      console.log('Error::setInput!!')
    }

    this._reader.setEncoding(this.encoding)
  }

  setOutput (output) {
    if (output instanceof fs.WriteStream) {
      this._writer = output
    } else if (typeof output === 'string') {
      let outputLC = output.toLowerCase()

      if (outputLC === 'console') {
        this._writer = null
        console.log('Will be exporting output by console!!')
      } else {
        this._writer = fs.createWriteStream(outputLC)
      }
    } else {
      this._writer = null
      console.log('Will be exporting output by console!!')
    }
  }

  async _read () {
    return new Promise((resolve, reject) => {
      if (
        this._reader === null ||
        !(this._reader instanceof fs.ReadStream)
      ) {
        reject(new Error('Please call setInput() first!!'))
        return
      }

      // Start read the input by ReadStream!!
      let context = ''

      this._reader.on('data', (chunk) => {
        context += chunk
      })

      this._reader.on('end', () => {
        resolve(context)
      })

      this._reader.on('error', (e) => {
        reject(new Error('Encounter error on the reading from stream'))
      })
    })
  }

  // FIXME: function is not ready!!
  async _write (message = '') {
    if (
      typeof message !== 'string' ||
      message === ''
    ) {
      return
    }

    if (
      this._writer === null ||
      !(this._writer instanceof fs.WriteStream)
    ) {
      console.log(message)
      return
    }

    return new Promise((resolve, reject) => {
      // Start output the detect results by WriteStream!!
      this._writer.write(message + '\n', 'UTF8')

      this._writer.on('finish', function () {
        console.log('Wrote completed!!')
      })

      this._writer.on('error', function (err) {
        reject(new Error(err.stack))
      })
    })
  }

  _clearLineBreak (context) {
    return context.replace(/(\n)/igm, '')
  }

  async reinitDefaultRules (rules = []) {
    let isDefault = false

    if (rules.length === 0) {
      isDefault = true
    }

    this._initRules(rules, isDefault)
  }

  async _initRules (rules = [], isDefault = false) {
    if (
      typeof isDefault === 'boolean' &&
      isDefault === true
    ) {
      rules = []

      for (let index in PredefineRules) {
        rules.push(PredefineRules[index])
      }
    }

    if (
      !(rules instanceof Array) ||
      rules.length === 0
    ) {
      return
    }

    let self = this

    self.manager = []

    rules.forEach(function (rule) {
      self.manager.push(new Ruler(rule))
    })
  }

  async check (context, rules = []) {
    let _context = this._clearLineBreak(context)

    try {
      await this._initRules(rules)

      let self = this

      await this.manager.forEach(function (ruler) {
        let result = ruler[ruler.rule](_context)

        self._write(result)
      })

      await console.log('Detecting completed.')
    } catch (e) {
      console.error(e)
    }
  }

  async detect (rules = []) {
    try {
      let context = await this._read()

      await this.check(context, rules)
    } catch (e) {
      console.error(e)
    }
  }
}

exports = module.exports = {
  PredefineRules,
  SnifferManager
}
