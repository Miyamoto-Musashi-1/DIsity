import { Container, InjectionToken, Injectable, Inject, Singleton } from "../src";

const API_URL = new InjectionToken<string>("API_URL")

@Injectable()
@Singleton()
class Logger {
  constructor() {
    console.log("Creating Logger");
  }

  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}

class MockLogger extends Logger {
  log(message: string): void {
    console.log(`[MOCK]: ${message}`)
  }
}

@Injectable()
class ApiClient {
  constructor(
    @Inject(API_URL)
    private baseUrl: string,

    private logger: Logger
  ) {}

  get(path: string) {
    this.logger.log(
      `GET ${this.baseUrl}${path}`
    );

    return {
      id: 1,
      name: "Huy",
    };
  }
}

@Injectable()
class UserRepository {
  constructor(
    private api: ApiClient
  ) {}

  findUser(id: number) {
    return this.api.get(`/users/${id}`);
  }
}

@Injectable()
class UserService {
  constructor(
    private repository: UserRepository,
    private logger: Logger
  ) {}

  getUser(id: number) {
    this.logger.log(
      `Getting user ${id}`
    );

    return this.repository.findUser(id);
  }
}

@Injectable()
class AppService {
  constructor(
    public readonly logger: Logger
  ) {}
}

const container = new Container()

container.register(AppService)
container.register(Logger)

const child = container.createChild()
child.register(Logger, {
  useClass: MockLogger,
  scope: 'singleton'
})

const childAppService = child.resolve(AppService)

const rootAppService = container.resolve(AppService)

console.log(
  "same service:",
  childAppService === rootAppService
)

console.log(
  "child service logger:",
  childAppService.logger.constructor.name
)

console.log(
  "root service logger:",
  rootAppService.logger.constructor.name
)