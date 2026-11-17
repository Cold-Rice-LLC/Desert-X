import {defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons'
import {countLabel, galleryImagesField} from '../objects/fields'

// The carousel from the top of an artwork or exhibition, anywhere on a page
export default defineType({
  name: 'carouselModule',
  type: 'object',
  title: 'Carousel',
  icon: ImagesIcon,
  fields: [
    {
      ...galleryImagesField(
        'Cropped to 4:3, as at the top of an artwork or exhibition. Two or more become a carousel.',
      ),
      validation: (rule) => rule.required().min(1),
    },
  ],
  preview: {
    // The array alone: selecting images.0 beside it would turn it into an
    // object with only that key, and so no length
    select: {images: 'images'},
    prepare: ({images = []}) => ({
      title: countLabel(images.length, 'image'),
      subtitle: 'Carousel',
      media: images[0],
    }),
  },
})
