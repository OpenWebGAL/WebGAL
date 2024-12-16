import { playSpeed } from '@/store/userDataInterface';

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
