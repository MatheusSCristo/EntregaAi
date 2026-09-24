const { spawnSync } = require('node:child_process');

const prismaCli = require.resolve('prisma/build/index.js');
const result = spawnSync(process.execPath, [prismaCli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PRISMA_GENERATE_SKIP_AUTOINSTALL: '1',
  },
});

process.exit(result.status ?? 1);
