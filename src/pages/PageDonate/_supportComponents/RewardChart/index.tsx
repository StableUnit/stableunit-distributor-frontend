import React, { useState } from "react";
import cn from "classnames";
import { ComposedChart, Line, XAxis, YAxis, Area, CartesianGrid, Tooltip } from "recharts";
import { useTotalDonation, useBonusRewarded } from "hooks";
import { GradientHref } from "ui-kit";

import "./styles.scss";

const getPrice = (x: number) => {
    // return 2025000000000 / ((-1500000 + x) * (-1500000 + x));
    return 1.1 - x * 1e-7 * 3;
    // return 1000000000000000000 / x ** 3;
    // return 25000000000 / x ** 1.8;
    // return 250000000 / x ** 1.5;
};

const DOT_STEP = 2000;

type DataType = {
    supply: number;
    rewardRatePast: number;
    rewardRateFuture: number;
};

interface DotProps {
    payload: DataType;
    cx: number;
    cy: number;
    stroke: string;
    value: any;
}

interface TooltipProps {
    label: number;
    active: boolean;
}

const CustomTooltip = ({ active, label }: TooltipProps) => {
    if (active) {
        return (
            <div className="custom-tooltip">
                <p className="donation">Donation count: {label.toLocaleString()}</p>
                <p className="rewards">Reward per donation: {getPrice(label).toFixed(3).toLocaleString()}</p>
            </div>
        );
    }

    return null;
};

const CustomTooltipPrice = ({ active, payload }: any) => {
    if (active) {
        const isLocked = payload[0].payload.bonusRewarded > 0;
        const price = payload[0].payload.priceBefore ?? payload[0].payload.priceAfter;
        return (
            <div className="custom-tooltip">
                <p className="donation">Total SuDAO tokens: {(+payload[0].payload.sum.toFixed(2)).toLocaleString()}</p>
                <p className="rewards">USD per SuDAO: {price.toFixed(3).toLocaleString()}</p>
                {isLocked && <p className="rewards">This tokens are reserved</p>}
            </div>
        );
    }

    return null;
};

type DataPriceType = {
    priceBefore: number | null;
    priceAfter: number | null;
    bonusRewarded: number | null;
    sum: number;
};

export const RewardChart = () => {
    const [selectedTab, setSelectedTab] = useState<"rewards" | "price">("price");
    const { totalDonation } = useTotalDonation();
    const currentSupplyPrice = getPrice(totalDonation);
    const { bonusRewarded } = useBonusRewarded();
    const bonusRewardedStart = 1_500_000 - bonusRewarded;
    const [isBonusRewardedDotAdded, setIsBonusRewardedDotAdded] = useState(false);

    const dataPrice = [] as DataPriceType[];
    let data = new Array(905).fill(0).map((_, i) => {
        const dotSupply = i * DOT_STEP;
        const isBeforeCurrentSupply = dotSupply < totalDonation;
        const price = getPrice(dotSupply);

        const newSum = (dataPrice.length ? dataPrice[dataPrice.length - 1].sum : 0) + price * DOT_STEP;

        if (dotSupply === totalDonation) {
            dataPrice.push({
                priceBefore: 1 / price,
                priceAfter: 1 / price,
                bonusRewarded: null,
                sum: newSum,
            });

            return undefined;
        }

        if (newSum > bonusRewardedStart && !isBonusRewardedDotAdded) {
            const lastData = dataPrice[dataPrice.length - 1];
            dataPrice[dataPrice.length - 1].bonusRewarded = lastData.priceBefore ?? lastData.priceAfter;
            setIsBonusRewardedDotAdded(true);
        }

        dataPrice.push({
            priceBefore: isBeforeCurrentSupply ? 1 / price : null,
            priceAfter: isBeforeCurrentSupply ? null : 1 / price,
            bonusRewarded: newSum >= bonusRewardedStart ? 1 / price : null,
            sum: newSum,
        });

        return {
            supply: dotSupply,
            rewardRatePast: isBeforeCurrentSupply ? price : null,
            rewardRateFuture: isBeforeCurrentSupply ? null : price,
        };
    });

    data = data.filter((v) => v);
    data.push({ supply: totalDonation, rewardRatePast: currentSupplyPrice, rewardRateFuture: currentSupplyPrice });
    // @ts-ignore
    data.sort((a, b) => a.supply - b.supply);

    return (
        <div className="reward-chart">
            <div className="reward-chart__navbar">
                <GradientHref
                    className={cn("reward-chart__navbar__title", {
                        "reward-chart__navbar__title--selected": selectedTab === "price",
                    })}
                    onClick={() => setSelectedTab("price")}
                >
                    Donation amount per reward
                </GradientHref>
                <GradientHref
                    className={cn("reward-chart__navbar__title", {
                        "reward-chart__navbar__title--selected": selectedTab === "rewards",
                    })}
                    onClick={() => setSelectedTab("rewards")}
                >
                    Rewards per donation
                </GradientHref>
            </div>
            <div className="reward-chart__content">
                <div
                    className={cn("reward-chart__content__chart", {
                        "reward-chart__content__chart--visible": selectedTab === "rewards",
                    })}
                >
                    <ComposedChart
                        width={730}
                        height={450}
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="-12%" stopColor="#DBB0FF" stopOpacity={1} />
                                <stop offset="24%" stopColor="#C2DCFF" stopOpacity={1} />
                                <stop offset="63%" stopColor="#B4FFE0" stopOpacity={1} />
                                <stop offset="82%" stopColor="#FEFBDA" stopOpacity={1} />
                                <stop offset="110%" stopColor="#FECBFF" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        {/* @ts-ignore */}
                        <Tooltip content={<CustomTooltip />} />
                        <CartesianGrid vertical={false} stroke="#313131" />
                        <XAxis
                            domain={[0, 1500000]}
                            type="number"
                            label={{ value: "Donations", position: "bottom", offset: 0 }}
                            dataKey="supply"
                        />
                        <YAxis
                            domain={[0, 1.2]}
                            allowDataOverflow
                            type="number"
                            label={{ value: "Reward rate", angle: -90, position: "insideLeft" }}
                        />
                        <Line type="monotone" dataKey="rewardRatePast" stroke="#7A7A7A" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="rewardRateFuture" stroke="#7A7A7A" strokeWidth={2} dot={false} />
                        <Area type="monotone" dataKey="rewardRatePast" stroke="" fillOpacity={1} fill="url(#colorUv)" />
                    </ComposedChart>
                </div>

                <div
                    className={cn("reward-chart__content__chart", {
                        "reward-chart__content__chart--visible": selectedTab === "price",
                    })}
                >
                    <ComposedChart
                        width={730}
                        height={450}
                        data={dataPrice}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorUv2" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="-12%" stopColor="#DBB0FF" stopOpacity={1} />
                                <stop offset="24%" stopColor="#C2DCFF" stopOpacity={1} />
                                <stop offset="63%" stopColor="#B4FFE0" stopOpacity={1} />
                                <stop offset="82%" stopColor="#FEFBDA" stopOpacity={1} />
                                <stop offset="110%" stopColor="#FECBFF" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <Tooltip content={<CustomTooltipPrice />} />
                        <CartesianGrid vertical={false} stroke="#313131" />
                        <XAxis
                            ticks={[300000, 600000, 900000, 1200000, 1500000]}
                            domain={[0, 1500000]}
                            allowDataOverflow
                            type="number"
                            label={{ value: "Sum", position: "bottom", offset: 0 }}
                            dataKey="sum"
                        />
                        <YAxis type="number" label={{ value: "Price", angle: -90, position: "insideLeft" }} />
                        <Line type="monotone" dataKey="priceAfter" stroke="#7A7A7A" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="priceBefore" stroke="#7A7A7A" strokeWidth={2} dot={false} />
                        <Area type="monotone" dataKey="priceBefore" stroke="" fillOpacity={1} fill="url(#colorUv2)" />
                        <Area type="monotone" dataKey="bonusRewarded" stroke="" fillOpacity={1} fill="#7A7A7A" />
                    </ComposedChart>
                </div>
            </div>
        </div>
    );
};
