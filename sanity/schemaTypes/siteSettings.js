import {defineArrayMember, defineField, defineType} from 'sanity'
import {countLabel, shownWhere} from './objects/fields'
import {linkTargetFields, linkTargetSelect, linkTargetSubtitle} from './objects/linkTarget'

// Menu items take a fourth Link Type, Sub-items: the item then opens its
// sub-items in the menu instead of following a link
const menuItemLinkFields = linkTargetFields({types: ['internal', 'external', 'subItems']})

export default defineType({
  name: 'siteSettings',
  type: 'document',
  title: 'Site Settings',
  fieldsets: [
    {
      name: 'metadata',
      title: 'Metadata',
      description:
        'What search results and shared links show for any page that doesn’t set its own (each page’s SEO section overrides these).',
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
      title: 'Share Image',
      description:
        'Shown when a link to the site is shared, for pages with no image of their own. Cropped to 1200 × 630 around the hotspot.',
      options: {hotspot: true},
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
              ...shownWhere(({parent}) => parent?.linkType === 'subItems', {
                required: 'Add at least one sub-item.',
              }),
              of: [defineArrayMember({type: 'navLink'})],
            }),
          ],
          preview: {
            select: {label: 'label', subItems: 'subItems', ...linkTargetSelect},
            prepare: ({label, subItems = [], ...link}) => ({
              title: label,
              subtitle:
                link.linkType === 'subItems'
                  ? countLabel(subItems.length, 'sub-item')
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
