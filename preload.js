
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

(async () => {
    const insertTablePath = path.join(__dirname, 'insertTable.js');
    const systemPath = path.join(__dirname, 'system.js');

    let insertTableModule = null;
    let systemModule = null;

    try {
        insertTableModule = await import(insertTablePath);
        systemModule = await import(systemPath);
    } catch (e) {
        console.error('preload: 모듈 import 에러:', e);
    }

    const dbAPI = {};

    if (insertTableModule) {
        if (typeof insertTableModule.insertWorkspace === 'function') {
            dbAPI.insertWorkspace = async (workspaceName) => {
                try {
                    return await insertTableModule.insertWorkspace(workspaceName);
                } catch (e) {
                    console.error('preload.dbAPI.insertWorkspace 에러:', e);
                    return { success: false, workspaceNo: null };
                }
            };
        }
        if (typeof insertTableModule.insertImage === 'function') {
            dbAPI.insertImage = async (imagePath, workspaceNo) => {
                try {
                    return await insertTableModule.insertImage(imagePath, workspaceNo);
                } catch (e) {
                    console.error('preload.dbAPI.insertImage 에러:', e);
                    return { success: false, imageNo: null };
                }
            };
        }
        if (typeof insertTableModule.insertLabel === 'function') {
            dbAPI.insertLabel = async (labelName, parentLabelNo = null) => {
                try {
                    return await insertTableModule.insertLabel(labelName, parentLabelNo);
                } catch (e) {
                    console.error('preload.dbAPI.insertLabel 에러:', e);
                    return { success: false, labelNo: null };
                }
            };
        }
        if (typeof insertTableModule.insertSet === 'function') {
            dbAPI.insertSet = async (setName, parentLabelNo = null, parentSetNo = null) => {
                try {
                    return await insertTableModule.insertSet(setName, parentLabelNo, parentSetNo);
                } catch (e) {
                    console.error('preload.dbAPI.insertSet 에러:', e);
                    return { success: false, setNo: null };
                }
            };
        }
    }

    if (systemModule) {
        // system.js에 정의된 함수들 노출
        if (typeof systemModule.getWorkspaces === 'function') {
            dbAPI.getWorkspaces = async () => {
                try {
                    return await systemModule.getWorkspaces();
                } catch (e) {
                    console.error('preload.dbAPI.getWorkspaces 에러:', e);
                    throw e;
                }
            };
        }
        if (typeof systemModule.insertImagesByDir === 'function') {
            dbAPI.insertImagesByDir = async (folderPath, workspaceNo) => {
                try {
                    return await systemModule.insertImagesByDir(folderPath, workspaceNo);
                } catch (e) {
                    console.error('preload.dbAPI.insertImagesByDir 에러:', e);
                    return { success: false, inserted: 0, errors: [e.message] };
                }
            };
        }
        if (typeof systemModule.getMaxImageNo === 'function') {
            dbAPI.getMaxImageNo = async (workspaceNo) => {
                try {
                    return await systemModule.getMaxImageNo(workspaceNo);
                } catch (e) {
                    console.error('preload.dbAPI.getMaxImageNo 에러:', e);
                    throw e;
                }
            };
        }
        if (typeof systemModule.getImagesInRange === 'function') {
            dbAPI.getImagesInRange = async (workspaceNo, startNum, endNum) => {
                try {
                    return await systemModule.getImagesInRange(workspaceNo, startNum, endNum);
                } catch (e) {
                    console.error('preload.dbAPI.getImagesInRange 에러:', e);
                    throw e;
                }
            };
        }
        if (typeof systemModule.getLabelsByWorkspace === 'function') {
            dbAPI.getLabelsByWorkspace = async (workspaceNo) => {
                try {
                    return await systemModule.getLabelsByWorkspace(workspaceNo);
                } catch (e) {
                    console.error('preload.dbAPI.getLabelsByWorkspace 에러:', e);
                    throw e;
                }
            };
        }
        if (typeof systemModule.getSetsByWorkspace === 'function') {
            dbAPI.getSetsByWorkspace = async (workspaceNo) => {
                try {
                    return await systemModule.getSetsByWorkspace(workspaceNo);
                } catch (e) {
                    console.error('preload.dbAPI.getSetsByWorkspace 에러:', e);
                    throw e;
                }
            };
        }
        if (typeof systemModule.mapLabelToImage === 'function') {
            dbAPI.mapLabelToImage = async (labelNo, imageNo) => {
                try {
                    return await systemModule.mapLabelToImage(labelNo, imageNo);
                } catch (e) {
                    console.error('preload.dbAPI.mapLabelToImage 에러:', e);
                    return { success: false };
                }
            };
        }
        if (typeof systemModule.mapSetToImage === 'function') {
            dbAPI.mapSetToImage = async (setNo, imageNo) => {
                try {
                    return await systemModule.mapSetToImage(setNo, imageNo);
                } catch (e) {
                    console.error('preload.dbAPI.mapSetToImage 에러:', e);
                    return { success: false };
                }
            };
        }
    }

    try {
        contextBridge.exposeInMainWorld('electronAPI', {
            openFile: () => ipcRenderer.invoke('show-open-dialog'),
        });
        contextBridge.exposeInMainWorld('dbAPI', dbAPI);
    } catch (e) {
        console.error('❌ preload error:', e);
    }
})();
