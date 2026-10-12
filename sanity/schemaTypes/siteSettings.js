import {defineField, defineType} from 'sanity'
import {hasLink, linkTargetFields} from './objects/linkTarget'

export default defineType({
  name: 'siteSettings',
  type: 'document',
  title: 'Site Settings',
  fields: [
    defineField({
      name: 'siteTitle',
      type: 'string',
      title: 'Site Title',
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      type: 'image',
      title: 'OG Image',
    }),
    defineField({
      name: 'announcementBar',
      type: 'object',
      title: 'Announcement Bar',
      description: 'Shown across the top of the site. Leave the text empty to hide it.',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'text',
          type: 'string',
          title: 'Text',
        }),
        ...linkTargetFields(),
        defineField({
          name: 'linkLabel',
          type: 'string',
          title: 'Link Label',
          hidden: ({parent}) => !hasLink(parent),
          validation: (rule) =>
            rule.custom((value, context) =>
              hasLink(context.parent) && !value ? 'Link Label is required.' : true,
            ),
        }),
      ],
    }),
  ],
})
