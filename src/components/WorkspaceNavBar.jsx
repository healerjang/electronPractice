import React, {useEffect, useState} from 'react';
import "@styles/Task/WorkspaceNavBar.scss"
import { MdFirstPage, MdLastPage  } from "react-icons/md";
import { MdOutlineLibraryAdd } from "react-icons/md";
import {setAlertMessage} from "../slices/AlertSlice";
import { useDispatch } from 'react-redux';
import Alert from "@components/Alert";
import Workspace from "@components/Workspace";

const WorkspaceNavBar = () => {
    const dispatch = useDispatch();

    const [width, setWidth] = useState(280);
    const [isOpen, setIsOpen] = useState(true);
    const [value, setValue] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaces, setWorkspaces] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await window.dbAPI.getWorkspaces();
                setWorkspaces(res.result);
            } catch (e) {
                window.ElectronAPI.logError("WorkspaceNavBar.jsx: workspaces load error, " + e);
            }
        })();
    }, []);

    const handleToggle = () => {
        if (isOpen) {
            setWidth(0);
            setIsOpen(false);
        } else {
            setWidth(280);
            setIsOpen(true);
        }
    };

    const handleClick = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        addWorkspace(trimmed).then(() => {});
        setValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleClick();
        }
    };

    const addWorkspace = async (name) => {
        if (!name) return;
        try {
            const { success, workspaceNo } = await window.dbAPI.insertWorkspace(name);
            if (success) {
                setWorkspaces(prev => [...prev, { workspaceNo: workspaceNo, workspaceName: name }]);
                setWorkspaceName('');
            } else {
                dispatch(setAlertMessage("이미 존재하는 워크스페이스명입니다."))
                window.ElectronAPI.logError("WorkspaceNavBar.jsx: fali workspace insert")
            }
        } catch (e) {
            window.ElectronAPI.logError("WorkspaceNavBar.jsx: addWorkspace error, " + e);
        }
    };

    return (
        <>
            <nav style={{ width: `${width}px`, transition: 'width 0.3s ease' }}>
                <div className="addWorkspace" style={{display: isOpen ? 'flex' : 'none'}}>
                    <input
                        type="text"
                        className="addWorkspaceInput"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="추가할 이름 입력"
                    />
                    <div
                        className="addWorkspaceBtn"
                        onClick={handleClick}
                    >
                        {<MdOutlineLibraryAdd   className="addIcon"/>}
                    </div>
                </div>
                <div className="workspaceContain">
                    {
                        workspaces.map((item) => (
                            <Workspace workspaceName={item.workspaceName} workspaceNo={item.workspaceNo} key={item.workspaceNo}></Workspace>
                        ))
                    }
                </div>
            </nav>
            <div className="dialBtn" onClick={handleToggle} style={{left:`${width}px`}}>
                {isOpen ? <MdFirstPage className="dialBtnIcon"/> : <MdLastPage className="dialBtnIcon"/>}
            </div>
        </>
    );
};

export default WorkspaceNavBar;