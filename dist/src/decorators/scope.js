"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = Scope;
const keys_1 = require("../metadata/keys");
function Scope(scope) {
    return (target) => {
        Reflect.defineMetadata(keys_1.INJECTABLE_SCOPE, scope, target);
    };
}
