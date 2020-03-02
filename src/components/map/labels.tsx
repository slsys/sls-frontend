import * as d3Selection from 'd3-selection';
import { h, Component, ComponentChild, createRef, FunctionalComponent } from 'preact';
import { NodeI, Device, Dictionary } from './types';
import * as style from './map.css';
import cx from 'classnames';
import { HoverableNode } from '.';
const stylesDict: Dictionary = { ...style };

interface LabelProps extends HoverableNode {
    node: NodeI;
}

class Label extends Component<LabelProps, {}> {
    ref = createRef<SVGTextElement>();

    componentDidMount(): void {
        const { current } = this.ref;
        d3Selection.select(current as SVGTextElement).data([this.props.node]);
    }

    onMouseOut = (): void => {
        const { node, onMouseOut } = this.props;
        onMouseOut && onMouseOut(node);
    }

    onMouseOver = (): void => {
        const { node, onMouseOver } = this.props;
        onMouseOver && onMouseOver(node);
    }

    render(): ComponentChild {
        const { node } = this.props;
        const deviceType = (node.device as Device).type as string;
        const mappedClas = stylesDict[deviceType] as string;
        const cn = cx(style.label, mappedClas);
        const { onMouseOut, onMouseOver } = this;
        return (
            <text
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
                className={cn}
                ref={this.ref}
                dy={-4}
                dx={3}
            >
                {node.name}
            </text>
        );
    }
}

interface LabelsProps extends HoverableNode {
    nodes: NodeI[];
}


const Labels: FunctionalComponent<LabelsProps> = (props) => {
    const { nodes, onMouseOut, onMouseOver } = props;
        const labels = nodes.map((node: NodeI, index: number) => (
            <Label
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
                key={index}
                node={node}
            />
        ));
        return <g className={style.labels}>{labels}</g>;
};
export default Labels;