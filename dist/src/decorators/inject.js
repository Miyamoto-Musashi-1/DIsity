"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = Inject;
const keys_1 = require("../metadata/keys");
function Inject(token) {
    return (target, _propertyKey, parameterIndex) => {
        const existingTokens = Reflect.getOwnMetadata(keys_1.INJECT_TOKENS, target) ?? {};
        existingTokens[parameterIndex] = token;
        Reflect.defineMetadata(keys_1.INJECT_TOKENS, existingTokens, target);
    };
}
