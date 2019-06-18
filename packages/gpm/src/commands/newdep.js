const { Command } = require('@oclif/command')
const fetch = require('node-fetch')
const packlist = require('npm-packlist')
const tar = require('tar-fs')
const config = require('../config')

class NewDep extends Command {
  async run () {
    // TASKS:
    // - check if package.json is valid: must have name and version
    // - check if package name and version does not already exists on registry
    // - run npm-packlist
    // - upload the tar (post against our registry super peer)
    const { args } = this.parse(NewDep)

    this.log('gpm::validating package.json...')

    try {
      const registryId = args.registryId
      const registry = config.get(`registries.${registryId}`)

      const files = await packlist({ path: args.package })

      const tarFile = tar.pack(null, {
        entries: files
      })

      this.log('gpm::uploading package...')
      // upload files to registry
      const res = await fetch(`http://${registry.http}${registry.packages || '/packages'}`, {
        method: 'POST',
        body: tarFile
      })
      const jsonRes = await res.json()
      if (jsonRes.status === 200) {
        this.log('gpm::package succesfully uploaded to the registry')
      } else {
        this.warn(`gpm::oops something happened. Received status: ${jsonRes.status} | ${jsonRes.msg}`)
      }
      this.exit()
    } catch (err) {
      this.error(err)
    }
  }
}

NewDep.description = `Add a new dependency to the registry
...
This will add a new entry to the gpm registry.
`

NewDep.args = [
  {
    name: 'package',
    description: 'Path to the new dependencys package.json file.',
    default: '.'
  },
  {
    name: 'registryId',
    description: 'Registry to use in gpm.',
    default: config.get('defaultRegistryId')
  }
]

module.exports = NewDep
