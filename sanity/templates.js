import {HOTEL_PREFIX} from './schemaTypes/documents/page'

const key = () => globalThis.crypto.randomUUID().slice(0, 12)

// Initial value templates used by the "New …" buttons on related-document
// tabs, and the Partner Hotels list's.
export const templates = [
  {
    id: 'hotel-page',
    title: 'Partner hotel',
    schemaType: 'page',
    // A carousel of the hotel, then its name, address, phone and website
    value: () => ({
      slug: {_type: 'slug', current: HOTEL_PREFIX},
      modules: [
        {_key: key(), _type: 'carouselModule'},
        {_key: key(), _type: 'textModule'},
      ],
    }),
  },
  {
    id: 'edition-in-location',
    title: 'Exhibition in location',
    schemaType: 'edition',
    parameters: [{name: 'locationId', type: 'string'}],
    value: ({locationId}) => ({
      location: {_type: 'reference', _ref: locationId},
    }),
  },
  {
    id: 'artwork-in-edition',
    title: 'Artwork in exhibition',
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
]
