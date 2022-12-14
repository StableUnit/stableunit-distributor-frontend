import { useContext, useEffect, useState } from "react";

import { StateContext } from "reducer/constants";
import { DistributorFactory } from "utils/api";
import { NULL_ADDRESS } from "utils/network";

export const useAccessNFTs = () => {
    const { currentAddress } = useContext(StateContext);
    const [accessNFTs, setAccessNFTs] = useState<string[]>();

    const updateData = async () => {
        if (currentAddress) {
            setAccessNFTs(await DistributorFactory.getAccessNFTs());
        }
    };

    useEffect(() => {
        updateData();
    }, [currentAddress]);

    return accessNFTs?.filter((v) => v !== NULL_ADDRESS);
};
