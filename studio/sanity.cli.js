import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'mktsf3hv',
    dataset: 'production'
  },
  deployment: {
    appId: 'b44trjdwqs71dnasqmdkzid9',
    /**
     * Definido como false para evitar o timeout de 120s (Extract manifest aborted)
     * e tornar o deploy instantâneo.
     */
    autoUpdates: false,
  }
})
