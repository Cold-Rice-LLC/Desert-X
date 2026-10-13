import {defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {moduleMembers} from '../modules'

// Press items link out to the article, so they have no page of their own:
// these fields only apply to one kind or the other
const isPress = ({document}) => document?.kind === 'press'
const isNews = (context) => !isPress(context)
const requiredFor = (applies, message) => (rule) =>
  rule.custom((value, context) => (applies(context) && !value ? message : true))

// Roughly what fits on a tile in the mono type
const CARD_TEXT_LIMIT = 150

export default defineType({
  name: 'news',
  type: 'document',
  title: 'News',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'kind',
      type: 'string',
      title: 'Kind',
      description: 'Press links out to an article elsewhere.',
      options: {
        list: [
          {title: 'News', value: 'news'},
          {title: 'Press', value: 'press'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'news',
      validation: (rule) => rule.required(),
    }),
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
      hidden: isPress,
      validation: requiredFor(isNews, 'Slug is required.'),
    }),
    defineField({
      name: 'publishDate',
      type: 'date',
      title: 'Publish Date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'reference',
      title: 'Location',
      description: 'Leave empty for General. The tile takes its colours from here.',
      to: [{type: 'location'}],
      options: {disableNew: true},
      hidden: isPress,
    }),
    defineField({
      name: 'cardText',
      type: 'text',
      title: 'Card Text',
      description: `Replaces the title, location and date on the news tile, exactly as typed. Up to ${CARD_TEXT_LIMIT} characters.`,
      rows: 6,
      hidden: isPress,
      validation: (rule) => rule.max(CARD_TEXT_LIMIT),
    }),
    defineField({
      name: 'publication',
      type: 'string',
      title: 'Publication',
      description: 'Where the article ran, e.g. Art Review.',
      hidden: isNews,
      validation: requiredFor(isPress, 'Publication is required.'),
    }),
    defineField({
      name: 'pressUrl',
      type: 'url',
      title: 'Article URL',
      hidden: isNews,
      validation: requiredFor(isPress, 'Article URL is required.'),
    }),
    defineField({
      name: 'featuredImage',
      type: 'image',
      title: 'Featured Image',
      options: {hotspot: true},
      hidden: isNews,
      validation: requiredFor(isPress, 'Featured Image is required.'),
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Logo',
      description: "The publication's logo, shown over the image. White, ideally an SVG.",
      hidden: isNews,
      validation: requiredFor(isPress, 'Logo is required.'),
    }),
    defineField({
      name: 'modules',
      type: 'array',
      title: 'Modules',
      of: moduleMembers,
      hidden: isPress,
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
    select: {title: 'title', kind: 'kind', publishDate: 'publishDate', location: 'location.title'},
    prepare: ({title, kind, publishDate, location}) => ({
      title,
      subtitle: [kind === 'press' ? 'Press' : location || 'General', publishDate]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
