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

const container = new Container()

container.register(API_URL, {
    useValue: "https://api.example.com"
})

container.register(Logger)
container.register(ApiClient)
container.register(UserRepository)
container.register(UserService)

const userService = container.resolve(UserService)

const child = container.createChild()
child.register(Logger, {
  useClass: MockLogger,
  scope: 'singleton'
})

const rootLogger = container.resolve(Logger)
const childLogger = child.resolve(Logger)

console.log(rootLogger === childLogger)  