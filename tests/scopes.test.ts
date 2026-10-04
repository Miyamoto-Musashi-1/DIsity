import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    Container,
    Injectable,
    Scoped,
    Singleton,
    Transient,
  } from "../src";
  
  describe("Scopes", () => {
    describe("transient", () => {
      it("creates a new instance for every resolution", () => {
        @Injectable()
        @Transient()
        class Service {}
  
        const container =
          new Container();
  
        container.register(Service);
  
        const first =
          container.resolve(Service);
  
        const second =
          container.resolve(Service);
  
        expect(first).not.toBe(second);
      });
    });
  
    describe("singleton", () => {
      it("returns the same instance", () => {
        @Injectable()
        @Singleton()
        class Service {}
  
        const container =
          new Container();
  
        container.register(Service);
  
        const first =
          container.resolve(Service);
  
        const second =
          container.resolve(Service);
  
        expect(first).toBe(second);
      });
  
      it("shares root singleton with children", () => {
        @Injectable()
        @Singleton()
        class Service {}
  
        const root =
          new Container();
  
        root.register(Service);
  
        const childA =
          root.createChild();
  
        const childB =
          root.createChild();
  
        const rootService =
          root.resolve(Service);
  
        const childAService =
          childA.resolve(Service);
  
        const childBService =
          childB.resolve(Service);
  
        expect(childAService)
          .toBe(rootService);
  
        expect(childBService)
          .toBe(rootService);
      });
    });
  
    describe("scoped", () => {
      it("returns the same instance within a scope", () => {
        @Injectable()
        @Scoped()
        class Service {}
  
        const root =
          new Container();
  
        root.register(Service);
  
        const child =
          root.createChild();
  
        const first =
          child.resolve(Service);
  
        const second =
          child.resolve(Service);
  
        expect(first).toBe(second);
      });
  
      it("creates different instances for different scopes", () => {
        @Injectable()
        @Scoped()
        class Service {}
  
        const root =
          new Container();
  
        root.register(Service);
  
        const childA =
          root.createChild();
  
        const childB =
          root.createChild();
  
        const rootService =
          root.resolve(Service);
  
        const childAService =
          childA.resolve(Service);
  
        const childBService =
          childB.resolve(Service);
  
        expect(rootService)
          .not.toBe(childAService);
  
        expect(childAService)
          .not.toBe(childBService);
  
        expect(rootService)
          .not.toBe(childBService);
      });
    });

    describe("child containers", () => {
        it("allows a child to override a provider", () => {
          @Injectable()
          @Singleton()
          class Logger {
            name = "logger";
          }
      
          class MockLogger extends Logger {
            name = "mock";
          }
      
          const root =
            new Container();
      
          root.register(Logger);
      
          const child =
            root.createChild();
      
          child.register(Logger, {
            useClass: MockLogger,
            scope: "singleton",
          });
      
          const rootLogger =
            root.resolve(Logger);
      
          const childLogger =
            child.resolve(Logger);
      
          expect(rootLogger)
            .toBeInstanceOf(Logger);
      
          expect(childLogger)
            .toBeInstanceOf(MockLogger);
      
          expect(rootLogger)
            .not.toBe(childLogger);
        });
      });

  });