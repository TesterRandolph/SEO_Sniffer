'use struct'

const BaseRuler = require('./BaseRuler')

class Ruler extends BaseRuler {
  constructor (config) {
    super(config)

    this.init(config)
  }

  // 待驗證::subRules setting 的遞迴初始化是否會發生異常
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

    if (
      config.rule === 'detectSubRules' &&
      typeof config.subRules !== 'undefined' &&
      config.subRules instanceof Array &&
      config.subRules.length > 0
    ) {
      this.subRules = []

      let self = this

      config.subRules.forEach(function (subConfig) {
        self.addSubRule(subConfig)
      })

      return
    }

    if (typeof config.limit === 'undefined') {
      config.limit = 0
    }

    this.setLimit(config.limit)
  }

  addSubRule (config) {
    this.subRules.push(new Ruler(config))
  }

  copy () {
    return new Ruler(this)
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
}

exports = module.exports = Ruler
