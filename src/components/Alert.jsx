import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {setAlertMessage} from "../slices/AlertSlice";
import '@styles/Alert.scss'

const Alert = () => {
    const dispatch = useDispatch();
    const alertMessage = useSelector(state => state.alerts);

    const okClick = () => {
        dispatch(setAlertMessage(""))
    }

    return (
        <>
            {
                alertMessage === "" ? <></> :
                    <div className="alertPage">
                        {alertMessage}
                        <button onClick={okClick}></button>
                    </div>
            }</>
    );
};

export default Alert;