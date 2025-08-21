import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function buildTimePlugin(): Plugin {
  return {
    name: 'build-time-plugin',
    buildStart() {
      // Generate current timestamp in dd.mm.yyyy hh:mm format
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      const buildTime = `${day}.${month}.${year} ${hours}:${minutes}`;
      
      // Path to buildInfo.ts
      const buildInfoPath = path.resolve(__dirname, 'src/config/buildInfo.ts');
      
      // Read the template
      let content = fs.readFileSync(buildInfoPath, 'utf-8');
      
      // Replace the placeholder with actual build time
      content = content.replace(/__BUILD_TIME__/g, buildTime);
      
      // Write back the file
      fs.writeFileSync(buildInfoPath, content);
      
      console.log(`✅ Build time set to: ${buildTime}`);
    }
  };
}