import { Component, ComponentChild, createRef, h } from "preact";
import style from "./style.css";
import cx from "classnames";
import { Notyf } from "notyf";
import store, { GlobalState } from "../../store";
import actions, { Actions } from "../../actions";
import { connect } from "unistore/preact";
import { useEffect } from "preact/hooks";
import { manager } from "../../websocket";
import { LogMessage } from "../discovery/types";
import { tsToTime } from "../../utils/tsConvert";
import { msToString } from "../../utils/msToString";

export const enum LogLevel {
    LOG_OFF,
    LOG_NORMAL,
    LOG_VERBOSE,
    LOG_DEBUG
}

export interface LogViewerState {
    followLog: boolean;
}

export class LogViewer extends Component<GlobalState & Actions, LogViewerState> {
    ref = createRef<HTMLDivElement>();

    constructor() {
        super();
        this.state = {
            followLog: true
        };
    }

    async componentDidMount(): Promise<void> {
        const { fetchLogsBuffer, getCurrentLogLevel } = this.props;
        await fetchLogsBuffer();
        setTimeout(this.scrollToBottom, 500);
        await getCurrentLogLevel();

        manager.subscribe("log", (data:LogMessage) => {
            const { logs } = store.getState();
            const copyLogs = [...logs, ('[' + tsToTime(data.payload.ts) + msToString(data.payload.ms/100) + '] ' + data.payload.message) as string];
            store.setState({ logs: copyLogs });
        });
    }


    onFollowLogChange = (e: Event): void => {
        e.preventDefault();
        const { followLog } = this.state;
        this.setState({ followLog: !followLog });
    };

    onClearScreenClick = (e: Event): void => {
        const { clearLogs } = this.props;
        clearLogs();
    };
    onClearCacheClick = async (e: Event): Promise<void> => {
        const { clearLogsBuffer } = this.props;
        await clearLogsBuffer();
        new Notyf().success("Cache cleared");
    };

    onLogLevelChange = async (e: Event): Promise<void> => {
        const { setLogLevel, getCurrentLogLevel } = this.props;
        const { value } = e.target as HTMLInputElement;
        const logLevel = parseInt(value, 10);
        await setLogLevel(logLevel);
        getCurrentLogLevel();
    };


    scrollToBottom = (): void => {
        this.ref.current.scrollTop = this.ref.current.scrollHeight;
    };

    render(): ComponentChild {
        const { followLog } = this.state;
        const { logLevel, logs } = this.props;

        useEffect(() => {
            followLog && this.scrollToBottom();
        }, [followLog, logs.length]);

        return (<div class={cx("h-100 container-fluid", style["log-container"])}>
            <div class="row justify-content-around">
                <div class="col-sm-6 my-1">
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button onClick={this.onClearScreenClick} type="button" class="btn btn-secondary">Clear screen
                        </button>
                        <button onClick={this.onClearCacheClick} type="button" class="btn btn-danger">Clear logs cache
                        </button>
                    </div>
                </div>
                <div class="col-sm-6 my-1">
                    <div class="d-flex justify-content-end">
                        <div class="col-sm-4">
                            <select value={logLevel} class="form-select" onChange={this.onLogLevelChange}>
                                <option value={LogLevel.LOG_OFF} selected>LOG_OFF</option>
                                <option value={LogLevel.LOG_NORMAL} selected>LOG_NORMAL</option>
                                <option value={LogLevel.LOG_VERBOSE}>LOG_VERBOSE</option>
                                <option value={LogLevel.LOG_DEBUG}>LOG_DEBUG</option>
                            </select>
                        </div>
                        <div class="col-sm2">
                            <div class="form-check form-check-inline">
                                <input checked={followLog} onChange={this.onFollowLogChange} class="form-check-input"
                                       type="checkbox" id="followLog" value="true" />
                                <label class="form-check-label" for="followLog">Follow log</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div ref={this.ref} class={cx("h-100", style["log-main"])}>
                {logs.map((line, lineNum) =>
                    <div class={style["log-line"]}>
                        <a class={style["log-line-num"]}>{lineNum + 1}</a>
                        <span>{line}</span>
                    </div>)}
            </div>
        </div>);
    }
}

const mappedProps = ["logs", "logLevel"];
const ConnectedLogViewer = connect<{}, LogViewerState, GlobalState, Actions>(mappedProps, actions)(LogViewer);
export default ConnectedLogViewer;
