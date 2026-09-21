import { INJECT_TOKENS, INJECTABLE_SCOPE } from './metadata/keys'
import { ResolutionContext } from './resolution-context'
import { type Constructor, type Token, type Provider, InjectionToken, Scope } from './types'

interface ProviderEntry<T> {
    provider: Provider<T>,
    owner: Container
}

export class Container {
    private registry = new Map<Token<any>, Provider<any>>()
    private instances = new Map<Token<any>, any>()

    constructor(private readonly parent?: Container) {}

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
                useClass: token
            })

            return
        }

        this.registry.set(token, provider)
    }

    resolve<T>(token: Token<T>): T {
        const context: ResolutionContext = {
            chain: []
        }

        return this.resolveToken(token, context)
    }

    createChild(): Container {
        return new Container(this)
    }

    private resolveToken<T>(
        token: Token<T>,
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
            return this.resolveProvider<T>(
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
    ): T {
        const entry = this.getProviderEntry(token)

        if (!entry) {
            throw new Error(
                `No provider found for ${this.tokenToString(token)}`
            )
        }

        const { provider, owner } = entry

        if ("useValue" in provider) {
            return provider.useValue
        }

        const scope = this.getScope(provider);

        const instanceContainer = this.getInstanceContainer(scope, owner)

        if (instanceContainer?.instances.has(token)) {
            return instanceContainer.instances.get(token)
        }

        const resolutionContainer = scope === 'singleton' ? owner : this

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
                    resolutionContainer.resolveToken(
                        dependency,
                        context
                    )
            )

            instance = new provider.useClass(...dependencies)
        } else if ("useFactory" in provider) {
            const dependencies = provider.dependencies?.map(
                (dependency) => resolutionContainer.resolveToken(
                    dependency,
                    context
                )
            ) ?? []

            instance = provider.useFactory(...dependencies)
        } else {
            throw new Error("Unknow provider")
        }

        if (instanceContainer) {
            instanceContainer.instances.set(
                token,
                instance
            )
        }

        return instance
    }

    private getProviderEntry<T>(token: Token<T>): ProviderEntry<T> | undefined {
        const provider = this.registry.get(token)

        if (provider) {
            return {
                provider: provider as Provider<T>,
                owner: this
            }
        }

        return this.parent?.getProviderEntry(token)
    }

    private getInstanceContainer(scope: Scope, owner: Container): Container | undefined {
        if (scope === 'singleton') {
            return owner
        }

        if (scope === 'scoped') {
            return this
        }

        return undefined
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

    getScope(
        provider: Provider<any>
    ): Scope {
        if ("useValue" in provider) {
            return 'singleton'
        }

        if (provider.scope) {
            return provider.scope
        }

        if ("useClass" in provider) {
            return (
                Reflect.getMetadata(
                    INJECTABLE_SCOPE,
                    provider.useClass,
                ) ?? 'transient'
            )
        }

        return "transient"
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