import { __INFO } from '@/config/info';
import type { IGameVar } from '@/Core/Modules/stage/stageInterface';
import { WebGAL } from '@/Core/WebGAL';
import { createEventEnvelope } from '@/types/editorPreviewProtocol';
import type { WebgalTemplate } from '@/types/template';

interface PreviewMetadataPublisherOptions {
  isRegistered: () => boolean;
  send: (envelope: unknown) => boolean;
}

export interface PreviewMetadataPublisher {
  publishRegisteredMetadata: () => void;
  reset: () => void;
  dispose: () => void;
}

export function createPreviewMetadataPublisher({
  isRegistered,
  send,
}: PreviewMetadataPublisherOptions): PreviewMetadataPublisher {
  let lastPublishedTemplate: WebgalTemplate | null = null;
  let lastPublishedGameInfo: IGameVar | null = null;

  const publishTemplate = (template: WebgalTemplate) => {
    if (!isRegistered() || template === lastPublishedTemplate) {
      return;
    }

    if (send(createEventEnvelope('preview.template.updated', { template }))) {
      lastPublishedTemplate = template;
    }
  };

  const publishGameInfo = (gameInfo: IGameVar) => {
    if (!isRegistered() || gameInfo === lastPublishedGameInfo) {
      return;
    }

    if (send(createEventEnvelope('preview.game-info.updated', { gameInfo }))) {
      lastPublishedGameInfo = gameInfo;
    }
  };

  const handleTemplateLoaded = (template?: WebgalTemplate) => {
    if (template) {
      publishTemplate(template);
    }
  };

  const handleGameInfoLoaded = (gameInfo?: IGameVar) => {
    if (gameInfo) {
      publishGameInfo(gameInfo);
    }
  };

  WebGAL.events.templateLoaded.on(handleTemplateLoaded);
  WebGAL.events.gameInfoLoaded.on(handleGameInfoLoaded);

  return {
    publishRegisteredMetadata: () => {
      send(createEventEnvelope('preview.version.updated', { version: __INFO.version }));
      if (WebGAL.template !== null) {
        publishTemplate(WebGAL.template);
      }
      if (WebGAL.gameConfig !== null) {
        publishGameInfo(WebGAL.gameConfig);
      }
    },
    reset: () => {
      lastPublishedTemplate = null;
      lastPublishedGameInfo = null;
    },
    dispose: () => {
      WebGAL.events.templateLoaded.off(handleTemplateLoaded);
      WebGAL.events.gameInfoLoaded.off(handleGameInfoLoaded);
    },
  };
}
