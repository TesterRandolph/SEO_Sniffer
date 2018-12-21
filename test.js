'use struct'

const fs = require('fs');
const {PredefineRules, SnifferManager} = require('./lib/SnifferManager');

const Ruler = require('./lib/Ruler');

const ioConfig = {
    // input: './samples/small.htm',
    input: './samples/shopback_index.htm',
    // input: fs.createReadStream('./samples/shopback_index.htm'),

    output: './logs/test_1.log'
    // output: fs.createWriteStream('./logs/test_1.log')
    // output: 'console'
};

const sniffer = new SnifferManager();
// const sniffer = new SnifferManager(ioConfig);

sniffer.setInput(ioConfig.input);
// sniffer.setInput(fs.createReadStream(ioConfig.input));

sniffer.setOutput(ioConfig.output);
// sniffer.setOutput(fs.createWriteStream(ioConfig.output));

// console.log('HelloWorld!!');

// sniffer.check();
sniffer.detect();
/*
sniffer.detect([{
    attribute: 'name'
}]);
*/
/*
sniffer.detect([
    PredefineRules.isImageWithoutAlt,
    PredefineRules.isAWithoutRel,
    PredefineRules.isHeadLegal
]);
*/

// const r = new Ruler();
/*
const ruler = new Ruler({
    'rule': 'isTagOverLimit',
    'tag': 'strong',
    'limit': 15
});
const ruler = new Ruler({
    rule: 'detectSubRules',
    tag: 'head',
    subRules: [{
            rule: 'isTagNotExist',
            tag: 'title'
        },
        {
            rule: 'isTagWithAttrNotExist',
            tag: 'meta',
            attribute: 'name',
            value: 'description'
        },
        {
            rule: 'isTagWithAttrNotExist',
            tag: 'meta',
            attribute: 'name',
            value: 'keywords'
        }
    ]
});
*/

// console.log(typeof ruler.limit);
// console.log(ruler.copy());
// console.log(ruler['isTagNotExist']());
// console.log(ruler[ruler.rule]());





