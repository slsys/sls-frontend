import { FunctionalComponent, h, RefObject, ComponentChild, JSX, Fragment } from "preact";
import { forwardRef, useState } from "preact/compat";

import styles from "./style.css";

interface UniversalEditorProps {
    name: string;
    value: unknown;
    valueFormatter?(value: unknown, isLoading: boolean): ComponentChild;
    onChange(value: unknown): Promise<void>;
    onRefresh?(): Promise<void>;
    allowEmpty?: boolean;
    titleEdit?: string;
    titleRefresh?: string;
    [k: string]: unknown;
}

/*
const togglePairs = new Map<string | boolean, string | boolean>([
    ['ON', 'OFF'],
    ['OFF', 'ON'],
    ['OPEN', 'CLOSE'],
    ['CLOSE', 'OPEN'],
    ['LOCK', 'UNLOCK'],
    ['UNLOCK', 'LOCK'],
    [true, false],
    [false, true]
]);
*/

// eslint-disable-next-line react/display-name
const UniversalEditor: FunctionalComponent<UniversalEditorProps> = forwardRef((props, ref: RefObject<HTMLInputElement>) => {
    const { name, value, onChange, onRefresh, allowEmpty, titleEdit, titleRefresh, ...rest } = props;
    /* const isToggleParameter = togglePairs.has(value as string | boolean); */
    const valueFormatter = props.valueFormatter || ((value: unknown): ComponentChild => `${value}`);

    const [isLoading, setIsLoading] = useState(false);

    const editorType =
        typeof value === 'number'
            ? 'number'
            : typeof value === 'boolean'
                ? 'checkbox'
                : (name.startsWith('state') && typeof value === 'string' && /^ON|OFF$/i.test(value) && !allowEmpty)
                    ? 'switch'
                    : 'default';

    const changeHandler: JSX.GenericEventHandler<HTMLInputElement> = async (event) => {
        try {
            setIsLoading(true);
            const { currentTarget } = event;
            switch (editorType) {
                case "checkbox":
                    await onChange(currentTarget.checked);
                    break;
                case "switch":
                    await onChange(currentTarget.checked ? "ON" : "OFF");
                    break;
                case "number":
                    currentTarget.valueAsNumber != value && await onChange(currentTarget.valueAsNumber);
                    break;
                default:
                    currentTarget.value != value && await onChange(currentTarget.value);
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const refreshHandler = async (): Promise<void> => {
        try {
            setIsLoading(true);
            await onRefresh();
        } finally {
            setIsLoading(false);
        }
    }

    const editHandler = async (): Promise<void> => {
        const newVal = prompt("Enter new value", value as string);
        if (newVal !== null && (newVal !== "" || allowEmpty)) {
            try {
                setIsLoading(true);
                await onChange(newVal);
            } finally {
                setIsLoading(false);
            }
        }
    };

    let input: ComponentChild;

    switch (editorType) {
        case "checkbox":
            input = <input ref={ref} {...rest} disabled={isLoading} type="checkbox" checked={value as boolean} onChange={changeHandler} />;
            break;
        case "switch":
            input =
                <div class={`form-check form-switch ${styles['custom-switch']} ms-2`}>
                    <input ref={ref} {...rest} disabled={isLoading} type="checkbox" class={`form-check-input ${styles['custom-control-input']}`} id={`${name}switch`} checked={value !== 'OFF'} onChange={changeHandler} />
                    <label class={`form-check-label ${styles['custom-control-label']}`} for={`${name}switch`}>{value as string}</label>
                </div>;
            break;
        //case "number":
        /* input = <input step="any" ref={ref} {...rest} type="number" value={value} onBlur={changeHandler} />; */
        default:
            input =
                <Fragment>
                    <button type="button" title={titleEdit} disabled={isLoading} class="btn btn-sm" onClick={editHandler}><i class="fas fa-edit" /></button>
                    <div class={`ml-1 ${isLoading ? "text-muted" : ""}`}>{valueFormatter(value, isLoading)}</div>
                </Fragment>;
            break;
    }

    return <div class="d-inline-flex align-items-center ml-n2">
        {onRefresh ? <button type="button" title={titleRefresh} disabled={isLoading} class="btn btn-sm" onClick={refreshHandler}><i class="fas fa-sync" /></button> : null}
        {input}
        <div class={`spinner-border spinner-border-sm text-primary ml-3 mr-2 my-1 ${!isLoading ? 'd-none' : ''}`} role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>;
});
export default UniversalEditor;
