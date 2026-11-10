import {defineField, defineType} from 'sanity'
import {TextIcon} from '@sanity/icons'
import {blocksToText} from '../objects/richText'
import {headingField, spanishField, spanishFieldset} from '../objects/fields'

const text = {name: 'text', type: 'richText', title: 'Text'}

export default defineType({
  name: 'textModule',
  type: 'object',
  title: 'Text',
  icon: TextIcon,
  fieldsets: [spanishFieldset],
  fields: [headingField, defineField(text), spanishField(headingField), spanishField(text)],
  preview: {
    select: {heading: 'heading', text: 'text'},
    prepare: ({heading, text}) => ({
      title: heading || blocksToText(text) || 'Text',
      subtitle: 'Text',
    }),
  },
})
