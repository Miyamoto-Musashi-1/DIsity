"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const src_1 = require("../src");
(0, vitest_1.describe)("Scopes", () => {
    (0, vitest_1.describe)("transient", () => {
        (0, vitest_1.it)("creates a new instance for every resolution", () => {
            let Service = class Service {
            };
            Service = __decorate([
                (0, src_1.Injectable)(),
                (0, src_1.Transient)()
            ], Service);
            const container = new src_1.Container();
            container.register(Service);
            const first = container.resolve(Service);
            const second = container.resolve(Service);
            (0, vitest_1.expect)(first).not.toBe(second);
        });
    });
    (0, vitest_1.describe)("singleton", () => {
        (0, vitest_1.it)("returns the same instance", () => {
            let Service = class Service {
            };
            Service = __decorate([
                (0, src_1.Injectable)(),
                (0, src_1.Singleton)()
            ], Service);
            const container = new src_1.Container();
            container.register(Service);
            const first = container.resolve(Service);
            const second = container.resolve(Service);
            (0, vitest_1.expect)(first).toBe(second);
        });
        (0, vitest_1.it)("shares root singleton with children", () => {
            let Service = class Service {
            };
            Service = __decorate([
                (0, src_1.Injectable)(),
                (0, src_1.Singleton)()
            ], Service);
            const root = new src_1.Container();
            root.register(Service);
            const childA = root.createChild();
            const childB = root.createChild();
            const rootService = root.resolve(Service);
            const childAService = childA.resolve(Service);
            const childBService = childB.resolve(Service);
            (0, vitest_1.expect)(childAService)
                .toBe(rootService);
            (0, vitest_1.expect)(childBService)
                .toBe(rootService);
        });
    });
    (0, vitest_1.describe)("scoped", () => {
        (0, vitest_1.it)("returns the same instance within a scope", () => {
            let Service = class Service {
            };
            Service = __decorate([
                (0, src_1.Injectable)(),
                (0, src_1.Scoped)()
            ], Service);
            const root = new src_1.Container();
            root.register(Service);
            const child = root.createChild();
            const first = child.resolve(Service);
            const second = child.resolve(Service);
            (0, vitest_1.expect)(first).toBe(second);
        });
        (0, vitest_1.it)("creates different instances for different scopes", () => {
            let Service = class Service {
            };
            Service = __decorate([
                (0, src_1.Injectable)(),
                (0, src_1.Scoped)()
            ], Service);
            const root = new src_1.Container();
            root.register(Service);
            const childA = root.createChild();
            const childB = root.createChild();
            const rootService = root.resolve(Service);
            const childAService = childA.resolve(Service);
            const childBService = childB.resolve(Service);
            (0, vitest_1.expect)(rootService)
                .not.toBe(childAService);
            (0, vitest_1.expect)(childAService)
                .not.toBe(childBService);
            (0, vitest_1.expect)(rootService)
                .not.toBe(childBService);
        });
    });
    (0, vitest_1.describe)("child containers", () => {
        (0, vitest_1.it)("allows a child to override a provider", () => {
            let Logger = class Logger {
                name = "logger";
            };
            Logger = __decorate([
                (0, src_1.Injectable)(),
                (0, src_1.Singleton)()
            ], Logger);
            class MockLogger extends Logger {
                name = "mock";
            }
            const root = new src_1.Container();
            root.register(Logger);
            const child = root.createChild();
            child.register(Logger, {
                useClass: MockLogger,
                scope: "singleton",
            });
            const rootLogger = root.resolve(Logger);
            const childLogger = child.resolve(Logger);
            (0, vitest_1.expect)(rootLogger)
                .toBeInstanceOf(Logger);
            (0, vitest_1.expect)(childLogger)
                .toBeInstanceOf(MockLogger);
            (0, vitest_1.expect)(rootLogger)
                .not.toBe(childLogger);
        });
    });
});
