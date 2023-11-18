export class FigureConentsCash {
  private _content = '';

  // public constructor() {}
  public push(sentenceContent: string) {
    this._content = sentenceContent;
  }
  public pop(): string {
    const constContent = this._content;
    this._content = '';
    return constContent;
  }
}

export class VoiceConentsCash {
  private _content = '';

  // public constructor() {}
  public push(sentenceContent: string) {
    this._content = sentenceContent;
  }
  public pop(): string {
    const constContent = this._content;
    this._content = '';
    return constContent;
  }
}

export const figureCash = new FigureConentsCash();
export const voiceCash = new VoiceConentsCash();
