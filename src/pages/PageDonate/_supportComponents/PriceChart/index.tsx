import React from "react";
import { ComposedChart, Line, XAxis, YAxis, Area, CartesianGrid, Tooltip } from "recharts";

import "./styles.scss";

const getPrice = (x: number) => 100 + (x * x) / 1e9;

const DOT_STEP = 5000;

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

const currentSupply = 205100;

const CustomTooltip = ({ active, label }: TooltipProps) => {
    if (active) {
        return (
            <div className="custom-tooltip">
                <p className="donation">Donation count: {label.toLocaleString()}</p>
                <p className="rewards">Reward per donation: {getPrice(label).toFixed(1).toLocaleString()}</p>
            </div>
        );
    }

    return null;
};

export const PriceChart = () => {
    // const totalSupply = 1e6;
    const currentSupplyPrice = getPrice(currentSupply);
    const data = new Array(201).fill(0).map((_, i) => {
        const dotSupply = i * DOT_STEP;
        const isBeforeCurrentSupply = dotSupply < currentSupply;
        const price = getPrice(dotSupply);

        return {
            supply: dotSupply,
            rewardRatePast: isBeforeCurrentSupply ? price : null,
            rewardRateFuture: isBeforeCurrentSupply ? null : price,
        };
    });

    data.push({ supply: currentSupply, rewardRatePast: currentSupplyPrice, rewardRateFuture: currentSupplyPrice });
    data.sort((a, b) => a.supply - b.supply);

    return (
        <div className="price-chart">
            <div className="info-container__title">Rewards per donation</div>
            <div className="price-chart__content">
                <ComposedChart
                    width={700}
                    height={500}
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
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid vertical={false} stroke="#313131" />
                    <XAxis
                        type="number"
                        label={{ value: "Donations", position: "bottom", offset: 0 }}
                        dataKey="supply"
                    />
                    <YAxis type="number" label={{ value: "Reward rate", angle: -90, position: "insideLeft" }} />
                    <Line type="monotone" dataKey="rewardRatePast" stroke="#7A7A7A" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="rewardRateFuture" stroke="#7A7A7A" strokeWidth={2} dot={false} />
                    <Area
                        type="monotone"
                        dataKey="rewardRatePast"
                        stroke=""
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorUv)"
                    />
                </ComposedChart>
            </div>
        </div>
    );
};
