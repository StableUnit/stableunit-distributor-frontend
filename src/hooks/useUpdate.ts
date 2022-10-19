import { useCallback, useContext, useEffect } from "react";
import { Actions } from "reducer";
import { DispatchContext, StateContext } from "reducer/constants";

// updateCallback should be in useCallback
export const useUpdate = (key: string, updateCallback: () => Promise<void>) => {
    const { updateFlag } = useContext(StateContext);
    const dispatch = useContext(DispatchContext);

    const startUpdate = useCallback(async () => {
        dispatch({ type: Actions.AddToUpdatePool, payload: key });
        await updateCallback();
        dispatch({ type: Actions.RemoveFromUpdatePool, payload: key });
    }, [dispatch, key, updateCallback]);

    useEffect(() => {
        if (updateFlag) {
            startUpdate();
        }
    }, [updateFlag, startUpdate]);
};
