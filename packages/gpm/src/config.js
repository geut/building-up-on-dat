const Conf = require('conf')

const defaults = {
  registries: {
    geut: {
      http: 'localhost:8080',
      dat: ''
    }
  },
  defaultRegistryId: 'geut',
  modulesDir: '.gpm',
  port: '9998'
}

const config = new Conf({ defaults, configName: 'config', projectName: 'gpm', projectSuffix: '' })

module.exports = config
