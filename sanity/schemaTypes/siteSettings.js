import {defineArrayMember, defineField, defineType} from 'sanity'
import {hasLink, linkTargetFields} from './objects/linkTarget'

export default defineType({
  name: 'siteSettings',
  type: 'document',
  title: 'Site Settings',
  fieldsets: [
    {
      name: 'metadata',
      title: 'Metadata',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'footer',
      title: 'Footer',
      options: {collapsible: true, collapsed: false},
    },
  ],
  fields: [
    defineField({
      name: 'siteTitle',
      type: 'string',
      title: 'Site Title',
      fieldset: 'metadata',
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      fieldset: 'metadata',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      type: 'image',
      title: 'OG Image',
      fieldset: 'metadata',
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
    // One field per footer column, left and right.
    ...[1, 2].map((n) =>
      defineField({
        name: `footerLinks${n}`,
        type: 'array',
        title: `Links ${n}`,
        fieldset: 'footer',
        of: [defineArrayMember({type: 'navLink'})],
      }),
    ),
    defineField({
      name: 'footerText',
      type: 'richText',
      title: 'Text',
      fieldset: 'footer',
    }),
    defineField({
      name: 'credits',
      type: 'richText',
      title: 'Credits',
      fieldset: 'footer',
    }),
  ],
})
