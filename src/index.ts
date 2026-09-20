import 'reflect-metadata'

export { Container } from "./container"

export { 
    InjectionToken
} from './types'

export { Injectable } from './decorators/injectable'
export { Inject } from './decorators/inject'

export { Singleton } from './decorators/singleton'
export { Transient } from './decorators/transient'

export type {
    Constructor,
    Token,
    Provider,
    ClassProvider,
    ValueProvider,
    FactoryProvider,
    Scope
} from './types'