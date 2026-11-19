import styled from 'styled-components'

/**
 * The Heading style as the editor shows it: Normal's size, not Sanity's
 * large h3, and semibold so it stands apart at a glance. On the site it's
 * the text's own size and weight, set apart by the space above it.
 */
const HeadingText = styled.span`
  font-size: 1em;
  font-weight: 600;
`

export default HeadingText
