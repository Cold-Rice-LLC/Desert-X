// Initial value templates used by the "New …" buttons on related-document tabs.
export const templates = [
  {
    id: 'edition-in-location',
    title: 'Edition in location',
    schemaType: 'edition',
    parameters: [{name: 'locationId', type: 'string'}],
    value: ({locationId}) => ({
      location: {_type: 'reference', _ref: locationId},
    }),
  },
  {
    id: 'artwork-in-edition',
    title: 'Artwork in edition',
    schemaType: 'artwork',
    parameters: [{name: 'editionId', type: 'string'}],
    value: ({editionId}) => ({
      edition: {_type: 'reference', _ref: editionId},
    }),
  },
  {
    id: 'artwork-by-artist',
    title: 'Artwork by artist',
    schemaType: 'artwork',
    parameters: [{name: 'artistId', type: 'string'}],
    value: ({artistId}) => ({
      artists: [{_type: 'reference', _ref: artistId}],
    }),
  },
  {
    id: 'story-by-artist',
    title: 'Story about artist',
    schemaType: 'story',
    parameters: [{name: 'artistId', type: 'string'}],
    value: ({artistId}) => ({
      artists: [{_type: 'reference', _ref: artistId}],
    }),
  },
]
