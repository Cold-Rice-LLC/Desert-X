import {defineField, defineType} from 'sanity'
import {NoteField} from '../../components/NoteField'
import {landingPages} from './landingPages'

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

// Fields beyond the title, by landing
const landingFields = {
  searchLanding: [
    defineField({
      name: 'intro',
      type: 'richText',
      title: 'Intro',
      description: 'Shown above the search field.',
    }),
  ],
}

export const landings = landingPages.map((page) =>
  landing({...page, fields: landingFields[page.name]}),
)

export const landingTypes = landings.map(({name}) => name)
