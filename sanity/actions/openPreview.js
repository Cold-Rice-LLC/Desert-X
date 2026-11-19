/* global window */
import {EyeOpenIcon} from '@sanity/icons'
import {previewUrl} from '../previewUrl'

/**
 * "Open preview" in a document's action menu: its page on the site with
 * ?preview=true, in a new tab, showing unpublished changes. The link has
 * no secret in it, so editors can send it to someone to review before
 * publishing. The draft has the latest slug, the published document the
 * one to fall back on with no changes pending.
 */
export const openPreviewAction = ({id, type, draft, published}) => {
  const url = previewUrl(type, id, draft || published)

  return {
    label: 'Open preview',
    icon: EyeOpenIcon,
    disabled: !url,
    title: url ? undefined : 'Add a slug to preview this page',
    onHandle: () => window.open(url, '_blank', 'noopener'),
  }
}
