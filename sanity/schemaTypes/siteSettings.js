import {defineArrayMember, defineField, defineType} from 'sanity'
import {countLabel, shownWhere} from './objects/fields'
import {linkTargetFields, linkTargetSelect, linkTargetSubtitle} from './objects/linkTarget'

// Menu items take a fourth Link Type, Sub-items: the item then opens its
// sub-items in the menu instead of following a link
const menuItemLinkFields = linkTargetFields({types: ['internal', 'external', 'subItems']})

export default defineType({
  name: 'siteSettings',
  type: 'document',
  title: 'Menu, Footer & SEO',
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
    {
      name: 'homepage',
      title: 'Homepage',
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
      description: 'The underlined link at the top right of the nav, on every page.',
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
    defineField({
      name: 'footerGroups',
      type: 'array',
      title: 'Groups',
      description:
        'The footer’s columns, in order: four across from tablet up, two to a row on phones.',
      fieldset: 'footer',
      of: [
        defineArrayMember({
          name: 'footerGroup',
          type: 'object',
          title: 'Group',
          fields: [
            defineField({
              name: 'kind',
              type: 'string',
              title: 'Content',
              options: {
                list: [
                  {title: 'Links', value: 'links'},
                  {title: 'Text', value: 'text'},
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              initialValue: 'links',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'links',
              type: 'array',
              title: 'Links',
              ...shownWhere(({parent}) => parent?.kind !== 'text', {
                required: 'Add at least one link.',
              }),
              of: [defineArrayMember({type: 'navLink'})],
            }),
            defineField({
              name: 'text',
              type: 'richText',
              title: 'Text',
              ...shownWhere(({parent}) => parent?.kind === 'text', {required: 'Add some text.'}),
            }),
          ],
          // Untitled, so named for what it holds: its links' labels, or the
          // start of its text
          preview: {
            select: {kind: 'kind', links: 'links', text: 'text'},
            prepare: ({kind, links = [], text = []}) =>
              kind === 'text'
                ? {
                    title: text
                      .flatMap((block) => block.children ?? [])
                      .map((child) => child.text)
                      .join(''),
                    subtitle: 'Text',
                  }
                : {
                    title: links.map((link) => link.label).join(', '),
                    subtitle: countLabel(links.length, 'link'),
                  },
          },
        }),
      ],
    }),
    defineField({
      name: 'credits',
      type: 'richText',
      title: 'Footer Note',
      description:
        'Under “DESERT X is a ® registered trademark. © Desert Biennial [year].”, which the site writes itself.',
      fieldset: 'footer',
    }),
    // The homepage's second column of quick links. Named for when the
    // footer had them too, so its content didn't need moving.
    defineField({
      name: 'footerLinks2',
      type: 'array',
      title: 'Quick Links',
      description:
        'The homepage’s second column of quick links, after each location with an exhibition.',
      fieldset: 'homepage',
      of: [defineArrayMember({type: 'navLink'})],
    }),
  ],
})
