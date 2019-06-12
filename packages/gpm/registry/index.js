const express = require('express')
const Dat = require('dat-node')
const multer = require('multer')
const tar = require('tar-fs')
const tempy = require('tempy')
const path = require('path')
const { readFile } = require('fs')
const { pipeline } = require('stream')
const { promisify } = require('util')

const destDir = `${__dirname}/modules/`
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destDir)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname)
  }
})
const upload = multer({ storage: multerStorage }).any()
const app = express()

// 1. Load the modules registry
Dat('./registry/modules', function (err, dat) {
  if (err) throw err

  // 2. Import the files
  const importer = dat.importFiles('./registry/modules', { watch: true, ignoreDirs: false })

  importer.on('error', console.log)
  importer.on('put-end', function (src, dest) {
    console.log('Added package', dest.name)
  })
  console.log('dat.live', dat.live)
  // 3. Share the files on the network!
  dat.joinNetwork()
  // (And share the link)
  console.log('Registry Dat link is: dat://' + dat.key.toString('hex'))

  startServer({ dat })
})

function startServer ({ dat }) {
  console.log('Starting registry endpoint')

  app.get('/key', function (req, res) {
    res.json({ key: dat.key.toString('hex') })
  })

  app.route('/packages')
    .get(function (req, res) {
      // simply list all packages
    })
    .post(upload, async function (req, res) {
      try {
        const tmp = tempy.directory()

        await promisify(pipeline)(req, tar.extract(tmp))

        const packageJSON = JSON.parse(await promisify(readFile)(path.join(tmp, 'package.json')))

        const pathToExtract = path.join('.', 'registry', 'modules', packageJSON.name, packageJSON.version)

        await promisify(pipeline)(tar.pack(tmp), tar.extract(pathToExtract))

        res.json({ status: 200, msg: 'Package received OK' })
      } catch (err) {
        res.json({ status: 500, msg: err.message })
      }
    })

  app.listen(8080)
}
