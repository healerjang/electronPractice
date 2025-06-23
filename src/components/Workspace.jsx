import React, {useCallback} from 'react';
import PropTypes from 'prop-types';

const Workspace = ({ workspaceNo, workspaceName}) => {
    const workSpaceClick = (async (workspaceNo) => {
        try{
            const res = await window.dbAPI.getStreams(workspaceNo);
            res.result.forEach((doc) => {
                window.ElectronAPI.logInfo(doc);
            })
        } catch (e) {
            window.ElectronAPI.logError("Workspace.jsx: streams load error, " + e);
        }
    });

    return (
        <div className="workspace-item" onClick={() => workSpaceClick(workspaceNo)}>
            <span className="workspace-name">{workspaceName}</span>
        </div>
    );
};

Workspace.propTypes = {
    workspaceNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    workspaceName: PropTypes.string.isRequired,
};

export default Workspace;
