import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {myStructure} from './myStructure'
import {templates} from './templates'

export default defineConfig({
  name: 'default',
  title: 'DesertX',

  projectId: '2f7qebi8',
  dataset: 'production',

  plugins: [structureTool({structure: myStructure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (prev) => [...prev, ...templates],
  },
})
