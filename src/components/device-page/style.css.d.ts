declare namespace StyleCssNamespace {
    export interface IStyleCss {
        "dashed-link": string;
        "device-pic": string;
        "disabled-link": string;
        loader: string;
        "props-row": string;
    }
}

declare const StyleCssModule: StyleCssNamespace.IStyleCss & {
    /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
    locals: StyleCssNamespace.IStyleCss;
};

export = StyleCssModule;
