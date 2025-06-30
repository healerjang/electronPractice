import React, {useEffect, useState} from 'react';
import '@styles/Header.scss'
import {useDispatch, useSelector} from "react-redux";
import {setStreamInfo} from "../slices/StreamInfoSlice";

const Header = () => {
    const selectWorkspace = useSelector(state => state.workspaceInfo);
    const [streamName, setStreamName] = useState("");
    const [streams, setStreams] = useState([]);
    const [activeModal, setActiveModal] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!selectWorkspace) return
        window.dbAPI.getStreams(selectWorkspace.no).then(result => {
            setStreams([])
            result.result.forEach((doc) => {
                setStreams((prep) => [...prep, doc])
            });
            if (streams[0] === undefined) return

            const defaultStream = streams[0]
            setStreamName(defaultStream.streamName);
            dispatch(setStreamInfo({
                no: defaultStream.streamNo,
                name: defaultStream.streamName,

            }));
        });
    }, [selectWorkspace]);

    return (
        <header>
            <div className="header-icon"></div>
            <div className="control-icon-box">
                <div className="setting-icon"></div>
                <div className="add-image-icon"></div>
                <div className="add-atis-icon"></div>
            </div>
            <div className="showing-info-box">
                <div className="info-container">
                    <div className="info-name">workspace</div>
                    <div className="workspace-name">{selectWorkspace === undefined ? "" : selectWorkspace.name}</div>
                </div>
                <div className="info-container">
                    <div className="info-name">stream</div>
                    <div className="stream-names-container">
                    <div className="stream-name">{streamName}</div>
                        {streams.map((item, i) => (
                            <div className="stream-name" key={i}>{item.streamName}</div>
                        ))}
                    </div>
                    <div className="dial-btn">
                        ▼
                    </div>
                </div>
            </div>
        </header>
    );
};


export default Header;