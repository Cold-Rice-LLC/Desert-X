import {defineArrayMember} from 'sanity'

/** The modules on offer in every `modules` array (page, news). */
export const moduleMembers = [
  defineArrayMember({type: 'textModule'}),
  defineArrayMember({type: 'scheduleModule'}),
  defineArrayMember({type: 'mediaModule'}),
  defineArrayMember({type: 'bioModule'}),
  defineArrayMember({type: 'interviewModule'}),
  defineArrayMember({type: 'peopleListModule'}),
  defineArrayMember({type: 'dropdownsModule'}),
]
