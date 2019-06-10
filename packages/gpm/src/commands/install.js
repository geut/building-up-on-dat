const { createReadStream, mkdirSync } = require('fs')
const { pipeline } = require('stream')
const { Command } = require('@oclif/command')
const Dat = require('dat-node')
const tar = require('tar')
const { getKey } = require('../keys')
const { registryId, gModulesDir } = require('../config')

class Install extends Command {

  async run () {
    const { args } = this.parse(Install)
		// TODO: check if !args.package, then we need to look for a package.json and install all deps
    const baseDir = `${this.config.home}/${gModulesDir}`
    this.log(`Downloading package ${args.package}...`)
    this.log(`Using key: [${getKey(registryId).substr(0,6)}]`)
    Dat(baseDir, {key: getKey(registryId), sparse: true}, (err, dat) => {
      if (err) return this.error(err)

      const network = dat.joinNetwork()
      network.on('connection', (info) => {
        this.log('connected to a peer')
      })

      dat.archive.ready(() => {
        // Manually download files via the hyperdrive API:
        dat.archive.readFile(`/${args.package}/1.0.0/${args.package}.tar`, (err, content) => {
          if (err) {
            if (err.notFound) {
              this.log(`${args.package} not found`)
            } else {
              this.error(err)
            }
          } else {
            // move file to pwd/node_modules and untar it
            mkdirSync('./node_modules')
            mkdirSync(`./node_modules/${args.package}`)
            pipeline(
              createReadStream(`${baseDir}/${args.package}/1.0.0/${args.package}.tar`),
              tar.x({
                C: `./node_modules/${args.package}`
              }),
              (err) => {
                if (err) return this.error(err)
                this.log(`${args.package} downloaded succesfully`)
                process.exit(0)
              }
            )
          }
        })

      })
    })
  }
}

Install.args = [
  {
    name: 'package',
    description: 'Download selected <package> from the dat based registry'
  }
]

Install.description = 'Fetch a package from the dat based registry'

module.exports = Install
