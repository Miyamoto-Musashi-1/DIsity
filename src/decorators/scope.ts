import { INJECTABLE_SCOPE } from "../metadata/keys";
import { Scope } from "../types";

export function Scope(scope: Scope): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(
            INJECTABLE_SCOPE,
            scope,
            target
        )
    }
}