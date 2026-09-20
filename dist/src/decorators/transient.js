"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transient = Transient;
const scope_1 = require("./scope");
function Transient() {
    return (0, scope_1.Scope)('transient');
}
