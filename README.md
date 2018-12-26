[![Build Status][travis-image]][travis-url] [![npm version][npm-image]][npm-url] [![License: LGPL v3][license-image]][license-url]

[travis-image]: https://img.shields.io/travis/TesterRandolph/SEO_Sniffer.svg
[travis-url]: https://travis-ci.org/TesterRandolph/SEO_Sniffer
[npm-image]: https://badge.fury.io/js/seo_sniffer.svg
[npm-url]: https://www.npmjs.com/package/seo_sniffer
[license-image]: https://img.shields.io/badge/License-LGPL%20v3-blue.svg
[license-url]: https://www.gnu.org/licenses/lgpl-3.0

# SEO_Sniffer
Develop a Node.js package to let user can use this package to scan a HTML file and show all of the SEO defects.

# Features ( Development Requirement )
1. This package should be production ready and a NPM module
2. User is free to chain any rules by themselves
	- For example, they can only use the rule 1 and 4 or only use rule 2.
	- The order of rules is doesn’t matter
3. User can define and use their own rules easily
4. The input can be:
	- A HTML file (User is able to config the input path)
	- Node Readable Stream
5. The output can be:
	- A file (User is able to config the output destination)
	- Node Writable Stream
	- Console
6. Your package should be flexible:
	- When we want to implement additional rules for `<meta>` tag, The code changes should be small. Ex: Checking `<meta name=“robots” />` existing or not?!

# Prerequisites
Developing by the Node.js 11.5

# Installation
```bash
npm install seo_sniffer
```

# Initializing Input/Output
## By Constructor
```javascript
const sniffer = new SnifferManager({
  input: 'PathToFile',
  // 'PathToFile' or fs.ReadStream
  
  output: 'PathToFile'
  // 'PathToFile' or fs.WriteStream or 'console'
})
```

## By setInput()/setOutput()
```javascript
const sniffer = new SnifferManager()

sniffer.setInput('PathToFile')
// 'PathToFile' or fs.ReadStream

sniffer.setOnput('PathToFile')
// 'PathToFile' or fs.WriteStream or 'console'
```

# Check Methods & Export Reports
## hasTagWithoutAttr()
Export Tag/Attribute:
```
`Has ${diff} ${tag} tag without ${attribute}.`
`No found any ${tag} tag without ${attribute}.`
```
Export Tag/Attribute/Value:
```
`Has ${diff} ${tag} tag without ${attribute}="${value}".`
`No found any ${tag} tag without ${attribute}="${value}".`
```

## isTagNotExist()
Export Tag:
```
`Not find any match on the ${tag}!!`
`Find matches on the ${tag}: ${counter}`
```
Export Tag/Attribute:
```
`Not find any match on the ${tag} with ${attribute}!!`
`Find matches on the ${tag} with ${attribute}: ${counter}`
```
Export Tag/Attribute/Value:
```
`Not find any match on the ${tag} with ${attribute}="${value}"!!`
`Find matches on the ${tag} with ${attribute}="${value}": ${counter}`
```

## isTagOverLimit()
Export Tag:
```
`There are ${counter} ${tag} tag, it's over the limit ${limit}!!`
`Find matches on the ${tag} tag: ${counter}`
```
Export Tag/Attribute:
```
`There are ${counter} ${tag} with ${attribute}, it's over the limit ${limit}!!`
`Find matches on the ${tag} with ${attribute}: ${counter}`
```
Export Tag/Attribute/Value:
```
`There are ${counter} ${tag} with ${attribute}="${value}", it's over the limit ${limit}!!`
`Find matches on the ${tag} with ${attribute}="${value}": ${counter}`
```

## isTagNotOnly()
Export is the same with "isTagOverLimit"

## detectSubRules()
Calling the other check methods to detect by the setting in the subRules.

# Rule Set Format
```javascript
{
  rule: 'Check_Method_Name',
  tag: 'HTML_Tag_Name',
  attribute: 'Attribute_Name',
  value: 'Attribute_Value',
  subRules: [{Rule_set}, ...]
  limit: Integer
}
```
- Must have: rule & tag
- If you want to use the subRules, the rule must be "detectSubRules" and the limit will be useless.
- The limit will be setting up with a default 0, if you are not setting a value.

# Predefine Rules
## isImageWithoutAlt
Detect if any `<img />` tag without alt attribute
```javascript
{
  rule: 'hasTagWithoutAttr',
  tag: 'img',
  attribute: 'alt'
}
```

## isAWithoutRel
Detect if any `<a />` tag without rel attribute
```javascript
{
  rule: 'hasTagWithoutAttr',
  tag: 'a',
  attribute: 'rel'
}
```

## isHeadLegal
In `<head>` tag
- Detect if header doesn’t have `<title>` tag
- Detect if header doesn’t have `<meta name=“descriptions” ... />` tag
- Detect if header doesn’t have `<meta name=“keywords” ... />` tag
```javascript
{
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
}
```

## isStrongOverLimit
Detect if there’re more than 15 `<strong>` tag in HTML (15 is a value should be configurable by user)
```javascript
{
  rule: 'isTagOverLimit',
  tag: 'strong',
  limit: 15
}
```

## isH1NotOnly
Detect if a HTML have more than one `<H1>` tag
```javascript
{
  rule: 'isTagNotOnly',
  tag: 'H1'
}
```


# Example
## Basic
### By Constructor
```javascript
const { SnifferManager } = require('seo_sniffer')

const ioConfig = {
  input: 'PathToFile',
  // input: fs.createReadStream('PathToFile'),

  output: 'PathToFile'
  // output: fs.createWriteStream('PathToFile')
  // output: 'console'
}

const sniffer = new SnifferManager(ioConfig)

sniffer.detect()
```

### By setInput()/setOutput()
```javascript
const { SnifferManager } = require('seo_sniffer')

const ioConfig = {
  input: 'PathToFile',
  // input: fs.createReadStream('PathToFile'),

  output: 'PathToFile'
  // output: fs.createWriteStream('PathToFile')
  // output: 'console'
}

const sniffer = new SnifferManager()

sniffer.setInput('PathToFile')
// 'PathToFile' or fs.createReadStream(PathToFile)

sniffer.setOnput('PathToFile')
// 'PathToFile' or fs.createWriteStream(PathToFile) or 'console'

sniffer.detect()
```

### No Input/Output by console
```javascript
const { SnifferManager } = require('seo_sniffer')

const sniffer = new SnifferManager()

sniffer.check('YourContext')
// sniffer.check('YourContext', [Rules])
```

## Choice from the Predefine Rules
```javascript
const { PredefineRules, SnifferManager } = require('seo_sniffer')

const ioConfig = {
  input: 'PathToFile',
  // input: fs.createReadStream('PathToFile'),

  output: 'PathToFile'
  // output: fs.createWriteStream('PathToFile')
  // output: 'console'
}

const sniffer = new SnifferManager(ioConfig)

sniffer.detect([
  PredefineRules.isImageWithoutAlt,
  PredefineRules.isAWithoutRel,
  PredefineRules.isHeadLegal
])
```

## Modify the Predefine Rules
If you want to implement additional rules for `<meta>` tag.
Ex: Checking `<meta name=“robots” />`
```javascript
const { PredefineRules, SnifferManager } = require('seo_sniffer')

const ioConfig = {
  input: 'PathToFile',
  // input: fs.createReadStream('PathToFile'),

  output: 'PathToFile'
  // output: fs.createWriteStream('PathToFile')
  // output: 'console'
}

const sniffer = new SnifferManager(ioConfig)

PredefineRules.isHeadLegal.subRules.push({
  rule: 'isTagNotExist',
  tag: 'meta',
  attribute: 'name',
  value: 'robots'
})

sniffer.reinitDefaultRules()

sniffer.detect()
```

If you want to reset the limit of `<strong>` from 15 to 5
```javascript
const { PredefineRules, SnifferManager } = require('seo_sniffer')

const ioConfig = {
  input: 'PathToFile',
  // input: fs.createReadStream('PathToFile'),

  output: 'PathToFile'
  // output: fs.createWriteStream('PathToFile')
  // output: 'console'
}

const sniffer = new SnifferManager(ioConfig)

PredefineRules.isStrongOverLimit.limit = 5

sniffer.reinitDefaultRules()

sniffer.detect()
```

## Customize the rule
The Customize rules & the predefine rules can be used in the same time.
```javascript
const { SnifferManager } = require('seo_sniffer')

const ioConfig = {
  input: 'PathToFile',
  // input: fs.createReadStream('PathToFile'),

  output: 'PathToFile'
  // output: fs.createWriteStream('PathToFile')
  // output: 'console'
}

const sniffer = new SnifferManager(ioConfig)

sniffer.detect([{
  rule: 'isTagNotExist',
  tag: 'meta',
  attribute: 'name',
  value: 'robots'
},
{
  rule: 'isTagNotExist',
  tag: 'meta',
  attribute: 'name',
  value: 'keywords'
}])
```

## Mixed Customize/Predefine rules
```javascript
const { PredefineRules, SnifferManager } = require('seo_sniffer')

const ioConfig = {
  input: 'PathToFile',
  // input: fs.createReadStream('PathToFile'),

  output: 'PathToFile'
  // output: fs.createWriteStream('PathToFile')
  // output: 'console'
}

const sniffer = new SnifferManager(ioConfig)

sniffer.detect([
  PredefineRules.isStrongOverLimit,
  PredefineRules.isImageWithoutAlt,
  {
    rule: 'isTagNotExist',
    tag: 'meta',
    attribute: 'name',
    value: 'robots'
  },
  {
    rule: 'isTagNotExist',
    tag: 'meta',
    attribute: 'name',
    value: 'keywords'
  }
])
```

