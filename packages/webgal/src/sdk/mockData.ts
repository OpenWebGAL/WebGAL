import { useEffect, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { initState } from '@/Core/Modules/stage/stageStateManager';
import type { IFlowchart } from '@/Core/Modules/flowchart';
import type { BacklogViewItem, ChooseOptionItem, ExtraCgGroup, SaveSlotData, UiScreenId } from '@/screens/contracts';
import type { IAppreciationAsset } from '@/store/userDataInterface';

let mockDataEnabled = false;
let activeUiScreenState: UiScreenId | null = null;
const listeners = new Set<() => void>();
const activeScreenListeners = new Set<() => void>();

export function isUiMockDataEnabled(): boolean {
  return mockDataEnabled;
}

export function setUiMockDataEnabled(enabled: boolean): void {
  if (mockDataEnabled === enabled) return;
  mockDataEnabled = enabled;
  listeners.forEach((cb) => cb());
}

export function subscribeUiMockData(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useUiMockDataEnabled(): boolean {
  const [enabled, setEnabled] = useState(mockDataEnabled);
  useEffect(() => subscribeUiMockData(() => setEnabled(mockDataEnabled)), []);
  return enabled;
}

export function getActiveUiScreen(): UiScreenId | null {
  return activeUiScreenState;
}

export function setActiveUiScreenState(screen: UiScreenId | null): void {
  if (activeUiScreenState === screen) return;
  activeUiScreenState = screen;
  activeScreenListeners.forEach((cb) => cb());
}

export function subscribeActiveUiScreen(listener: () => void): () => void {
  activeScreenListeners.add(listener);
  return () => {
    activeScreenListeners.delete(listener);
  };
}

export function useActiveUiScreen(): UiScreenId | null {
  const [screen, setScreen] = useState<UiScreenId | null>(activeUiScreenState);
  useEffect(() => subscribeActiveUiScreen(() => setScreen(activeUiScreenState)), []);
  return screen;
}

interface ScenicTheme {
  skyTop: string;
  skyBottom: string;
  sunColor: string;
  hillBack: string;
  hillFront: string;
  glowColor: string;
}

const SCENIC_THEMES: readonly ScenicTheme[] = [
  {
    skyTop: '#a1c4fd',
    skyBottom: '#fbc2eb',
    sunColor: '#fff5e4',
    hillBack: '#9aa7d6',
    hillFront: '#6f7cb5',
    glowColor: '#fde2f3',
  },
  {
    skyTop: '#f6d365',
    skyBottom: '#fda085',
    sunColor: '#fff7d6',
    hillBack: '#b57c8f',
    hillFront: '#7d4e6d',
    glowColor: '#ffe4cc',
  },
  {
    skyTop: '#89f7fe',
    skyBottom: '#66a6ff',
    sunColor: '#f8fafc',
    hillBack: '#6591c7',
    hillFront: '#466a9e',
    glowColor: '#e0f2fe',
  },
  {
    skyTop: '#2b5876',
    skyBottom: '#786fa6',
    sunColor: '#fef9c3',
    hillBack: '#463f73',
    hillFront: '#2c2752',
    glowColor: '#ddd6fe',
  },
];

function buildScenicSvg(theme: ScenicTheme, caption = ''): string {
  const captionNode = caption
    ? `<text x="32" y="328" fill="#ffffff" fill-opacity="0.9" font-family="sans-serif" font-size="22" letter-spacing="2">${caption}</text>`
    : '';
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">',
    '<defs>',
    `<linearGradient id="sky" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0%" stop-color="${theme.skyTop}"/><stop offset="100%" stop-color="${theme.skyBottom}"/></linearGradient>`,
    `<radialGradient id="sun" cx="72%" cy="32%" r="36%"><stop offset="0%" stop-color="${theme.sunColor}" stop-opacity="0.95"/><stop offset="55%" stop-color="${theme.glowColor}" stop-opacity="0.45"/><stop offset="100%" stop-color="${theme.glowColor}" stop-opacity="0"/></radialGradient>`,
    '</defs>',
    '<rect width="640" height="360" fill="url(#sky)"/>',
    '<rect width="640" height="360" fill="url(#sun)"/>',
    '<circle cx="460" cy="116" r="42" fill="#ffffff" fill-opacity="0.72"/>',
    `<circle cx="148" cy="94" r="18" fill="${theme.glowColor}" fill-opacity="0.34"/>`,
    `<circle cx="212" cy="136" r="10" fill="${theme.glowColor}" fill-opacity="0.28"/>`,
    `<circle cx="536" cy="78" r="14" fill="${theme.glowColor}" fill-opacity="0.32"/>`,
    `<path d="M0 248 Q160 198 320 236 T640 218 L640 360 L0 360 Z" fill="${theme.hillBack}" fill-opacity="0.72"/>`,
    `<path d="M0 282 Q190 242 390 278 T640 262 L640 360 L0 360 Z" fill="${theme.hillFront}" fill-opacity="0.88"/>`,
    '<ellipse cx="120" cy="180" rx="5" ry="2.5" transform="rotate(-24 120 180)" fill="#fff1f2" fill-opacity="0.75"/>',
    '<ellipse cx="290" cy="148" rx="4" ry="2" transform="rotate(18 290 148)" fill="#fff1f2" fill-opacity="0.65"/>',
    '<ellipse cx="510" cy="166" rx="5" ry="2.5" transform="rotate(-12 510 166)" fill="#fff1f2" fill-opacity="0.7"/>',
    captionNode,
    '</svg>',
  ].join('');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createMockPreviewSvg(label = '', accent?: string): string {
  const index = Math.abs(Array.from(label).reduce((sum, ch) => sum + ch.charCodeAt(0), 0)) % SCENIC_THEMES.length;
  const base = SCENIC_THEMES[index];
  const theme = accent ? { ...base, skyBottom: accent } : base;
  return buildScenicSvg(theme, label);
}

function makeMockSaveSlot(index: number, speaker: string, text: string, themeIndex: number): SaveSlotData {
  const stage = cloneDeep(initState);
  stage.showName = speaker;
  stage.showText = text;
  const theme = SCENIC_THEMES[themeIndex % SCENIC_THEMES.length];
  return {
    index,
    saveTime: `2026-05-0${(index % 9) + 1} 20:${String((index * 7) % 60).padStart(2, '0')}:12`,
    previewImage: buildScenicSvg(theme),
    nowStageState: stage,
    backlog: [],
    sceneData: {
      currentSentenceId: index * 12,
      sceneStack: [],
      sceneName: `chapter${(index % 3) + 1}.txt`,
      sceneUrl: `game/scene/chapter${(index % 3) + 1}.txt`,
    },
  };
}

export function getMockSaveSlots(startIndex = 1, endIndex = 10): Record<number, SaveSlotData | null> {
  const result: Record<number, SaveSlotData | null> = {};
  const samples = [
    ['星野 桜', '午后的阳光洒在旧校舍的走廊上，微风轻轻吹过窗帘。', 0],
    ['天海 遥', '「约定好了哦，明年樱花盛开的时候再在这里见面。」', 1],
    ['苍井 诗织', '海风送来远处电车驶过的声音，晚霞把堤岸染成了温柔的橘色。', 2],
    ['白羽 千秋', '翻开笔记本的最后一页，里面夹着一张褪色的车票。', 3],
  ] as const;

  for (let idx = startIndex; idx <= endIndex; idx++) {
    const offset = idx - startIndex;
    if (offset >= 0 && offset < samples.length) {
      const [speaker, text, themeIndex] = samples[offset];
      result[idx] = makeMockSaveSlot(idx, speaker, text, themeIndex);
    } else {
      result[idx] = null;
    }
  }
  return result;
}

export function getMockQuickSavePreview(): SaveSlotData {
  return makeMockSaveSlot(0, '星野 桜', '快速存档模拟预览 —— 正沿着樱花坡道走向下一幕场景。', 0);
}

export function getMockFlowcharts(): { flowcharts: IFlowchart[]; unlockedNodeKeys: string[] } {
  const flowcharts: IFlowchart[] = [
    {
      id: 'main-story',
      name: '主线剧情',
      type: 'main',
      nodes: [
        {
          id: 'start',
          type: 'root',
          position: { x: 80, y: 180 },
          data: { label: '序章：相遇', sceneName: 'start.txt', isRoot: true },
        },
        {
          id: 'school',
          type: 'chapter',
          position: { x: 360, y: 180 },
          data: { label: '第一章：放学后', sceneName: 'chapter1.txt' },
        },
        {
          id: 'route-a',
          type: 'branch',
          position: { x: 640, y: 90 },
          data: { label: '分支：天台', sceneName: 'branch_a.txt' },
        },
        {
          id: 'route-b',
          type: 'branch',
          position: { x: 640, y: 270 },
          data: { label: '分支：图书馆', sceneName: 'branch_b.txt' },
        },
        {
          id: 'ending',
          type: 'ending',
          position: { x: 920, y: 180 },
          data: { label: '终章：约定', sceneName: 'ending.txt' },
        },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'school' },
        { id: 'e2', source: 'school', target: 'route-a' },
        { id: 'e3', source: 'school', target: 'route-b' },
        { id: 'e4', source: 'route-a', target: 'ending' },
        { id: 'e5', source: 'route-b', target: 'ending' },
      ],
    },
  ];
  return {
    flowcharts,
    unlockedNodeKeys: ['main-story:start', 'main-story:school', 'main-story:route-a'],
  };
}

export function getMockBacklogItems(): BacklogViewItem[] {
  return [
    {
      index: 0,
      speaker: '星野 桜',
      text: '清晨的站台还带着微凉的雾气，列车进站的声音由远及近。',
      vocalUrl: '',
      sentenceId: 1,
    },
    { index: 1, speaker: '天海 遥', text: '「早安。今天的风好像比昨天温柔一点呢。」', vocalUrl: '', sentenceId: 2 },
    {
      index: 2,
      speaker: '',
      text: '她把手里温热的罐装咖啡递了过来，指尖还留着淡淡的香气。',
      vocalUrl: '',
      sentenceId: 3,
    },
    { index: 3, speaker: '星野 桜', text: '「走吧，文化祭的准备工作才刚刚开始。」', vocalUrl: '', sentenceId: 4 },
  ];
}

export function getMockChooseOptions(): ChooseOptionItem[] {
  return [
    { id: '0', text: '前往天台吹吹风', disabled: false },
    { id: '1', text: '留在教室整理社团资料', disabled: false },
    { id: '2', text: '（未解锁条件分支示例）', disabled: true },
  ];
}

export function getMockExtraData(): { cgGroups: ExtraCgGroup[]; bgmList: IAppreciationAsset[] } {
  const cgGroups: ExtraCgGroup[] = [
    {
      key: 'gallery-1',
      name: '序章：樱花坡道',
      resources: [
        { name: '樱花坡道', url: createMockPreviewSvg('CG 01 · 樱花坡道', '#8b5cf6'), series: 'gallery-1', order: 1 },
        { name: '黄昏教室', url: createMockPreviewSvg('CG 02 · 黄昏教室', '#ec4899'), series: 'gallery-1', order: 2 },
      ],
    },
    {
      key: 'gallery-2',
      name: '夏夜祭典',
      resources: [
        { name: '夏夜花火', url: createMockPreviewSvg('CG 03 · 夏夜花火', '#0ea5e9'), series: 'gallery-2', order: 3 },
      ],
    },
  ];
  const bgmList: IAppreciationAsset[] = [
    { name: '01. 春風とPromise', url: 'mock://bgm-1', series: 'ost', order: 1 },
    { name: '02. 放課後のチャイム', url: 'mock://bgm-2', series: 'ost', order: 2 },
    { name: '03. 星降る屋上にて', url: 'mock://bgm-3', series: 'ost', order: 3 },
  ];
  return { cgGroups, bgmList };
}

export function getMockTextBoxSample(): {
  showName: string;
  dialogSegments: string[];
  currentDialogKey: string;
} {
  return {
    showName: '星野 桜',
    dialogSegments: ['[桜](さくら)の花びらが舞う中、新しい[物語](ストーリー)が今ここから始まる。'],
    currentDialogKey: '__mock_textbox_preview__',
  };
}

export function getMockGlobalDialog(): {
  title: string;
  confirmText: string;
  cancelText: string;
} {
  return {
    title: '确定要返回标题界面吗？未保存的进度将会丢失。',
    confirmText: '确定',
    cancelText: '取消',
  };
}
