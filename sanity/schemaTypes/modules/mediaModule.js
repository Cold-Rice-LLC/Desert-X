import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons'
import {shownWhere, spanishField, spanishFieldset} from '../objects/fields'
import {linkTargetFields, linkTargetSubtitle} from '../objects/linkTarget'
import {blocksToText} from '../objects/richText'

const MEDIA_TYPES = [
  {title: 'Image', value: 'image'},
  {title: 'MP4', value: 'mp4'},
  {title: 'YouTube', value: 'youtube'},
  {title: 'Vimeo', value: 'vimeo'},
]

// Show a field only for the chosen media types, and require it there
const isType =
  (...types) =>
  ({parent}) =>
    types.includes(parent?.mediaType)

const caption = {
  name: 'caption',
  type: 'richText',
  title: 'Caption',
  description:
    'Optional. Shown under the media, e.g. the artist, the title in italics and the year.',
}

const secondCaption = {
  name: 'secondCaption',
  type: 'richText',
  title: 'Second Caption',
  description: 'Optional. Shown under the second image, as Caption is under the first.',
  hidden: ({parent}) => !(parent?.mediaType === 'image' && parent?.secondImage),
}

export default defineType({
  name: 'mediaModule',
  type: 'object',
  title: 'Media',
  icon: ImageIcon,
  fieldsets: [spanishFieldset],
  fields: [
    defineField({
      name: 'mediaType',
      type: 'string',
      title: 'Media Type',
      options: {list: MEDIA_TYPES, layout: 'radio', direction: 'horizontal'},
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      options: {hotspot: true},
      ...shownWhere(isType('image'), {required: 'Choose an image.'}),
    }),
    defineField({
      name: 'secondImage',
      type: 'image',
      title: 'Second Image',
      description: 'Optional. The two images sit side by side, both cropped to 4:5.',
      options: {hotspot: true},
      ...shownWhere(isType('image')),
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video',
      options: {accept: 'video/mp4'},
      ...shownWhere(isType('mp4'), {required: 'Choose a video.'}),
    }),
    defineField({
      name: 'youtubeId',
      type: 'string',
      title: 'YouTube ID',
      description: 'The 11 characters after "v=" in the video’s URL.',
      ...shownWhere(isType('youtube'), {
        required: 'YouTube ID is required.',
        check: (value) => /^[\w-]{11}$/.test(value) || 'A YouTube ID is 11 characters.',
      }),
    }),
    defineField({
      name: 'vimeoUrl',
      type: 'url',
      title: 'Vimeo URL',
      ...shownWhere(isType('vimeo'), {
        required: 'Vimeo URL is required.',
        check: (value) =>
          /^https:\/\/(player\.)?vimeo\.com\//.test(value) || 'Use a vimeo.com link.',
      }),
    }),
    defineField({
      name: 'poster',
      type: 'image',
      title: 'Poster',
      description: 'Shown before the video plays.',
      options: {hotspot: true},
      ...shownWhere(isType('mp4', 'youtube', 'vimeo')),
    }),
    defineField(caption),
    defineField(secondCaption),
    defineField({
      name: 'link',
      type: 'object',
      title: 'Link',
      description: 'Optional. Makes the image and its caption one link, e.g. to a hotel’s page.',
      hidden: ({parent}) => parent?.mediaType !== 'image',
      fields: linkTargetFields(),
    }),
    defineField({
      name: 'secondLink',
      type: 'object',
      title: 'Second Link',
      description:
        'Optional. Makes the second image and its caption one link, as Link does the first.',
      hidden: ({parent}) => !(parent?.mediaType === 'image' && parent?.secondImage),
      fields: linkTargetFields(),
    }),
    spanishField(caption),
    spanishField(secondCaption),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      caption: 'caption',
      image: 'image',
      poster: 'poster',
      videoName: 'video.asset.originalFilename',
      youtubeId: 'youtubeId',
      vimeoUrl: 'vimeoUrl',
      linkType: 'link.linkType',
      internalTitle: 'link.internalLink.title',
      externalUrl: 'link.externalUrl',
    },
    prepare: ({mediaType, caption, image, poster, ...source}) => {
      const typeTitle = MEDIA_TYPES.find(({value}) => value === mediaType)?.title
      const sources = {mp4: source.videoName, youtube: source.youtubeId, vimeo: source.vimeoUrl}
      // Only an image links anywhere, and a link set back to None keeps its
      // old page, which isn't shown
      const linked = mediaType === 'image' && ['internal', 'external'].includes(source.linkType)
      const link = linked && linkTargetSubtitle(source)
      return {
        title: blocksToText(caption) || 'Media',
        subtitle: [typeTitle, sources[mediaType], link].filter(Boolean).join(' · '),
        media: mediaType === 'image' ? image : poster,
      }
    },
  },
})
