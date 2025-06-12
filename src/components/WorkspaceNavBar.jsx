import React, {useEffect, useState} from 'react';
import "@styles/Task/WorkspaceNavBar.scss"
import { MdFirstPage, MdLastPage  } from "react-icons/md";
import { MdOutlineLibraryAdd } from "react-icons/md";

const WorkspaceNavBar = () => {
    const [width, setWidth] = useState(300);
    const [isOpen, setIsOpen] = useState(true);
    const [value, setValue] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaces, setWorkspaces] = useState([]);

    useEffect(() => {
        if (!window.dbAPI) {
            console.error('dbAPI가 아직 없음');
            return;
        }
        (async () => {
            try {
                const res = await window.dbAPI.getWorkspaces();
                setWorkspaces(res.result);
            } catch (e) {
                console.error('워크스페이스 로드 에러:', e);
            }
        })();
    }, []);

    const handleToggle = () => {
        if (isOpen) {
            setWidth(0);
            setIsOpen(false);
        } else {
            setWidth(300);
            setIsOpen(true);
        }
    };

    const handleClick = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        addWorkspace(trimmed);
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
                setWorkspaces(prev => [...prev, { workspaceNo, workspaceName: name }]);
                setWorkspaceName('');
            } else {
                console.warn('워크스페이스 삽입 실패');
            }
        } catch (e) {
            console.error('addWorkspace 에러:', e);
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
            </nav>
            <div className="dialBtn" onClick={handleToggle} style={{left:`${width}px`}}>
                {isOpen ? <MdFirstPage className="dialBtnIcon"/> : <MdLastPage className="dialBtnIcon"/>}
            </div>
        </>
    );
};

export default WorkspaceNavBar;