'use struct'

class BaseRuler {
  constructor (config) {
    this.init(config)
  }

  init (config) {
    this.setRule(config.rule)
    this.setTag(config.tag)
    this.setAttribute(config.attribute, config.value)
    this.setLimit(config.limit)
  }

  copy () {
    return new BaseRuler(this)
  }

  setRule (rule) {
    if (
      typeof rule === 'undefined' ||
      typeof rule !== 'string' ||
      rule === ''
    ) {
      this.rule = 'countTag'
      return
    }

    this.rule = rule
  }

  setTag (tag) {
    if (
      typeof tag === 'undefined' ||
      typeof tag !== 'string'
    ) {
      this.tag = ''
      return
    }

    this.tag = tag
  }

  setAttribute (attribute, value = '') {
    if (
      typeof attribute === 'undefined' ||
      typeof attribute !== 'string'
    ) {
      this.attribute = ''
      this.value = ''
      return
    }

    this.attribute = attribute

    if (
      typeof value !== 'string' ||
      value === ''
    ) {
      this.value = ''
      return
    }

    this.value = value
  }

  setLimit (limit) {
    if (
      typeof limit === 'undefined' ||
      !Number.isInteger(limit)
    ) {
      this.limit = 0
      return
    }

    this.limit = limit
  }

  _buildRegexPattern (isWithAttr = false, isFullTag = false) {
    let attrPattern = ''

    if (isWithAttr && this.attribute !== '') {
      attrPattern += `(${this.attribute}=`

      if (this.value !== '') {
        attrPattern += `"${this.value}"`
      } else {
        attrPattern += '"([^"]*?)"'
      }

      attrPattern += ')([^<>]*?)'
    }

    let regexTail = ''

    if (isFullTag && this.tag !== '') {
      regexTail = `((?:(?!</((\\s)*?)${this.tag}>).)*)</((\\s)*?)${this.tag}>`
    }

    return `<${this.tag}([^<>]*?)${attrPattern}(/>|>${regexTail})`
  }

  countTag (context, isWithAttr = false) {
    if (this.tag === '') {
      return 0
    }

    let regex = new RegExp(this._buildRegexPattern(isWithAttr), 'igm')

    let result = context.match(regex)

    if (result === null) {
      return 0
    }

    return result.length
  }
}

exports = module.exports = BaseRuler
