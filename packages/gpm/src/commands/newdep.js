const {Command} = require('@oclif/command')
const Dat = require('dat-node')
const fetch = require('node-fetch');
const packlist = require('npm-packlist')
const tar = require('tar')
const config = require('../config')

class NewDep extends Command {
  async run() {
    // TASKS:
    // - check if package.json is valid: must have name and version
    // - check if package name and version does not already exists on registry
    // - run npm-packlist
    // - upload the tar (post against our registry super peer)
    const {args} = this.parse(NewDep)
    this.log('Validation package.json...')
    try {
      const files = await packlist({ path: args.package })
      const tarFilesStream = await tar({
        prefix: 'package/',
        cwd: packageDir,
        gzip: true
      }, files)

      this.log('Uploading package...')
      // upload files to registry
      const res = await fetch(`${config.endpoint.base}${config.endpoint.packages}`, {
        method: 'POST',
        body: tarFilesStream,
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.status === 200){
        this.log('Package succesfully uploaded to the registry')
      } else {
        this.warn(`Oops something happened. Received status: ${res.status}`)
      }
      this.exit()
    } catch (err) {
      this.error(err);
    }

    this.log('Preparing to parse and upload the new dependency')
    //

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
    default: '.',
  }
]


module.exports = NewDep
