const express = require('express')
const Dat = require('dat-node')
const multer  = require('multer')

const destDir = `${__dirname}/modules/`
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destDir)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname)
  }
})
const upload = multer({storage: multerStorage}).any()
const app = express()

const drainStream = stream =>
  new Promise((resolve, reject) => {
    let dataParts = [Buffer.alloc(0)];
    // this is so Buffer.concat doesn’t error if nothing comes;
    stream.on('data', d => dataParts.push(d));
    stream.on('error', reject);
    stream.on('close', () => {
      resolve(Buffer.concat(dataParts));
    });
  });

// 1. Load the modules registry
Dat('./registry/modules', function (err, dat) {
  if (err) throw err

  // 2. Import the files
  const importer = dat.importFiles('./registry/modules', {watch: true, ignoreDirs: false});

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
    res.json({ key: dat.key.toString('hex') })
  });

  app.route('/packages')
    .get(function(req, res) {
      // simply list all packages
    })
    .post(upload, function(req, res) {
      console.log('req.file', req.file)
      console.log('req.package', req.package)
      res.json({ status: 200, msg: 'Package received OK' })
      // Everything went fine.
      // push new package into the registry
      //console.log('req.files >>>', req.file)
      //console.log('req.files >>>', req.files)
      /*
      try {
        const file = await drainStream(req)
        console.log('file', file.toString())
      } catch (err) {
        res.json({status: 500, msg: err.message})
      }
      */
    })

  app.listen(8080)
}

