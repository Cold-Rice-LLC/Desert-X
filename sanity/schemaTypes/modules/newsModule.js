import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

// News articles show three related news at the bottom on their own, so
// this module is only offered on pages
export default defineType({
  name: 'newsModule',
  type: 'object',
  title: 'News',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
      description: 'Leave empty for "News".',
    }),
    defineField({
      name: 'show',
      type: 'string',
      title: 'Show',
      options: {
        list: [
          {title: 'Latest', value: 'latest'},
          {title: 'Selected', value: 'selected'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'latest',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'selected',
      type: 'array',
      title: 'News',
      description: 'One to three.',
      of: [
        defineArrayMember({type: 'reference', to: [{type: 'news'}], options: {disableNew: true}}),
      ],
      hidden: ({parent}) => parent?.show !== 'selected',
      validation: (rule) =>
        rule.unique().custom((value, context) => {
          if (context.parent?.show !== 'selected') return true
          if (!value?.length) return 'Pick at least one.'
          return value.length > 3 ? 'Pick at most three.' : true
        }),
    }),
  ],
  preview: {
    select: {heading: 'heading', show: 'show', selected: 'selected'},
    prepare: ({heading, show, selected = []}) => ({
      title: heading || 'News',
      subtitle: show === 'selected' ? `News · ${selected.length} selected` : 'News · Latest',
    }),
  },
})
