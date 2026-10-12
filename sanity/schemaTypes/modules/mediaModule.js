import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons'

const MEDIA_TYPES = [
  {title: 'Image', value: 'image'},
  {title: 'MP4', value: 'mp4'},
  {title: 'YouTube', value: 'youtube'},
  {title: 'Vimeo', value: 'vimeo'},
]

// Show a field only for the chosen media type, and require it there.
const forType = (type, message) => ({
  hidden: ({parent}) => parent?.mediaType !== type,
  validation: (rule) =>
    rule.custom((value, context) =>
      context.parent?.mediaType === type && !value ? message : true,
    ),
})

export default defineType({
  name: 'mediaModule',
  type: 'object',
  title: 'Media',
  icon: ImageIcon,
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
      ...forType('image', 'Choose an image.'),
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video',
      options: {accept: 'video/mp4'},
      ...forType('mp4', 'Choose a video.'),
    }),
    defineField({
      name: 'youtubeId',
      type: 'string',
      title: 'YouTube ID',
      description: 'The 11 characters after "v=" in the video’s URL.',
      hidden: ({parent}) => parent?.mediaType !== 'youtube',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.parent?.mediaType !== 'youtube') return true
          if (!value) return 'YouTube ID is required.'
          return /^[\w-]{11}$/.test(value) ? true : 'A YouTube ID is 11 characters.'
        }),
    }),
    defineField({
      name: 'vimeoUrl',
      type: 'url',
      title: 'Vimeo URL',
      hidden: ({parent}) => parent?.mediaType !== 'vimeo',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.parent?.mediaType !== 'vimeo') return true
          if (!value) return 'Vimeo URL is required.'
          return /^https:\/\/(player\.)?vimeo\.com\//.test(value) ? true : 'Use a vimeo.com link.'
        }),
    }),
    defineField({
      name: 'poster',
      type: 'image',
      title: 'Poster',
      description: 'Shown before the video plays.',
      options: {hotspot: true},
      hidden: ({parent}) => !['mp4', 'youtube', 'vimeo'].includes(parent?.mediaType),
    }),
    defineField({
      name: 'caption',
      type: 'string',
      title: 'Caption',
      description:
        'Overrides the caption set on the image or video in the Media library. YouTube and Vimeo only have this caption.',
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      caption: 'caption',
      image: 'image',
      poster: 'poster',
      imageCaption: 'image.asset.description',
      videoCaption: 'video.asset.description',
      videoName: 'video.asset.originalFilename',
      youtubeId: 'youtubeId',
      vimeoUrl: 'vimeoUrl',
    },
    prepare: ({mediaType, caption, image, poster, imageCaption, videoCaption, ...source}) => {
      const typeTitle = MEDIA_TYPES.find(({value}) => value === mediaType)?.title
      const sources = {mp4: source.videoName, youtube: source.youtubeId, vimeo: source.vimeoUrl}
      return {
        title: caption || (mediaType === 'image' ? imageCaption : videoCaption) || 'Media',
        subtitle: [typeTitle, sources[mediaType]].filter(Boolean).join(' · '),
        media: mediaType === 'image' ? image : poster,
      }
    },
  },
})
