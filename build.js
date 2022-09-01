

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
          ttl: false,
          velocity: true,
          rotation : false,
          scale : false
        },
        text: {
          newline: true,
          rtl: true,
          textAlign: true
        },
        vector: {
          clamp: true,
          length: true
        },
        sprite : {
          animation : false
        },
        tileEngine : {
          camera : false,
          dynamic : false,
          query : false,
          tiled : false
        }
      })
    ]
  });

