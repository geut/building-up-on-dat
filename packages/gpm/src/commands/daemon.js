const { createServer } = require('net')
const { Command } = require('@oclif/command')
const Dat = require('dat-node')
const znode = require('znode')
const { getKey } = require('../keys')
const { registryId, gModulesDir, port } = require('../config')

const DATRPC = (dat) => ({
  ping: () => 'pong',
  install: ({ packageName, version = '1.0.0' }) => {
    // Manually download files via the hyperdrive API:
    console.log('gpm::datrpc install')
    // TODO: improve this, because we are saving in memory and maybe some packages can be BIG :o
    return new Promise((resolve, reject) => {
      dat.archive.readFile(`/${packageName}/${version}/${packageName}.tar`, (err, content) => {
        if (err) {
          return reject(err)
        }
        resolve(content)
      })
    })
  }
})

class Daemon extends Command {
  async run () {
    const { args } = this.parse(Daemon)
    const baseDir = `${this.config.home}/${gModulesDir}`
    this.log('gpm::starting daemon command...')
    this.log(`gpm::using key: [${getKey(registryId).substr(0, 6)}]`)
    Dat(baseDir, { key: getKey(registryId), sparse: true }, (err, dat) => {
      if (err) return this.error(err)

      const network = dat.joinNetwork()

      network.on('connection', (info) => {
        this.log('gpm::connected to a peer')
      })

      dat.archive.ready(() => {
        const server = createServer(async socket => {
          try {
            this.log('gpm::connecting to dat-rpc daemon...')
            await znode(socket, DATRPC(dat))
          } catch (err) {
            this.error(err)
          }
        })

        server.listen(args.port, (err) => {
          if (err) {
            this.error(err)
          }
          this.log(`gpm::daemon dat-rpc pp ready on port ${args.port}`)
        })
      })
    })
  }
}

Daemon.args = [
  {
    name: 'port',
    description: 'Starts the dat-rpc daemon on the selected port.',
    default: port
  }
]

Daemon.description = 'Fetch a package from the dat based registry'

module.exports = Daemon
