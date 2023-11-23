type Case<T, R> = [T, () => R];

class Matcher<T, R = any> {
  private cases: Array<Case<T, R>> = [];
  private readonly subject: T;
  private defaultCase?: () => R;

  public constructor(subject: T) {
    this.subject = subject;
  }

  public with(pattern: T, fn: () => R): this {
    this.cases.push([pattern, fn]);
    return this;
  }

  public endsWith(pattern: T, fn: () => R) {
    this.cases.push([pattern, fn]);
    return this.evaluate();
  }

  public default(fn: () => R) {
    this.defaultCase = fn;
    return this.evaluate();
  }

  private evaluate(): R | undefined {
    for (const [pattern, action] of this.cases) {
      if (pattern === this.subject) {
        return action();
      }
    }
    if (this.defaultCase) {
      return this.defaultCase();
    }
    return undefined;
  }
}

export function match<T, R = any>(subject: T): Matcher<T, R> {
  return new Matcher(subject);
}
