import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {shownWhere} from '../objects/fields'

// News articles show three related news at the bottom on their own, so
// this module is only offered on pages
export default defineType({
  name: 'newsModule',
  type: 'object',
  title: 'News',
  icon: DocumentTextIcon,
  fields: [
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
      ...shownWhere(({parent}) => parent?.show === 'selected', {
        required: 'Pick at least one.',
        check: (value) => value.length <= 3 || 'Pick at most three.',
        rule: (rule) => rule.unique(),
      }),
    }),
  ],
  preview: {
    select: {show: 'show', selected: 'selected'},
    prepare: ({show, selected = []}) => ({
      title: 'News',
      subtitle: show === 'selected' ? `News · ${selected.length} selected` : 'News · Latest',
    }),
  },
})
