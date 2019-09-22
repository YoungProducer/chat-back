"use strict";
// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const testlab_1 = require("@loopback/testlab");
async function setupApplication() {
    const app = new __1.ShoppingApplication({
        rest: testlab_1.givenHttpServerConfig(),
    });
    await app.boot();
    await app.start();
    const client = testlab_1.createRestAppClient(app);
    return { app, client };
}
exports.setupApplication = setupApplication;
//# sourceMappingURL=helper.js.map