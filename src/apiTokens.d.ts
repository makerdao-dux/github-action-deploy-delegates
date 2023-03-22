//https://stackoverflow.com/questions/48230773/how-to-create-a-partial-like-that-requires-a-single-property-to-be-set
type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

type AllTokens = {
    WEB3_STORAGE_TOKEN: string,
    NFT_STORAGE_TOKEN: string
};

export type ApiTokens = AtLeastOne<AllTokens>;