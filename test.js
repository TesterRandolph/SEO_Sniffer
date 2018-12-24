'use struct'

const { PredefineRules, SnifferManager } = require('./lib/SnifferManager')
// const { SnifferManager } = require('./lib/SnifferManager')

const ioConfig = {
  // input: './samples/small.htm',
  input: './samples/shopback_index.htm',
  // input: fs.createReadStream('./samples/shopback_index.htm'),

  // output: './logs/test_20181222_10.log'
  // output: fs.createWriteStream('./logs/test_1.log')
  output: 'console'
}

const sniffer = new SnifferManager()
// const sniffer = new SnifferManager(ioConfig)

sniffer.setInput(ioConfig.input)
// sniffer.setInput(fs.createReadStream(ioConfig.input))

sniffer.setOutput(ioConfig.output)
// sniffer.setOutput(fs.createWriteStream(ioConfig.output))

/*
PredefineRules.isHeadLegal.subRules.push({
  rule: 'isTagNotExist',
  tag: 'meta',
  attribute: 'name',
  value: 'robots'
})
*/
PredefineRules.isStrongOverLimit.limit = 5

// sniffer.reinitDefaultRules()

// sniffer.check()
// sniffer.detect()
/*
sniffer.detect([{
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
*/
/*
sniffer.detect([
  // PredefineRules.isImageWithoutAlt,
  // PredefineRules.isAWithoutRel,
  PredefineRules.isHeadLegal
])
*/
sniffer.detect([
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
