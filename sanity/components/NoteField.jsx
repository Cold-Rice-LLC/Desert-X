// Props come from Sanity's form builder, not from callers
/* eslint-disable react/prop-types */
import {Card, Text} from '@sanity/ui'

/**
 * Renders a field as a plain note, in place of its title and input: the
 * field's description is the note's text. The field itself stores nothing.
 */
export function NoteField({schemaType}) {
  return (
    <Card padding={3} radius={2} tone="primary" border>
      <Text size={1}>{schemaType.description}</Text>
    </Card>
  )
}
