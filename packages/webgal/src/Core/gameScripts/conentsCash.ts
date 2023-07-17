export class figureConentsCash {
  private _content: string ="";

  public constructor() {
  }
  public push(sentenceContent: string){
    this._content = sentenceContent;
  }
  public pop(): string{
    const constContent = this._content;
    this._content = "";
    return constContent;
  }
}

export class voiceConentsCash {
  private _content: string ="";

  public constructor() {
  }
  public push(sentenceContent: string){
    this._content = sentenceContent;
  }
  public pop(): string{
    const constContent = this._content;
    this._content = "";
    return constContent;
  }
}

export const figureCash = new figureConentsCash();
export const voiceCash = new voiceConentsCash();