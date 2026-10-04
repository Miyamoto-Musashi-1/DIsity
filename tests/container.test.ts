import { describe, expect, it } from 'vitest'

import {
    Container,
    Inject,
    Injectable,
    InjectionToken
} from "../src"

describe("Container", () => {
    it("resolves a register class", () => {
        @Injectable()
        class UserService {}

        const container = new Container()

        container.register(UserService)

        const service = container.resolve(UserService)

        expect(service).toBeInstanceOf(UserService)
    })

    it("injects class dependencies", () => {
        @Injectable()
        class UserRepository {}
    
        @Injectable()
        class UserService {
          constructor(
            public readonly repository:
              UserRepository
          ) {}
        }
    
        const container =
          new Container();
    
        container.register(UserRepository);
        container.register(UserService);
    
        const service =
          container.resolve(UserService);
    
        expect(service.repository)
          .toBeInstanceOf(UserRepository);
      });

      it("resolves value providers", () => {
        const API_URL =
          new InjectionToken<string>(
            "API_URL"
          );
    
        const container =
          new Container();
    
        container.register(API_URL, {
          useValue:
            "https://api.example.com",
        });
    
        expect(
          container.resolve(API_URL)
        ).toBe(
          "https://api.example.com"
        );
      });

      it("supports @Inject token overrides", () => {
        const API_URL =
          new InjectionToken<string>(
            "API_URL"
          );
    
        @Injectable()
        class ApiClient {
          constructor(
            @Inject(API_URL)
            public readonly baseUrl: string
          ) {}
        }
    
        const container =
          new Container();
    
        container.register(API_URL, {
          useValue:
            "https://api.example.com",
        });
    
        container.register(ApiClient);
    
        const api =
          container.resolve(ApiClient);
    
        expect(api.baseUrl).toBe(
          "https://api.example.com"
        );
      });
    
      it("resolves factory providers", () => {
        const API_URL =
          new InjectionToken<string>(
            "API_URL"
          );
    
        const API_CLIENT =
          new InjectionToken<{
            baseUrl: string;
          }>("API_CLIENT");
    
        const container =
          new Container();
    
        container.register(API_URL, {
          useValue:
            "https://api.example.com",
        });
    
        container.register(API_CLIENT, {
          useFactory: (
            baseUrl: string
          ) => ({
            baseUrl,
          }),
          dependencies: [API_URL],
        });
    
        const api =
          container.resolve(API_CLIENT);
    
        expect(api).toEqual({
          baseUrl:
            "https://api.example.com",
        });
      });
    
      it("throws for an unregistered token", () => {
        @Injectable()
        class MissingService {}
    
        const container =
          new Container();
    
        expect(() =>
          container.resolve(
            MissingService
          )
        ).toThrow(
          "No provider found for MissingService"
        );
      });
    
      it("clears cached instance when re-registering", () => {
        const SERVICE =
          new InjectionToken<object>(
            "SERVICE"
          );
    
        const first = {};
        const second = {};
    
        const container =
          new Container();
    
        container.register(SERVICE, {
          useValue: first,
        });
    
        expect(
          container.resolve(SERVICE)
        ).toBe(first);
    
        container.register(SERVICE, {
          useValue: second,
        });
    
        expect(
          container.resolve(SERVICE)
        ).toBe(second);
      });
})