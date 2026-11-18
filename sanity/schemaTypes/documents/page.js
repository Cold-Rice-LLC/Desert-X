import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {pageModuleMembers} from '../modules'
import {linkTargetFields, linkTargetSelect, linkTargetSubtitle} from '../objects/linkTarget'
import {modulesField, seoField, shownWhere, titleSlugFields} from '../objects/fields'
import {blocksToText} from '../objects/richText'

/** The homepage's ids, published and draft: a page with no slug of its own. */
export const HOMEPAGE_IDS = ['homepage', 'drafts.homepage']

const isHomepage = (document) => HOMEPAGE_IDS.includes(document?._id)

// A slug is one or more parts, a / between them, so a page can sit under
// another: stay/parker-palm-springs is at /stay/parker-palm-springs
const SLUG_PATTERN = /^[a-z0-9-]+(\/[a-z0-9-]+)*$/

// The title as a slug's last part, keeping the parts before it, so
// Generate on a page under another keeps where it is
const slugify = (title, _schemaType, {parent}) => {
  const prefix = parent?.slug?.current?.match(/^.*\//)?.[0] ?? ''
  const part = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return (prefix + part).slice(0, 200)
}

const SLIDE_MEDIA_TYPES = [
  {title: 'Image', value: 'image'},
  {title: 'Video', value: 'video'},
]

// Slides saved before videos were added have no media type: they're images
const isSlideType =
  (type) =>
  ({parent}) =>
    (parent?.mediaType ?? 'image') === type

export default defineType({
  name: 'page',
  type: 'document',
  title: 'Page',
  icon: DocumentIcon,
  fields: [
    ...titleSlugFields({
      slug: {
        description:
          'Where the page is: about is at /about. Parts with a / between put it under another page, e.g. about/history at /about/history.',
        options: {source: 'title', slugify},
        ...shownWhere(({document}) => !isHomepage(document), {
          required: 'Slug is required.',
          check: ({current}) =>
            SLUG_PATTERN.test(current) ||
            'Use lowercase letters, numbers and hyphens, with a / between parts, e.g. about/history.',
        }),
      },
    }),
    defineField({
      name: 'slides',
      type: 'array',
      title: 'Slides',
      description:
        'The homepage carousel, in order, with the footer’s links along its bottom (bottom left from tablet size up). Each slide fills the window; clicking its left or right half goes back or on, and the last loops round to the first.',
      hidden: ({document}) => !isHomepage(document),
      of: [
        defineArrayMember({
          name: 'slide',
          type: 'object',
          title: 'Slide',
          fields: [
            defineField({
              name: 'mediaType',
              type: 'string',
              title: 'Media Type',
              options: {list: SLIDE_MEDIA_TYPES, layout: 'radio', direction: 'horizontal'},
              initialValue: 'image',
            }),
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              description: 'Fills the window, cropped around the hotspot.',
              options: {hotspot: true},
              ...shownWhere(isSlideType('image'), {required: 'Choose an image.'}),
            }),
            defineField({
              name: 'video',
              type: 'file',
              title: 'Video',
              description: 'Fills the window, and plays muted on a loop.',
              options: {accept: 'video/mp4'},
              ...shownWhere(isSlideType('video'), {required: 'Choose a video.'}),
            }),
            defineField({
              name: 'poster',
              type: 'image',
              title: 'Poster',
              description: 'Optional. Shown while the video loads.',
              options: {hotspot: true},
              ...shownWhere(isSlideType('video')),
            }),
            defineField({
              name: 'headline',
              type: 'text',
              title: 'Headline',
              rows: 2,
              description:
                'Optional. Centred over the slide, fading in as it arrives. Consecutive slides can carry on one sentence.',
            }),
            ...linkTargetFields(),
            defineField({
              name: 'title',
              type: 'italicText',
              title: 'Title',
              description:
                'Optional. Shown bottom right of the slide, linking to where it goes if it has a link. Leave empty for the linked artwork’s artist and title, or the linked page’s title. Put an artwork title in italics.',
            }),
          ],
          preview: {
            select: {
              mediaType: 'mediaType',
              image: 'image',
              poster: 'poster',
              videoName: 'video.asset.originalFilename',
              title: 'title',
              headline: 'headline',
              ...linkTargetSelect,
            },
            // Its headline, or else what its caption says or links to
            prepare: ({mediaType, image, poster, videoName, title, headline, ...link}) => ({
              title: headline || blocksToText(title) || linkTargetSubtitle(link) || 'No text',
              subtitle:
                mediaType === 'video' ? ['Video', videoName].filter(Boolean).join(' · ') : 'Image',
              media: mediaType === 'video' ? poster : image,
            }),
          },
        }),
      ],
    }),
    // The homepage is its carousel alone
    modulesField(pageModuleMembers, {hidden: ({document}) => isHomepage(document)}),
    seoField,
  ],
})
