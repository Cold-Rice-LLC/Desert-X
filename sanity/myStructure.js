import {
  BookIcon,
  CalendarIcon,
  CogIcon,
  DocumentIcon,
  HomeIcon,
  ImageIcon,
  PinIcon,
  UserIcon,
} from '@sanity/icons'
import DocumentsPane from 'sanity-plugin-documents-pane'

const publishedId = (document) => document?.displayed?._id?.replace('drafts.', '')

// A tab on a document showing related documents, with a "New …" button that
// pre-fills the reference back to this document.
const relatedPane = (S, {title, query, template, parameter, label}) =>
  S.view
    .component(DocumentsPane)
    .title(title)
    .options({
      query,
      params: ({document}) => ({id: publishedId(document)}),
      initialValueTemplates: ({document}) => {
        const id = publishedId(document)
        if (!id) return []
        return [
          {
            schemaType: template.schemaType,
            template: template.id,
            title: `${label} ${document.displayed.title ?? ''}`.trim(),
            parameters: {[parameter]: id},
          },
        ]
      },
    })

const editorWith = (S, schemaType, id, panes) =>
  S.document()
    .schemaType(schemaType)
    .documentId(id)
    .views([S.view.form(), ...panes.map((options) => relatedPane(S, options))])

export const myStructure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem()
                .title('Homepage')
                .icon(HomeIcon)
                .child(S.document().schemaType('page').documentId('homepage')),
              S.divider(),
              S.documentTypeListItem('page')
                .title('All pages')
                .child(
                  S.documentTypeList('page')
                    .title('All pages')
                    .filter('_type == "page" && _id != "homepage" && _id != "drafts.homepage"'),
                ),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title('Locations')
        .icon(PinIcon)
        .child(
          S.documentTypeList('location')
            .title('Locations')
            .child((id) =>
              editorWith(S, 'location', id, [
                {
                  title: 'Editions',
                  query: '*[_type == "edition" && location._ref == $id] | order(year desc)',
                  template: {schemaType: 'edition', id: 'edition-in-location'},
                  parameter: 'locationId',
                  label: 'New edition in',
                },
              ]),
            ),
        ),
      S.listItem()
        .title('Editions')
        .icon(CalendarIcon)
        .child(
          S.documentTypeList('edition')
            .title('Editions')
            .defaultOrdering([{field: 'year', direction: 'desc'}])
            .child((id) =>
              editorWith(S, 'edition', id, [
                {
                  title: 'Artworks',
                  query: '*[_type == "artwork" && edition._ref == $id] | order(title asc)',
                  template: {schemaType: 'artwork', id: 'artwork-in-edition'},
                  parameter: 'editionId',
                  label: 'New artwork in',
                },
              ]),
            ),
        ),
      S.listItem()
        .title('Artists')
        .icon(UserIcon)
        .child(
          S.documentTypeList('artist')
            .title('Artists')
            .child((id) =>
              editorWith(S, 'artist', id, [
                {
                  title: 'Artworks',
                  query: '*[_type == "artwork" && $id in artists[]._ref] | order(title asc)',
                  template: {schemaType: 'artwork', id: 'artwork-by-artist'},
                  parameter: 'artistId',
                  label: 'New artwork by',
                },
                {
                  title: 'Stories',
                  query: '*[_type == "story" && $id in artists[]._ref] | order(title asc)',
                  template: {schemaType: 'story', id: 'story-by-artist'},
                  parameter: 'artistId',
                  label: 'New story about',
                },
              ]),
            ),
        ),
      S.documentTypeListItem('artwork').title('Artworks').icon(ImageIcon),

      S.divider(),

      S.documentTypeListItem('story').title('Stories').icon(BookIcon),

      S.divider(),

      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
