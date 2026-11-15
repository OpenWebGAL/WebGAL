import type { BuiltInScreenVariant } from '@/screens/contracts';
import { BACKLOG_DEFAULT_VARIANT } from './backlog/BacklogScreen';
import { BOTTOM_CONTROL_PANEL_DEFAULT_VARIANT } from './bottomControlPanel/BottomControlPanelScreen';
import { CHOOSE_DEFAULT_VARIANT } from './choose/ChooseScreen';
import { GLOBAL_DIALOG_DEFAULT_VARIANT } from './globalDialog/GlobalDialogScreen';
import { MENU_PANEL_DEFAULT_VARIANT } from './menuPanel/MenuPanelScreen';
import { TEXTBOX_DEFAULT_VARIANT } from './textbox/TextBoxScreen';
import { TITLE_DEFAULT_VARIANT } from './title/TitleScreen';

export const STAGE_BUILTIN_SCREENS: BuiltInScreenVariant[] = [
  TITLE_DEFAULT_VARIANT,
  TEXTBOX_DEFAULT_VARIANT,
  CHOOSE_DEFAULT_VARIANT,
  MENU_PANEL_DEFAULT_VARIANT,
  BACKLOG_DEFAULT_VARIANT,
  BOTTOM_CONTROL_PANEL_DEFAULT_VARIANT,
  GLOBAL_DIALOG_DEFAULT_VARIANT,
];
