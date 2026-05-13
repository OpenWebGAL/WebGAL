interface ResolveDialogDisplayStateOptions {
  previousShowName: string;
  previousTextboxTheme: string;
  speaker: string | null;
  textboxThemeOverride: string | null;
  clear: boolean;
}

interface DialogDisplayState {
  showName: string;
  textboxTheme: string;
}

export function resolveDialogDisplayState(options: ResolveDialogDisplayStateOptions): DialogDisplayState {
  const { previousShowName, previousTextboxTheme, speaker, textboxThemeOverride, clear } = options;

  const showName = clear ? '' : (speaker ?? previousShowName);
  const textboxTheme = textboxThemeOverride ?? (clear ? '' : (speaker ?? previousTextboxTheme));

  return {
    showName,
    textboxTheme,
  };
}
