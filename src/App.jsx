import React from 'react';
import '@styles/App.scss'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Task from "@pages/Task";

export default function App() {

    return (
        <BrowserRouter>
            <div className="page">
                <Routes>
                    <Route path="/" element={<Task/>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
