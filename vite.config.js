import {
    existsSync,
    writeFileSync
} from 'fs';
import {
    resolve
} from 'path';
import {
    defineConfig
} from 'vite';

const userConfigPath = resolve(__dirname, 'user.config.json');
if (!existsSync(userConfigPath)) {
    writeFileSync(userConfigPath, '{}');
}

export default defineConfig({
    server: {
        hmr: {
            overlay: false,
        },
        watch: {
            usePolling: true,
        }
    },
    plugins: [{
        name: 'full-reload',
        handleHotUpdate({
            server
        }) {
            server.ws.send({
                type: 'full-reload'
            });
            return [];
        }
    }, ]
});