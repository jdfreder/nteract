import * as React from "react";
declare type AnsiStyleType = {
    backgroundColor?: string;
    color?: string;
};
export declare function ansiToInlineStyle(text: string): {
    content: string;
    style: AnsiStyleType;
}[];
declare type Props = {
    children: string;
    className?: string;
    linkify?: boolean;
};
declare function Ansi(props: Props): React.DetailedReactHTMLElement<{
    className: string;
}, HTMLElement>;
export default Ansi;
