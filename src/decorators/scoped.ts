import { Scope } from "./scope"

export function Scoped(): ClassDecorator {
    return Scope('scoped')
}