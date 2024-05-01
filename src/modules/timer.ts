import * as vscode from "vscode";
import {
  taskName,
  taskTime,
  timer,
  setTimer,
  setTaskTime,
  setTask,
  pomodoroDuration,
  breakDuration,
  longBreakDuration,
} from "../shared/variables";

let elapsedTime: number = 0;
let completedPomodoros: number = 0;

export function startTimer(
  duration: number,
  isPomodoro: boolean,
  statusBarItem: vscode.StatusBarItem
) {
  vscode.window.showInformationMessage(
    `Timer started for ${isPomodoro ? "Pomodoro" : "Break"}`
  );
  statusBarItem.text = isPomodoro ? "$(clock) Pomodoro" : "$(clock) Break";
  statusBarItem.show();
  if (!timer) {
    elapsedTime = 0;
  }
  setTimer(
    setInterval(() => updateTimer(duration, isPomodoro, statusBarItem), 1000)
  );
}

function updateTimer(
  duration: number,
  isPomodoro: boolean,
  statusBarItem: vscode.StatusBarItem
) {
  elapsedTime += 1000;

  const remainingTime = duration - elapsedTime;

  if (isPomodoro) setTaskTime(taskTime + 1000);

  if (taskName && isPomodoro) setTask(taskName, taskTime);

  if (remainingTime <= 0) {
    clearInterval(timer!);
    setTimer(null);
    if (isPomodoro) {
      vscode.window.showInformationMessage(
        `Pomodoro completed for task: ${taskName}`
      );

      completedPomodoros++;
      resetTimer(statusBarItem);

      if (completedPomodoros < 4) {
        vscode.window
          .showInformationMessage(
            "Time for a 5-minute break. Take a rest?",
            "Yes",
            "No"
          )
          .then((choice) => {
            choice === "Yes"
              ? startTimer(breakDuration, false, statusBarItem)
              : startTimer(pomodoroDuration, true, statusBarItem);
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
              ? startTimer(longBreakDuration, false, statusBarItem)
              : startTimer(pomodoroDuration, true, statusBarItem);

            completedPomodoros = 0;
          });
      }
    } else {
      vscode.window
        .showInformationMessage("Break time completed", "Start Pomodoro")
        .then((choice) => {
          if (choice === "Start Pomodoro") {
            startTimer(pomodoroDuration, true, statusBarItem);
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

function resetTimer(statusBarItem: vscode.StatusBarItem) {
  elapsedTime = 0;
  statusBarItem.text = "$(clock) Pomodoro";
  statusBarItem.show();
}
