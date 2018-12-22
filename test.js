'use struct'

const fs = require('fs');
const {PredefineRules, SnifferManager} = require('./lib/SnifferManager');

const ioConfig = {
    // input: './samples/small.htm',
    input: './samples/shopback_index.htm',
    // input: fs.createReadStream('./samples/shopback_index.htm'),

    output: './logs/test_20181222_9.log'
    // output: fs.createWriteStream('./logs/test_1.log')
    // output: 'console'
};

const sniffer = new SnifferManager();
// const sniffer = new SnifferManager(ioConfig);

sniffer.setInput(ioConfig.input);
// sniffer.setInput(fs.createReadStream(ioConfig.input));

sniffer.setOutput(ioConfig.output);
// sniffer.setOutput(fs.createWriteStream(ioConfig.output));

PredefineRules.isHeadLegal.subRules.push({
    rule: 'isTagNotExist',
    tag: 'meta',
    attribute: 'name',
    value: 'robots'
});

sniffer.reinitDefaultRules();

// sniffer.check();
sniffer.detect();
/*
sniffer.detect([{
    attribute: 'name'
}]);
*/
/*
sniffer.detect([
    // PredefineRules.isImageWithoutAlt,
    // PredefineRules.isAWithoutRel,
    PredefineRules.isHeadLegal
]);
*/