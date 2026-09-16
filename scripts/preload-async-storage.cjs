const memory = new Map();

const AsyncStorageMock = {
  getItem: async (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: async (key, value) => {
    memory.set(key, value);
  },
  removeItem: async (key) => {
    memory.delete(key);
  },
  clear: async () => {
    memory.clear();
  },
};

const abs = require.resolve("@react-native-async-storage/async-storage");
require.cache[abs] = {
  id: abs,
  filename: abs,
  loaded: true,
  exports: AsyncStorageMock,
};

module.exports = { AsyncStorageMock, memory };
