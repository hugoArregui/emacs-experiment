const { Document } = require('tree-sitter');
const { readFileSync } = require('fs');
const util = require('util');
const fs = require('fs');

const emacsStream = fs.createWriteStream('syntax.el');

const document = new Document();
document.setLanguage(require('tree-sitter-javascript'));

const f = 'example.js';

const content = readFileSync(f).toString('utf8');
document.setInputString(content);
document.parse();

console.log(document.rootNode.toString());

const output = {
  keywords: [],
  strings: [],
  comments: []
};

function loop(parent, node) {
  const { type, startIndex, endIndex, isNamed } = node;

  if (type === 'program') {
    emacsStream.write(`(setq index-tree '(`);
  }
  emacsStream.write(`((${startIndex} . ${endIndex}) "${type}" `);

  if (type === 'return' ||
      type === 'const' ||
      type === 'if' ||
      type === 'let' ||
      // NOTE function could be the block or the keyword
      (type === 'function' && parent && parent.type === 'function')) {
    output.keywords.push({
      startIndex: startIndex + 1,
      endIndex: endIndex + 1
    });
  } else if (type === 'string') {
    output.strings.push({
      startIndex: startIndex + 1,
      endIndex: endIndex + 1
    });
  } else if (type === 'comment') {
    output.comments.push({
      startIndex: startIndex + 1,
      endIndex: endIndex + 1
    });
  } else {
    // console.log(node);
  }

  if (node.children.length > 0) {
    emacsStream.write(" \n (children ");
    node.children.forEach((child) => {
      emacsStream.write('\n');
      loop(node, child);
    });
    emacsStream.write(')');
  }
  emacsStream.write(')');
}


function generateEmacsProgram(output) {
  const setColor = (color, startIndex, endIndex) => {
    console.log(`(put-text-property ${startIndex} ${endIndex} 'font-lock-face
        (cons 'foreground-color "${color}"))`);
  };

  //NOTE: for reset
  setColor('white', 1, content.length + 1);

  console.log('(let ()');
  console.log("(set-syntax-table (make-char-table 'syntax-table nil))");
  output.keywords.forEach(({ startIndex, endIndex }) => {
    setColor('yellow', startIndex, endIndex);
  });
  output.strings.forEach(({ startIndex, endIndex }) => {
    setColor('red', startIndex, endIndex);
  });
  output.comments.forEach(({ startIndex, endIndex }) => {
    setColor('green', startIndex, endIndex);
  });
  console.log(')');
}


loop(null, document.rootNode);
emacsStream.write('))');
generateEmacsProgram(output);

emacsStream.end();
