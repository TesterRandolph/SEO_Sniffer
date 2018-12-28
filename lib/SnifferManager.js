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
    this.detectResults = []

    this._initRules([], true)
  }

  setInput (input) {
    if (typeof input === 'undefined') {
      return
    }

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
    if (typeof output === 'undefined') {
      return
    }

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

      let reader = this._reader

      reader.setMaxListeners(reader.getMaxListeners() + 1)
      reader.on('data', appendChunk)
      reader.on('error', onError)
      reader.on('end', onEnd)

      function appendChunk (chunk) {
        context += chunk
      }

      function onError () {
        cleanUp()
        reject(new Error('Encounter error on the reading from stream'))
      }

      function onEnd () {
        cleanUp()
        context = removeNewLine(context)
        resolve(context)
      }

      function removeNewLine (tmp) {
        return tmp.replace(/(\n)/igm, '')
      }

      function cleanUp () {
        reader.removeListener('data', appendChunk)
        reader.removeListener('error', onError)
        reader.removeListener('end', onEnd)
        reader.setMaxListeners(reader.getMaxListeners() - 1)
      }
    })
  }

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
      let writer = this._writer

      // Start output the detect results by WriteStream!!
      writer.write(message + '\n', 'UTF8')

      writer.setMaxListeners(writer.getMaxListeners() + 1)
      writer.on('finish', onFinish)
      writer.on('error', onError)

      function onFinish () {
        console.log('Wrote completed!!')
      }

      function onError (err) {
        cleanUp()
        reject(new Error(err.stack))
      }

      function cleanUp () {
        writer.removeListener('error', onError)
        writer.removeListener('finish', onFinish)
        writer.setMaxListeners(writer.getMaxListeners() - 1)
      }
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

    this._manager = []
    this.detectResults = []

    let self = this

    rules.forEach(function (rule) {
      self._manager.push(new Ruler(rule))
    })
  }

  check (context, rules = []) {
    let _context = this._clearLineBreak(context)

    try {
      this._initRules(rules)

      let self = this

      this._manager.forEach(function (ruler) {
        let result = ruler[ruler.rule](_context)

        // result cache
        self.detectResults.push(result)

        self._write(result)
      })

      this._write('Detecting completed.')
    } catch (e) {
      console.error(e)
    }
  }

  async detect (rules = []) {
    try {
      let context = await this._read()

      await this.check(context, rules)
      // await console.log(this.detectResults)
    } catch (e) {
      console.error(e)
    }
  }
}

exports = module.exports = {
  PredefineRules,
  SnifferManager
}
