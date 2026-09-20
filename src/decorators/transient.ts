import { Scope } from "./scope";

export function Transient(): ClassDecorator {
    return Scope('transient')
}