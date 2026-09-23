interface FigureDiffMark {
  sourceUrl: string;
  targetUrl: string;
}

/** 内核的一次性换图意图，不保存状态快照，也不管理动画。 */
export class FigureDiffManager {
  private readonly marks = new Map<string, FigureDiffMark>();

  /** 同一次提交内连续差分（A→B→C）时，起点仍是尚在舞台上的 A。 */
  public mark(key: string, mark: FigureDiffMark) {
    const sourceUrl = this.marks.get(key)?.sourceUrl ?? mark.sourceUrl;
    this.marks.set(key, { sourceUrl, targetUrl: mark.targetUrl });
  }

  /** 只匹配实际上屏的源图；无论是否匹配，本次尝试都会消费标记。 */
  public consume(key: string, sourceUrl: string, targetUrl: string): boolean {
    const mark = this.marks.get(key);
    this.marks.delete(key);
    return mark?.sourceUrl === sourceUrl && mark.targetUrl === targetUrl;
  }

  /** 覆盖目标时清除单个标记；演算被丢弃、舞台重建或提交结束时清除全部。 */
  public clear(key?: string) {
    if (key === undefined) this.marks.clear();
    else this.marks.delete(key);
  }
}
