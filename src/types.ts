import { Named } from "./components/tree-view";

export type DeviceType = "EndDevice" | "Router" | "Coordinator";

export type Dictionary<V> = { [index: string]: V }

export interface DeviceStats {
    linkquality?: number;
    battery?: number;
    [k: string]: string | number| boolean;
}

export const inteviewsCount = 4;

export enum InterviewState {
    StateUnknown = -1,
    AnnouncementReceived = 0,
    DescriptionRecieved = 1,
    EndpointsRecieved = 2,
    ClustersRecieved = 3,
    ModelRecieved = 4
}


interface Interview {
    /** Last intreview timestamp */
    TS?: number;
    /**
     * 0 - получен анонс, запускает интервью
     * 1 - получено описание устройства
     * 2 - получено количествы активные эндпоинты
     * 3 - получены кластеры
     * 4- получена модель
     */
    State?: InterviewState;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Cluster {

}

export interface Endpoint {
    "profId": string;
    "In"?: Dictionary<true>;
    "Out"?: Dictionary<true>;
    "devId": string;
}

export enum DeviceSupportStatus {
    Unknown = 0,
    Supported = 1,
    UnSupported = 2
}


export enum PowerSource {
    Unknown = 0,
    MainsSinglePhase = 1,
    MainsThreePhase = 2,
    Battery = 3,
    DC = 4,
    EmergencyMainsConstantPower = 5,
    EmergencyMains = 6
}

export enum StateFlags {
    Cached = 1,
    Hide = 2, // no send
    HA_Disc = 4,
    Option = 8
}

export interface Device {
    change?: number;
    /** A 64-bit IEEE address (also called MAC address or Extended address) */
    ieeeAddr?: string | undefined;
    /** A 16-bi network address */
    nwkAddr: string;
    /** Node last message timestamp */
    lastMessageTimestamp?: number | undefined;
    type?: DeviceType | undefined;

    /** Unique converter ID */
    cid?: number;

    ManufName?: string | undefined;
    ModelId?: string | undefined;
    DateCode?: string | undefined;
    /** Device status */
    st?: DeviceStats | undefined;
    st_flags?: Dictionary<number> | undefined;
    friendly_name?: string | undefined;
    /** Routes list, each item is an 16-bit network address (also called logical address or short address). */
    Rtg?: string[] | undefined;
    /** Features discovery status, aka interview */
    Interview?: Interview | undefined;
    PowerSource?: PowerSource | undefined;
    ep?: Dictionary<Endpoint> | undefined;
    supported?: DeviceSupportStatus | undefined;
    SB?: Dictionary<string> | undefined;


    flags?: number | undefined;
    Rcf?: unknown;
}

export interface JoinState {
    enable: boolean;
    counter: number;
}

export interface FileDescriptor extends Named {
    name: string;
    size: number;
    is_dir: boolean;
}


export interface BindRule extends Dictionary<string | number> {
    id?: number;
    DstNwkAddr: string;
    ClusterId: number;
    SrcEp: number;
    DstEp: number;
}

export type SortDirection = "asc" | "desc";

export interface  CurrentJoinDuration {
    duration: number;
}

export interface TouchLinkDevice {
    Channel: number;
    LinkQuality: number;
    PanId: number;
    TS: number;
    ieeeAddr: string;
}
export interface TouchLinkScanApiResponse {
    TS: number;
    devices: TouchLinkDevice[];
    currentChannel: number;
}
