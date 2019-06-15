const { mkdirSync } = require('fs')
const { Readable } = require('stream')
const { connect } = require('net')
const { pipeline } = require('stream')
const { Command, flags } = require('@oclif/command')
const { extract } = require('tar-fs')
const znode = require('znode')
const { port } = require('../config')

const createReadStreamFromBuffer = (buffer) => {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

class Install extends Command {
  async run () {
    const { args, flags } = this.parse(Install)
    // TODO: check if !args.package, then we need to look for a package.json and install all deps
    const socket = connect(port)
    try {
      const remote = await znode(socket)
      this.log(`gpm::downloading package ${args.package}...`)
      const tarBuffer = await remote.install({ packageName: args.package, version: flags.version })
      mkdirSync(`./node_modules/${args.package}`, { recursive: true })
      pipeline(
        createReadStreamFromBuffer(tarBuffer),
        extract(`./node_modules/${args.package}`),
        (err) => {
          if (err) return this.error(err)
          this.log(`gpm::${args.package} installed succesfully`)
          process.exit(0)
        }
      )
    } catch (err) {
      this.error(err)
    }
  }
}

Install.args = [
  {
    name: 'package',
    description: 'Download selected <package> from the dat based registry'
  }
]

Install.flags = {
  version: flags.string({
    char: 'v',
    description: 'Specific version to retrieve from the dat based registry',
    default: '1.0.0'
  })
}

Install.description = 'Fetch a package from the dat based registry'

module.exports = Install
