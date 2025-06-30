const { contextBridge, ipcRenderer } = require('electron');

console.log("preload load")

contextBridge.exposeInMainWorld('ElectronAPI', {
    openFile: () => ipcRenderer.invoke('show-open-dialog'),
    logDebug: (message) => ipcRenderer.send('logging', 'debug', message),
    logInfo: (message) => ipcRenderer.send('logging', 'info', message),
    logWarning: (message) => ipcRenderer.send('logging', 'warn', message),
    logError: (message) => ipcRenderer.send('logging', 'error', message),
});

contextBridge.exposeInMainWorld('dbAPI', {
    getWorkspaces: async () => {
        try {
            return await ipcRenderer.invoke('getWorkspaces');
        } catch (e) {
            return { result: [] };
        }
    },
    insertWorkspace: async (workspaceName) => {
        try {
            return await ipcRenderer.invoke('insertWorkspace', workspaceName);
        } catch (e) {
            return { success: false, workspaceNo: null };
        }
    },
    getStreams: async (workspaceNo) => {
        try {
            return await ipcRenderer.invoke('getStreams', workspaceNo);
        } catch (e) {
            return { result: [] };
        }
    },
    insertStream: async (streamName, workspaceNo) => {
        try {
            return await ipcRenderer.invoke('insertStream', streamName, workspaceNo);
        } catch (e) {
            return { success: false, workspaceNo: null };
        }
    }
    // // 이미지 삽입
    // insertImage: async (imagePath, workspaceNo) => {
    //     try {
    //         return await ipcRenderer.invoke('insertImage', imagePath, workspaceNo);
    //     } catch (e) {
    //         console.error('preload.insertImage 에러:', e);
    //         return { success: false, imageNo: null };
    //     }
    // },
    // // 레이블 삽입
    // insertLabel: async (labelName, parentLabelNo = null) => {
    //     try {
    //         return await ipcRenderer.invoke('insertLabel', labelName, parentLabelNo);
    //     } catch (e) {
    //         console.error('preload.insertLabel 에러:', e);
    //         return { success: false, labelNo: null };
    //     }
    // },
    // // 세트 삽입
    // insertSet: async (setName, parentLabelNo = null, parentSetNo = null) => {
    //     try {
    //         return await ipcRenderer.invoke('insertSet', setName, parentLabelNo, parentSetNo);
    //     } catch (e) {
    //         console.error('preload.insertSet 에러:', e);
    //         return { success: false, setNo: null };
    //     }
    // },
    // // 디렉토리 경로 따라 이미지 일괄 삽입
    // insertImagesByDir: async (folderPath, workspaceNo) => {
    //     try {
    //         return await ipcRenderer.invoke('insertImagesByDir', folderPath, workspaceNo);
    //     } catch (e) {
    //         console.error('preload.insertImagesByDir 에러:', e);
    //         return { success: false, inserted: 0, errors: [e.message] };
    //     }
    // },
    // // workspace의 최대 imageNo
    // getMaxImageNo: async (workspaceNo) => {
    //     try {
    //         return await ipcRenderer.invoke('getMaxImageNo', workspaceNo);
    //     } catch (e) {
    //         console.error('preload.getMaxImageNo 에러:', e);
    //         return { maxImageNo: null };
    //     }
    // },
    // // 이미지 범위 조회
    // getImagesInRange: async (workspaceNo, startNum, endNum) => {
    //     try {
    //         return await ipcRenderer.invoke('getImagesInRange', workspaceNo, startNum, endNum);
    //     } catch (e) {
    //         console.error('preload.getImagesInRange 에러:', e);
    //         return { result: [] };
    //     }
    // },
    // // workspace의 라벨들 조회
    // getLabelsByWorkspace: async (workspaceNo) => {
    //     try {
    //         return await ipcRenderer.invoke('getLabelsByWorkspace', workspaceNo);
    //     } catch (e) {
    //         console.error('preload.getLabelsByWorkspace 에러:', e);
    //         return { result: [] };
    //     }
    // },
    // // workspace의 세트들 조회
    // getSetsByWorkspace: async (workspaceNo) => {
    //     try {
    //         return await ipcRenderer.invoke('getSetsByWorkspace', workspaceNo);
    //     } catch (e) {
    //         console.error('preload.getSetsByWorkspace 에러:', e);
    //         return { result: [] };
    //     }
    // },
    // // label-image 매핑
    // mapLabelToImage: async (labelNo, imageNo) => {
    //     try {
    //         return await ipcRenderer.invoke('mapLabelToImage', labelNo, imageNo);
    //     } catch (e) {
    //         console.error('preload.mapLabelToImage 에러:', e);
    //         return { success: false };
    //     }
    // },
    // // set-image 매핑
    // mapSetToImage: async (setNo, imageNo) => {
    //     try {
    //         return await ipcRenderer.invoke('mapSetToImage', setNo, imageNo);
    //     } catch (e) {
    //         console.error('preload.mapSetToImage 에러:', e);
    //         return { success: false };
    //     }
    // },
});
