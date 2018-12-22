'use struct'

const BaseRuler = require('./BaseRuler')

class Ruler extends BaseRuler {
  constructor (config) {
    super(config)

    this.initSubRules(config.subRules)
  }

  // 待驗證::subRules setting 的遞迴初始化是否會發生異常
  initSubRules (rules) {
    if (typeof rules === 'undefined' || !(rules instanceof Array)) {
      return
    }

    this.subRules = []

    let self = this

    rules.forEach(function (subConfig) {
      self.addSubRule(subConfig)
    })
  }

  addSubRule (config) {
    this.subRules.push(new Ruler(config))
  }

  _innerHtml (context) {
    let isWithAttr = false
    let isFullTag = true

    if (this.attribute !== '') {
      isWithAttr = true
    }

    let regex = new RegExp(this._buildRegexPattern(isWithAttr, isFullTag), 'igm')

    return context.match(regex)
  }

  // 待驗證::subRules setting 的遞迴檢測是否會發生異常
  detectSubRules (context) {
    let _contexts = []

    if (typeof context === 'string') {
      _contexts.push(context)
    }

    let result = []

    for (let index in _contexts) {
      let _innerContexts = this._innerHtml(_contexts[index])

      if (_innerContexts === null) {
        continue
      }

      for (let indexI in _innerContexts) {
        this.subRules.forEach(function (subRuler) {
          result.push(subRuler[subRuler.rule](_innerContexts[indexI]))
        })
      }
    }

    return result.join('\n')
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
    this.isTagOverLimit(context)
  }
}

exports = module.exports = Ruler
