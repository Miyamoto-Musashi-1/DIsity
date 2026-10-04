# Disity

Lightweight, decorator-based dependency injection for TypeScript applications.

Disity provides a dependency injection container inspired by Inversify and NestJS, with constructor injection, configurable providers, dependency scopes, and hierarchical containers.

> **Version 1.0.0:** Core DI functionality is available. React hooks and provider integration are planned but not yet implemented.

## Features

- Constructor-based dependency injection
- `@Injectable()` and `@Inject()` decorators
- Class, value, and factory providers
- Type-safe `InjectionToken<T>`
- Singleton, transient, and scoped lifecycles
- Child containers and provider overrides
- Circular dependency detection

## Installation

```bash
npm install disity
```

Disity uses TypeScript legacy decorators and `reflect-metadata`. Configure your TypeScript compiler:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Your build tool must also support legacy decorators and constructor metadata emission. TypeScript's `tsc` compiler supports this configuration, but other transpilers may need additional setup.

## Quick Start

```ts
import {
  Container,
  Injectable,
  Singleton,
} from "disity";

@Injectable()
@Singleton()
class Logger {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}

@Injectable()
class UserService {
  constructor(
    private readonly logger: Logger
  ) {}

  getUser(id: number) {
    this.logger.log(`Getting user ${id}`);

    return { id, name: "Huy" };
  }
}

const container = new Container();

container.register(Logger);
container.register(UserService);

const userService = container.resolve(UserService);

console.log(userService.getUser(1));
```

## Injection Tokens

Use `InjectionToken<T>` when dependencies cannot be represented by runtime classes, such as interfaces, strings, or configuration values.

```ts
import {
  Container,
  Injectable,
  Inject,
  InjectionToken,
} from "disity";

const API_URL =
  new InjectionToken<string>("API_URL");

@Injectable()
class ApiClient {
  constructor(
    @Inject(API_URL)
    private readonly baseUrl: string
  ) {}

  getBaseUrl() {
    return this.baseUrl;
  }
}

const container = new Container();

container.register(API_URL, {
  useValue: "https://api.example.com",
});

container.register(ApiClient);

const client = container.resolve(ApiClient);
```

## Providers

Disity supports three provider types.

### Class provider

```ts
container.register(Logger, {
  useClass: Logger,
});
```

### Value provider

```ts
container.register(API_URL, {
  useValue: "https://api.example.com",
});
```

### Factory provider

```ts
const CONFIG =
  new InjectionToken<{ url: string }>("CONFIG");

container.register(CONFIG, {
  useFactory: (url: string) => ({ url }),
  dependencies: [API_URL],
});
```

## Lifecycles

Disity supports three dependency lifecycles.

| Lifecycle | Behavior |
|---|---|
| `@Transient()` | Creates a new instance on every resolution |
| `@Singleton()` | Shares one instance per registration owner |
| `@Scoped()` | Shares one instance per requesting container |

Transient is the default lifecycle.

```ts
@Injectable()
@Singleton()
class Logger {}

@Injectable()
@Transient()
class TaskService {}

@Injectable()
@Scoped()
class EditorService {}
```

You can also configure the lifecycle explicitly:

```ts
container.register(Logger, {
  useClass: Logger,
  scope: "singleton",
});
```

Explicit provider scope takes precedence over decorator metadata.

## Child Containers

Child containers inherit registrations from their parents.

```ts
const root = new Container();

root.register(Logger);

const child = root.createChild();

const rootLogger = root.resolve(Logger);
const childLogger = child.resolve(Logger);

console.log(rootLogger === childLogger);
// true, because Logger is a root-owned singleton
```

Child containers can override registrations:

```ts
class MockLogger extends Logger {}

child.register(Logger, {
  useClass: MockLogger,
  scope: "singleton",
});

const logger = child.resolve(Logger);

console.log(logger instanceof MockLogger);
// true
```

Root-owned singleton dependencies are resolved from their registration owner. Scoped and transient dependencies are resolved from the requesting container.

## Circular Dependency Detection

Disity detects dependency resolution cycles and reports the dependency path.

Example error:

```text
Circular dependency detected:
ServiceA -> ServiceB -> ServiceC -> ServiceA
```

## Current Limitations

- Async factory resolution is not yet supported.
- Automatic constructor injection requires compatible metadata emission.
- Container scope disposal is not yet implemented.
- React-specific hooks and providers are not yet available.
- Re-registering dependencies does not automatically reconstruct existing dependent instances.

## Development

```bash
npm install
npm run typecheck
npm run test:run
npm run build
npm run validate:package
```

## License

MIT (if the repository uses an MIT license).
