import React from 'react';
import '@styles/App.scss'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Task from "@pages/Task";
import {useSelector} from "react-redux";
import Alert from "@components/Alert";
import Header from "@components/Header";

export default function App() {

    return (
        <>
            <BrowserRouter>
                <div className="container">
                    <Header></Header>
                    <div className="page">
                        <Routes>
                            <Route path="/" element={<Task/>} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
            <Alert></Alert>
        </>
    );
}
