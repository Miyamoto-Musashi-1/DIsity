"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scoped = Scoped;
const scope_1 = require("./scope");
function Scoped() {
    return (0, scope_1.Scope)('scoped');
}
