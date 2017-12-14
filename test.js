import test from 'ava';
import Parser from './lib/sps-parser'

const fs = require('fs')
const content = fs.readFileSync('./fixtures/test-1.sps', 'utf8')

test('set value', t => {
  let parser = new Parser(content)

  parser.replace(188, 'HE01_03', 'HEX_82829')

  let newContent = parser.getText()

  // fs.writeFileSync('./test.sps', newContent, 'utf8');

  let newParser = new Parser(newContent)
  let value = newParser.getValue(188, 'HE01_03')

  t.is(value, 'HEX_82829')
});
