'use struct'

exports = module.exports = {
  isImageWithoutAlt: {
    rule: 'hasTagWithoutAttr',
    tag: 'img',
    attribute: 'alt'
  },
  isAWithoutRel: {
    rule: 'hasTagWithoutAttr',
    tag: 'a',
    attribute: 'rel'
  },
  isHeadLegal: {
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
  },
  isStrongOverLimit: {
    rule: 'isTagOverLimit',
    tag: 'strong',
    limit: 15
  },
  isH1NotOnly: {
    rule: 'isTagNotOnly',
    tag: 'H1'
  }
}
