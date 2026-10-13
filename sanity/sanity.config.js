import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {schemaTypes} from './schemaTypes'
import {myStructure} from './myStructure'
import {templates} from './templates'
import {landingTypes} from './schemaTypes/documents/landings'

// One fixed document each, opened from the structure: no create, delete or
// duplicate, and kept out of the "new document" menu
const singletonTypes = new Set(['siteSettings', ...landingTypes])
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'DesertX',

  projectId: '2f7qebi8',
  dataset: 'production',

  plugins: [structureTool({structure: myStructure}), media(), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter(({schemaType}) => !singletonTypes.has(schemaType)),
      ...templates,
    ],
  },

  document: {
    actions: (input, {schemaType}) =>
      singletonTypes.has(schemaType)
        ? input.filter(({action}) => action && singletonActions.has(action))
        : input,
  },
})
