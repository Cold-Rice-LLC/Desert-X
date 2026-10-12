import {defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {moduleMembers} from '../modules'

export default defineType({
  name: 'news',
  type: 'document',
  title: 'News',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishDate',
      type: 'date',
      title: 'Publish Date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'modules',
      type: 'array',
      title: 'Modules',
      of: moduleMembers,
    }),
  ],
  orderings: [
    {
      title: 'Publish Date, Newest',
      name: 'publishDateDesc',
      by: [{field: 'publishDate', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'publishDate'},
  },
})
