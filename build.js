

const esbuild = require('esbuild');
const kontra = require('esbuild-plugin-kontra');


esbuild
  .build({
    entryPoints: ['main.js'],
    bundle: true,
    outfile: 'game.dist.js',
    plugins: [
      kontra({
        gameObject: {
          anchor: true,
          opacity: false,
          ttl: true,
          velocity: true
        },
        text: {
          newline: true,
          rtl: true,
          textAlign: true
        },
        vector: {
          clamp: true,
          length: true
        }
      })
    ]
  });

