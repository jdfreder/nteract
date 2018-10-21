import * as React from "react";
import { ansiToJson, AnserJsonEntry } from "anser";
import { escapeCarriageReturn } from "escape-carriage";

const LINK_REGEX =
    /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;


/**
 * Converts ANSI strings into JSON output.
 * @name ansiToJSON
 * @function
 * @param {String} input The input string.
 * @return {Array} The parsed input.
 */
function ansiToJSON(input: string): AnserJsonEntry[] {
  input = escapeCarriageReturn(input);
  return ansiToJson(input, {
    json: true,
    remove_empty: true
  });
}

/**
 * Converts an Anser bundle into a React Node.
 * @param linkify whether links should be converting into clickable anchor tags.
 * @param bundle Anser output.
 */
function convertBundleIntoReact(
    linkify: boolean, bundle: AnserJsonEntry, key: number): React.ReactNode {
  const style = {
    color: `rgb(${bundle.fg})`,
    backgroundColor: `rgb(${bundle.bg})`,
  };
  const words = bundle.content.split(" ")
      .map((word: string, index: number) => {
        // If this isn't the first word, re-add the space removed from split.
        if (index !== 0) {
          word = " " + word;
        }

        // If we don't want to linkify or this isn't a link, just return the
        // word as-is.
        const shouldLinkify = linkify && LINK_REGEX.test(word);
        if (!shouldLinkify) return word;

        return React.createElement(
            "a",
            {
              key: index,
              href: word,
              target: "_blank"
            },
            `${word}`);
      });
  return React.createElement(
    "span", {style, key}, words
  );
}

declare type Props = {
  children: string;
  className?: string;
  linkify?: boolean;
};

export default function Ansi(props: Props): React.ReactNode {
  return React.createElement(
    "code", { className: props.className },
    ansiToJSON(props.children)
        .map(convertBundleIntoReact.bind(this, props.linkify)));
}
