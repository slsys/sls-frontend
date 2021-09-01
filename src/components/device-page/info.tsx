import { Component, ComponentChild, Fragment, h } from "preact";
import { Device } from "../../types";
import SafeImg from "../safe-image";
import { genDeviceDetailsLink, genDeviceImageUrl, toHex } from "../../utils";
import DeviceControlGroup from "../device-control";
import PowerSourceComp from "../power-source";
import style from "./style.css";
import { getClusterName } from "./bind";
import { connect } from "unistore/preact";
import { GlobalState } from "../../store";

interface PropsFromStore {
    device: Device ;
}

export class DeviceInfo extends Component<PropsFromStore, {}> {
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
                        {
                            device.friendly_name ? (
                                <Fragment>
                                    <dt class="col-5">Friendly name</dt>
                                    <dd class="col-7">{device.friendly_name}</dd>
                                </Fragment>
                            ) : null
                        }


                        <dt class="col-5">ieeeAddr</dt>
                        <dd class="col-7">{device.ieeeAddr}</dd>

                        <dt class="col-5">nwkAddr</dt>
                        <dd class="col-7">{device.nwkAddr}</dd>

                        <dt class="col-5">Power source</dt>
                        <dd class="col-7"><PowerSourceComp source={device.PowerSource}
                                                           battery={device?.st?.battery} /></dd>

                        <dt class="col-5">Converter Id</dt>
                        <dd class="col-7">{device.cid > 0 ? 
                                          <a className={"d-block"} href={"https://slsys.io/action/supported_devices.html?device="+device.cid}
                                                                   target={"_blank"}>{device.cid}&nbsp;<i className={"fas fa-info-circle"} /></a> : 0}</dd>

                        <dt class="col-5">ManufName</dt>
                        <dd class="col-7">{device.ManufName}</dd>

                        <dt class="col-5">ModelId</dt>
                        <dd class="col-7">{device.ModelId}</dd>

                        {(device.DateCode && device.DateCode != "null") ? <Fragment>
                        <dt class="col-5">DateCode</dt>
                        <dd class="col-7">{device.DateCode}</dd>
                        </Fragment> : null}

                        <dt class="col-5">Routes</dt>
                        <dd class="col-7">{device?.Rtg?.map((route) => <a className={"d-block"}
                                                                          href={genDeviceDetailsLink(route)}>{route}</a>)}</dd>
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

export default connect<{}, {}, GlobalState, PropsFromStore>(mappedProps)(DeviceInfo);