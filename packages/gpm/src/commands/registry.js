const path = require('path')
const { Command } = require('@oclif/command')

const startRegistry = require('../../registry')

class Registry extends Command {
  async run () {
    const { args } = this.parse(Registry)

    const directory = path.resolve(args.directory)

    startRegistry(directory)
  }
}

Registry.args = [
  {
    name: 'directory',
    description: 'Directory where to store the modules.',
    default: process.cwd()
  }
]

Registry.description = 'Run your own registry.'

module.exports = Registry
