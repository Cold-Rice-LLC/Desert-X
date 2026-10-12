import {defineArrayMember, defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons'

// A titled list of people, one plain-text entry each — typed exactly as it
// shows, e.g. "Name, Role" on one line or the role on a line of its own.
// Separate entries let the site keep a person together across columns.
const peopleList = (name, title) =>
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
      defineField({
        name: 'people',
        type: 'array',
        title: 'People',
        of: [defineArrayMember({type: 'text', rows: 2})],
      }),
    ],
  })

export default defineType({
  name: 'peopleListModule',
  type: 'object',
  title: 'People List',
  icon: UsersIcon,
  fields: [peopleList('leftList', 'Left List'), peopleList('rightList', 'Right List')],
  preview: {
    select: {
      leftTitle: 'leftList.title',
      leftPeople: 'leftList.people',
      rightTitle: 'rightList.title',
      rightPeople: 'rightList.people',
    },
    prepare: ({leftTitle, leftPeople = [], rightTitle, rightPeople = []}) => ({
      title: [leftTitle, rightTitle].filter(Boolean).join(' / ') || 'People List',
      subtitle: `People List · ${leftPeople.length} / ${rightPeople.length}`,
    }),
  },
})
