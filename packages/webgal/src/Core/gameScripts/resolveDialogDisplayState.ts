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

  let showName = previousShowName;
  if (speaker !== null) {
    showName = speaker;
  }
  if (clear) {
    showName = '';
  }

  let textboxTheme = previousTextboxTheme;
  if (speaker !== null) {
    textboxTheme = speaker;
  }
  if (clear) {
    textboxTheme = '';
  }
  if (textboxThemeOverride !== null) {
    textboxTheme = textboxThemeOverride;
  }

  return {
    showName,
    textboxTheme,
  };
}
