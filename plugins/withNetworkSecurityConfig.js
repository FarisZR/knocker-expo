const { withAndroidManifest, AndroidConfig, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const XML_NAME = 'network_security_config.xml';
const XML_DIR = ['app', 'src', 'main', 'res', 'xml'];

const buildXml = (domains) => {
  if (!domains || domains.length === 0) {
    return `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
`;
  }

  const domainConfigs = domains
    .map(
      (domain) => `    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">${domain}</domain>
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </domain-config>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
${domainConfigs}
</network-security-config>
`;
};

const withNetworkSecurityConfig = (config, props = {}) => {
  const { domains } = props;

  config = withAndroidManifest(config, async (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    if (!app.$['android:networkSecurityConfig']) {
      app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    }
    return cfg;
  });

  const xmlContent = buildXml(domains);

  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const xmlPath = path.join(cfg.modRequest.projectRoot, 'android', ...XML_DIR, XML_NAME);
      await fs.promises.mkdir(path.dirname(xmlPath), { recursive: true });
      await fs.promises.writeFile(xmlPath, xmlContent, 'utf8');
      return cfg;
    },
  ]);
};

module.exports = withNetworkSecurityConfig;