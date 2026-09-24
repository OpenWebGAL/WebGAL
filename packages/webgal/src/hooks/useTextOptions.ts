import { textSize } from '@/store/userDataInterface';

export function getTextLineLimit(size: number, maxLine: unknown) {
  const lineLimit = Number(maxLine);
  return Number.isNaN(lineLimit) ? (size === textSize.small ? 3 : 2) : lineLimit;
}

// 范围为 [startRange, step * 100 + startRange]
export function useTextDelay(data: number) {
  const startRange = 3;
  const step = 1.5;
  return startRange + (100 - data) * step;
}

// 范围为 [startRange, step * 100 + startRange]
export function useTextAnimationDuration(data: number) {
  const startRange = 200;
  const step = 15;
  return startRange + (100 - data) * step;
}
