export type LinkType = {
    href: string;
    text: string;
    isDesktop: boolean;
    isMobile: boolean;
};

export type DistributionDataType = {
    startTimestamp: number;
    deadlineTimestamp: number;
    minimumDonationUsd: string;
    maximumDonationUsd: string;
    donationGoalMin: string;
    donationGoalMax: string;
    totalDonations: string;
    donationToken: string;
    fullVestingSeconds: number;
    cliffSeconds: number;
    tgeUnlockRatio1e18: string;
    vestingFrequencySeconds: number;
};

export type TokenMetadata = {
    address: string;
    symbol: string;
    decimals: number;
    image?: string;
};

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
    ? ElementType
    : never;
