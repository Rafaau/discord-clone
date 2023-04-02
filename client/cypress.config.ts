import { defineConfig } from "cypress";
import { execSync } from "child_process";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    setupNodeEvents(on, config) {
      on('task', {
        getClipboard: () => {
          if (process.platform === 'win32') {
            // Windows
            return execSync('powershell.exe Get-Clipboard').toString().trim();
          } else if (process.platform === 'darwin') {
            // macOS
            return execSync('pbpaste').toString().trim();
          } else {
            // Linux
            return execSync('xclip -selection clipboard -o').toString().trim();
          }
        }
      })
    }
  },
});
