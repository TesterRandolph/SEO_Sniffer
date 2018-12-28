'use struct'

const fs = require('fs')

const should = require('should')
const BaseRuler = require('../lib/BaseRuler')

const encoding = 'utf8'

let content = ''

before(async () => {
  let loader = async function () {
    let input = './samples/shopback_index.htm'
    let reader = fs.createReadStream(input)

    reader.setEncoding(encoding)

    return new Promise((resolve, reject) => {
      let tmp = ''

      reader.on('data', (chunk) => {
        tmp += chunk
      })

      reader.on('end', () => {
        resolve(tmp)
      })

      reader.on('error', () => {
        reject(new Error('Encounter error on the reading from stream'))
      })
    })
  }

  content = await loader()

  await content.replace(/(\n)/igm, '')
})

describe('BaseRuler', () => {
  describe('Initializing by constructor()', () => {
    let config = {
      rule: 'isTagOverLimit',
      tag: 'meta',
      attribute: 'name',
      value: 'description',
      limit: 1
    }

    it('By "new BaseRuler()"', done => {
      let result = new BaseRuler()

      result.should.be.empty()

      done()
    })
    it('By "new BaseRuler(config{})"', done => {
      let result = new BaseRuler(config)

      result.should.have.property('rule', config.rule)
      result.should.have.property('tag', config.tag)
      result.should.have.property('attribute', config.attribute)
      result.should.have.property('value', config.value)
      result.should.have.property('limit', config.limit)

      done()
    })
  })

  describe('Initializing by the init()', () => {
    let config = {
      rule: 'isTagOverLimit',
      tag: 'meta',
      attribute: 'name',
      value: 'description',
      limit: 1
    }

    let result = new BaseRuler()

    it('Calling the init()', done => {
      result.init()

      result.should.be.empty()

      done()
    })
    it('Calling the init(config{})', done => {
      result.init(config)

      result.should.have.property('rule', config.rule)
      result.should.have.property('tag', config.tag)
      result.should.have.property('attribute', config.attribute)
      result.should.have.property('value', config.value)
      result.should.have.property('limit', config.limit)

      done()
    })
  })

  describe('Initializing by set*()', () => {
    let config = {
      rule: 'isTagOverLimit',
      tag: 'meta',
      attribute: 'name',
      value: 'description',
      limit: 1
    }

    let result = new BaseRuler()

    it('Calling the setRule()', done => {
      result.setRule()

      result.should.have.property('rule', 'countTag')

      done()
    })
    it('Calling the setRule(rule)', done => {
      result.setRule(config.rule)

      result.should.have.property('rule', config.rule)
      result[config.rule].should.be.type('function')

      done()
    })
    it('Calling the setTag()', done => {
      result.setTag()

      result.should.have.property('tag', '')

      done()
    })
    it('Calling the setTag(tag)', done => {
      result.setTag(config.tag)

      result.should.have.property('tag', config.tag)

      done()
    })
    it('Calling the setAttribute()', done => {
      result.setAttribute()

      result.should.have.property('attribute', '')
      result.should.have.property('value', '')

      done()
    })
    it('Calling the setAttribute(attribute)', done => {
      result.setAttribute(config.attribute)

      result.should.have.property('attribute', config.attribute)
      result.should.have.property('value', '')

      done()
    })
    it('Calling the setAttribute(attribute, value)', done => {
      result.setAttribute(config.attribute, config.value)

      result.should.have.property('attribute', config.attribute)
      result.should.have.property('value', config.value)

      done()
    })
    it('Calling the setLimit()', done => {
      result.setLimit()

      result.should.have.property('limit', 0)

      done()
    })
    it('Calling the setLimit(limit)', done => {
      result.setLimit(config.limit)

      result.should.have.property('limit', config.limit)

      done()
    })
  })

  describe('Counting by the countTag()', () => {
    let config = {
      onlyTag: {
        rule: 'isTagNotOnly',
        tag: 'H1'
      },
      withAttr: {
        rule: 'isTagOverLimit',
        tag: 'meta',
        attribute: 'name'
      },
      withAttrValue: {
        rule: 'isTagOverLimit',
        tag: 'meta',
        attribute: 'name',
        value: 'description'
      }
    }

    describe('With the status of the isWithAttr switch', () => {
      let ruler = new BaseRuler()

      describe('isWithAttr === false', () => {
        it('Only setting the tag', done => {
          ruler.init(config.onlyTag)
          let result = ruler.countTag(content, false)

          result.should.equal(2)

          done()
        })
        it('With setting the attribute', done => {
          ruler.init(config.withAttr)
          let result = ruler.countTag(content, false)

          result.should.equal(12)

          done()
        })
        it('With setting the value/attribute', done => {
          ruler.init(config.withAttrValue)
          let result = ruler.countTag(content, false)

          result.should.equal(12)

          done()
        })
      })
      describe('isWithAttr === true', () => {
        it('Only setting the tag', done => {
          ruler.init(config.onlyTag)
          let result = ruler.countTag(content, true)

          result.should.equal(2)

          done()
        })
        it('With setting the attribute', done => {
          ruler.init(config.withAttr)
          let result = ruler.countTag(content, true)

          result.should.equal(5)

          done()
        })
        it('With setting the value/attribute', done => {
          ruler.init(config.withAttrValue)
          let result = ruler.countTag(content, true)

          result.should.equal(1)

          done()
        })
      })
    })
  })

  describe('Checking by the functions', () => {
    let config = {
      hasTagWithoutAttr: {
        rule: 'hasTagWithoutAttr',
        tag: 'a',
        attribute: 'rel'
      },
      isTagNotExist: {
        rule: 'isTagNotExist',
        tag: 'meta',
        attribute: 'name',
        value: 'keywords'
      },
      isTagOverLimit: {
        rule: 'isTagOverLimit',
        tag: 'strong',
        limit: 15
      },
      isTagNotOnly: {
        rule: 'isTagNotOnly',
        tag: 'H1'
      }
    }

    let ruler = new BaseRuler()

    it('Calling the hasTagWithoutAttr()', done => {
      ruler.init(config.hasTagWithoutAttr)
      let result = ruler.hasTagWithoutAttr(content)

      result.should.be.a.String()
      result.should.match(/^(Has (\d+?) (.*?)|No found any (.*?))$/)

      done()
    })
    it('Calling the isTagNotExist()', done => {
      ruler.init(config.isTagNotExist)
      let result = ruler.isTagNotExist(content)

      result.should.be.a.String()
      result.should.match(/^(Find matches (.*?): (\d+?)|Not find any match (.*?)!!)$/)

      done()
    })
    it('Calling the isTagOverLimit()', done => {
      ruler.init(config.isTagOverLimit)
      let result = ruler.isTagOverLimit(content)

      result.should.be.a.String()
      result.should.match(/^(Find matches (.*?): (\d+?)|There are (\d+?) (.*?) (\d+?)!!)$/)

      done()
    })
    it('Calling the isTagNotOnly()', done => {
      ruler.init(config.isTagNotOnly)
      let result = ruler.isTagNotOnly(content)

      result.should.be.a.String()
      result.should.match(/^(Find matches (.*?): (\d+?)|There are (\d+?) (.*?) (\d+?)!!)$/)

      done()
    })
  })
})
