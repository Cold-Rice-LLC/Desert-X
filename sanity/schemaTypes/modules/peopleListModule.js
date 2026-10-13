import {defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons'

// A titled list of people as plain text, typed exactly as it shows, e.g.
// "Name, Role" on one line or the role on a line of its own. `texts` names
// its text fields, one per column.
const peopleList = (name, title, texts) =>
  defineField({
    name,
    type: 'object',
    title,
    options: {collapsible: true, collapsed: false},
    fields: [
      defineField({
        name: 'title',
        type: 'string',
        title: 'Title',
      }),
      ...texts.map(([textName, textTitle]) =>
        defineField({
          name: textName,
          type: 'text',
          title: textTitle,
          rows: 10,
        }),
      ),
    ],
  })

export default defineType({
  name: 'peopleListModule',
  type: 'object',
  title: 'People List',
  icon: UsersIcon,
  fields: [
    peopleList('leftList', 'Left List', [['text', 'Text']]),
    peopleList('rightList', 'Right List', [
      ['text1', 'Text 1'],
      ['text2', 'Text 2'],
    ]),
  ],
  preview: {
    select: {leftTitle: 'leftList.title', rightTitle: 'rightList.title'},
    prepare: ({leftTitle, rightTitle}) => ({
      title: [leftTitle, rightTitle].filter(Boolean).join(' / ') || 'People List',
      subtitle: 'People List',
    }),
  },
})
