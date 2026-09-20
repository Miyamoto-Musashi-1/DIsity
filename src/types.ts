export type Constructor<T = unknown> =
  new (...args: any[]) => T;

export class InjectionToken<T> {
    readonly #type!: T

    constructor(public readonly description: string) {}

    toString(): string {
        return `InjectionToken(${this.description})`
    }
}

export type Token<T = unknown> =
  | Constructor<T>
  | InjectionToken<T>

export type Scope = "transient" | "singleton"

export interface ClassProvider<T = unknown> {
  useClass: Constructor<T>;
  dependencies?: Token[];
  scope?: Scope
}

export interface ValueProvider<T = unknown> {
  useValue: T;
}

export interface FactoryProvider<T = unknown> {
  useFactory: (...args: any[]) => T;
  dependencies?: Token[];
  scope?: Scope
}

export type Provider<T = unknown> =
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>;