import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {setAlertMessage} from "../slices/AlertSlice";
import '@styles/Alert.scss'

const Alert = () => {
    const dispatch = useDispatch();
    const alertMessage = useSelector(state => state.alert);

    const okClick = () => {
        dispatch(setAlertMessage(""))
    }

    useEffect(() => {
        console.log("alertMessage", alertMessage)
    })

    return (
        <>
            {
                alertMessage === "" ? <></> :
                    <div className="alertPage">
                        <div className="alert">
                            <div className="text-field">
                                {alertMessage}
                            </div>
                            <div className="check_button_container">
                                <div className="check_button" onClick={okClick}>확인</div>
                            </div>
                        </div>
                    </div>
            }</>
    );
};

export default Alert;