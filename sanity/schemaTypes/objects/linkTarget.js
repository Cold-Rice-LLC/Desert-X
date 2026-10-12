import {defineField} from 'sanity'

/**
 * Where a link points, with no label of its own. Pass `required: true` for
 * links that must point somewhere; left optional, an untouched link renders
 * as no link. `types` narrows the destinations on offer.
 */
const LINK_TYPE_TITLES = {
  internal: 'Internal',
  external: 'External',
}

export const linkTargetFields = ({required = false, types = ['internal', 'external']} = {}) => [
  defineField({
    name: 'linkType',
    type: 'string',
    title: 'Link Type',
    options: {
      list: [
        // A radio can't be un-picked, so an optional link needs an explicit
        // way back to no link once Internal or External has been clicked.
        // Required links must point somewhere, so they don't get the out.
        ...(required ? [] : [{title: 'None', value: 'none'}]),
        ...types.map((value) => ({title: LINK_TYPE_TITLES[value], value})),
      ],
      layout: 'radio',
      direction: 'horizontal',
    },
    initialValue: required ? types[0] : undefined,
    validation: (rule) => (required ? rule.required() : rule),
  }),
  defineField({
    name: 'internalLink',
    type: 'reference',
    title: 'Page',
    description: 'The page on this site the link goes to.',
    to: [
      {type: 'page'},
      {type: 'edition'},
      {type: 'location'},
      {type: 'artist'},
      {type: 'artwork'},
      {type: 'story'},
    ],
    options: {disableNew: true},
    hidden: ({parent}) => parent?.linkType !== 'internal',
    validation: (rule) =>
      rule.custom((value, context) =>
        context.parent?.linkType === 'internal' && !value ? 'Choose a page.' : true,
      ),
  }),
  defineField({
    name: 'externalUrl',
    type: 'url',
    title: 'External URL',
    description: 'A full URL. Opens in a new tab.',
    hidden: ({parent}) => parent?.linkType !== 'external',
    validation: (rule) =>
      rule.custom((value, context) =>
        context.parent?.linkType === 'external' && !value ? 'External URL is required.' : true,
      ),
  }),
]

/** Whether a link object points anywhere. */
export const hasLink = (link) => ['internal', 'external'].includes(link?.linkType)
