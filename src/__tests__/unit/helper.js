"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("../../application");
const testlab_1 = require("@loopback/testlab");
async function setupApplication() {
    const app = new application_1.ShoppingApplication({
        rest: testlab_1.givenHttpServerConfig(),
    });
    await app.boot();
    await app.start();
    return app;
}
exports.setupApplication = setupApplication;
//# sourceMappingURL=helper.js.map