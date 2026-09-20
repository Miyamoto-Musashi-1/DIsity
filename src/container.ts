import { INJECT_TOKENS } from './metadata/keys'
import { ResolutionContext } from './resolution-context'
import { type Constructor, type Token, type Provider, InjectionToken } from './types'

export class Container {
    private registry = new Map<Token<any>, Provider<any>>()
    private instances = new Map<Token<any>, any>()

    register<T>(target: Constructor<T>): void
    
    register<T>(
        token: Token<T>,
        provider: Provider<T>
    ): void

    register<T>(
        token: Token<T>,
        provider?: Provider<T>
    ): void {
        this.instances.delete(token)

        if (!provider) {
            if (typeof token !== "function") {
                throw new Error(
                    `Provider is required for ${this.tokenToString(token)}`
                )
            }

            this.registry.set(token, {
                useClass: token,
                scope: 'transient'
            })

            return
        }

        this.registry.set(token, provider)
    }

    resolve<T>(token: Token<T>) {
        const context: ResolutionContext = {
            chain: []
        }

        return this.resolveToken(token, context)
    }

    resolveToken<T>(
        token: Token,
        context: ResolutionContext
    ): T {
        if (context.chain.includes(token)) {
            throw new Error(
                this.createCircularDependencyMessage(
                    context.chain,
                    token
                )
            )
        }

        context.chain.push(token)

        try {
            return this.resolveProvider(
                token,
                context
            )
        } finally {
            context.chain.pop()
        }
    }

    private resolveProvider<T>(
        token: Token<T>,
        context: ResolutionContext
    ) {
        const provider = this.registry.get(token)

        if (!provider) {
            throw new Error(
                `No provider found for ${this.tokenToString(token)}`
            )
        }

        if ("useValue" in provider) {
            return provider.useValue
        }

        const scope = provider.scope ?? 'transient'

        if (scope === 'singleton' && this.instances.has(token)) {
            return this.instances.get(token)
        }

        let instance: T

        if ("useClass" in provider) {
            const dependencyTokens = 
            this.getDependencies(
                provider.useClass,
                provider.dependencies
            )

            const dependencies = 
            dependencyTokens.map(
                (dependency) => 
                    this.resolveToken(
                        dependency,
                        context
                    )
            )

            instance = new provider.useClass(...dependencies)
        } else if ("useFactory" in provider) {
            const dependencies = provider.dependencies?.map(
                (dependency) => this.resolveToken(
                    dependency,
                    context
                )
            ) ?? []

            instance = provider.useFactory(...dependencies)
        } else {
            throw new Error("Unknow provider")
        }

        if (scope === 'singleton') {
            this.instances.set(token, instance)
        }

        return instance
    }

    private getDependencies(
        target: Constructor<any>,
        explicitDependencies?: Token[]
    ): Token[] {
        if (explicitDependencies) {
            return explicitDependencies
        }

        const paramTypes =
        Reflect.getMetadata(
            "design:paramtypes",
            target
        ) ?? []

        const injectedTokens: Record<number, Token> =
        Reflect.getOwnMetadata(
            INJECT_TOKENS,
            target,
        ) ?? {}

        return paramTypes.map(
            (paramType: Token, index: number) => 
                injectedTokens[index] ?? paramType
        )
    }

    private createCircularDependencyMessage(
        chain: Token[],
        repeatedToken: Token
    ): string {
        const cycleStart = 
        chain.indexOf(repeatedToken)

        const cycle = [
            ...chain.slice(cycleStart),
            repeatedToken
        ]

        const path = cycle
        .map(token => 
            this.tokenToString(token)
        )
        .join(" -> ")

        return `Circular dependency detected: ${path}`
    }

    private tokenToString(token: Token): string {
        if (token instanceof InjectionToken) {
            return token.toString()
        }

        return token.name
    }
}