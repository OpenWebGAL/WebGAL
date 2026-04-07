import type { IEffect, ITransform } from '@/store/stageInterface';
import type { componentsVisibility } from '@/store/guiInterface';

export const EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL = 'webgal-editor-preview-sync.v1' as const;

type EmptyObject = Record<string, never>;

export interface SyncScenePayload {
  sceneName: string;
  sentenceId: number;
  syncMode: 'stable' | 'fast';
}

export interface RunSceneContentPayload {
  sceneContent: string;
}

export interface RunSnippetPayload {
  snippet: string;
}

export type ReloadTemplatesPayload = EmptyObject;

export interface SetEffectPayload {
  target: IEffect['target'];
  transform?: Partial<Omit<ITransform, 'position' | 'scale'>> & {
    position?: Partial<ITransform['position']>;
    scale?: Partial<ITransform['scale']>;
  };
}

export type SetComponentVisibilityPayload = Partial<Record<keyof componentsVisibility, boolean>>;

export interface SetFontOptimizationPayload {
  enabled: boolean;
}

export interface PreviewCommandPayloadByType {
  'preview.command.sync-scene': SyncScenePayload;
  'preview.command.run-scene-content': RunSceneContentPayload;
  'preview.command.run-snippet': RunSnippetPayload;
  'preview.command.reload-templates': ReloadTemplatesPayload;
  'preview.command.set-effect': SetEffectPayload;
  'preview.command.set-component-visibility': SetComponentVisibilityPayload;
  'preview.command.set-font-optimization': SetFontOptimizationPayload;
}

export type PreviewCommandType = keyof PreviewCommandPayloadByType;

const PREVIEW_COMMAND_TYPES = [
  'preview.command.sync-scene',
  'preview.command.run-scene-content',
  'preview.command.run-snippet',
  'preview.command.reload-templates',
  'preview.command.set-effect',
  'preview.command.set-component-visibility',
  'preview.command.set-font-optimization',
] as const satisfies readonly PreviewCommandType[];

export interface PreviewRequestPayloadByType extends PreviewCommandPayloadByType {}

export type PreviewRequestType = keyof PreviewRequestPayloadByType;

const PREVIEW_REQUEST_TYPES = [...PREVIEW_COMMAND_TYPES] as const satisfies readonly PreviewRequestType[];

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

interface JsonObject {
  [key: string]: JsonValue;
}

export interface PreviewReadyUpdatedPayload {
  ready: boolean;
}

export interface StageSnapshotUpdatedPayload {
  sceneName: string;
  sentenceId: number;
  stageState: JsonObject;
}

interface EventPayloadByType {
  'preview.ready.updated': PreviewReadyUpdatedPayload;
  'stage.snapshot.updated': StageSnapshotUpdatedPayload;
}

export type HostEventType = keyof EventPayloadByType;

const HOST_EVENT_TYPES = [
  'preview.ready.updated',
  'stage.snapshot.updated',
] as const satisfies readonly HostEventType[];

export interface RegisterPreviewRequestPayload {
  gameId?: string;
  embeddedLaunchId?: string;
}

interface SessionRequestPayloadByType {
  'session.register-preview': RegisterPreviewRequestPayload;
}

interface RequestPayloadByType extends SessionRequestPayloadByType, PreviewRequestPayloadByType {}

export interface PreviewCommandResponsePayloadByType extends Record<PreviewCommandType, EmptyObject> {}

export interface PreviewResponsePayloadByType extends PreviewCommandResponsePayloadByType {}

interface SessionResponsePayloadByType {
  'session.register-preview': EmptyObject;
}

interface ResponsePayloadByType extends SessionResponsePayloadByType, PreviewResponsePayloadByType {}

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

type EventEnvelopeByType<TType extends keyof EventPayloadByType = keyof EventPayloadByType> = {
  [K in TType]: EventEnvelope<EventPayloadByType[K], K>;
}[TType];

type RequestEnvelopeByType<TType extends keyof RequestPayloadByType = keyof RequestPayloadByType> = {
  [K in TType]: RequestEnvelope<RequestPayloadByType[K], K>;
}[TType];

type ResponseEnvelopeByType<TType extends keyof ResponsePayloadByType = keyof ResponsePayloadByType> = {
  [K in TType]: ResponseEnvelope<ResponsePayloadByType[K], K>;
}[TType];

export type ProtocolEnvelope = EventEnvelopeByType | RequestEnvelopeByType | ResponseEnvelopeByType;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasEnvelopeShape(value: unknown, kind: ProtocolEnvelope['kind']): value is Record<string, unknown> {
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

function isEventEnvelope(value: unknown): value is EventEnvelope {
  return hasEnvelopeShape(value, 'event');
}

function isRequestEnvelope(value: unknown): value is RequestEnvelope {
  return hasEnvelopeShape(value, 'request');
}

function isResponseEnvelope(value: unknown): value is ResponseEnvelope {
  return hasEnvelopeShape(value, 'response');
}

export function isProtocolEnvelope(value: unknown): value is ProtocolEnvelope {
  return isEventEnvelope(value) || isRequestEnvelope(value) || isResponseEnvelope(value);
}

export function isPreviewCommandType(value: unknown): value is PreviewCommandType {
  return isMessageType(value, PREVIEW_COMMAND_TYPES);
}

export function isPreviewRequestType(value: unknown): value is PreviewRequestType {
  return isMessageType(value, PREVIEW_REQUEST_TYPES);
}

export function isHostEventType(value: unknown): value is HostEventType {
  return isMessageType(value, HOST_EVENT_TYPES);
}

export function isHostEventEnvelope(value: unknown): value is EventEnvelopeByType<HostEventType> {
  return isEventEnvelope(value) && isHostEventType(value.type);
}

export function isPreviewCommandRequestEnvelope(value: unknown): value is RequestEnvelopeByType<PreviewCommandType> {
  return isRequestEnvelope(value) && isPreviewCommandType(value.type);
}

export function isPreviewRequestEnvelope(value: unknown): value is RequestEnvelopeByType<PreviewRequestType> {
  return isRequestEnvelope(value) && isPreviewRequestType(value.type);
}
