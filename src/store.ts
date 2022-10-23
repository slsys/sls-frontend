import createStore from "unistore";
import devtools from "unistore/devtools";

import { BindRule, Device, FileDescriptor, JoinState, TouchLinkScanApiResponse } from "./types";
import { TimeInfo } from "./components/discovery/types";
import { LogLevel } from "./components/log-viewer";
import { ApiResponse } from "./utils";


export interface GlobalState {
    forceRender: number;
    isLoading: boolean;
    isError: boolean | string;
    device: Device | undefined;
    devices: Device[];
    bindRules: BindRule[];
    time: TimeInfo | undefined;
    timeOffset: number;
    logs: string[];
    logLevel: LogLevel;


    files: FileDescriptor[];
    executionResults: ApiResponse<string> | null;

    currentFileContent: string;
    currentFile: FileDescriptor;

    joinState: JoinState;
    touchlinkResuts: TouchLinkScanApiResponse | null;
    touchlinkScanInProgress: boolean;

}

const initialState: GlobalState = {
    forceRender: Date.now(),
    device: undefined,
    isLoading: false,
    isError: false,
    devices: [],
    bindRules: [{} as BindRule],
    time: undefined,
    timeOffset: 0,
    logs: [],
    logLevel: LogLevel.LOG_DEBUG,


    files: [],
    executionResults: null,
    currentFileContent: "",
    currentFile: null,
    joinState: null,
    touchlinkResuts: null,
    touchlinkScanInProgress: false
};

const store = process.env.NODE_ENV === 'production' ?  createStore(initialState) : devtools(createStore(initialState));

export default store;
