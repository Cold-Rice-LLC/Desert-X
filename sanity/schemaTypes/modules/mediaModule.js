import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons'
import {shownWhere} from '../objects/fields'

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
