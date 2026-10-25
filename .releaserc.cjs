'use strict';

const { makeConfig } = require('@webgrip/semantic-release-config');

module.exports = makeConfig({
  extraReleaseRules: [{ type: 'content', release: 'patch' }],
});
