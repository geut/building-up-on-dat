import Dat from 'dat-js';

const dat = new Dat({ sparseMetadata: false });

const defaultState = () => ({
  parents: []
})

function getArchive (url, opts={}) {
  return new Promise((resolve, reject) => {
    url = url.replace(/\/$/, '')
    const hd = dat.get(url, opts)
    hd.ready(() => {
      console.log({ key: hd.key })
      if (hd.content) {
        resolve({ archive: hd, swarm: dat.swarm })
      } else {
        hd.on('syncing', () => {console.log('syncing content...')})
        hd.on('content', () => {
          const archive = dat.archives.find(h => h.key.toString('hex') === url || h.url === url)
          console.log({archive})
          resolve({ archive, swarm: dat.swarm })
        })
      }
    })
  })
}

function getFileContent(archive, path) {
  return new Promise((resolve, reject) => {
    // todo, check file type (mime type?)
    archive.readFile(path, 'utf-8', (err, content) => {
      if (err) reject(err);
      else resolve(content);
    })
  });
}

function getDirContent(archive, path){
  return new Promise((resolve, reject) => {
    archive.readdir(path, (err, files) => {
      if (err) reject(err);
      else {
        resolve(files);
      }
    });
  })
}


async function stat(archive, path) {
  return new Promise((resolve, reject) => {
    archive.stat(path, (err, stat) => {
      if (err) reject(err);
      else resolve(stat);
    })
  })
}

function buildPath(explorerState, filename) {
  const path = explorerState.parents.reduce((prev, curr) => {
    return `${prev}/${curr}`;
  }, '');
  return `${path}/${filename}`.replace(/^\/+/g, '');
}

async function buildFileItems(archive, list, explorerState=defaultState()) {
    console.log('buildFileItems triggered.');

    const fileItems = [];
    for (let i = 0; i < list.length; i++) {
      const filename = list[i];
      const fullPath = buildPath(explorerState, filename);
      const fileStat = await stat(archive, fullPath);

      const item = {
        label: filename,
        size: fileStat.size,
        modifiedTimestamp: fileStat.mtime.getTime(),
        nativeIndex: i,
        fullPath
      }

      if (!fileStat.isFile()) {
        item.children = [];
      }

      fileItems.push(item)
    }

    return fileItems;
  }

async function renderContentBasic(archive, path) {
  const found = await stat(archive, path);
  console.log('renderContentBasic stat', found)
  if (found.isFile()) {
    const fileContent = await getFileContent(archive, path);
    console.log('some content', fileContent);
  } else {
    // return files
    const list = await getDirContent(archive, path);
    console.log({ list });
    const files = await buildFileItems(archive, list);
    console.log({ files });
    return files;
  }
}

async function getChildrens (explorerState, archive, item) {
  // TODO: fix path creation
  const list = await getDirContent(archive, `${item.fullPath ? item.fullPath : item.label}`);
  const files = await buildFileItems(archive, list, { parents: [item.fullPath] });
  console.log({files})
  return files;
}

async function loadDat (options={}) {
  const alreadyLoaded = dat.has(options.dat)
  console.log('alreadyLoaded', alreadyLoaded)
  try {
    const { archive, swarm } = await getArchive(options.dat)
    const content = await renderContentBasic(archive, options.path || '/')
    return {
      content,
      archive,
      swarm
    }
  } catch(e) {
    console.error(e);
    return { content: [], archive: {}, swarm: {} };
  }
}

const archives = dat.archives

export default {
  loadDat,
  getChildrens,
  archives
}
