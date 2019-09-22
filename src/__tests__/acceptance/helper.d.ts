import { ShoppingApplication } from '../..';
import { Client } from '@loopback/testlab';
export interface AppWithClient {
    app: ShoppingApplication;
    client: Client;
}
export declare function setupApplication(): Promise<AppWithClient>;
