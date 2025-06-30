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
 * ]| []>}
 * @property {(workspaceName: string) => Promise<{workspaceNo:int}>}
 * @property {(workspaceNo: int) => Promise<{ [
 *     {
 *         streamNo: int,
 *         streamName: string
 *     }
 * ]| []>}
 * @property {streamName: string, workspaceNo: int} => Promise<{streamNo:int}>
 */
/**
 * @type {ElectronAPI}
 */