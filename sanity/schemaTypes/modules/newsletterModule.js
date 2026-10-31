import {defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons'
import {blocksToText} from '../objects/richText'
import {headingField} from '../objects/fields'

// The Mailchimp newsletter signup: an email field and Sign Up, under
// optional text. The list it signs up to is set in the site's code.
export default defineType({
  name: 'newsletterModule',
  type: 'object',
  title: 'Newsletter Signup',
  icon: EnvelopeIcon,
  fields: [
    headingField,
    defineField({
      name: 'text',
      type: 'richText',
      title: 'Text',
      description: 'Shown above the email field.',
    }),
  ],
  preview: {
    select: {heading: 'heading', text: 'text'},
    prepare: ({heading, text}) => ({
      title: heading || blocksToText(text) || 'Newsletter Signup',
      subtitle: 'Newsletter Signup',
    }),
  },
})
