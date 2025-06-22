import React from 'react';
import '@styles/App.scss'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Task from "@pages/Task";
import {useSelector} from "react-redux";
import Alert from "@components/Alert";

export default function App() {
    const alertMessage = useSelector(state => state.alerts); // null 또는 JSX

    return (
        <>
            <BrowserRouter>
                <div className="page">
                    <Routes>
                        <Route path="/" element={<Task/>} />
                    </Routes>
                </div>
            </BrowserRouter>
            <Alert></Alert>
        </>
    );
}
