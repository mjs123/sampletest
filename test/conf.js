// An example configuration file.
exports.config = {
  //directConnect: true,
  seleniumAddress:"http://35.222.142.226/wd/hub",

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  // Framework to use. Jasmine is recommended.
  framework: 'jasmine',

  // Spec patterns are relative to the current working directory when
  // protractor is called.
  specs: [
    'example_spec.js',
    'angular_material/input_spec.js',
    'angular_material/mat_paginator_spec.js'

  ],

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
