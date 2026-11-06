import type { ReactNode } from 'react'

import { chartPreviews } from './charts'
import { dataPreviews } from './data-display'
import { formsPreviews } from './forms'
import { layoutPreviews } from './layout'
import { mediaPreviews } from './media'
import { navigationPreviews } from './navigation'
import { overlayPreviews } from './overlays'
import { tablesPreviews } from './tables'

export const previewBySlug: Record<string, ReactNode> = {
  ...formsPreviews,
  ...tablesPreviews,
  ...dataPreviews,
  ...overlayPreviews,
  ...navigationPreviews,
  ...layoutPreviews,
  ...chartPreviews,
  ...mediaPreviews,
}
