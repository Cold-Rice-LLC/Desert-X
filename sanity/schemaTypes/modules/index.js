import {defineArrayMember} from 'sanity'

/**
 * The modules on offer in every `modules` array: artworks, news, the Visit
 * landing and editions' Visit Info. Pages get a few more (see below).
 */
export const moduleMembers = [
  defineArrayMember({type: 'textModule'}),
  defineArrayMember({type: 'scheduleModule'}),
  defineArrayMember({type: 'mediaModule'}),
  defineArrayMember({type: 'bioModule'}),
  defineArrayMember({type: 'interviewModule'}),
  defineArrayMember({type: 'peopleListModule'}),
  defineArrayMember({type: 'dropdownsModule'}),
]

/**
 * Pages also get the News module (news articles show related news on their
 * own), the Donate module and the Newsletter Signup.
 */
export const pageModuleMembers = [
  ...moduleMembers,
  defineArrayMember({type: 'newsModule'}),
  defineArrayMember({type: 'donateModule'}),
  defineArrayMember({type: 'newsletterModule'}),
]
