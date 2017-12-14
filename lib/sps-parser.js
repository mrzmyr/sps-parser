const fs = require('fs')

const flatten = arr => arr.reduce(
  (acc, val) => acc.concat(
    Array.isArray(val) ? flatten(val) : val
  ),
  []
);

class Parser {
  constructor(content) {
    this.content = content;
  }

  // https://stackoverflow.com/a/7624821/237209
  _splitLineByLength(str, l) {
    var strs = [];
    while(str.length > l){
        var pos = str.substring(0, l).lastIndexOf('\t');
        pos = pos <= 0 ? l : pos;
        strs.push(str.substring(0, pos));
        var i = str.indexOf('\t', pos)+1;
        if(i < pos || i > pos+l)
            i = pos;
        str = str.substring(i);
    }
    strs.push(str);
    return strs;
  }

  _getLines(lines) {
    lines = lines.split('\n')

    // remove comments
    // lines = lines.filter(l => l[0] !== '*')

    // remove \r
    // lines = lines.map(l => l.replace(/\r/g, ''))

    return lines
  }

  _findIndex(str, lines) {
    for (var i = 0; i < lines.length; i++) {
      if(lines[i] === str) return i;
    }
  }

  _endsWith(str, lines) {
    for (var i = 0; i < lines.length; i++) {
      if(lines[i].endsWith(str)) return i;
    }
  }

  _getValuesBlockIndicies(lines) {
    let start = this._findIndex('BEGIN DATA\r', lines)
    let end = this._findIndex('END DATA.\r', lines)

    return { start, end }
  }

  _getVariableLabels(lines) {
    let start = this._findIndex('VARIABLE LABELS', lines)

    lines = lines.slice(start)

    let end = this._findIndex('.', lines)
    let block = lines.slice(1, end);

    let labels = block.map(b => {
      let index = b.trim().indexOf(' ') + 1
      return {
        id: b.substr(0, index),
        title: b.substr(index, b.length - 1).replace(/[\']/g, '').trim()
      }
    })

    return labels
  }

  _getValueIndexByName(variableName) {
    let variables = this.getVariables()

    for (var i = 0; i < variables.length; i++) {
      if(variables[i].id === variableName) return i
    }
  }

  _getCaseIndexByCaseId(caseId) {
    let values = this.getValues()
    for (var i = 0; i < values.length; i++) {
      if(values[i][0] == caseId) return i
    }
  }

  _getVariables(lines) {

    let start = this._findIndex('DATA LIST FREE(TAB)\r', lines)
    let end = this._endsWith('.\r', lines.slice(start)) + start

    let block = lines.slice(start + 1, end) // +1 remove headline

    return block.map(vl => {
      let split = vl.trim().split(' ')
      let id = split[0]
      let type = split[1].replace(/[\)|\(]/g, '')
      return { id, type }
    })
  }

  _getValues(lines, variables) {

    let { start, end } = this._getValuesBlockIndicies(lines)

    let block = lines.slice(start + 1, end) // +1 remove headline
    let data = []

    for (var i = 0; i < block.length; i++) {
      let dataLine = block[i].split('\t');
      while(dataLine.length < variables.length) {
        i++
        dataLine = dataLine.concat(block[i].split('\t'))
      }
      data.push(dataLine)
    }

    return data
  }

  _setValues(newValues) {
    let lines = this._getLines(this.content)
    let { start, end } = this._getValuesBlockIndicies(lines)
    let newDataBlock = newValues.map(j => j.join('\t'));

    let splittedByLength = flatten(newDataBlock.map(bd => this._splitLineByLength(bd, 255)))

    start++;

    splittedByLength.splice(0, 0, 'BEGIN DATA\r');
    splittedByLength.forEach((s, i) => {
      lines[start + i - 1] = s
    })

    this.content = lines.join('\n');
  }

  getVariables() {
    let lines = this._getLines(this.content)
    let variables = this._getVariables(lines);
    return variables
  }

  getValues() {
    let lines = this._getLines(this.content)
    let variables = this._getVariables(lines);
    let values = this._getValues(lines, variables);

    return values
  }

  getValue(caseId, variableName) {
    let values = this.getValues()
    let valueIndex = this._getValueIndexByName(variableName)
    let caseIndex = this._getCaseIndexByCaseId(caseId)

    return values[caseIndex][valueIndex]
  }

  getText() {
    return this.content
  }

  replace(caseId, variableName, newValue) {
    let values = this.getValues()
    let valueIndex = this._getValueIndexByName(variableName)
    let caseIndex = this._getCaseIndexByCaseId(caseId)

    values[caseIndex][valueIndex] = newValue

    this._setValues(values)
  }

}

module.exports = Parser
