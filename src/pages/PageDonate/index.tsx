import React from "react";

import { Donate } from "./_supportComponents/Donate";
import { Links } from "./_supportComponents/Links";

import "./styles.scss";

interface Props {
    onConnect: () => void;
}

export const PageDonate = ({ onConnect }: Props) => {
    return (
        <div className="profile-donate">
            <div className="profile-donate__content">
                <Donate onConnect={onConnect} />
                <Links />
            </div>
        </div>
    );
};
