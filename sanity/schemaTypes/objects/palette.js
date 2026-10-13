import {defineArrayMember, defineType} from 'sanity'

/**
 * Four colours that news tiles build their gradients from. Used by
 * locations, and by the News landing for news with no location.
 */
export default defineType({
  name: 'palette',
  type: 'array',
  title: 'Palette',
  description: 'Four colours. News tiles mix them into a gradient.',
  of: [defineArrayMember({type: 'color', options: {disableAlpha: true}})],
  options: {layout: 'grid'},
  validation: (rule) => rule.required().length(4).error('Add exactly four colours.'),
})
