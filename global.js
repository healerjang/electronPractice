/**
 * @typedef {Object} ElectronAPI
 * @property {() => Promise<{ path: string; size: number; createdAt: Date; modifiedAt: Date; } | null>} openFile
 * @property {(message: string) => void} logDebug
 * @property {(message: string) => void} logInfo
 * @property {(message: string) => void} logWarning
 * @property {(message: string) => void} logError
 */
/**
 * @type {ElectronAPI}
 */

/**
 * @typedef {Object} dbAPI
 * @property {() => Promise<{ [
 *     {
 *         workspaceNo: int,
 *         workspaceName: string
 *     }
 * ]| []>} openFile
 * @property {(workspaceName: string) => Promise<{workspaceNo:int}>}
 */
/**
 * @type {ElectronAPI}
 */