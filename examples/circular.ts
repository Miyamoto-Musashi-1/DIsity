import { Container, Injectable } from "../src";

@Injectable()
class ServiceA {}

@Injectable()
class ServiceB {}

@Injectable()
class ServiceC {}

const container = new Container()

container.register(ServiceA, {
    useClass: ServiceA,
    dependencies: [ServiceB]
})

container.register(ServiceB, {
    useClass: ServiceB,
    dependencies: [ServiceC]
})

container.register(ServiceC, {
    useClass: ServiceC,
    dependencies: [ServiceA]
})

container.resolve(ServiceA)