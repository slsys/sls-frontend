import { DeviceType, PowerSource } from "../../types";


export type MessageCategory = "log" | "zigbee";
export type JoinEvents =
    "TcDeviceInd"
    | "DeviceAnnceInd"
    | "NodeDescRsp"
    | "ActiveEpRsp"
    | "ModelRcv"
    | "SimpleDescRsp"
    | "PowerSrcRcv"
    | "ConfRsp";

export type ZigbeeEvent = "stateChange" | "LeaveInd" | "PermitJoin" | JoinEvents;

export interface LogMessage {
    category: "log"
    payload: LogPayload
}

export interface LogPayload {
  ts: number
  log_level: number
  message: string
}

export interface ZigbeePayload {
    timestamp: number;
    event: ZigbeeEvent;
    nwkAddr: string;

    ep?: number;
    ieeeAddr: string;
    type?: DeviceType;
    cid?: number;
    ModelId?: string;
    ManufName?: string;
    duration?: number;
    Target?: string;
    PowerSource?: PowerSource;
    ParentnwkAddr?: string;
    ProfileId?: string;
    DeviceId?: string;
}


export interface WebsocketMessage {
    category: MessageCategory;
    payload: LogPayload | ZigbeePayload;
}

export interface TimeInfo {
    ntp_enable: boolean;
    ntp_server: string;
    tz: string;
    ts: number;
}

