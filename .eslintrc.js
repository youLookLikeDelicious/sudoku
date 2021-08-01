module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:vue/essential'
  ],
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module'
  },
  'plugins': [
    'vue'
  ],
  'rules': {
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'comma-dangle': ['warn', 'never'],
    indent: [2, 2]
  }
}