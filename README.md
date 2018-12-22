# SEO_Sniffer
For checking the SEO.


# Features

# Prerequisites
I'm using the Node.js 11.5

# Installation
```
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
## hasTagWithoutAttr
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

## isTagNotExist
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

## isTagOverLimit
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

## isTagNotOnly
Export is the same with "isTagOverLimit"

## detectSubRules
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

# Predefine Rules
## isImageWithoutAlt
```javascript
{
  rule: 'hasTagWithoutAttr',
  tag: 'img',
  attribute: 'alt'
}
```

## isAWithoutRel
```javascript
{
  rule: 'hasTagWithoutAttr',
  tag: 'a',
  attribute: 'rel'
}
```

## isHeadLegal
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
```javascript
{
  rule: 'isTagOverLimit',
  tag: 'strong',
  limit: 15
}
```

## isH1NotOnly
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
If you want to implement additional rules for <meta> tag.
Ex: Checking <meta name=“robots” />
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

## Customize the rule
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


