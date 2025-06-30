
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from "react-redux";
import {setWorkspaceInfo} from "../slices/WorkspaceInfoSlice";
import '@styles/Task/Workspace.scss'

const Workspace = ({ workspaceNo, workspaceName}) => {
    const dispatch = useDispatch();
    const selectWorkspaceName = useSelector(state => state.workspaceInfo.workspaceName);

    const workSpaceClick = (async (workspaceNo) => {
        try{
            if (selectWorkspaceName === workspaceName) return
            dispatch(setWorkspaceInfo({
                no: workspaceNo,
                name: workspaceName,
            }));
        } catch (e) {
            window.ElectronAPI.logError("Workspace.jsx: streams load error, " + e);
        }
    });

    return (
        <div className={selectWorkspaceName === workspaceName ? "workspace-item-active" : "workspace-item"} onClick={() => workSpaceClick(workspaceNo)}>
            {workspaceName}
        </div>
    );
};

Workspace.propTypes = {
    workspaceNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    workspaceName: PropTypes.string.isRequired,
};

export default Workspace;
