import {Card, Container} from '@sanity/ui'
import {Marked} from 'marked'
import styled from 'styled-components'
import source from './guide.md?raw'

// GitHub's heading slugs, so the guide's own contents links resolve
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s/g, '-')

const marked = new Marked({
  renderer: {
    heading({tokens, depth, text}) {
      return `<h${depth} id="${slug(text)}">${this.parser.parseInline(tokens)}</h${depth}>`
    },
  },
})

// The guide is our own markdown, so it's safe to render as HTML
const html = marked.parse(source)

// In-page links scroll the guide rather than changing the Studio's URL
const followContentsLink = (event) => {
  const href = event.target.closest('a')?.getAttribute('href')
  if (!href?.startsWith('#')) return
  event.preventDefault()
  event.currentTarget.ownerDocument
    .getElementById(href.slice(1))
    ?.scrollIntoView({behavior: 'smooth'})
}

const Prose = styled.article`
  font-size: 1rem;
  line-height: 1.6;

  h1 {
    margin: 0 0 1rem;
    font-size: 2rem;
    line-height: 1.2;
  }

  h2 {
    margin: 3rem 0 1rem;
    padding-top: 2rem;
    border-top: 1px solid var(--card-border-color);
    font-size: 1.5rem;
    line-height: 1.25;
    scroll-margin-top: 1rem;
  }

  h3 {
    margin: 2rem 0 0.5rem;
    font-size: 1.125rem;
    scroll-margin-top: 1rem;
  }

  p,
  ul,
  ol,
  table {
    margin: 0 0 1rem;
  }

  ul,
  ol {
    padding-left: 1.5rem;
  }

  li + li {
    margin-top: 0.25rem;
  }

  a {
    color: var(--card-link-color);
  }

  code {
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    background: var(--card-code-bg-color);
    color: var(--card-code-fg-color);
    font-size: 0.875em;
  }

  table {
    display: block;
    overflow-x: auto;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th,
  td {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--card-border-color);
    text-align: left;
    vertical-align: top;
  }

  th {
    background: var(--card-code-bg-color);
  }

  td:first-child {
    white-space: nowrap;
  }
`

export function GuideTool() {
  return (
    <Card height="fill" overflow="auto" paddingX={4} paddingY={[5, 6]}>
      <Container width={2}>
        <Prose onClick={followContentsLink} dangerouslySetInnerHTML={{__html: html}} />
      </Container>
    </Card>
  )
}
