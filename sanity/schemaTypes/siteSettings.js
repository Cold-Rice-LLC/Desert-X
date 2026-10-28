import {defineArrayMember, defineField, defineType} from 'sanity'
import {linkTargetFields, linkTargetSelect, linkTargetSubtitle} from './objects/linkTarget'

// Menu items take the usual link fields plus a fourth Link Type, Sub-items:
// the item then opens its sub-items in the menu instead of following a link
const menuItemLinkFields = linkTargetFields().map((field) =>
  field.name === 'linkType'
    ? {
        ...field,
        options: {
          ...field.options,
          list: [...field.options.list, {title: 'Sub-items', value: 'subItems'}],
        },
      }
    : field,
)

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
      name: 'menu',
      title: 'Menu',
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
      name: 'donateLink',
      type: 'navLink',
      title: 'Donate Link',
      description: 'The grey button at the top right of the nav, on every page.',
    }),
    defineField({
      name: 'menuItems',
      type: 'array',
      title: 'Menu Items',
      fieldset: 'menu',
      of: [
        defineArrayMember({
          name: 'menuItem',
          type: 'object',
          title: 'Menu Item',
          fields: [
            defineField({
              name: 'label',
              type: 'string',
              title: 'Label',
              validation: (rule) => rule.required(),
            }),
            ...menuItemLinkFields,
            defineField({
              name: 'subItems',
              type: 'array',
              title: 'Sub-items',
              description: 'Sub-items linking to a location get the Desert X mark.',
              hidden: ({parent}) => parent?.linkType !== 'subItems',
              validation: (rule) =>
                rule.custom((value, context) =>
                  context.parent?.linkType === 'subItems' && !value?.length
                    ? 'Add at least one sub-item.'
                    : true,
                ),
              of: [defineArrayMember({type: 'navLink'})],
            }),
          ],
          preview: {
            select: {label: 'label', subItems: 'subItems', ...linkTargetSelect},
            prepare: ({label, subItems = [], ...link}) => ({
              title: label,
              subtitle:
                link.linkType === 'subItems'
                  ? `${subItems.length} ${subItems.length === 1 ? 'sub-item' : 'sub-items'}`
                  : linkTargetSubtitle(link),
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'menuText',
      type: 'text',
      title: 'Menu Text',
      description: 'Shown under the menu items until one with sub-items is opened.',
      fieldset: 'menu',
      rows: 3,
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
