# Rendering

One of the best parts of Slate is that it's built with React, so it fits right into your existing application. It doesn't re-invent its own view layer that you have to learn. It tries to keep everything as React-y as possible.

To that end, Slate gives you control over the rendering behavior of your custom nodes and properties in your richtext domain.

You can define these behaviors by passing `props` into the editor, or you can define them in Slate plugins.

## Nodes

Using custom components for the nodes and leaves is the most common rendering need. Slate makes this easy to do. In the case of nodes, you just define a function and pass it to the `renderBlock` or `renderInline` prop of `Editor` component.

The function is called with the node's props, including `props.node` which is the node itself. You can use these to determine what to render. For example, you can render nodes using simple HTML elements:

```js
function renderBlock(props, editor, next) {
  const { node, attributes, children } = props

  switch (node.type) {
    case 'paragraph':
      return <p {...attributes}>{children}</p>
    case 'quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'image': {
      const src = node.data.get('src')
      return <img {...attributes} src={src} />
    }
    default:
      return next()
  }
}

function renderInline(props, editor, next) {
  ...
}

<Editor
  renderBlock={renderBlock}
  renderInline={renderInline}
  ...
/>
```

> 🤖 Be sure to mix in `props.attributes` and render `props.children` in your node components! The attributes are required for utilities like Slate's `findDOMNode`, and the children are the actual text content of your nodes.

You don't have to use simple HTML elements, you can use your own custom React components too:

```js
function renderBlock(props, editor, next) {
  switch (props.node.type) {
    case 'paragraph':
      return <ParagraphComponent {...props} />
    case 'quote':
      return <QuoteComponent {...props} />
    case 'image':
      return <ImageComponent {...props} />
    default:
      return next()
  }
}
```

And you can just as easily put that `renderBlock` or `renderInline` logic into a plugin, and pass that plugin into your editor instead:

```js
function SomeRenderingPlugin() {
  return {
    renderBlock(props, editor, next) {
      ...
    }
  }
}

const plugins = [
  SomeRenderingPlugin(),
  ...
]

<Editor
  plugins={plugins}
  ...
/>
```

## Leaves

When text-level formatting is rendered, the characters are grouped into "leaves" of text that each contain the same formatting applied to them.

To customize the rendering of each leaf, you use a custom `renderLeaf` prop:

```js
function renderLeaf(props, editor, next) {
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

  if (leafHasMark('strikethrough')) {
    children = <s>{children}</s>
  }

  return <span {...attributes}>{children}</span>
}
```

> 🤖 Be sure to mix `props.attributes` in your `renderLeaf`. `attributes` provides `data-*` dom attributes for spell-check in non-IE browsers.

Notice though how we've handled it slightly differently than `renderBlock`. Since text formatting tends to be fairly simple, we've opted to ditch the `switch` statement and just toggle on/off a few styles instead. (But there's nothing preventing you from using custom components if you'd like!)

One disadvantage of text-level formatting is that you cannot guarantee that any given format is "contiguous"—meaning that it stays as a single leaf. This limitation with respect to leaves is similar to the DOM, where this is invalid:

```html
<em>t<strong>e</em>x</strong>t
```

Because the elements in the above example do not properly close themselves they are invalid. Instead, you would write the above HTML as follows:

```html
<em>t</em><strong><em>e</em>x</strong>t
```

If you happened to add another overlapping section of `<strike>` to that text, you might have to rearrange the closing tags yet again. Rendering leaves in Slate is similar—you can't guarantee that even though a word has one type of formatting applied to it that that leaf will be contiguous, because it depends on how it overlaps with other formatting.

Of course, this leaf stuff sounds pretty complex. But, you do not have to think about it much, as long as you use text-level formatting and node-level formatting for their intended purposes:

- Text properties are for **non-contiguous**, character-level formatting.
- Node properties are for **contiguous**, semantic elements in the document.

> 🤖 Note that in earlier versions of Slate leaf formatting was handled by a `renderMark` prop which Slate called for each mark associated with a given leaf. The `renderMark` prop is still supported, but the `renderLeaf` prop gives the client more control of leaf rendering and is more analogous with the way Slate 0.50+ handles leaf rendering. If the `renderLeaf` prop is not provided, however, the `renderMark` prop will be called as before for the benefit of clients using it.

## The Editor Itself

Not only can you control the rendering behavior of the components inside the editor, but you can also control the rendering of the editor itself.

This sounds weird, but it can be pretty useful if you want to render additional top-level elements from inside a plugin. To do so, you use the `renderEditor` function:

```js
function renderEditor(props, editor, next) {
  const { editor } = props
  const wordCount = countWords(editor.value.text)
  const children = next()
  return (
    <React.Fragment>
      {children}
      <span className="word-count">{wordCount}</span>
    </React.Fragment>
  )
}

<Editor
  renderEditor={renderEditor}
  ...
/>
```

Here we're rendering a small word count number underneath all of the content of the editor. Whenever you change the content of the editor, `renderEditor` will be called, and the word count will be updated.

This is very similar to how higher-order components work! Except it allows each plugin in Slate's plugin stack to wrap the editor's children.

> 🤖 Be sure to remember to render `children` in your `renderEditor` functions, because that contains the editor's own elements!
