/**
 * Module for parsing TASKING VX-Toolset for TriCore diagnostics
 */ /** */

import * as vscode from 'vscode';

import { oneLess, RawDiagnosticParser, FeedLineResult } from './util';

// https://www.regexr.com/7dcbq
export const REGEX =
    /^(?<compiler_tool>.*)\s+(?<severity>[A-Za-z]{1})(?<code>\d+):\s+\[\"(?<file>.*)\"\s+(?<line>\d+)\/(?<column>\d+)\]\s+(?<message>.*)$/;

export class Parser extends RawDiagnosticParser {
    private translateSeverity(tasking_severity: string): string {
        switch (tasking_severity) {
            case "E":
            case "F":
                return "error";
            case "W":
                return "warning";
            default:
                return "info";
        }
    }

    doHandleLine(line: string) {
        const mat = REGEX.exec(line);
        if (!mat) {
            // Nothing to see on this line of output...
            return FeedLineResult.NotMine;
        }

        const [full, _ /* compiler_tool */, severity, code, file, lineno = "1", column = "1", message] = mat;
        if (file && severity && message) {
            return {
                full: full,
                file: file,
                location: new vscode.Range(
                    oneLess(lineno),
                    oneLess(column),
                    oneLess(lineno),
                    999
                ),
                severity: this.translateSeverity(severity),
                message: message,
                code: code,
                related: []
            };
        }
        return FeedLineResult.NotMine;
    }
}
