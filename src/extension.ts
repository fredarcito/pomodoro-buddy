import * as vscode from "vscode";
import { showTaskSummary } from "./modules/taskSummary";
import { startTimer } from "./modules/timer";

import {
  tasks,
  timer,
  setTask,
  pomodoroDuration,
  setTaskName,
  setTaskTime,
} from "./shared/variables";

let addTaskStatusBarItem: vscode.StatusBarItem;
let summaryStatusBarItem: vscode.StatusBarItem;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    90
  );
  statusBarItem.text = "$(clock) Pomodoro";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  addTaskStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    99
  );
  addTaskStatusBarItem.text = "$(plus) New Task";
  addTaskStatusBarItem.command = "pomodoro-buddy.addTask";
  addTaskStatusBarItem.tooltip = "Add a new task";
  addTaskStatusBarItem.show();
  context.subscriptions.push(addTaskStatusBarItem);

  summaryStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    98
  );
  summaryStatusBarItem.text = "$(list-unordered) Task Summary";
  summaryStatusBarItem.command = "pomodoro-buddy.showTaskSummary";
  summaryStatusBarItem.tooltip = "Show Task Summary";
  summaryStatusBarItem.show();
  context.subscriptions.push(summaryStatusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "pomodoro-buddy.startPomodoroSession",
      () => {
        vscode.window
          .showInputBox({
            placeHolder: "Enter task name",
            prompt:
              "Enter the name of the task you are going to work on during this Pomodoro session:",
          })
          .then((name) => {
            if (name) {
              setTaskName(name);
              setTaskTime(0);
              setTask(name, 0);
              if (!timer) startTimer(pomodoroDuration, true, statusBarItem);
            }
          });
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pomodoro-buddy.addTask", () => {
      vscode.window
        .showInputBox({
          placeHolder: "Enter task name",
          prompt: "Enter the name of the task you want to add:",
        })
        .then((name) => {
          if (name) {
            setTaskName(name);
            setTaskTime(0);
            setTask(name, 0);
          }
        });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pomodoro-buddy.showTaskSummary", () => {
      showTaskSummary(tasks);
    })
  );
}

export function deactivate() {
  if (timer) clearInterval(timer);
}
