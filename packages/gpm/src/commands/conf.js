const { Command } = require('@oclif/command')
const config = require('../config')

class Conf extends Command {
  async run () {
    const { args } = this.parse(Conf)

    if (args.key && args.value) {
      config.set(args.key, args.value)
    } else if (args.key) {
      this.log(`key = ${config.get(args.key)}`)
    } else {
      this.log(JSON.stringify(config.store))
    }
  }
}

Conf.args = [
  {
    name: 'key',
    description: 'Key configuration.'
  },
  {
    name: 'value',
    description: 'Value configuration.'
  }
]

Conf.description = 'Configuration for gpm.'

module.exports = Conf
