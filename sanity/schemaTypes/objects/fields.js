import {defineField} from 'sanity'

/**
 * Fields and helpers several types share.
 */

/**
 * A document's required Title, then its Slug made from it. `title` and
 * `slug` add to or override either field, e.g. a description, or a slug
 * that's hidden and not required for some documents.
 */
export const titleSlugFields = ({title = {}, slug = {}} = {}) => [
  defineField({
    name: 'title',
    type: 'string',
    title: 'Title',
    validation: (rule) => rule.required(),
    ...title,
  }),
  defineField({
    name: 'slug',
    type: 'slug',
    title: 'Slug',
    options: {source: 'title'},
    validation: (rule) => rule.required(),
    ...slug,
  }),
]

/** A module's optional Heading. */
export const headingField = defineField({
  name: 'heading',
  type: 'string',
  title: 'Heading',
})

/** A document's SEO overrides. */
export const seoField = defineField({
  name: 'seo',
  type: 'seo',
  title: 'SEO',
})

/** A `modules` array of `members`; `field` adds to it, e.g. a description. */
export const modulesField = (members, field = {}) =>
  defineField({
    name: 'modules',
    type: 'array',
    title: 'Modules',
    of: members,
    ...field,
  })

/**
 * Spread into a field to show it only where `applies`, a test of the
 * field's context (its `parent` and `document`). Given `required`, it's
 * required there, with that message; `check` then tests a value it has,
 * returning true or a message. `rule` starts the validation off, e.g.
 * with the URL schemes it accepts.
 */
export const shownWhere = (applies, {required, check, rule: base = (rule) => rule} = {}) => ({
  hidden: (context) => !applies(context),
  validation: (rule) =>
    base(rule).custom((value, context) => {
      if (!applies(context)) return true
      const empty = !value || value.length === 0 || (value._type === 'slug' && !value.current)
      if (empty) return required ?? true
      return check ? check(value) : true
    }),
})

/** A count for previews: "1 bio", "3 bios". */
export const countLabel = (count = 0, word) => `${count} ${count === 1 ? word : `${word}s`}`
