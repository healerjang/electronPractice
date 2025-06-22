const path = require("path");

module.exports = {
    devServer: {
        hot: true,
        liveReload: true,
    },
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.resolve = webpackConfig.resolve || {};
            webpackConfig.resolve.fallback = {
                ...(webpackConfig.resolve.fallback || {}),
                fs: false,
                path: require.resolve('path-browserify'),
                stream:  require.resolve('stream-browserify'),
            };

            webpackConfig.resolve.alias = {
                ...(webpackConfig.resolve.alias || {}),
                "@styles": path.resolve(__dirname, "src/styles"),
                "@components": path.resolve(__dirname, "src/components"),
                "@utils": path.resolve(__dirname, "src/utils"),
                "@icons": path.resolve(__dirname, "src/icons"),
                "@slices": path.resolve(__dirname, "src/slices"),
                "@providers": path.resolve(__dirname, "src/providers"),
                "@pages": path.resolve(__dirname, "src/pages"),
            };

            // webpackConfig.target = 'electron-renderer';
            return webpackConfig;
        }
    }
}