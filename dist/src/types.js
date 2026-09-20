"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectionToken = void 0;
class InjectionToken {
    description;
    #type;
    constructor(description) {
        this.description = description;
    }
    toString() {
        return `InjectionToken(${this.description})`;
    }
}
exports.InjectionToken = InjectionToken;
