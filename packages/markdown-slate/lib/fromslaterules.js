/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;
const { NS_PREFIX_CiceroMarkModel } = require('@accordproject/markdown-cicero').CiceroMarkModel;

const fromslateutil = require('./fromslateutil');

const rules = {};

// CommonMark rules
rules.paragraph = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Paragraph`, nodes: []};
};
rules.softbreak = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Softbreak`};
};
rules.linebreak = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Linebreak`};
};
rules.horizontal_rule = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}ThematicBreak`};
};
rules.heading_one = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '1', nodes: []};
};
rules.heading_two = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '2', nodes: []};
};
rules.heading_three = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '3', nodes: []};
};
rules.heading_four = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '4', nodes: []};
};
rules.heading_five = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '5', nodes: []};
};
rules.heading_six = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '6', nodes: []};
};
rules.block_quote = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}BlockQuote`, nodes: []};
};
rules.code_block = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}CodeBlock`, text: fromslateutil.getText(node)};
};
rules.html_block = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}HtmlBlock`, text: fromslateutil.getText(node)};
};
rules.html_inline = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}HtmlInline`, text: node.data.content};
};
rules.link = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Link`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
};
rules.image = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Image`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
};
rules.list_item = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Item`, nodes: []};
};

// Shared CommonMark / CiceroMark rules ???
rules.ol_list = (node,processNodes) => {
    let result;
    if (node.data.type === 'variable') {
        result = {$class : `${NS_PREFIX_CiceroMarkModel}ListBlock`, name: node.data.name, type: 'ordered', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
        if (node.data.elementType) {
            result.elementType = node.data.elementType;
        }
        if (node.data.decorators) {
            result.decorators = node.data.decorators;
        }
    } else {
        result = {$class : `${NS_PREFIX_CommonMarkModel}List`, type: 'ordered', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
    }
    return result;
};
rules.ul_list = (node,processNodes) => {
    let result;
    if (node.data.type === 'variable') {
        result = {$class : `${NS_PREFIX_CiceroMarkModel}ListBlock`, name: node.data.name, type: 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
        if (node.data.elementType) {
            result.elementType = node.data.elementType;
        }
        if (node.data.decorators) {
            result.decorators = node.data.decorators;
        }
    } else {
        result = {$class : `${NS_PREFIX_CommonMarkModel}List`, type: 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
    }
    return result;
};

// CiceroMark rules
rules.clause = (node,processNodes) => {
    // console.log(JSON.stringify(node, null, 4));
    const result = {$class : `${NS_PREFIX_CiceroMarkModel}Clause`, name: node.data.name, nodes: []};
    if (node.data.elementType) {
        result.elementType = node.data.elementType;
    }
    if (node.data.decorators) {
        result.decorators = node.data.decorators;
    }
    if (node.data.src) {
        result.src = node.data.src;
    }
    return result;
};
rules.conditional = (node,processNodes) => {
    const isTrue = node.data.isTrue;
    let whenTrueNodes = [];
    processNodes(whenTrueNodes, node.data.whenTrue);
    let whenFalseNodes = [];
    processNodes(whenFalseNodes, node.data.whenFalse);
    return fromslateutil.handleConditional(node,isTrue,whenTrueNodes,whenFalseNodes);
};
rules.optional = (node,processNodes) => {
    const hasSome = node.data.hasSome;
    let whenSomeNodes = [];
    processNodes(whenSomeNodes, node.data.whenSome);
    let whenNoneNodes = [];
    processNodes(whenNoneNodes, node.data.whenNone);
    return fromslateutil.handleOptional(node,hasSome,whenSomeNodes,whenNoneNodes);
};
rules.variable = (node,processNodes) => {
    return fromslateutil.handleVariable(node);
};
rules.formula = (node,processNodes) => {
    return fromslateutil.handleFormula(node);
};

module.exports = rules;