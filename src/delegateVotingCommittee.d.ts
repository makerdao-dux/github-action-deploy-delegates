export type Strategy = {
    name: string;
    description: string;
    delegates: string[];
};

export type DelelegateVotingCommittee = {
    name: string;
    image: string;
    externalProfileURL: string;
    description: string;
    strategies: Strategy[];
};
