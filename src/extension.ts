import * as vscode from "vscode";

let timer: NodeJS.Timeout | null = null;
let elapsedTime: number = 0;
let taskTime: number = 0;
let taskName: string | null = null;
//let pomodoroDuration: number = 25 * 60 * 1000; // 25 minutos en milisegundos
//let breakDuration: number = 5 * 60 * 1000; // 5 minutos en milisegundos

let pomodoroDuration: number = 30 * 1000; // 25 minutos en milisegundos
let breakDuration: number = 30 * 1000; // 5 minutos en milisegundos

let statusBarItem: vscode.StatusBarItem;
let tasks: { [taskName: string]: number } = {};

export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = "$(clock) Pomodoro";
  statusBarItem.command = "pomodoro-buddy.helloWorld";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand("pomodoro-buddy.helloWorld", () => {
      vscode.window
        .showInputBox({
          placeHolder: "Enter task name",
          prompt:
            "Enter the name of the task you are going to work on during this Pomodoro session:",
        })
        .then((name) => {
          console.log(name);
          if (name) {
            taskName = name;

            taskTime = 0;
            tasks[name] = 0;

            if (!timer) startTimer(pomodoroDuration, true);
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
      // Lógica para el pomodoro completado
      vscode.window.showInformationMessage(
        `Pomodoro completed for task: ${taskName}`
      );

      resetTimer();

      vscode.window
        .showInformationMessage(
          "Time for a 5-minute break. Take a rest?",
          "Yes",
          "No"
        )
        .then((choice) => {
          if (choice === "Yes") {
            startTimer(breakDuration, false); // Iniciar el temporizador de descanso de 5 minutos
          } else {
            startTimer(pomodoroDuration, true); // Reanudar otro pomodoro de 25 minutos
          }
        });
    } else {
      vscode.window
        .showInformationMessage("Break time completed", "Start Pomodoro")
        .then((choice) => {
          if (choice === "Start Pomodoro") {
            startTimer(pomodoroDuration, true); // Iniciar un nuevo pomodoro con la misma tarea
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
    console.log(tasks[task]);
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
