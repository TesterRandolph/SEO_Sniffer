'use struct'

const fs = require('fs')

const should = require('should')

const {
  PredefineRules,
  SnifferManager
} = require('../lib/SnifferManager')

const Ruler = require('../lib/Ruler')

const patternArray = [
  'Has (\\d+?) (.*?)',
  'No found any (.*?)',
  'Find matches (.*?): (\\d+?)',
  'Not find any match (.*?)!!',
  'There are (\\d+?) (.*?) (\\d+?)!!'
]

const regex = new RegExp(`^({${patternArray.join('|')}})$`, 'igm')

const ioConfig = {
  input: './samples/shopback_index.htm',
  output: fs.createWriteStream('./test.log')
}

const ioFileConfig = {
  input: './samples/shopback_index.htm',
  output: './test.log'
}

const ioStreamConfig = {
  input: fs.createReadStream('./samples/shopback_index.htm'),
  output: fs.createWriteStream('./test.log')
}

const encoding = 'utf8'

let content = ''

before(async () => {
  let loader = async function () {
    let input = './samples/shopback_index.htm'
    let reader = fs.createReadStream(input)

    reader.setEncoding(encoding)

    return new Promise((resolve, reject) => {
      let tmp = ''

      reader.setMaxListeners(reader.getMaxListeners() + 1)
      reader.on('data', appendChunk)
      reader.on('error', onError)
      reader.on('end', onEnd)

      function appendChunk (chunk) {
        tmp += chunk
      }

      function onError () {
        cleanUp()
        reject(new Error('Encounter error on the reading from stream'))
      }

      function onEnd () {
        cleanUp()
        tmp = removeNewLine(tmp)
        resolve(tmp)
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

  content = await loader()
})

describe('SnifferManager', () => {
  describe('I/O by constructor()', () => {
    it('With empty', done => {
      let result = new SnifferManager()

      result.should.hasOwnProperty('_encoding', 'utf8')
      result.should.hasOwnProperty('_reader', null)
      result.should.hasOwnProperty('_writer', null)

      result.should.hasOwnProperty('_manager')
      result._manager.should.be.an.Array()
      result._manager.should.matchEach(function (ruler) {
        ruler.should.be.instanceOf(Ruler)
      })

      result.should.hasOwnProperty('detectResults', [])

      done()
    })
    it('With ioFileConfig{}', done => {
      let result = new SnifferManager(ioFileConfig)

      result.should.hasOwnProperty('_encoding', 'utf8')

      result.should.hasOwnProperty('_reader')
      result._reader.should.be.instanceOf(fs.ReadStream)

      result.should.hasOwnProperty('_writer')
      result._writer.should.be.instanceOf(fs.WriteStream)

      result.should.hasOwnProperty('_manager')
      result._manager.should.be.an.Array()
      result._manager.should.matchEach(function (ruler) {
        ruler.should.be.instanceOf(Ruler)
      })

      result.should.hasOwnProperty('detectResults', [])

      done()
    })
    it('With ioStreamConfig{}', done => {
      let result = new SnifferManager(ioStreamConfig)

      result.should.hasOwnProperty('_encoding', 'utf8')

      result.should.hasOwnProperty('_reader')
      result._reader.should.be.instanceOf(fs.ReadStream)

      result.should.hasOwnProperty('_writer')
      result._writer.should.be.instanceOf(fs.WriteStream)

      result.should.hasOwnProperty('_manager')
      result._manager.should.be.an.Array()
      result._manager.should.matchEach(function (ruler) {
        ruler.should.be.instanceOf(Ruler)
      })

      result.should.hasOwnProperty('detectResults', [])

      done()
    })
  })

  describe('I/O by setInput()/setOutput()', () => {
    let result = new SnifferManager()

    it('With empty', done => {
      result.setInput()
      result.setOutput()

      result.should.hasOwnProperty('_reader', null)
      result.should.hasOwnProperty('_writer', null)

      done()
    })
    it('With ioFileConfig{}', done => {
      result.setInput(ioFileConfig.input)
      result.setOutput(ioFileConfig.output)

      result.should.hasOwnProperty('_reader')
      result._reader.should.be.instanceOf(fs.ReadStream)

      result.should.hasOwnProperty('_writer')
      result._writer.should.be.instanceOf(fs.WriteStream)

      done()
    })
    it('With ioStreamConfig{}', done => {
      result.setInput(ioStreamConfig.input)
      result.setOutput(ioStreamConfig.output)

      result.should.hasOwnProperty('_reader')
      result._reader.should.be.instanceOf(fs.ReadStream)

      result.should.hasOwnProperty('_writer')
      result._writer.should.be.instanceOf(fs.WriteStream)

      done()
    })
  })

  describe('Initializing the rules', () => {
    describe('By the PredefineRules', async () => {
      let result = new SnifferManager(ioFileConfig)
      result.detect()

      await it('With empty', done => {
        result.should.hasOwnProperty('_manager')
        result._manager.should.be.an.Array()
        result._manager.should.matchEach(function (ruler) {
          ruler.should.be.instanceOf(Ruler)
        })

        result.should.hasOwnProperty('detectResults')
        result.detectResults.should.be.an.Array()
        result.detectResults.length.should.be.exactly(5)
        result.detectResults.should.be.matchAny(regex)

        done()
      })
    })

    describe('By customizing the PredefineRules', async () => {
      let result = new SnifferManager(ioFileConfig)
      result.detect([
        PredefineRules.isHeadLegal,
        PredefineRules.isImageWithoutAlt,
        PredefineRules.isAWithoutRel,
        PredefineRules.isH1NotOnly
      ])

      await it('With the customizing setting', done => {
        result.should.hasOwnProperty('_manager')
        result._manager.should.be.an.Array()
        result._manager.should.be.matchAny(function (ruler) {
          ruler.should.be.instanceOf(Ruler)
        })

        result.should.hasOwnProperty('detectResults')
        result.detectResults.should.be.an.Array()
        result.detectResults.length.should.be.exactly(result._manager.length)
        result.detectResults.should.be.matchAny(regex)

        done()
      })
    })

    describe('By appending to the PredefineRules', async () => {
      let result = new SnifferManager(ioFileConfig)

      PredefineRules.isHeadLegal.subRules.push({
        rule: 'isTagNotExist',
        tag: 'meta',
        attribute: 'name',
        value: 'robots'
      })

      PredefineRules.isStrongOverLimit.limit = 5

      result.reinitDefaultRules()
      result.detect()

      await it('With the appending', done => {
        result.should.hasOwnProperty('_manager')
        result._manager.should.be.an.Array()
        result._manager.should.be.matchAny(function (ruler) {
          ruler.should.be.instanceOf(Ruler)
        })

        result.should.hasOwnProperty('detectResults')
        result.detectResults.should.be.an.Array()
        result.detectResults.length.should.be.exactly(result._manager.length)
        result.detectResults.should.be.matchAny(regex)

        done()
      })
    })

    describe('By the customizing rules', async () => {
      let result = new SnifferManager(ioFileConfig)

      result.detect([{
        rule: 'isTagNotExist',
        tag: 'meta',
        attribute: 'name',
        value: 'robots'
      },
      {
        rule: 'isTagNotExist',
        tag: 'meta',
        attribute: 'name',
        value: 'keywords'
      }])

      await it('With the customizing', done => {
        result.should.hasOwnProperty('_manager')
        result._manager.should.be.an.Array()
        result._manager.should.be.matchAny(function (ruler) {
          ruler.should.be.instanceOf(Ruler)
        })

        result.should.hasOwnProperty('detectResults')
        result.detectResults.should.be.an.Array()
        result.detectResults.length.should.be.exactly(result._manager.length)
        result.detectResults.should.be.matchAny(regex)

        done()
      })
    })

    describe('By the mixed rules', async () => {
      let result = new SnifferManager(ioFileConfig)

      result.detect([
        PredefineRules.isStrongOverLimit,
        PredefineRules.isImageWithoutAlt,
        {
          rule: 'isTagNotExist',
          tag: 'meta',
          attribute: 'name',
          value: 'robots'
        },
        {
          rule: 'isTagNotExist',
          tag: 'meta',
          attribute: 'name',
          value: 'keywords'
        }
      ])

      await it('With freedom', done => {
        result.should.hasOwnProperty('_manager')
        result._manager.should.be.an.Array()
        result._manager.should.be.matchAny(function (ruler) {
          ruler.should.be.instanceOf(Ruler)
        })

        result.should.hasOwnProperty('detectResults')
        result.detectResults.should.be.an.Array()
        result.detectResults.length.should.be.exactly(result._manager.length)
        result.detectResults.should.be.matchAny(regex)

        done()
      })
    })
  })

  describe('Checking the HTML content by check()', () => {
    it('With all the default PredefineRules', done => {
      let result = new SnifferManager()

      result.setOutput(ioConfig.output)
      result.check(content)

      result.should.hasOwnProperty('detectResults')
      result.detectResults.should.be.an.Array()
      result.detectResults.length.should.be.exactly(5)
      result.detectResults.should.be.matchAny(regex)

      done()
    })
  })

  describe('Checking the HTML content by detect()', async () => {
    let result = new SnifferManager(ioConfig)

    result.detect()

    await it('With all the default PredefineRules', done => {
      result.should.hasOwnProperty('detectResults')
      result.detectResults.should.be.an.Array()
      result.detectResults.length.should.be.exactly(5)
      result.detectResults.should.be.matchAny(regex)

      done()
    })
  })
})
