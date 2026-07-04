import { createResponseEnvelope } from '@/types/editorPreviewProtocol';
import type {
  ReferenceBoxQueryResultPayload,
  RequestEnvelopeByType,
  ResponseEnvelopeByType,
} from '@/types/editorPreviewProtocol';

interface ReferenceBoxQueryStage {
  queryTargetReferenceBox(target: string): ReferenceBoxQueryResultPayload;
  waitForTargetReferenceBox(target: string, timeoutMs: number): Promise<void>;
}

const REFERENCE_BOX_GEOMETRY_READY_TIMEOUT_MS = 300;

export async function handleReferenceBoxQuery(
  request: RequestEnvelopeByType<'preview.query.reference-box'>,
  pixiStage: ReferenceBoxQueryStage | null | undefined,
): Promise<ResponseEnvelopeByType<'preview.query.reference-box'>> {
  const { target } = request.payload;

  if (!pixiStage) {
    return createResponseEnvelope('preview.query.reference-box', request.requestId, {
      target,
      status: 'unsupported',
      reason: 'Pixi stage 不可用',
    });
  }

  let result = pixiStage.queryTargetReferenceBox(target);
  if (result.status === 'loading') {
    await pixiStage.waitForTargetReferenceBox(target, REFERENCE_BOX_GEOMETRY_READY_TIMEOUT_MS);
    result = pixiStage.queryTargetReferenceBox(target);
  }

  return createResponseEnvelope('preview.query.reference-box', request.requestId, result);
}
