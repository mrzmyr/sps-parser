# SPS Parser

> Parse your SPS file and modify and save it to make working with tools like [soscisurvey.de](https://www.soscisurvey.de/) and SPSS more flexible

### Installation

Use the file in `lib/sps-parser.js`

> Haven't got the time to publish to `npm`

### Usage

#### Read & Write

```js
const Parser = require('./sps-parser')
const content = fs.readFileSync('your-file.sps', 'utf8')

let parser = new Parser(content)

// replace case with case id 188 value 'HE01_03' with '5'
parser.replace(188, 'HE01_03', 5)

// get raw text output with new values
let newContent = parser.getText()

fs.writeFileSync('./test.sps', newContent, 'utf8');
```

#### Get Values & Variables

```js
const Parser = require('./sps-parser')
const content = fs.readFileSync('your-file.sps', 'utf8')

let parser = new Parser(content)

let value = parser.getValue(188, 'HE01_03')
let values = parser.getValues()
let variables = parser.getVariables()
```
