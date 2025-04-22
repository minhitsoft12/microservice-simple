const ProviderEnum = {
    GOOGLE: "GOOGLE",
    EMAIL: "EMAIL",
};

export { ProviderEnum };

export type ProviderEnumType = keyof typeof ProviderEnum;
