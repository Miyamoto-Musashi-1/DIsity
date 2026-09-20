import { Scope } from "./scope"

export function Singleton(): ClassDecorator {
    return Scope('singleton')
}