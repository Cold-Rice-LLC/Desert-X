import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'

const isHomepage = (document) => ['homepage', 'drafts.homepage'].includes(document?._id)

export default defineType({
  name: 'page',
  type: 'document',
  title: 'Page',
  icon: DocumentIcon,
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
      hidden: ({document}) => isHomepage(document),
      validation: (rule) =>
        rule.custom((value, context) =>
          isHomepage(context.document) || value?.current ? true : 'Required',
        ),
    }),
    defineField({
      name: 'modules',
      type: 'array',
      title: 'Modules',
      of: [{type: 'placeholderModule'}],
    }),
  ],
})
