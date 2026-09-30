class DevDebugger {
    log(...args: any[]) {
        if (__DEV__) {
            console.log(...args);
        }
    }

    error(...args: any[]) {
        if (__DEV__) {
            console.error(...args);
        }
    }

    warn(...args: any[]) {
        if (__DEV__) {
            console.warn(...args);
        }
    }

    info(...args: any[]) {
        if (__DEV__) {
            console.info(...args);
        }
    }
}

export const devDebugger = new DevDebugger();

export const useDevDebugger = () => {
    return devDebugger;
};
