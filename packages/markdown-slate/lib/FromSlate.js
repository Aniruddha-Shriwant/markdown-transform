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

const NS = 'org.accordproject.commonmark';
const NS_CICERO = 'org.accordproject.ciceromark';

const fromslateutil = require('./fromslateutil');

/**
 * Converts a Slate DOM to a Markdown DOM
 */
class FromSlate {
    /**
     * Converts a set of Slate child node to Markdown DOM (as JSON)
     * @param {*} value the Slate value
     * @returns {*} the Markdown DOM
     */
    fromSlate(value) {

        const result = {
            $class : 'org.accordproject.commonmark.Document',
            xmlns : 'http://commonmark.org/xml/1.0',
            nodes : []
        };
        // convert the value to a plain object
        this.processChildren(result, value.document.children);
        return fromslateutil.removeEmptyParagraphs(result);
    }

    /**
     * Converts an array of Slate nodes, pushing them into the parent
     * @param {*} parent the parent CiceroMark DOM node
     * @param {*} nodes an array of Slate nodes
     */
    processChildren(parent, nodes) {
        if(!parent.nodes) {
            throw new Error(`Parent node doesn't have children ${JSON.stringify(parent)}`);
        }
        this.processNodes(parent.nodes, nodes);
    }

    /**
     * Converts an array of Slate nodes, pushing them into the parent
     * @param {*} target the target nodes
     * @param {*} nodes an array of Slate nodes
     */
    processNodes(target, nodes) {
        nodes.forEach((node, index) => {
            let result = null;
            let handleChildren = true;

            if('text' in node && !node.type) {
                result = fromslateutil.handleText(node);
            } else {
                switch(node.type) {
                case 'clause':
                    // console.log(JSON.stringify(node, null, 4));
                    result = {$class : `${NS_CICERO}.Clause`, name: node.data.name, nodes: []};
                    if (node.data.elementType) {
                        result.elementType = node.data.elementType;
                    }
                    if (node.data.decorators) {
                        result.decorators = node.data.decorators;
                    }
                    if (node.data.src) {
                        result.src = node.data.src;
                    }
                    break;
                case 'conditional': {
                    const isTrue = node.data.isTrue;
                    let whenTrueNodes = [];
                    this.processNodes(whenTrueNodes, node.data.whenTrue);
                    let whenFalseNodes = [];
                    this.processNodes(whenFalseNodes, node.data.whenFalse);
                    result = fromslateutil.handleConditional(node,isTrue,whenTrueNodes,whenFalseNodes);
                }
                    break;
                case 'optional': {
                    const hasSome = node.data.hasSome;
                    let whenSomeNodes = [];
                    this.processNodes(whenSomeNodes, node.data.whenSome);
                    let whenNoneNodes = [];
                    this.processNodes(whenNoneNodes, node.data.whenNone);
                    result = fromslateutil.handleOptional(node,hasSome,whenSomeNodes,whenNoneNodes);
                }
                    break;
                case 'variable': {
                    result = fromslateutil.handleVariable(node);
                    handleChildren = false;
                }
                    break;
                case 'formula':
                    result = fromslateutil.handleFormula(node);
                    break;
                case 'paragraph':
                    result = {$class : `${NS}.Paragraph`, nodes: []};
                    break;
                case 'softbreak':
                    result = {$class : `${NS}.Softbreak`};
                    break;
                case 'linebreak':
                    result = {$class : `${NS}.Linebreak`};
                    break;
                case 'horizontal_rule':
                    result = {$class : `${NS}.ThematicBreak`};
                    break;
                case 'heading_one':
                    result = {$class : `${NS}.Heading`, level : '1', nodes: []};
                    break;
                case 'heading_two':
                    result = {$class : `${NS}.Heading`, level : '2', nodes: []};
                    break;
                case 'heading_three':
                    result = {$class : `${NS}.Heading`, level : '3', nodes: []};
                    break;
                case 'heading_four':
                    result = {$class : `${NS}.Heading`, level : '4', nodes: []};
                    break;
                case 'heading_five':
                    result = {$class : `${NS}.Heading`, level : '5', nodes: []};
                    break;
                case 'heading_six':
                    result = {$class : `${NS}.Heading`, level : '6', nodes: []};
                    break;
                case 'block_quote':
                    result = {$class : `${NS}.BlockQuote`, nodes: []};
                    break;
                case 'code_block':
                    result = {$class : `${NS}.CodeBlock`, text: fromslateutil.getText(node)};
                    break;
                case 'html_block':
                    result = {$class : `${NS}.HtmlBlock`, text: fromslateutil.getText(node)};
                    break;
                case 'html_inline':
                    result = {$class : `${NS}.HtmlInline`, text: node.data.content};
                    break;
                case 'ol_list':
                case 'ul_list': {
                    if (node.data.type === 'variable') {
                        result = {$class : `${NS_CICERO}.ListBlock`, name: node.data.name, type: node.type === 'ol_list' ? 'ordered' : 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
                        if (node.data.elementType) {
                            result.elementType = node.data.elementType;
                        }
                        if (node.data.decorators) {
                            result.decorators = node.data.decorators;
                        }
                    } else {
                        result = {$class : `${NS}.List`, type: node.type === 'ol_list' ? 'ordered' : 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
                    }
                }
                    break;
                case 'list_item':
                    result = {$class : `${NS}.Item`, nodes: []};
                    break;
                case 'link':
                    result = {$class : `${NS}.Link`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
                    break;
                case 'image':
                    result = {$class : `${NS}.Image`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
                    break;
                }
            }

            // process any children, attaching to first child if it exists (for list items)
            if(node.children && result && result.nodes && handleChildren) {
                this.processChildren(result.nodes[0] ? result.nodes[0] : result, node.children);
                if (result.nodes.length === 0) {
                    result.nodes.push({$class : `${NS}.Text`, text : ''});
                }
            }

            if(result) {
                target.push(result);
            }
        });
    }
}

module.exports = FromSlate;