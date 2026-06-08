import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.MOONSHOT_API_KEY': JSON.stringify(env.MOONSHOT_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api/cac-search': {
          target: 'https://authapp.cac.gov.ng',
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/cac-search/, '/name_similarity_app/api/public_search/search'),
          headers: {
            Origin: 'https://icrp.cac.gov.ng',
            Referer: 'https://icrp.cac.gov.ng/',
          },
        },
        '/api/cac-tax': {
          target: 'https://icrp.cac.gov.ng',
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/cac-tax/, '/tin_service/api/v1/public/tin/generate-tax-id'),
          headers: {
            Origin: 'https://icrp.cac.gov.ng',
            Referer: 'https://icrp.cac.gov.ng/',
          },
        },
      },
    },
  };
});
