import * as vscode from "vscode";

let addTaskStatusBarItem: vscode.StatusBarItem;
let statusBarItem: vscode.StatusBarItem;
let summaryStatusBarItem: vscode.StatusBarItem;
let timer: NodeJS.Timeout | null = null;
let elapsedTime: number = 0;
let taskTime: number = 0;
let taskName: string | null = null;
let pomodoroDuration: number = 25 * 60 * 1000;
let breakDuration: number = 5 * 60 * 1000;
let longBreakDuration: number = 20 * 60 * 1000;
let tasks: { [taskName: string]: number } = {};
let completedPomodoros: number = 0;

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
              taskName = name;
              taskTime = 0;
              tasks[name] = 0;
              if (!timer) startTimer(pomodoroDuration, true);
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
            taskName = name;
            taskTime = 0;
            tasks[name] = 0;
          }
        });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pomodoro-buddy.showTaskSummary", () => {
      showTaskSummary();
    })
  );
}

function startTimer(duration: number, isPomodoro: boolean) {
  vscode.window.showInformationMessage(
    `Timer started for ${isPomodoro ? "Pomodoro" : "Break"}`
  );
  statusBarItem.text = isPomodoro ? "$(clock) Pomodoro" : "$(clock) Break";
  statusBarItem.show();
  if (!timer) {
    elapsedTime = 0;
  }
  timer = setInterval(() => updateTimer(duration, isPomodoro), 1000);
}

function updateTimer(duration: number, isPomodoro: boolean) {
  elapsedTime += 1000;

  const remainingTime = duration - elapsedTime;

  if (isPomodoro) taskTime += 1000;

  if (taskName && isPomodoro) tasks[taskName] = taskTime;

  if (remainingTime <= 0) {
    clearInterval(timer!);
    timer = null;
    if (isPomodoro) {
      vscode.window.showInformationMessage(
        `Pomodoro completed for task: ${taskName}`
      );

      completedPomodoros++;
      resetTimer();

      if (completedPomodoros < 4) {
        vscode.window
          .showInformationMessage(
            "Time for a 5-minute break. Take a rest?",
            "Yes",
            "No"
          )
          .then((choice) => {
            choice === "Yes"
              ? startTimer(breakDuration, false)
              : startTimer(pomodoroDuration, true);
          });
      } else {
        vscode.window
          .showInformationMessage(
            "You've completed 4 Pomodoros. Time for a 20-minute long break. Take a rest?",
            "Yes",
            "No"
          )
          .then((choice) => {
            choice === "Yes"
              ? startTimer(longBreakDuration, false)
              : startTimer(pomodoroDuration, true);

            completedPomodoros = 0;
          });
      }
    } else {
      vscode.window
        .showInformationMessage("Break time completed", "Start Pomodoro")
        .then((choice) => {
          if (choice === "Start Pomodoro") {
            startTimer(pomodoroDuration, true);
          }
        });
    }
  } else {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    statusBarItem.text = isPomodoro
      ? `$(clock) Pomodoro: ${minutes}m ${seconds}s`
      : `$(clock) Break: ${minutes}m ${seconds}s`;
    statusBarItem.show();
  }
}

function resetTimer() {
  elapsedTime = 0;
  statusBarItem.text = "$(clock) Pomodoro";
  statusBarItem.show();
}

function showTaskSummary() {
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

function formatTime(timeInMilliseconds: number): string {
  const minutes = Math.floor(timeInMilliseconds / 60000);
  const seconds = Math.floor((timeInMilliseconds % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function getWebviewContent(summary: string): string {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Summary</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
      }
    </style>
  </head>
  <body>
    <h2>Task Summary</h2>
    <pre>${summary}</pre>
  </body>
  </html>`;
}

export function deactivate() {
  if (timer) clearInterval(timer);
}
