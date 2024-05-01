export const pomodoroDuration: number = 25 * 60 * 1000;
export const breakDuration: number = 5 * 60 * 1000;
export const longBreakDuration: number = 20 * 60 * 1000;
export let taskName: string | null = null;
export let taskTime: number = 0;
export let timer: NodeJS.Timeout | null = null;
export let tasks: { [taskName: string]: number } = {};

export function setTaskName(name: string) {
  taskName = name;
}

export function setTaskTime(time: number) {
  taskTime = time;
}

export function setTimer(newTimer: NodeJS.Timeout | null) {
  timer = newTimer;
}

export function setTask(task: string, time: number) {
  tasks[task] = time;
}
