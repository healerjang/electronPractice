import React from 'react';
import PropTypes from 'prop-types';

const Workspace = ({ workspaceNo, workspaceName, onClick }) => {
    return (
        <div
            className="workspace-item"
            data-workspace-no={workspaceNo}
            onClick={() => {
                if (onClick) onClick(workspaceNo);
            }}
            style={{
                padding: '8px 12px',
                cursor: onClick ? 'pointer' : 'default',
                borderBottom: '1px solid #e0e0e0',
            }}
        >
            <span className="workspace-name">{workspaceName}</span>
        </div>
    );
};

Workspace.propTypes = {
    workspaceNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    workspaceName: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

export default Workspace;
