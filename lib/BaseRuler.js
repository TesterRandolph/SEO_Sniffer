'use struct'

class BaseRuler {
  constructor (config) {
    this.init(config)
  }

  init (config) {
    if (typeof config === 'undefined') {
      return
    }

    if (typeof config.rule === 'undefined') {
      config.rule = ''
    }

    this.setRule(config.rule)

    if (typeof config.tag === 'undefined') {
      config.tag = ''
    }

    this.setTag(config.tag)

    if (typeof config.attribute === 'undefined') {
      config.attribute = ''
    }

    if (typeof config.value === 'undefined') {
      config.value = ''
    }

    this.setAttribute(config.attribute, config.value)

    if (typeof config.limit === 'undefined') {
      config.limit = 0
    }

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

  hasTagWithoutAttr (context) {
    // this.countTag() - this.countTagWithAttr()
    let counterT = this.countTag(context)
    let counterTWA = this.countTag(context, true)

    let diff = counterT - counterTWA

    let plugin = ''

    if (this.value !== '') {
      plugin += `="${this.value}"`
    }

    if (diff > 0) {
      return `Has ${diff} ${this.tag} tag without ${this.attribute}${plugin}.`
    }

    return `No found any ${this.tag} tag without ${this.attribute}${plugin}.`
  }

  isTagNotExist (context) {
    // this.countTag() === 0
    let counter = 0
    let plugin = ''

    if (this.attribute === '') {
      counter = this.countTag(context)
    } else {
      counter = this.countTag(context, true)

      plugin += ` with ${this.attribute}`

      if (this.value !== '') {
        plugin += `="${this.value}"`
      }
    }

    if (counter === 0) {
      return `Not find any match on the ${this.tag}${plugin}!!`
    }

    return `Find matches on the ${this.tag}${plugin}: ${counter}`
  }

  isTagOverLimit (context) {
    // this.countTag() > this.limit
    let counter = 0
    let plugin = ''

    if (this.attribute === '') {
      counter = this.countTag(context)
      plugin += ' tag'
    } else {
      counter = this.countTag(context, true)

      plugin += ` with ${this.attribute}`

      if (this.value !== '') {
        plugin += `="${this.value}"`
      }
    }

    if (counter > this.limit) {
      let message = ''

      message += `There are ${counter} ${this.tag}${plugin}`
      message += `, it's over the limit ${this.limit}!!`

      return message
    }

    return `Find matches on the ${this.tag}${plugin}: ${counter}`
  }

  isTagNotOnly (context) {
    // this.isTagOverLimit(1)
    this.setLimit(1)

    return this.isTagOverLimit(context)
  }
}

exports = module.exports = BaseRuler
