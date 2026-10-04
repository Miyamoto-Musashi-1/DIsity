import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    Container,
    Injectable,
  } from "../src";
  
  describe(
    "Circular dependency detection",
    () => {
      it(
        "throws with the dependency path",
        () => {
          @Injectable()
          class ServiceA {}
  
          @Injectable()
          class ServiceB {}
  
          @Injectable()
          class ServiceC {}
  
          const container =
            new Container();
  
          container.register(
            ServiceA,
            {
              useClass: ServiceA,
              dependencies: [
                ServiceB,
              ],
            }
          );
  
          container.register(
            ServiceB,
            {
              useClass: ServiceB,
              dependencies: [
                ServiceC,
              ],
            }
          );
  
          container.register(
            ServiceC,
            {
              useClass: ServiceC,
              dependencies: [
                ServiceA,
              ],
            }
          );
  
          expect(() =>
            container.resolve(ServiceA)
          ).toThrow(
            "Circular dependency detected: ServiceA -> ServiceB -> ServiceC -> ServiceA"
          );
        }
      );
    }
  );