"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const API_URL = new src_1.InjectionToken("API_URL");
let Logger = class Logger {
    constructor() {
        console.log("Creating Logger");
    }
    log(message) {
        console.log(`[LOG]: ${message}`);
    }
};
Logger = __decorate([
    (0, src_1.Injectable)(),
    (0, src_1.Singleton)(),
    __metadata("design:paramtypes", [])
], Logger);
class MockLogger extends Logger {
    log(message) {
        console.log(`[MOCK]: ${message}`);
    }
}
let ApiClient = class ApiClient {
    baseUrl;
    logger;
    constructor(baseUrl, logger) {
        this.baseUrl = baseUrl;
        this.logger = logger;
    }
    get(path) {
        this.logger.log(`GET ${this.baseUrl}${path}`);
        return {
            id: 1,
            name: "Huy",
        };
    }
};
ApiClient = __decorate([
    (0, src_1.Injectable)(),
    __param(0, (0, src_1.Inject)(API_URL)),
    __metadata("design:paramtypes", [String, Logger])
], ApiClient);
let UserRepository = class UserRepository {
    api;
    constructor(api) {
        this.api = api;
    }
    findUser(id) {
        return this.api.get(`/users/${id}`);
    }
};
UserRepository = __decorate([
    (0, src_1.Injectable)(),
    __metadata("design:paramtypes", [ApiClient])
], UserRepository);
let UserService = class UserService {
    repository;
    logger;
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    getUser(id) {
        this.logger.log(`Getting user ${id}`);
        return this.repository.findUser(id);
    }
};
UserService = __decorate([
    (0, src_1.Injectable)(),
    __metadata("design:paramtypes", [UserRepository,
        Logger])
], UserService);
const container = new src_1.Container();
container.register(API_URL, {
    useValue: "https://api.example.com"
});
container.register(Logger);
container.register(ApiClient);
container.register(UserRepository);
container.register(UserService);
const userService = container.resolve(UserService);
// userService.getUser(1)
// const child = container.createChild()
// const rootLogger = container.resolve(Logger)
// const childLogger = child.resolve(Logger)
// console.log("same logger:", rootLogger === childLogger)
// const childA = container.createChild()
// const childB = container.createChild()
// const loggerA = childA.resolve(Logger)
// const loggerB = childB.resolve(Logger)
// console.log(loggerA === loggerB)
const child = container.createChild();
child.register(Logger, {
    useClass: MockLogger,
    scope: 'singleton'
});
const rootLogger = container.resolve(Logger);
const childLogger = child.resolve(Logger);
console.log(rootLogger === childLogger);
