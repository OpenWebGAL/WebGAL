const frameApiManager = new (class {
  private apis: Record<string, Function>;
  public constructor() {
    this.apis = {};
  }
  public registerFrameApi(fnName: string, fn: Function) {
    this.apis[fnName] = fn;
  }
  public callFrameApi(fnName: string, ...args: any[]) {
    if (this.apis[fnName]) {
      this.apis[fnName](...args);
    }
  }
  public clearFrameApi() {
    this.apis = {};
  }
  public getFrameApi(fnName: string) {
    return this.apis[fnName];
  }
})();
export default frameApiManager;
