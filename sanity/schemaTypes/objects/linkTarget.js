import {defineField} from 'sanity'
import {landingPages} from '../documents/landingPages'
import {shownWhere} from './fields'

const LINK_TYPE_TITLES = {
  internal: 'Internal',
  external: 'External',
  subItems: 'Sub-items',
}

const linkTypeIs =
  (type) =>
  ({parent}) =>
    parent?.linkType === type

/**
 * Where a link points, with no label of its own. Pass `required: true` for
 * links that must point somewhere; left optional, an untouched link renders
 * as no link. `types` sets the Link Types on offer (menu items add
 * Sub-items), and `schemes` widens the URL schemes an external link
 * accepts.
 */

export const linkTargetFields = ({
  required = false,
  schemes,
  types = ['internal', 'external'],
} = {}) => [
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
    description: 'The page on this site the link goes to. A location goes to its newest edition.',
    to: [
      {type: 'page'},
      {type: 'edition'},
      {type: 'location'},
      {type: 'artwork'},
      {type: 'news'},
      ...landingPages.map(({name}) => ({type: name})),
    ],
    options: {disableNew: true},
    ...shownWhere(linkTypeIs('internal'), {required: 'Choose a page.'}),
  }),
  defineField({
    name: 'externalUrl',
    type: 'url',
    title: 'External URL',
    description: schemes
      ? 'A full URL, or a mailto:/tel: address. Opens in a new tab.'
      : 'A full URL. Opens in a new tab.',
    // `url` allows http/https only unless told otherwise — rich text links
    // also reach inboxes and phone numbers.
    ...shownWhere(linkTypeIs('external'), {
      required: 'External URL is required.',
      rule: (rule) => (schemes ? rule.uri({scheme: schemes}) : rule),
    }),
  }),
]

/**
 * Shared preview select for a link destination — internalTitle reaches
 * through the reference for the linked page's title.
 */
export const linkTargetSelect = {
  linkType: 'linkType',
  internalTitle: 'internalLink.title',
  externalUrl: 'externalUrl',
}

/** Shared preview subtitle for a link destination. */
export const linkTargetSubtitle = ({linkType, internalTitle, externalUrl}) => {
  if (linkType === 'external') return `↗ ${externalUrl || ''}`
  return internalTitle || ''
}
