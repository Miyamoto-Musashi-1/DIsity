import { Token } from "../types";
import { INJECT_TOKENS } from "../metadata/keys";

export function Inject(
    token: Token
): ParameterDecorator {

    return (
        target,
        _propertyKey,
        parameterIndex
    ) => {
        const existingTokens = 
        Reflect.getOwnMetadata(
            INJECT_TOKENS,
            target
        ) ?? {}

        existingTokens[parameterIndex] = token

        Reflect.defineMetadata(
            INJECT_TOKENS,
            existingTokens,
            target
        )
    }
}