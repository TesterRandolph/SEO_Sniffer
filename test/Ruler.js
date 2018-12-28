'use struct'

const fs = require('fs')

const should = require('should')
const Ruler = require('../lib/Ruler')

const config = {
  rule: 'detectSubRules',
  tag: 'head',
  subRules: [{
    rule: 'isTagNotExist',
    tag: 'title'
  },
  {
    rule: 'isTagNotExist',
    tag: 'meta',
    attribute: 'name',
    value: 'description'
  },
  {
    rule: 'isTagNotExist',
    tag: 'meta',
    attribute: 'name',
    value: 'keywords'
  }]
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

describe('Ruler extends BaseRuler', () => {
  describe('Initializing by constructor()', () => {
    it('By "new Ruler()"', done => {
      let result = new Ruler()

      result.should.be.empty()

      done()
    })
    it('By "new Ruler(config{})"', done => {
      let result = new Ruler(config)

      result.should.have.property('rule', config.rule)
      result.should.have.property('tag', config.tag)

      if (typeof config.attribute !== 'undefined') {
        result.should.have.property('attribute', config.attribute)
      }

      if (typeof config.value !== 'undefined') {
        result.should.have.property('value', config.value)
      }

      if (
        config.rule === 'detectSubRules' &&
        typeof config.subRules !== 'undefined' &&
        config.subRules instanceof Array
      ) {
        result.subRules.should.be.an.Array()

        if (result.subRules.length > 0) {
          result.subRules.forEach(function (subRule) {
            subRule.should.be.instanceOf(Ruler)
          })
        }

        result.should.not.have.property('limit')
      } else {
        result.should.not.have.property('subRules')
        result.should.have.property('limit')
      }

      done()
    })
  })

  describe('Initializing by the init()', () => {
    let result = new Ruler()

    it('Calling the init()', done => {
      result.init()
      result.should.be.empty()

      done()
    })
    it('Calling the init(config{})', done => {
      result.init(config)

      result.should.have.property('rule', config.rule)
      result.should.have.property('tag', config.tag)

      if (typeof config.attribute !== 'undefined') {
        result.should.have.property('attribute', config.attribute)
      }

      if (typeof config.value !== 'undefined') {
        result.should.have.property('value', config.value)
      }

      if (
        config.rule === 'detectSubRules' &&
        typeof config.subRules !== 'undefined' &&
        config.subRules instanceof Array
      ) {
        result.subRules.should.be.an.Array()

        if (result.subRules.length > 0) {
          result.subRules.forEach(function (subRule) {
            subRule.should.be.instanceOf(Ruler)
          })
        }

        result.should.not.have.property('limit')
      } else {
        result.should.not.have.property('subRules')
        result.should.have.property('limit')
      }

      done()
    })
  })

  describe('setSubRules()', () => {
    it('Calling the setSubRules()', done => {
      let result = new Ruler()

      if (
        typeof config.subRules !== 'undefined' &&
        config.subRules instanceof Array
      ) {
        result.setSubRules(config.subRules)
        result.subRules.should.be.an.Array()

        result.subRules.forEach(function (subRule) {
          subRule.should.be.instanceOf(Ruler)
        })
      } else {
        result.setSubRules()
        result.subRules.should.be.empty()
      }

      done()
    })
  })

  describe('addSubRule()', () => {
    it('Calling the addSubRule()', done => {
      let result = new Ruler(config)

      let subRuleConfig = {
        rule: 'isTagNotExist',
        tag: 'meta',
        attribute: 'name',
        value: 'robots'
      }

      result.addSubRule(subRuleConfig)

      result.subRules.length.should.be.above(config.subRules.length)
      done()
    })
  })

  describe('Checking by the detectSubRules()', () => {
    it('Calling the detectSubRules()', done => {
      let ruler = new Ruler(config)
      let result = ruler.detectSubRules(content)

      let resultArray = result.split('\n')

      let patternArray = [
        'Has (\\d+?) (.*?)',
        'No found any (.*?)',
        'Find matches (.*?): (\\d+?)',
        'Not find any match (.*?)!!',
        'There are (\\d+?) (.*?) (\\d+?)!!'
      ]

      let regex = new RegExp(`^({${patternArray.join('|')}})$`, 'igm')

      resultArray.should.be.matchAny(regex)

      done()
    })
  })
})
