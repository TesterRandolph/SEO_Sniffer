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
}

exports = module.exports = Ruler
