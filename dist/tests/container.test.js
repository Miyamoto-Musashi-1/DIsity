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
const vitest_1 = require("vitest");
const src_1 = require("../src");
(0, vitest_1.describe)("Container", () => {
    (0, vitest_1.it)("resolves a register class", () => {
        let UserService = class UserService {
        };
        UserService = __decorate([
            (0, src_1.Injectable)()
        ], UserService);
        const container = new src_1.Container();
        container.register(UserService);
        const service = container.resolve(UserService);
        (0, vitest_1.expect)(service).toBeInstanceOf(UserService);
    });
    (0, vitest_1.it)("injects class dependencies", () => {
        let UserRepository = class UserRepository {
        };
        UserRepository = __decorate([
            (0, src_1.Injectable)()
        ], UserRepository);
        let UserService = class UserService {
            repository;
            constructor(repository) {
                this.repository = repository;
            }
        };
        UserService = __decorate([
            (0, src_1.Injectable)(),
            __metadata("design:paramtypes", [UserRepository])
        ], UserService);
        const container = new src_1.Container();
        container.register(UserRepository);
        container.register(UserService);
        const service = container.resolve(UserService);
        (0, vitest_1.expect)(service.repository)
            .toBeInstanceOf(UserRepository);
    });
    (0, vitest_1.it)("resolves value providers", () => {
        const API_URL = new src_1.InjectionToken("API_URL");
        const container = new src_1.Container();
        container.register(API_URL, {
            useValue: "https://api.example.com",
        });
        (0, vitest_1.expect)(container.resolve(API_URL)).toBe("https://api.example.com");
    });
    (0, vitest_1.it)("supports @Inject token overrides", () => {
        const API_URL = new src_1.InjectionToken("API_URL");
        let ApiClient = class ApiClient {
            baseUrl;
            constructor(baseUrl) {
                this.baseUrl = baseUrl;
            }
        };
        ApiClient = __decorate([
            (0, src_1.Injectable)(),
            __param(0, (0, src_1.Inject)(API_URL)),
            __metadata("design:paramtypes", [String])
        ], ApiClient);
        const container = new src_1.Container();
        container.register(API_URL, {
            useValue: "https://api.example.com",
        });
        container.register(ApiClient);
        const api = container.resolve(ApiClient);
        (0, vitest_1.expect)(api.baseUrl).toBe("https://api.example.com");
    });
    (0, vitest_1.it)("resolves factory providers", () => {
        const API_URL = new src_1.InjectionToken("API_URL");
        const API_CLIENT = new src_1.InjectionToken("API_CLIENT");
        const container = new src_1.Container();
        container.register(API_URL, {
            useValue: "https://api.example.com",
        });
        container.register(API_CLIENT, {
            useFactory: (baseUrl) => ({
                baseUrl,
            }),
            dependencies: [API_URL],
        });
        const api = container.resolve(API_CLIENT);
        (0, vitest_1.expect)(api).toEqual({
            baseUrl: "https://api.example.com",
        });
    });
    (0, vitest_1.it)("throws for an unregistered token", () => {
        let MissingService = class MissingService {
        };
        MissingService = __decorate([
            (0, src_1.Injectable)()
        ], MissingService);
        const container = new src_1.Container();
        (0, vitest_1.expect)(() => container.resolve(MissingService)).toThrow("No provider found for MissingService");
    });
    (0, vitest_1.it)("clears cached instance when re-registering", () => {
        const SERVICE = new src_1.InjectionToken("SERVICE");
        const first = {};
        const second = {};
        const container = new src_1.Container();
        container.register(SERVICE, {
            useValue: first,
        });
        (0, vitest_1.expect)(container.resolve(SERVICE)).toBe(first);
        container.register(SERVICE, {
            useValue: second,
        });
        (0, vitest_1.expect)(container.resolve(SERVICE)).toBe(second);
    });
});
