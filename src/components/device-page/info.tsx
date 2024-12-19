import { Component, ComponentChild, Fragment, h } from "preact";
import { Device, DeviceSupportStatus } from "../../types";
import SafeImg from "../safe-image";
import { genDeviceDetailsLink, genDeviceImageUrl, toHex } from "../../utils";
import DeviceControlGroup from "../device-control";
import PowerSourceComp from "../power-source";
import style from "./style.css";
import { getClusterName } from "./bind";
import { connect } from "unistore/preact";
import { GlobalState } from "../../store";
import actions, { Actions } from "../../actions";
import UniversalEditor from '../universal-editor';

interface PropsFromStore {
    device: Device;
}

export class DeviceInfo extends Component<PropsFromStore & Actions, {}> {
    async onRenameClick(newName: string): Promise<void> {
        const { renameDevice, getZigbeeDevicesList, getDeviceInfo, device } = this.props;
        if (newName !== null && newName !== device.friendly_name) {
            await renameDevice(device.nwkAddr, newName);
            await getZigbeeDevicesList(true);
            await getDeviceInfo(device.nwkAddr);
        }
    }

    async onIdentAutoClick(): Promise<void> {
        const { identDevice, getZigbeeDevicesList, getDeviceInfo, device } = this.props;
        await identDevice(device.nwkAddr, "");
        await getZigbeeDevicesList(true);
        await getDeviceInfo(device.nwkAddr);
    }

    async onIdentManualClick(newCid: string): Promise<void> {
        const { identDevice, getZigbeeDevicesList, getDeviceInfo, device } = this.props;
        if (newCid !== null && newCid !== `${device.cid}` && !Number.isNaN(parseInt(newCid, 10))) {
            await identDevice(device.nwkAddr, newCid);
            await getZigbeeDevicesList(true);
            await getDeviceInfo(device.nwkAddr);
        }
    }

    render(): ComponentChild {
        const { device } = this.props;
        if (device) {
            return this.renderDeviceInfo();
        }
        return "Loading...";
    }

    renderDeviceInfo(): ComponentChild {
        const { device } = this.props;
        const endpoints = Object.entries(device.ep ?? {}).map(([epName, ep]) => {
            const inClusters = Object.entries(ep.In ?? {}).map(([clusterId]) => {
                const cluster = parseInt(clusterId, 10);
                return <small class={"d-block text-nowrap text-truncate"}
                    title={toHex(cluster, 4)}>{getClusterName(cluster, false)}</small>;
            });
            const outClusters = Object.entries(ep.Out ?? {}).map(([clusterId]) => {
                const cluster = parseInt(clusterId, 10);
                return <small class={"d-block text-nowrap text-truncate"}
                    title={toHex(cluster, 4)}>{getClusterName(cluster, false)}</small>;
            });
            return (<Fragment>
                <dt class="col-5">Endpoint #{epName}</dt>
                <dl class={"col-6"} />

                <dd class="col-5">ProfileId</dd>
                <dl class={"col-7"}>{ep.profId}</dl>

                <dd class="col-5">DeviceId</dd>
                <dl class={"col-7"}>{ep.devId}</dl>

                <dd class={"col-5 text-nowrap"}>Input clusters</dd>
                <dl class="col-7">{inClusters.length ? inClusters : <b>None</b>}</dl>
                <dd class={"col-5 text-nowrap"}>Output clusters</dd>
                <dl class="col-7">{outClusters.length ? outClusters : <b>None</b>}</dl>

            </Fragment>);
        });
        return (
            <div class="card mb-3">
                <SafeImg class={`card-img-top ${style["device-pic"]}`} src={genDeviceImageUrl(device)} />
                <div class="card-body">
                    <h5 class="card-title">{device.type}</h5>

                    <dl class="row">
                        <dt class="col-5">Friendly name</dt>
                        <dd class="col-7">
                            <UniversalEditor
                                name="Friendly name"
                                value={device.friendly_name || ""}
                                valueFormatter={(value: unknown): ComponentChild => value ? `${value}` : <span class="text-muted">&lt;not set&gt;</span>}
                                allowEmpty={true}
                                onChange={(value): Promise<void> => this.onRenameClick(value as string)}
                                titleEdit={"Enter new name"}
                            />
                        </dd>

                        <dt class="col-5">ieeeAddr</dt>
                        <dd class="col-7">{device.ieeeAddr}</dd>

                        <dt class="col-5">nwkAddr</dt>
                        <dd class="col-7">{device.nwkAddr}</dd>

                        <dt class="col-5">Power source</dt>
                        <dd class="col-7">
                            <PowerSourceComp source={device.PowerSource} battery={device?.st?.battery} />
                        </dd>

                        <dt class="col-5">Converter Id</dt>
                        <dd class="col-7">
                            <UniversalEditor
                                name="ConverterId"
                                value={device.cid}
                                valueFormatter={(value: unknown, isLoading: boolean): ComponentChild =>
                                    device.supported === DeviceSupportStatus.UnSupported
                                        ? <Fragment>
                                            <span class="text-muted">&lt;not set&gt;</span>&nbsp;(<a className={`${isLoading ? style["disabled-link"] : ""}`} href={`https://slsys.io/docs/zigbee_converters`}
                                            target="_blank" rel="noopener noreferrer">HOWTO&nbsp;<i className={"fas fa-info-circle"} /></a>)
                                          </Fragment>
                                        : (value as number) > 0
                                            ? <a className={`d-block ${isLoading ? style["disabled-link"] : ""}`} href={`https://slsys.io/action/supported_devices.html?device=${value}`}
                                                target="_blank" rel="noopener noreferrer">{value}&nbsp;<i className={"fas fa-info-circle"} /></a>
                                            : 0
                                }
                                allowEmpty={false}
                                onRefresh={(): Promise<void> => this.onIdentAutoClick()}
                                onChange={(value): Promise<void> => this.onIdentManualClick(value as string)}
                                titleRefresh="Reload converter Id"
                                titleEdit="Set converter Id manually"
                            />
                        </dd>

                        <dt class="col-5">ManufName</dt>
                        <dd class="col-7">{device.ManufName}</dd>

                        <dt class="col-5">ModelId</dt>
                        <dd class="col-7">{device.ModelId}</dd>

                        {(device.DateCode && device.DateCode != "null") ? <Fragment>
                            <dt class="col-5">DateCode</dt>
                            <dd class="col-7">{device.DateCode}</dd>
                        </Fragment> : null}

                        <dt class="col-5">Routes</dt>
                        <dd class="col-7">
                            {device?.Rtg?.map((route) => <a className={"d-block"} href={genDeviceDetailsLink(route)}>{route}</a>)}
                        </dd>
                        {endpoints}
                    </dl>

                </div>
                <div class="card-footer">
                    <DeviceControlGroup device={device} />
                </div>
            </div>
        );
    }
}

const mappedProps = ["device"];

export default connect<{}, {}, GlobalState, PropsFromStore | Actions>(mappedProps, actions)(DeviceInfo);
