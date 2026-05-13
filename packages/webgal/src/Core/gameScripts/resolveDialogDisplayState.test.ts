import { describe, expect, it } from 'vitest';
import { resolveDialogDisplayState } from './resolveDialogDisplayState';

describe('resolveDialogDisplayState', () => {
  it('uses speaker as the default show name and textbox theme', () => {
    expect(
      resolveDialogDisplayState({
        previousShowName: '',
        previousTextboxTheme: '',
        speaker: 'anon',
        textboxThemeOverride: null,
        clear: false,
      }),
    ).toEqual({
      showName: 'anon',
      textboxTheme: 'anon',
    });
  });

  it('keeps the speaker name and lets textboxTheme override the default theme', () => {
    expect(
      resolveDialogDisplayState({
        previousShowName: '',
        previousTextboxTheme: '',
        speaker: 'anon',
        textboxThemeOverride: 'system',
        clear: false,
      }),
    ).toEqual({
      showName: 'anon',
      textboxTheme: 'system',
    });
  });

  it('inherits the previous state when the sentence does not provide a new speaker or theme', () => {
    expect(
      resolveDialogDisplayState({
        previousShowName: 'anon',
        previousTextboxTheme: 'system',
        speaker: null,
        textboxThemeOverride: null,
        clear: false,
      }),
    ).toEqual({
      showName: 'anon',
      textboxTheme: 'system',
    });
  });

  it('resets the textbox theme to the new speaker when the previous sentence used an override', () => {
    expect(
      resolveDialogDisplayState({
        previousShowName: 'anon',
        previousTextboxTheme: 'system',
        speaker: 'heroine',
        textboxThemeOverride: null,
        clear: false,
      }),
    ).toEqual({
      showName: 'heroine',
      textboxTheme: 'heroine',
    });
  });

  it('clears both show name and textbox theme by default', () => {
    expect(
      resolveDialogDisplayState({
        previousShowName: 'anon',
        previousTextboxTheme: 'system',
        speaker: null,
        textboxThemeOverride: null,
        clear: true,
      }),
    ).toEqual({
      showName: '',
      textboxTheme: '',
    });
  });

  it('allows textboxTheme to override the cleared default', () => {
    expect(
      resolveDialogDisplayState({
        previousShowName: 'anon',
        previousTextboxTheme: 'anon',
        speaker: null,
        textboxThemeOverride: 'system',
        clear: true,
      }),
    ).toEqual({
      showName: '',
      textboxTheme: 'system',
    });
  });
});
