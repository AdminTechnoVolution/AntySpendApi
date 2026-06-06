declare const _default: () => {
    port: number;
    mongodbUri: string | undefined;
    jwt: {
        secret: string | undefined;
        accessExpires: string;
        refreshExpires: string;
    };
    google: {
        clientId: string | undefined;
    };
    openRouter: {
        apiKey: string;
        model: string;
    };
    exchangeRate: {
        apiToken: string;
    };
    rateLimit: {
        max: number;
        ttlMs: number;
    };
    enableSwagger: boolean;
};
export default _default;
