const express = require('express')
const app = express()
const Dat = require('dat-node')

// 1. Load the modules registry
Dat('./registry/modules', function (err, dat) {
  if (err) throw err

  // 2. Import the files
  const importer = dat.importFiles('./registry/modules', {watch: true, ignoreDirs: false});

  console.log({importer})
  importer.on('error', console.log)
  importer.on('put-end', function (src, dest) {
    console.log('Added package', dest.name)
  })
  console.log('dat.live', dat.live)
  // 3. Share the files on the network!
  dat.joinNetwork()
  // (And share the link)
  console.log('Registry Dat link is: dat://' + dat.key.toString('hex'))

  startServer({ dat });
})

function startServer ({ dat }) {
  console.log('Starting registry endpoint')
  app.get('/key', function(req, res) {
    res.send({ key: dat.key.toString('hex') })
  });

  app.route('/packages')
    .get(function(req, res) {
      // simply list all packages
    })
    .post(function(req, res) {
      // push new package into the registry
      res.send('Package upload ok')
    })

  app.listen(8080)
}

