import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {pageModuleMembers} from '../modules'
import {linkTargetFields, linkTargetSelect, linkTargetSubtitle} from '../objects/linkTarget'
import {modulesField, seoField, shownWhere, titleSlugFields} from '../objects/fields'

/** The homepage's ids, published and draft: a page with no slug of its own. */
export const HOMEPAGE_IDS = ['homepage', 'drafts.homepage']

const isHomepage = (document) => HOMEPAGE_IDS.includes(document?._id)

const SLIDE_MEDIA_TYPES = [
  {title: 'Image', value: 'image'},
  {title: 'Video', value: 'video'},
]

// With Quick Links on, slides have a headline instead of a link and title
const quickLinksOn = ({document}) => Boolean(document?.quickLinks)
const quickLinksOff = (context) => !quickLinksOn(context)

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
      slug: shownWhere(({document}) => !isHomepage(document), {required: 'Slug is required.'}),
    }),
    defineField({
      name: 'quickLinks',
      type: 'boolean',
      title: 'Quick Links',
      description:
        'Shows the footer’s links along the bottom of the carousel (bottom left from tablet size up), and each slide’s Headline centred over it, in place of its link and Title.',
      initialValue: false,
      hidden: ({document}) => !isHomepage(document),
    }),
    defineField({
      name: 'slides',
      type: 'array',
      title: 'Slides',
      description:
        'The homepage carousel, in order. Each slide fills the window; clicking its left or right half goes back or on, and the last loops round to the first.',
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
              hidden: quickLinksOff,
            }),
            ...linkTargetFields({shown: quickLinksOff}),
            defineField({
              name: 'title',
              type: 'string',
              title: 'Title',
              description:
                'Shown bottom left of the slide, linking to where it goes. Leave empty for the linked artwork’s artist and title, or the linked page’s title.',
              hidden: quickLinksOn,
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
            // A slide doesn't see the document's Quick Links: the headline
            // when there is one, else what it links to
            prepare: ({mediaType, image, poster, videoName, title, headline, ...link}) => ({
              title: headline || title || linkTargetSubtitle(link) || 'No link',
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
