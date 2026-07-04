export const EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL = 'webgal-editor-preview-sync.v1' as const;

export const SESSION_REGISTER_PREVIEW_TYPE = 'session.register-preview' as const;

type EmptyObject = Record<string, never>;
type PayloadMap = Record<string, unknown>;

function payload<TPayload>(): TPayload {
  return undefined as TPayload;
}

function definePayloadMap<TMap extends PayloadMap>(map: TMap): Readonly<TMap> {
  return Object.freeze(map);
}

function messageTypes<TMap extends PayloadMap>(map: TMap): readonly Extract<keyof TMap, string>[] {
  return Object.freeze(Object.keys(map) as Extract<keyof TMap, string>[]);
}

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface DebugVariable {
  key: string;
  value: string;
  isGlobal?: boolean;
}

export interface Point2D {
  x?: number;
  y?: number;
}

export interface Transform {
  position?: Point2D;
  scale?: Point2D;
  rotation?: number;

  alpha?: number;
  blur?: number;

  brightness?: number;
  contrast?: number;
  saturation?: number;
  gamma?: number;
  colorRed?: number;
  colorGreen?: number;
  colorBlue?: number;

  bloom?: number;
  bloomBrightness?: number;
  bloomBlur?: number;
  bloomThreshold?: number;

  bevel?: number;
  bevelThickness?: number;
  bevelRotation?: number;
  bevelSoftness?: number;
  bevelRed?: number;
  bevelGreen?: number;
  bevelBlue?: number;

  oldFilm?: number;
  dotFilm?: number;
  reflectionFilm?: number;
  glitchFilm?: number;
  rgbFilm?: number;
  godrayFilm?: number;

  shockwaveFilter?: number;
  radiusAlphaFilter?: number;
}

export const COMPONENT_VISIBILITY_KEYS = [
  'showStarter',
  'showTitle',
  'showMenuPanel',
  'showTextBox',
  'showControls',
  'controlsVisibility',
  'showBacklog',
  'showExtra',
  'showGlobalDialog',
  'showPanicOverlay',
  'isEnterGame',
  'isShowLogo',
  'enableAppreciationMode',
  'fontOptimization',
] as const;

export type ComponentVisibilityKey = (typeof COMPONENT_VISIBILITY_KEYS)[number];

export type SetComponentVisibilityPayload = Partial<Record<ComponentVisibilityKey, boolean>>;

export type SyncSceneSettleMode = 'normal' | 'immediate';

export interface SyncScenePayload {
  sceneName: string;
  sentenceId: number;
  debugVariables?: DebugVariable[];
  transformBaselineRevision?: string;
  settleMode?: SyncSceneSettleMode;
}

export interface RunSceneContentPayload {
  sceneContent: string;
  debugVariables?: DebugVariable[];
}

export interface RunSnippetPayload {
  snippet: string;
  debugVariables?: DebugVariable[];
}

export type ReloadTemplatesPayload = EmptyObject;

export type SetEffectPhase = 'preview' | 'commit';

export interface SetEffectPayload {
  target: string;
  transform?: Transform;
  phase?: SetEffectPhase;
}

export interface SetFontOptimizationPayload {
  enabled: boolean;
}

export interface SetTextReadModePayload {
  isRead: boolean;
}

export interface ReferenceBoxQueryPayload {
  target: string;
}

export type BaseTransformQueryPayload = EmptyObject;

export interface TransformBaselineQueryPayload {
  target: string;
  transformBaselineRevision: string;
}

export interface ReferenceBox {
  originX: number;
  originY: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  stageWidth: number;
  stageHeight: number;
}

export type ReferenceBoxQueryResultPayload =
  | {
      target: string;
      status: 'ready';
      box: ReferenceBox;
    }
  | {
      target: string;
      status: 'missing' | 'loading' | 'unsupported';
      reason?: string;
    };

export interface BaseTransformQueryResultPayload {
  baseTransform: Transform;
}

export type TransformBaselineQueryResultPayload =
  | {
      status: 'ready';
      transform: Transform;
    }
  | {
      status: 'loading';
    }
  | {
      status: 'unavailable';
    };

export const PREVIEW_COMMAND_PAYLOADS = definePayloadMap({
  'preview.command.sync-scene': payload<SyncScenePayload>(),
  'preview.command.run-scene-content': payload<RunSceneContentPayload>(),
  'preview.command.run-snippet': payload<RunSnippetPayload>(),
  'preview.command.reload-templates': payload<ReloadTemplatesPayload>(),
  'preview.command.set-effect': payload<SetEffectPayload>(),
  'preview.command.set-component-visibility': payload<SetComponentVisibilityPayload>(),
  'preview.command.set-font-optimization': payload<SetFontOptimizationPayload>(),
  'preview.command.set-text-read-mode': payload<SetTextReadModePayload>(),
});

export type PreviewCommandPayloadByType = typeof PREVIEW_COMMAND_PAYLOADS;

export type PreviewCommandType = keyof PreviewCommandPayloadByType & string;

export const PREVIEW_COMMAND_TYPES = messageTypes(PREVIEW_COMMAND_PAYLOADS);

export const PREVIEW_QUERY_PAYLOADS = definePayloadMap({
  'preview.query.reference-box': payload<ReferenceBoxQueryPayload>(),
  'preview.query.base-transform': payload<BaseTransformQueryPayload>(),
  'preview.query.transform-baseline': payload<TransformBaselineQueryPayload>(),
});

export type PreviewQueryPayloadByType = typeof PREVIEW_QUERY_PAYLOADS;

export type PreviewQueryType = keyof PreviewQueryPayloadByType & string;

export const PREVIEW_QUERY_TYPES = messageTypes(PREVIEW_QUERY_PAYLOADS);

export type PreviewRequestPayloadByType = PreviewCommandPayloadByType & PreviewQueryPayloadByType;

export type PreviewRequestType = keyof PreviewRequestPayloadByType;

export const PREVIEW_REQUEST_TYPES = [
  ...PREVIEW_COMMAND_TYPES,
  ...PREVIEW_QUERY_TYPES,
] as const satisfies readonly PreviewRequestType[];

export interface PreviewReadyUpdatedPayload {
  ready: boolean;
}

export interface StageSnapshotUpdatedPayload {
  sceneName: string;
  sentenceId: number;
  stageState: JsonObject;
}

export interface FastPreviewTimeoutPayload {
  sceneName: string;
  sentenceId: number;
  targetSentenceId: number;
  forwardedLineCount: number;
  elapsedMs: number;
  maxDurationMs: number;
}

export const HOST_EVENT_PAYLOADS = definePayloadMap({
  'preview.ready.updated': payload<PreviewReadyUpdatedPayload>(),
  'stage.snapshot.updated': payload<StageSnapshotUpdatedPayload>(),
  'preview.event.fast-preview-timeout': payload<FastPreviewTimeoutPayload>(),
});

export type EventPayloadByType = typeof HOST_EVENT_PAYLOADS;

export type HostEventType = keyof EventPayloadByType & string;

export const HOST_EVENT_TYPES = messageTypes(HOST_EVENT_PAYLOADS);

export interface RegisterPreviewRequestPayload {
  gameId?: string;
  embeddedLaunchId?: string;
}

export const SESSION_REQUEST_PAYLOADS = definePayloadMap({
  [SESSION_REGISTER_PREVIEW_TYPE]: payload<RegisterPreviewRequestPayload>(),
});

export type SessionRequestPayloadByType = typeof SESSION_REQUEST_PAYLOADS;

export type SessionRequestType = keyof SessionRequestPayloadByType & string;

export const SESSION_REQUEST_TYPES = messageTypes(SESSION_REQUEST_PAYLOADS);

export type RequestPayloadByType = SessionRequestPayloadByType & PreviewRequestPayloadByType;

export type RequestType = keyof RequestPayloadByType;

export const REQUEST_TYPES = [
  ...SESSION_REQUEST_TYPES,
  ...PREVIEW_REQUEST_TYPES,
] as const satisfies readonly RequestType[];

export type PreviewCommandResponsePayloadByType = Record<PreviewCommandType, EmptyObject>;

export const PREVIEW_QUERY_RESPONSE_PAYLOADS = definePayloadMap({
  'preview.query.reference-box': payload<ReferenceBoxQueryResultPayload>(),
  'preview.query.base-transform': payload<BaseTransformQueryResultPayload>(),
  'preview.query.transform-baseline': payload<TransformBaselineQueryResultPayload>(),
});

export type PreviewQueryResponsePayloadByType = typeof PREVIEW_QUERY_RESPONSE_PAYLOADS;

export type PreviewResponsePayloadByType = PreviewCommandResponsePayloadByType & PreviewQueryResponsePayloadByType;

export type PreviewResponseType = PreviewRequestType;

export const PREVIEW_RESPONSE_TYPES = PREVIEW_REQUEST_TYPES satisfies readonly PreviewResponseType[];

export const SESSION_RESPONSE_PAYLOADS = definePayloadMap({
  [SESSION_REGISTER_PREVIEW_TYPE]: payload<EmptyObject>(),
});

export type SessionResponsePayloadByType = typeof SESSION_RESPONSE_PAYLOADS;

export type SessionResponseType = keyof SessionResponsePayloadByType & string;

export const SESSION_RESPONSE_TYPES = messageTypes(SESSION_RESPONSE_PAYLOADS);

export type ResponsePayloadByType = SessionResponsePayloadByType & PreviewResponsePayloadByType;

export type ResponseType = keyof ResponsePayloadByType;

export const RESPONSE_TYPES = [
  ...SESSION_RESPONSE_TYPES,
  ...PREVIEW_RESPONSE_TYPES,
] as const satisfies readonly ResponseType[];

export const PREVIEW_REQUEST_ERROR_CODES = ['bad-request', 'unsupported-request-type', 'internal-error'] as const;

export type PreviewRequestErrorCode = (typeof PREVIEW_REQUEST_ERROR_CODES)[number];

export interface PreviewRequestError {
  code: PreviewRequestErrorCode;
  message?: string;
}

export interface EventEnvelope<TPayload = unknown, TType extends string = string> {
  kind: 'event';
  type: TType;
  payload: TPayload;
}

export interface RequestEnvelope<TPayload = unknown, TType extends string = string> {
  kind: 'request';
  type: TType;
  requestId: string;
  payload: TPayload;
}

export interface ResponseEnvelope<TPayload = unknown, TType extends string = string> {
  kind: 'response';
  type: TType;
  requestId: string;
  payload: TPayload;
}

export interface PreviewRequestErrorEnvelope<TType extends string = string> {
  kind: 'error';
  type: TType;
  requestId: string;
  error: PreviewRequestError;
}

export type AnyProtocolEnvelope = EventEnvelope | RequestEnvelope | ResponseEnvelope | PreviewRequestErrorEnvelope;

export type EventEnvelopeByType<TType extends keyof EventPayloadByType = keyof EventPayloadByType> = {
  [K in TType]: EventEnvelope<EventPayloadByType[K], K>;
}[TType];

export type RequestEnvelopeByType<TType extends keyof RequestPayloadByType = keyof RequestPayloadByType> = {
  [K in TType]: RequestEnvelope<RequestPayloadByType[K], K>;
}[TType];

export type ResponseEnvelopeByType<TType extends keyof ResponsePayloadByType = keyof ResponsePayloadByType> = {
  [K in TType]: ResponseEnvelope<ResponsePayloadByType[K], K>;
}[TType];

export type PreviewRequestErrorEnvelopeByType<TType extends keyof RequestPayloadByType = keyof RequestPayloadByType> = {
  [K in TType]: PreviewRequestErrorEnvelope<K>;
}[TType];

export type KnownProtocolEnvelope =
  | EventEnvelopeByType
  | RequestEnvelopeByType
  | ResponseEnvelopeByType
  | PreviewRequestErrorEnvelopeByType;

export type ProtocolEnvelope = KnownProtocolEnvelope;

export function createEventEnvelope<TType extends keyof EventPayloadByType>(
  type: TType,
  payload: EventPayloadByType[TType],
): EventEnvelopeByType<TType> {
  return {
    kind: 'event',
    type,
    payload,
  };
}

export function createRequestEnvelope<TType extends keyof RequestPayloadByType>(
  type: TType,
  requestId: string,
  payload: RequestPayloadByType[TType],
): RequestEnvelopeByType<TType> {
  return {
    kind: 'request',
    type,
    requestId,
    payload,
  };
}

export function createResponseEnvelope<TType extends keyof ResponsePayloadByType>(
  type: TType,
  requestId: string,
  payload: ResponsePayloadByType[TType],
): ResponseEnvelopeByType<TType> {
  return {
    kind: 'response',
    type,
    requestId,
    payload,
  };
}

export function createRequestErrorEnvelope<TType extends string>(
  type: TType,
  requestId: string,
  error: PreviewRequestError,
): PreviewRequestErrorEnvelope<TType> {
  return {
    kind: 'error',
    type,
    requestId,
    error,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasPayloadEnvelopeShape(
  value: unknown,
  kind: 'event' | 'request' | 'response',
): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    value.kind === kind &&
    typeof value.type === 'string' &&
    'payload' in value &&
    (kind === 'event' || typeof value.requestId === 'string')
  );
}

function isMessageType<TType extends string>(value: unknown, acceptedTypes: readonly TType[]): value is TType {
  return typeof value === 'string' && acceptedTypes.includes(value as TType);
}

export function isSessionRequestType(value: unknown): value is SessionRequestType {
  return isMessageType(value, SESSION_REQUEST_TYPES);
}

export function isPreviewCommandType(value: unknown): value is PreviewCommandType {
  return isMessageType(value, PREVIEW_COMMAND_TYPES);
}

export function isPreviewQueryType(value: unknown): value is PreviewQueryType {
  return isMessageType(value, PREVIEW_QUERY_TYPES);
}

export function isPreviewRequestType(value: unknown): value is PreviewRequestType {
  return isMessageType(value, PREVIEW_REQUEST_TYPES);
}

export function isRequestType(value: unknown): value is RequestType {
  return isMessageType(value, REQUEST_TYPES);
}

export function isPreviewResponseType(value: unknown): value is PreviewResponseType {
  return isMessageType(value, PREVIEW_RESPONSE_TYPES);
}

export function isSessionResponseType(value: unknown): value is SessionResponseType {
  return isMessageType(value, SESSION_RESPONSE_TYPES);
}

export function isResponseType(value: unknown): value is ResponseType {
  return isMessageType(value, RESPONSE_TYPES);
}

export function isHostEventType(value: unknown): value is HostEventType {
  return isMessageType(value, HOST_EVENT_TYPES);
}

export function isPreviewRequestErrorCode(value: unknown): value is PreviewRequestErrorCode {
  return isMessageType(value, PREVIEW_REQUEST_ERROR_CODES);
}

export function isEventEnvelope(value: unknown): value is EventEnvelope {
  return hasPayloadEnvelopeShape(value, 'event');
}

export function isRequestEnvelope(value: unknown): value is RequestEnvelope {
  return hasPayloadEnvelopeShape(value, 'request');
}

export function isResponseEnvelope(value: unknown): value is ResponseEnvelope {
  return hasPayloadEnvelopeShape(value, 'response');
}

export function isPreviewRequestErrorEnvelope(value: unknown): value is PreviewRequestErrorEnvelope {
  return (
    isRecord(value) &&
    value.kind === 'error' &&
    typeof value.type === 'string' &&
    typeof value.requestId === 'string' &&
    isRecord(value.error) &&
    isPreviewRequestErrorCode(value.error.code) &&
    (!('message' in value.error) || typeof value.error.message === 'string')
  );
}

export function isAnyProtocolEnvelope(value: unknown): value is AnyProtocolEnvelope {
  return (
    isEventEnvelope(value) ||
    isRequestEnvelope(value) ||
    isResponseEnvelope(value) ||
    isPreviewRequestErrorEnvelope(value)
  );
}

export function isHostEventEnvelope(value: unknown): value is EventEnvelopeByType<HostEventType> {
  return isEventEnvelope(value) && isHostEventType(value.type);
}

export function isKnownRequestEnvelope(value: unknown): value is RequestEnvelopeByType<RequestType> {
  return isRequestEnvelope(value) && isRequestType(value.type);
}

export function isSessionRequestEnvelope(value: unknown): value is RequestEnvelopeByType<SessionRequestType> {
  return isRequestEnvelope(value) && isSessionRequestType(value.type);
}

export function isPreviewCommandRequestEnvelope(value: unknown): value is RequestEnvelopeByType<PreviewCommandType> {
  return isRequestEnvelope(value) && isPreviewCommandType(value.type);
}

export function isPreviewRequestEnvelope(value: unknown): value is RequestEnvelopeByType<PreviewRequestType> {
  return isRequestEnvelope(value) && isPreviewRequestType(value.type);
}

export function isKnownResponseEnvelope(value: unknown): value is ResponseEnvelopeByType<ResponseType> {
  return isResponseEnvelope(value) && isResponseType(value.type);
}

export function isPreviewResponseEnvelope(value: unknown): value is ResponseEnvelopeByType<PreviewResponseType> {
  return isResponseEnvelope(value) && isPreviewResponseType(value.type);
}

export function isKnownPreviewRequestErrorEnvelope(
  value: unknown,
): value is PreviewRequestErrorEnvelopeByType<PreviewRequestType> {
  return isPreviewRequestErrorEnvelope(value) && isPreviewRequestType(value.type);
}

export function isKnownProtocolEnvelope(value: unknown): value is KnownProtocolEnvelope {
  return (
    isHostEventEnvelope(value) ||
    isKnownRequestEnvelope(value) ||
    isKnownResponseEnvelope(value) ||
    (isPreviewRequestErrorEnvelope(value) && isRequestType(value.type))
  );
}
