import type { BuiltInScreenVariant } from '@/screens/contracts';
import { EXTRA_GALLERY_CLASSIC_VARIANT } from './extra/ExtraGalleryClassic';
import { FLOWCHART_DEFAULT_VARIANT } from './flowchart/FlowchartDefault';
import { LOAD_GRID_2X5_VARIANT } from './load/LoadGrid2x5';
import { OPTIONS_TABBED_CLASSIC_VARIANT } from './options/OptionsTabbedClassic';
import { SAVE_GRID_2X5_VARIANT } from './save/SaveGrid2x5';

/**
 * Only the 5 default menu variants are compiled into the engine bundle as crash fallbacks.
 * Extended preset variants remain under `src/screens/menu/**` for template build & typecheck.
 */
export const MENU_BUILTIN_SCREENS: BuiltInScreenVariant[] = [
  SAVE_GRID_2X5_VARIANT,
  LOAD_GRID_2X5_VARIANT,
  OPTIONS_TABBED_CLASSIC_VARIANT,
  FLOWCHART_DEFAULT_VARIANT,
  EXTRA_GALLERY_CLASSIC_VARIANT,
];
