"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const keys_1 = require("./metadata/keys");
const types_1 = require("./types");
class Container {
    parent;
    registry = new Map();
    instances = new Map();
    constructor(parent) {
        this.parent = parent;
    }
    register(token, provider) {
        this.instances.delete(token);
        if (!provider) {
            if (typeof token !== "function") {
                throw new Error(`Provider is required for ${this.tokenToString(token)}`);
            }
            this.registry.set(token, {
                useClass: token
            });
            return;
        }
        this.registry.set(token, provider);
    }
    resolve(token) {
        const context = {
            chain: []
        };
        return this.resolveToken(token, context);
    }
    createChild() {
        return new Container(this);
    }
    resolveToken(token, context) {
        if (context.chain.includes(token)) {
            throw new Error(this.createCircularDependencyMessage(context.chain, token));
        }
        context.chain.push(token);
        try {
            return this.resolveProvider(token, context);
        }
        finally {
            context.chain.pop();
        }
    }
    resolveProvider(token, context) {
        const entry = this.getProviderEntry(token);
        if (!entry) {
            throw new Error(`No provider found for ${this.tokenToString(token)}`);
        }
        const { provider, owner } = entry;
        if ("useValue" in provider) {
            return provider.useValue;
        }
        const scope = this.getScope(provider);
        if (scope === 'singleton' && owner.instances.has(token)) {
            return owner.instances.get(token);
        }
        let instance;
        if ("useClass" in provider) {
            const dependencyTokens = this.getDependencies(provider.useClass, provider.dependencies);
            const dependencies = dependencyTokens.map((dependency) => this.resolveToken(dependency, context));
            instance = new provider.useClass(...dependencies);
        }
        else if ("useFactory" in provider) {
            const dependencies = provider.dependencies?.map((dependency) => this.resolveToken(dependency, context)) ?? [];
            instance = provider.useFactory(...dependencies);
        }
        else {
            throw new Error("Unknow provider");
        }
        if (scope === 'singleton') {
            owner.instances.set(token, instance);
        }
        return instance;
    }
    getProviderEntry(token) {
        const provider = this.registry.get(token);
        if (provider) {
            return {
                provider: provider,
                owner: this
            };
        }
        return this.parent?.getProviderEntry(token);
    }
    getDependencies(target, explicitDependencies) {
        if (explicitDependencies) {
            return explicitDependencies;
        }
        const paramTypes = Reflect.getMetadata("design:paramtypes", target) ?? [];
        const injectedTokens = Reflect.getOwnMetadata(keys_1.INJECT_TOKENS, target) ?? {};
        return paramTypes.map((paramType, index) => injectedTokens[index] ?? paramType);
    }
    getScope(provider) {
        if ("useValue" in provider) {
            return 'singleton';
        }
        if (provider.scope) {
            return provider.scope;
        }
        if ("useClass" in provider) {
            return (Reflect.getMetadata(keys_1.INJECTABLE_SCOPE, provider.useClass) ?? 'transient');
        }
        return "transient";
    }
    createCircularDependencyMessage(chain, repeatedToken) {
        const cycleStart = chain.indexOf(repeatedToken);
        const cycle = [
            ...chain.slice(cycleStart),
            repeatedToken
        ];
        const path = cycle
            .map(token => this.tokenToString(token))
            .join(" -> ");
        return `Circular dependency detected: ${path}`;
    }
    tokenToString(token) {
        if (token instanceof types_1.InjectionToken) {
            return token.toString();
        }
        return token.name;
    }
}
exports.Container = Container;
