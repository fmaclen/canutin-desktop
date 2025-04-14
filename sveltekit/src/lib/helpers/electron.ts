export const ELECTRON_MESSAGE_SERVER_READY = 'sveltekit-server-ready';

enum ElectronStatus {
	IS_NOTIFIED,
	IS_NOT_NOTIFIED
}

let electronStatus: ElectronStatus = ElectronStatus.IS_NOT_NOTIFIED;

export function notifyElectronServerReady() {
	// Notify Electron that the server is ready (only once)
	if (electronStatus === ElectronStatus.IS_NOT_NOTIFIED) {
		process.parentPort.postMessage(ELECTRON_MESSAGE_SERVER_READY);
		electronStatus = ElectronStatus.IS_NOTIFIED;
	}
}
