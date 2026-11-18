import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons'
import {galleryImagesField, seoField, titleSlugFields} from '../objects/fields'

/**
 * A partner hotel: listed on the Stay page, its photo and caption linking
 * to its own page at /stay/<slug>, where its images are a carousel with
 * its name and details under it. The Stay page sets the order.
 */
export default defineType({
  name: 'hotel',
  type: 'document',
  title: 'Hotel',
  icon: CaseIcon,
  fields: [
    ...titleSlugFields({
      title: {title: 'Name'},
      slug: {
        description: 'Where its page is: parker-palm-springs is at /stay/parker-palm-springs.',
      },
    }),
    defineField({
      name: 'caption',
      type: 'string',
      title: 'Caption on Stay',
      description:
        'Optional. Shown under its photo on the Stay page, e.g. “Villa Royale – Hosts of our Artistic Team”. Leave empty for its name.',
    }),
    defineField({
      name: 'stayImage',
      type: 'image',
      title: 'Photo on Stay',
      description: 'Optional. Its photo on the Stay page. Leave empty for the first of its Images.',
      options: {hotspot: true},
    }),
    {
      ...galleryImagesField(
        'The carousel at the top of its page, cropped to 4:3. Two or more become a carousel.',
      ),
      validation: (rule) => rule.required().min(1),
    },
    defineField({
      name: 'details',
      type: 'richText',
      title: 'Details',
      description:
        'Shown under its name below the carousel: its address (linked to a map), phone and website, and any offer for Desert X visitors.',
    }),
    seoField,
  ],
  preview: {
    select: {title: 'title', caption: 'caption', stayImage: 'stayImage', image: 'images.0'},
    prepare: ({title, caption, stayImage, image}) => ({
      title,
      subtitle: caption,
      media: stayImage?.asset ? stayImage : image,
    }),
  },
})
