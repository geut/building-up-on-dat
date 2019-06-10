const { registryId: activeRegistry } = require('./config')

const keys = {
  [activeRegistry]: '5769446ccdb192a67799cb5a6394d45b5642c4ad181ebec4d49ee7fa98b98ff9'
}

function getKey (registryId=activeRegistry) {
  return keys[registryId];
}

function setKey (registryId, key) {
  if (!registryId) {
    throw new Error('mising argument: registryId')
  }
  keys[registryId] = key;
}

module.exports = {
  getKey,
  setKey
}
