import {defineArrayMember, defineField, defineType} from 'sanity'
import {hasLink, linkTargetFields, linkTargetSelect, linkTargetSubtitle} from './objects/linkTarget'

// A menu item with sub-items opens them instead of following a link, so
// its link fields hide once it has any
const hasSubItems = (parent) => parent?.subItems?.length > 0
const menuItemLinkFields = linkTargetFields().map((field) => ({
  ...field,
  hidden: (context) => hasSubItems(context.parent) || field.hidden?.(context),
}))

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
      name: 'search',
      title: 'Search',
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
              description:
                'Shown when the item is clicked, in place of following a link. Sub-items linking to a location get the Desert X mark.',
              of: [defineArrayMember({type: 'navLink'})],
            }),
          ],
          preview: {
            select: {label: 'label', subItems: 'subItems', ...linkTargetSelect},
            prepare: ({label, subItems = [], ...link}) => ({
              title: label,
              subtitle: subItems.length
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
    defineField({
      name: 'donateLink',
      type: 'navLink',
      title: 'Donate Link',
      description: 'Bottom left of the menu.',
      fieldset: 'menu',
    }),
    defineField({
      name: 'searchIntro',
      type: 'richText',
      title: 'Search Intro',
      description: 'Shown above the search field on the search page.',
      fieldset: 'search',
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
