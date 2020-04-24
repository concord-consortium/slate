/* eslint-disable no-console */

import { Editor } from 'slate-react'
import { Value } from 'slate'

import React from 'react'
import faker from 'faker'

/**
 * Create a huge JSON document.
 *
 * @type {Object}
 */

const HEADINGS = 100
const PARAGRAPHS = 8 // Paragraphs per heading
const nodes = []
const json = {
  document: { nodes },
}

for (let h = 0; h < HEADINGS; h++) {
  nodes.push({
    object: 'block',
    type: 'heading',
    nodes: [{ object: 'text', text: faker.lorem.sentence() }],
  })

  for (let p = 0; p < PARAGRAPHS; p++) {
    nodes.push({
      object: 'block',
      type: 'paragraph',
      nodes: [{ object: 'text', text: faker.lorem.paragraph() }],
    })
  }
}

/**
 * Deserialize the initial editor value.
 *
 * @type {Object}
 */

const initialValue = Value.fromJSON(json, { normalize: false })

/**
 * The huge document example.
 *
 * @type {Component}
 */

class HugeDocument extends React.Component {
  /**
   * Render the editor.
   *
   * @return {Component} component
   */

  render() {
    return (
      <Editor
        placeholder="Enter some text..."
        spellCheck={false}
        defaultValue={initialValue}
        renderBlock={this.renderBlock}
        renderLeaf={this.renderLeaf}
      />
    )
  }

  /**
   * Render a Slate block.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   * @return {Element}
   */

  renderBlock = (props, editor, next) => {
    const { attributes, children, node } = props

    switch (node.type) {
      case 'heading':
        return <h1 {...attributes}>{children}</h1>
      default:
        return next()
    }
  }

  /**
   * Render a Slate leaf.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   * @return {Element}
   */

  renderLeaf = (props, editor, next) => {
    const { marks, attributes } = props
    let children = props.children

    const leafHasMark = type => marks.some(mark => mark.type === type)

    if (leafHasMark('bold')) {
      children = <strong>{children}</strong>
    }

    if (leafHasMark('code')) {
      children = <code>{children}</code>
    }

    if (leafHasMark('italic')) {
      children = <em>{children}</em>
    }

    if (leafHasMark('underlined')) {
      children = <u>{children}</u>
    }

    return <span {...attributes}>{children}</span>
  }
}

/**
 * Export.
 */

export default HugeDocument
