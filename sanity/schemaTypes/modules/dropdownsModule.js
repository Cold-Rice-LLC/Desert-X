import {defineArrayMember, defineField, defineType} from 'sanity'
import {ChevronDownIcon} from '@sanity/icons'
import {countLabel, headingField} from '../objects/fields'

export default defineType({
  name: 'dropdownsModule',
  type: 'object',
  title: 'Dropdowns',
  icon: ChevronDownIcon,
  fields: [
    headingField,
    defineField({
      name: 'dropdowns',
      type: 'array',
      title: 'Dropdowns',
      of: [
        defineArrayMember({
          name: 'dropdown',
          type: 'object',
          title: 'Dropdown',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Title',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'content',
              type: 'richText',
              title: 'Content',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {heading: 'heading', dropdowns: 'dropdowns'},
    prepare: ({heading, dropdowns = []}) => ({
      title: heading || 'Dropdowns',
      subtitle: `Dropdowns · ${countLabel(dropdowns.length, 'dropdown')}`,
    }),
  },
})
