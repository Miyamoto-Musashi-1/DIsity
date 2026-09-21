import { Container, InjectionToken, Injectable, Inject, Singleton, Scoped } from "../src";

const API_URL = new InjectionToken<string>("API_URL")

@Injectable()
@Singleton()
class Logger {
  constructor() {
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

@Injectable()
@Scoped()
class EditorService {
  constructor(public readonly logger: Logger) {}
}

const container = new Container()

container.register(Logger);
container.register(EditorService);

const childA = container.createChild()
childA.register(Logger, {
  useClass: MockLogger,
  scope: "singleton",
});

const rootEditor =
  container.resolve(EditorService);

const childEditor =
  childA.resolve(EditorService);

  console.log(
    rootEditor.logger.constructor.name
  );
  
  console.log(
    childEditor.logger.constructor.name
  );