'use strict';

const { makeConfig } = require('@webgrip/semantic-release-config');

module.exports = makeConfig({
  changelog: false,
  extraReleaseRules: [{ type: 'content', release: 'patch' }],
});
