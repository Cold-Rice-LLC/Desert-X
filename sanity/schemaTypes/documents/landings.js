import {defineField, defineType} from 'sanity'
import {
  DocumentTextIcon,
  EarthGlobeIcon,
  ImageIcon,
  PinIcon,
  SearchIcon,
  UserIcon,
} from '@sanity/icons'
import {NoteField} from '../../components/NoteField'

/**
 * Landing pages: pages the site builds itself (a news listing, the search
 * page), each with one fixed document so links can point at it and editors
 * have a place for its title and any content. The document id is the type
 * name. A landing with no fields of its own shows a note saying so.
 */
const landing = ({name, title, icon, fields = []}) =>
  defineType({
    name,
    type: 'document',
    title: `${title} Landing`,
    icon,
    fields: [
      defineField({
        name: 'title',
        type: 'string',
        title: 'Title',
        description: 'Shown in the nav, next to the menu button.',
        initialValue: title,
        validation: (rule) => rule.required(),
      }),
      ...(fields.length
        ? fields
        : [
            defineField({
              name: 'note',
              type: 'string',
              description:
                'This page has no other editable content: the rest of it is built by the site.',
              readOnly: true,
              components: {field: NoteField},
            }),
          ]),
    ],
    preview: {
      prepare: () => ({title: `${title} Landing`}),
    },
  })

export const landings = [
  landing({name: 'newsLanding', title: 'News', icon: DocumentTextIcon}),
  landing({name: 'artistsLanding', title: 'Artists', icon: UserIcon}),
  landing({name: 'artLanding', title: 'Art', icon: ImageIcon}),
  landing({name: 'locationsLanding', title: 'Locations', icon: PinIcon}),
  landing({name: 'visitLanding', title: 'Visit', icon: EarthGlobeIcon}),
  landing({
    name: 'searchLanding',
    title: 'Search',
    icon: SearchIcon,
    fields: [
      defineField({
        name: 'intro',
        type: 'richText',
        title: 'Intro',
        description: 'Shown above the search field.',
      }),
    ],
  }),
]

export const landingTypes = landings.map(({name}) => name)
