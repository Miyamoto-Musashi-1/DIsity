"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Singleton = Singleton;
const scope_1 = require("./scope");
function Singleton() {
    return (0, scope_1.Scope)('singleton');
}
