import * as vscode from "vscode";
import { formatTime, getWebviewContent } from "./webview";

export function showTaskSummary(tasks: { [taskName: string]: number }) {
  const panel = vscode.window.createWebviewPanel(
    "taskSummary",
    "Task Summary",
    vscode.ViewColumn.One,
    {}
  );

  let summary = "Task Summary:\n";
  for (const task in tasks) {
    summary += `- ${task}: ${formatTime(tasks[task])}\n`;
  }

  panel.webview.html = getWebviewContent(summary);
}
