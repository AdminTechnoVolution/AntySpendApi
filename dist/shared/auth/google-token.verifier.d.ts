import { ConfigService } from '@nestjs/config';
export interface GoogleProfile {
    googleSub: string;
    email: string;
    name: string;
    picture?: string;
}
export declare class GoogleTokenVerifier {
    private readonly config;
    private readonly client;
    constructor(config: ConfigService);
    verifyIdToken(idToken: string): Promise<GoogleProfile>;
}
