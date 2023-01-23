module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
          '@svgr/webpack',
          {
              loader: 'url-loader',
              options: {
                  esModule: false,
              },
          }
      ],
    });

    return config;
  },
};
