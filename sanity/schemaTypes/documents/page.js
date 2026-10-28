import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {pageModuleMembers} from '../modules'
import {linkTargetFields, linkTargetSelect, linkTargetSubtitle} from '../objects/linkTarget'
import {modulesField, seoField, shownWhere, titleSlugFields} from '../objects/fields'

/** The homepage's ids, published and draft: a page with no slug of its own. */
export const HOMEPAGE_IDS = ['homepage', 'drafts.homepage']

const isHomepage = (document) => HOMEPAGE_IDS.includes(document?._id)

export default defineType({
  name: 'page',
  type: 'document',
  title: 'Page',
  icon: DocumentIcon,
  fields: [
    ...titleSlugFields({
      slug: shownWhere(({document}) => !isHomepage(document), {required: 'Slug is required.'}),
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
            defineField({
              name: 'title',
              type: 'string',
              title: 'Title',
              description:
                'Shown bottom left of the slide, linking to where it goes. Leave empty for the linked artwork’s artist and title, or the linked page’s title.',
            }),
          ],
          preview: {
            select: {media: 'image', title: 'title', ...linkTargetSelect},
            prepare: ({media, title, ...link}) => ({
              title: title || linkTargetSubtitle(link) || 'No link',
              media,
            }),
          },
        }),
      ],
    }),
    modulesField(pageModuleMembers),
    seoField,
  ],
})
