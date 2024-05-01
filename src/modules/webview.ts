export function formatTime(timeInMilliseconds: number): string {
  const minutes = Math.floor(timeInMilliseconds / 60000);
  const seconds = Math.floor((timeInMilliseconds % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function getWebviewContent(summary: string): string {
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
