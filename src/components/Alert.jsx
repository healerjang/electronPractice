import React from 'react';
import {useDispatch} from "react-redux";
import {setAlertComponent} from "../slices/AlertSlice";

const Alert = (message) => {
    const dispatch = useDispatch();

    const okClick = () => {
        dispatch(setAlertComponent(<></>))
    }

    return (
        <div className="alertPage">
            message
            <button onClick={okClick}></button>
        </div>
    );
};

export default Alert;