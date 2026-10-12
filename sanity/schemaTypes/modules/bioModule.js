import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'

export default defineType({
  name: 'bioModule',
  type: 'object',
  title: 'Bio',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
    }),
    defineField({
      name: 'bios',
      type: 'array',
      title: 'Bios',
      of: [
        defineArrayMember({
          name: 'bio',
          type: 'object',
          title: 'Bio',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: {hotspot: true},
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'imageText',
              type: 'text',
              title: 'Image Text',
              description: 'Shown beside the image, e.g. a name and role.',
              rows: 3,
            }),
            defineField({
              name: 'text',
              type: 'richText',
              title: 'Text',
            }),
          ],
          preview: {
            select: {imageText: 'imageText', media: 'image'},
            prepare: ({imageText, media}) => ({
              title: imageText?.split('\n')[0] || 'Bio',
              media,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {heading: 'heading', bios: 'bios'},
    prepare: ({heading, bios = []}) => ({
      title: heading || 'Bio',
      subtitle: `Bio · ${bios.length} ${bios.length === 1 ? 'bio' : 'bios'}`,
    }),
  },
})
