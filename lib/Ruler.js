'use struct'

const BaseRuler = require('./BaseRuler');

class Ruler extends BaseRuler {

    constructor(config) {
        super(config);

        this.initSubRules(config.subRules);
    }

    initSubRules(rules) {
        if (typeof rules === 'undefined' || !(rules instanceof Array)) {
            return;
        }

        this.subRules = [];

        let self = this;

        rules.forEach(function (subConfig) {
            self.addSubRule(subConfig);
        });

        return;
    }

    addSubRule(config) {
        this.subRules.push(new Ruler(config));
    }

    _innerHtml(context) {
        let isWithAttr = false;
        let isFullTag = true;

        if (this.attribute !== '') {
            isWithAttr = true;
        }

        let regex = new RegExp(this._buildRegexPattern(isWithAttr, isFullTag), 'igm');

        return context.match(regex);
    }

    detectSubRules(context) {
        let _contexts = [];

        if (typeof context === 'string') {
            _contexts.push(context);
        }

        for (let index in _contexts) {
            let _innerContexts = this._innerHtml(_contexts[index]);

            if (_innerContexts === null) {
                continue;
            }

            for (let indexI in _innerContexts) {
                this.subRules.forEach(function (subRuler) {
                    subRuler[subRuler.rule](_innerContexts[indexI]);
                });
            }
        }
    }

    hasTagWithoutAttr(context) {
        // this.countTag() - this.countTagWithAttr()
        let counterT = this.countTag(context);
        let counterTWA = this.countTag(context, true);

        let diff = counterT - counterTWA;
        let result =``;

        if (diff > 0) {
            result = `Has ${diff} ${this.tag} tag without ${this.attribute}.\r\n`;
            console.log(result);
            return;
        }

        result = `No found any ${this.tag} tag without ${this.attribute}.\r\n`;
        console.log(result);
        return;
    }

    isTagNotExist(context) {
        // this.countTag() === 0
        let counter = 0;

        if (this.attribute === '') {
            counter = this.countTag(context);
        } else {
            counter = this.countTag(context, true);
        }

        if (counter === 0) {
            console.log(`Not find any match!!\r\n`);
            return;
        }
        
        console.log(`Find matches: ${counter}\r\n`);
        return;
    }

    isTagOverLimit(context) {
        // this.countTag() > this.limit
        let counter = 0;

        if (this.attribute === '') {
            counter = this.countTag(context);
        } else {
            counter = this.countTag(context, true);
        }

        if (counter > this.limit) {
            console.log(`There are ${counter} over the limit ${this.limit}!!\r\n`);
            return;
        }

        console.log(`Find matches: ${counter}\r\n`);
        return;
    }

    isTagNotOnly(context) {
        // this.isTagOverLimit(1)
        this.setLimit(1);
        this.isTagOverLimit(context);
        return;
    }
}

exports = module.exports = Ruler;