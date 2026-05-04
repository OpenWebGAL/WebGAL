import { describe, expect, it } from 'vitest';
import {
  isHostEventEnvelope,
  isHostEventType,
  isPreviewCommandRequestEnvelope,
  isPreviewCommandType,
} from './editorPreviewProtocol';

describe('editorPreviewProtocol artifacts', () => {
  it('publishes the v1 subprotocol constant', async () => {
    const moduleUrl = new URL('./editorPreviewProtocol.ts', import.meta.url);

    await expect(import(moduleUrl.href)).resolves.toMatchObject({
      EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL: 'webgal-editor-preview-sync.v1',
    });
  });

  it('exposes a preview command type guard', () => {
    expect(isPreviewCommandType('preview.command.sync-scene')).toBe(true);
    expect(isPreviewCommandType('preview.command.run-snippet')).toBe(true);
    expect(isPreviewCommandType('preview.command.unknown')).toBe(false);
    expect(isPreviewCommandType('session.register-preview')).toBe(false);
  });

  it('accepts only executable preview command requests', () => {
    expect(
      isPreviewCommandRequestEnvelope({
        kind: 'request',
        type: 'preview.command.sync-scene',
        requestId: 'req-sync-scene',
        payload: {
          sceneName: 'scene/start.txt',
          sentenceId: 0,
          syncMode: 'stable',
        },
      }),
    ).toBe(true);

    expect(
      isPreviewCommandRequestEnvelope({
        kind: 'request',
        type: 'session.register-preview',
        requestId: 'req-register-preview',
        payload: {},
      }),
    ).toBe(false);

    expect(
      isPreviewCommandRequestEnvelope({
        kind: 'request',
        type: 'preview.command.unknown',
        requestId: 'req-unknown-command',
        payload: {},
      }),
    ).toBe(false);

    expect(
      isPreviewCommandRequestEnvelope({
        kind: 'event',
        type: 'preview.command.sync-scene',
        payload: {},
      }),
    ).toBe(false);
  });

  it('exposes a host event type guard', () => {
    expect(isHostEventType('preview.ready.updated')).toBe(true);
    expect(isHostEventType('stage.snapshot.updated')).toBe(true);
    expect(isHostEventType('preview.command.sync-scene')).toBe(false);
    expect(isHostEventType('preview.event.unknown')).toBe(false);
  });

  it('accepts only supported host events', () => {
    expect(
      isHostEventEnvelope({
        kind: 'event',
        type: 'preview.ready.updated',
        payload: {
          ready: true,
        },
      }),
    ).toBe(true);

    expect(
      isHostEventEnvelope({
        kind: 'event',
        type: 'stage.snapshot.updated',
        payload: {
          sceneName: 'scene/start.txt',
          sentenceId: 0,
          stageState: {},
        },
      }),
    ).toBe(true);

    expect(
      isHostEventEnvelope({
        kind: 'request',
        type: 'preview.ready.updated',
        requestId: 'req-host-event',
        payload: {
          ready: true,
        },
      }),
    ).toBe(false);

    expect(
      isHostEventEnvelope({
        kind: 'event',
        type: 'preview.event.unknown',
        payload: {},
      }),
    ).toBe(false);
  });
});
