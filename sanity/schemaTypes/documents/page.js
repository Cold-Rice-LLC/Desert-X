import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {pageModuleMembers} from '../modules'
import {linkTargetFields, linkTargetSelect, linkTargetSubtitle} from '../objects/linkTarget'

const isHomepage = (document) => ['homepage', 'drafts.homepage'].includes(document?._id)

export default defineType({
  name: 'page',
  type: 'document',
  title: 'Page',
  icon: DocumentIcon,
  fields: [
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
      hidden: ({document}) => isHomepage(document),
      validation: (rule) =>
        rule.custom((value, context) =>
          isHomepage(context.document) || value?.current ? true : 'Required',
        ),
    }),
    defineField({
      name: 'slides',
      type: 'array',
      title: 'Slides',
      description:
        'The homepage carousel, in order. It drifts right to left and loops; scrolling pushes it either way.',
      hidden: ({document}) => !isHomepage(document),
      of: [
        defineArrayMember({
          name: 'slide',
          type: 'object',
          title: 'Slide',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              description: 'Shown at the full height of the window, at its own width.',
              options: {hotspot: true},
              validation: (rule) => rule.required(),
            }),
            ...linkTargetFields(),
          ],
          preview: {
            select: {media: 'image', ...linkTargetSelect},
            prepare: ({media, ...link}) => ({title: linkTargetSubtitle(link) || 'No link', media}),
          },
        }),
      ],
    }),
    defineField({
      name: 'modules',
      type: 'array',
      title: 'Modules',
      of: pageModuleMembers,
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'SEO',
    }),
  ],
})
