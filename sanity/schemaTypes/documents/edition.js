import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons'

export default defineType({
  name: 'edition',
  type: 'document',
  title: 'Edition',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'e.g. Coachella Valley 2025',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      description: 'The location then the year, e.g. california-2025.',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'reference',
      title: 'Location',
      to: [{type: 'location'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      type: 'number',
      title: 'Year',
      validation: (rule) => rule.required().integer().min(2017),
    }),
    defineField({
      name: 'startDate',
      type: 'date',
      title: 'Start Date',
    }),
    defineField({
      name: 'endDate',
      type: 'date',
      title: 'End Date',
      validation: (rule) =>
        rule.custom((value, context) =>
          value && context.document?.startDate && value < context.document.startDate
            ? 'End Date is before Start Date.'
            : true,
        ),
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Images',
      description:
        'Shown at the top, cropped to 4:3. Two or more become a carousel. Leave empty to show the first image of each artwork in the edition.',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
    }),
    defineField({
      name: 'description',
      type: 'richText',
      title: 'Description',
      description: 'Shown under the dates.',
    }),
    defineField({
      name: 'sponsorGroups',
      type: 'array',
      title: 'Sponsor Groups',
      description:
        'Shown under the artworks, each group a panel of logos. Groups pair up side by side unless set to full width.',
      of: [
        defineArrayMember({
          name: 'sponsorGroup',
          type: 'object',
          title: 'Sponsor Group',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Title',
              description: 'e.g. Premier Sponsors',
            }),
            defineField({
              name: 'fullWidth',
              type: 'boolean',
              title: 'Full Width',
              description: 'Across the whole page, with larger logos.',
              initialValue: false,
            }),
            defineField({
              name: 'logos',
              type: 'array',
              title: 'Logos',
              of: [
                defineArrayMember({
                  name: 'sponsorLogo',
                  type: 'object',
                  title: 'Logo',
                  fields: [
                    defineField({
                      name: 'name',
                      type: 'string',
                      title: 'Name',
                      description: 'The sponsor, read out in place of the logo.',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'image',
                      type: 'image',
                      title: 'Logo',
                      description:
                        'An SVG or transparent PNG, trimmed to the logo’s edges. A white background is blended away.',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'url',
                      type: 'url',
                      title: 'Link',
                      description: 'Optional, e.g. the sponsor’s website.',
                    }),
                  ],
                  preview: {
                    select: {title: 'name', media: 'image', subtitle: 'url'},
                  },
                }),
              ],
              options: {layout: 'grid'},
            }),
          ],
          preview: {
            select: {
              title: 'title',
              fullWidth: 'fullWidth',
              logos: 'logos',
              media: 'logos.0.image',
            },
            prepare: ({title, fullWidth, logos, media}) => ({
              title: title || 'Untitled Group',
              subtitle: [
                fullWidth ? 'Full width' : 'Half width',
                `${logos?.length ?? 0} logo${logos?.length === 1 ? '' : 's'}`,
              ].join(' · '),
              media,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'sponsorLists',
      type: 'array',
      title: 'Sponsor Lists',
      description: 'Up to four titled columns of names under the sponsor logos.',
      of: [
        defineArrayMember({
          name: 'sponsorList',
          type: 'object',
          title: 'Sponsor List',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Title',
              description: 'e.g. Galleries',
            }),
            defineField({
              name: 'text',
              type: 'text',
              title: 'Text',
              description: 'Shown as typed, one name per line.',
              rows: 10,
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'text'},
          },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  orderings: [
    {
      title: 'Year, newest first',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      location: 'location.title',
      year: 'year',
    },
    prepare({title, location, year}) {
      return {
        title,
        subtitle: [location, year].filter(Boolean).join(' · '),
      }
    },
  },
})
