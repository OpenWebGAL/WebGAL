class Matcher<T, R = any> {
  private subject: T;
  private result: R | undefined;
  private isEnd = false;

  public constructor(subject: T) {
    this.subject = subject;
  }

  public with(pattern: T, fn: () => R): this {
    if (!this.isEnd && this.subject === pattern) {
      this.result = fn();
      this.isEnd = true;
    }
    return this;
  }

  public endsWith(pattern: T, fn: () => R) {
    if (!this.isEnd && this.subject === pattern) {
      this.result = fn();
      this.isEnd = true;
    }
    return this.evaluate();
  }

  public default(fn: () => R) {
    if (!this.isEnd) this.result = fn();
    return this.evaluate();
  }

  private evaluate(): R | undefined {
    return this.result;
  }
}

export function match<T, R = any>(subject: T): Matcher<T, R> {
  return new Matcher(subject);
}
