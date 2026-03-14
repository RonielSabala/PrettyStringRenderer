import {
    defineConfig
} from 'vite';

export default defineConfig({
    server: {
        hmr: {
            overlay: true,
        },
        watch: {
            usePolling: false,
            ignored: ['**/node_modules/**', '**/.git/**'],
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
    }]
});