import ReconnectingWebSocket from "reconnecting-websocket";
import { Device, Dictionary } from "./types";
import { TimeInfo } from "./components/discovery/types";
import { Notyf } from "notyf";

export const genDeviceDetailsLink = (deviceIdentifier: string | number): string => (`/zigbee/device?dev=${encodeURIComponent(deviceIdentifier)}&activeTab=Info`);

export const toHex = (input: number, padding = 4): string => {
    return `0x${(`${'0'.repeat(padding)}${input.toString(16)}`).substr(-1 * padding).toUpperCase()}`;
};

/**
 * Returns an array with arrays of the given size.
 *
 * @param inputArr {Array} array to split
 * @param chunkSize {Integer} Size of every group
 */
export function chunkArray<T>(inputArr: T[], chunkSize: number): T[][] {

    const results = [];
    while (inputArr.length) {
        results.push(inputArr.splice(0, chunkSize));
    }
    return results;
}

export const encodeGetParams = (data: Dictionary<string | number>): string => Object.keys(data).map((key) => [key, data[key]].map(encodeURIComponent).join("=")).join("&");

export const sanitizeModelNameForImageUrl = (modelName: string): string => {
    return modelName ? modelName.replace("/", "_") : null;
};

export const genDeviceImageUrl = (device: Device): string => ((device.cid > 0) ? `https://slsys.io/img/supported_devices/${device.cid}.png`
                                                                               : `https://slsys.github.io/Gateway/devices/png/${sanitizeModelNameForImageUrl(device.ModelId)}.png`);

export type LoadableFileTypes = "js" | "css";

export const fetchJs = (url) => {
    return new Promise((resolve, reject) => {
        const scriptElement = document.createElement("script");
        scriptElement.addEventListener("load", resolve);
        scriptElement.addEventListener("error", reject);
        scriptElement.setAttribute("type", "text/javascript");
        scriptElement.setAttribute("src", url);
        document.getElementsByTagName("head")[0].appendChild(scriptElement);
    });
};

export const fetchStyle = (url) => {
    return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.addEventListener("load", resolve);
        link.addEventListener("error", reject);
        link.setAttribute("type", "text/css");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", url);
        document.getElementsByTagName("head")[0].appendChild(link)
    });
};

export function last<T>(collection: T[]) {
    return collection[collection.length - 1];
}
export function arrayUnique<T>(input: T[]) {
    return input.filter((v, i, a) => a.indexOf(v) === i);
}



export const bitOps = {
    getBit: (n: number, bitIndex: number): number => {
        const bitMask = 1 << bitIndex;
        const result = n & bitMask;
        return result >>> bitIndex;
    },
    setBit: (n: number, bitIndex: number): number => {
        const bitMask = 1 << bitIndex;
        return n | bitMask;
    },
    clearBit: (n: number, bitIndex: number): number => {
        const bitMask = ~(1 << bitIndex);
        return n & bitMask;
    }
};


export const toHHMMSS = (secs: number): string => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor(secs / 60) % 60;
    const seconds = Math.floor(secs % 60);

    return [hours, minutes, seconds]
        .map(v => v < 10 ? `0${v}` : v)
        .filter((v, i) => v !== "00" || i > 0)
        .join(":");
};
type HttMethod = "GET" | "POST" | "DELETE";
type ContentType = "text" | "json" | "blob";
export type CallbackHandler<T> = (err: boolean, res: T) => void;
export interface ApiResponse<T> {
    success: boolean;
    result: T;
}
export function callApi<T>(url: string, method: HttMethod, params: Dictionary<any>, payload: any, callback: CallbackHandler<T>, contentType: ContentType = "json"): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fetch(`${url}?${encodeGetParams(params)}`, { method, body: payload })
            .then((res) => {
                if (res.status === 200) {
                    return res[contentType]();
                }
                throw new Error(res.statusText);

            })
            .then(data => {
                callback(false, data);
                resolve();
            })
            .catch(e => {
                new Notyf().error(e.toString());
                callback(e.toString(), undefined);
                reject();
            });
    })
}

export const lastSeen = (device: Device, timeInSeconds: number): string => {
    if (device.last_seen && timeInSeconds) {
        const lastSeen = timeInSeconds - device.last_seen;
        if (lastSeen < 0) {
            return "Now";
        }
        return toHHMMSS(lastSeen);
    }
};