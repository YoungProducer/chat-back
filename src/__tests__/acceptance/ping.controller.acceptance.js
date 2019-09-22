"use strict";
// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const helper_1 = require("./helper");
describe('PingController', () => {
    let app;
    let client;
    before('setupApplication', async () => {
        ({ app, client } = await helper_1.setupApplication());
    });
    after(async () => {
        await app.stop();
    });
    it('invokes GET /ping', async () => {
        const res = await client.get('/ping?msg=world').expect(200);
        testlab_1.expect(res.body).to.containEql({ greeting: 'Hello from LoopBack' });
    });
});
//# sourceMappingURL=ping.controller.acceptance.js.map