/* global console */
import {getCliClient} from 'sanity/cli'
import {landingPages} from '../schemaTypes/documents/landingPages'

/**
 * Creates any landing document that doesn't exist yet, with its default
 * title, so links can point at it. Existing landings are left alone, so
 * it's safe to run again whenever a landing type is added:
 *
 *   npx sanity exec scripts/createLandings.js --with-user-token
 */
const client = getCliClient({apiVersion: '2024-07-19'})

const transaction = landingPages.reduce(
  (tx, {name, title}) => tx.createIfNotExists({_id: name, _type: name, title}),
  client.transaction(),
)

// sanity exec doesn't support top-level await
transaction.commit().then(({results}) => {
  const created = results.filter(({operation}) => operation === 'create').map(({id}) => id)
  console.log(created.length ? `Created: ${created.join(', ')}` : 'All landings already exist.')
})
