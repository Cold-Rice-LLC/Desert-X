import {
  CalendarIcon,
  CogIcon,
  DocumentIcon,
  DocumentTextIcon,
  HomeIcon,
  ImageIcon,
  PinIcon,
  StarIcon,
  UserIcon,
} from '@sanity/icons'
import DocumentsPane from 'sanity-plugin-documents-pane'
import {landings} from './schemaTypes/documents/landings'
import {HOMEPAGE_IDS, HOTEL_PREFIX} from './schemaTypes/documents/page'

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
              ...landings.map(({name, title, icon}) =>
                S.listItem()
                  .title(title)
                  .icon(icon)
                  .child(S.document().schemaType(name).documentId(name)),
              ),
              S.divider(),
              S.documentTypeListItem('page')
                .title('All pages')
                .child(
                  S.documentTypeList('page')
                    .title('All pages')
                    .filter(
                      // coalesce, or pages with no slug yet would drop out
                      '_type == "page" && !(_id in $homepageIds) && !coalesce(string::startsWith(slug.current, $prefix), false)',
                    )
                    .params({homepageIds: HOMEPAGE_IDS, prefix: HOTEL_PREFIX}),
                ),
              // The pages under Stay, kept apart from the rest. New ones
              // start under stay/ with a carousel and a text module.
              S.listItem()
                .title('Partner Hotels')
                .icon(StarIcon)
                .child(
                  S.documentTypeList('page')
                    .title('Partner Hotels')
                    .filter('_type == "page" && string::startsWith(slug.current, $prefix)')
                    .params({prefix: HOTEL_PREFIX})
                    .defaultOrdering([{field: 'title', direction: 'asc'}])
                    .initialValueTemplates([S.initialValueTemplateItem('hotel-page')]),
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
                  title: 'Exhibitions',
                  query: '*[_type == "edition" && location._ref == $id] | order(year desc)',
                  template: {schemaType: 'edition', id: 'edition-in-location'},
                  parameter: 'locationId',
                  label: 'New exhibition in',
                },
              ]),
            ),
        ),
      S.listItem()
        .title('Exhibitions')
        .icon(CalendarIcon)
        .child(
          S.documentTypeList('edition')
            .title('Exhibitions')
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
              ]),
            ),
        ),
      S.documentTypeListItem('artwork').title('Artworks').icon(ImageIcon),

      S.divider(),

      S.listItem()
        .title('News')
        .icon(DocumentTextIcon)
        .child(
          S.documentTypeList('news')
            .title('News')
            .defaultOrdering([{field: 'publishDate', direction: 'desc'}]),
        ),

      S.divider(),

      S.listItem()
        .title('Menu, Footer & SEO')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
