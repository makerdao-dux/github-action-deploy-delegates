
export type Metrics = {
  combinedParticipation?: string;
  pollParticipation?: string;
  executiveParticipation?: string;
  communication?: string;
};

export type Delegate = {
  voteDelegateAddress: string;
  image: string;
  profile: Profile;
  metrics: Metrics;
  cuMember: boolean
};

export type Profile = {
  name: string;
  description: string,
  tags: string[];
  externalProfileURL: string;
};

export type Tag = {
  id: string;
  shortname: string;
  longname: string;
  description: string;
};
