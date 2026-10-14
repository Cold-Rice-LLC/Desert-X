import {defineField, defineType} from 'sanity'

/**
 * How a page shows in search results and when shared. Every field is
 * optional: the site fills in what's left empty from the page itself (its
 * title, the start of its text, its first image), or else from Site
 * Settings.
 */
export default defineType({
  name: 'seo',
  type: 'object',
  title: 'SEO',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description:
        'Replaces the page’s title in search results and shares. “— Desert X” follows it.',
      validation: (rule) =>
        rule.max(60).warning('Search results cut titles off at about 60 characters.'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 3,
      validation: (rule) =>
        rule.max(160).warning('Search results cut descriptions off at about 160 characters.'),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Share Image',
      description: 'Cropped to 1200 × 630 around the hotspot.',
      options: {hotspot: true},
    }),
  ],
})
