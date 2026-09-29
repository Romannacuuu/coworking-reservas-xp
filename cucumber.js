module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['tests/support/**/*.ts', 'tests/step_definitions/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['summary'],
  },
};
