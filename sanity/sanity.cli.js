import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '2f7qebi8',
    dataset: 'production'
  },
  // Deployed to https://desert-x.sanity.studio (desertx.sanity.studio
  // belongs to another project)
  studioHost: 'desert-x',
  deployment: {
    appId: 's9ylbwz74vhuqu0cdc94ufti',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
