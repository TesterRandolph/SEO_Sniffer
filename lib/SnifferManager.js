'use struct'

const fs = require('fs');

const PredefineRules = require('./PredefineRules');
const Ruler = require('./Ruler');

class SnifferManager {

    constructor(ioSet = {}) {
        this.encoding = 'utf8';

        this.reader = null;
        this.writer = null;

        if (typeof ioSet.input !== 'undefined') {
            setInput(ioSet.input);
        }

        if (typeof ioSet.output !== 'undefined') {
            setOutput(ioSet.output);
        }

        this.manager = [];
    }

    setInput(input) {
        if (typeof input === 'string' && fs.existsSync(input) === true) {
            this.reader = fs.createReadStream(input.toLowerCase());
        }

        if (input instanceof fs.ReadStream) {
            this.reader = input;
        }

        if (this.reader instanceof fs.ReadStream) {
            this.reader.setEncoding(this.encoding);

            return;
        }

        console.log('Error::setInput!!');
    }

    setOutput(output) {
        if (output instanceof fs.WriteStream) {
            this.writer = output;
        }

        if (typeof output === 'string') {
            let _output = output.toLowerCase();

            if (_output !== 'console') {
                this.writer = fs.createWriteStream(_output);
            }
        }

        if (this.writer instanceof fs.WriteStream) {
            return;
        }

        console.log('Error::setOutput!!');
    }

    async _read(message = '') {
        return new Promise((resolve, reject) => {
            if (
                this.reader !== null &&
                this.reader instanceof fs.ReadStream
            ) {
                // Start read the input by ReadStream!!
                let context = '';

                this.reader.on('data', (chunk) => {
                    context += chunk;
                });

                this.reader.on('end', () => {
                    resolve(context);
                });

                this.reader.on('error', (e) => {
                    let reason = new Error('Encounter error on the reading from stream');
                    reject(reason);

                    return;
                });
            } else {
                let reason = new TypeError('Please call setInput() first!!');
                reject(reason);

                return;
            }
        });
    }

    // FIXME: function is not ready!!
    async _write(message = '') {
        if (
            this.writer !== null &&
            this.writer instanceof fs.WriteStream
        ) {
            // Start output the detect results by WriteStream!!
            this.writer.write(message, 'UTF8');

            this.writer.end();

            this.writer.on('finish', function () {
                console.log('Wrote completed!!');
            });

            this.writer.on('error', function (err) {
                console.log(err.stack);
            });

            console.log('Write End!!');
        }

        console.log('Start output detect results by Console!!');
    }

    clearLineBreak(context) {
        return context.replace(/(\n)/igm, '');
    }

    async _initRules(rules = []) {
        if (!(rules instanceof Array)) {
            let reason = new Error('Encounter error on the rules');
            return reason;
        }

        if (rules.length === 0) {
            if (this.manager.length !== 0) {
                return;
            }

            for (let index in PredefineRules) {
                rules.push(PredefineRules[index]);
            }
        }

        let self = this;

        self.manager = [];

        rules.forEach(function(rule) {
            self.manager.push(new Ruler(rule));
        });
    }

    async check(context, rules = []) {
        let _context = this.clearLineBreak(context);

        try {
            await this._initRules(rules);

            await this.manager.forEach(function(ruler) {
                ruler[ruler.rule](_context);
            });
        } catch(e) {
            console.error(e);
        }
    }

    async detect(rules = []) {
        try {
            let context = await this._read();

            await this.check(context, rules);
        } catch (e) {
            console.error(e);
        }
    }
}

exports = module.exports = {
    PredefineRules,
    SnifferManager
};