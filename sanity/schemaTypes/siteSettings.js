import {defineArrayMember, defineField, defineType} from 'sanity'
import {hasLink, linkTargetFields} from './objects/linkTarget'

// Footer rich text: paragraphs with italic and links only.
const footerTextMembers = [
  defineArrayMember({
    type: 'block',
    styles: [{title: 'Normal', value: 'normal'}],
    lists: [],
    marks: {
      decorators: [{title: 'Italic', value: 'em'}],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: linkTargetFields({
            required: true,
            schemes: ['http', 'https', 'mailto', 'tel'],
          }),
        },
      ],
    },
  }),
]

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
      type: 'array',
      title: 'Text',
      fieldset: 'footer',
      of: footerTextMembers,
    }),
    defineField({
      name: 'credits',
      type: 'array',
      title: 'Credits',
      fieldset: 'footer',
      of: footerTextMembers,
    }),
  ],
})
