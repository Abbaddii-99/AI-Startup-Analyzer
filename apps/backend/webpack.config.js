module.exports = (options, webpack) => {
  return {
    ...options,
    externals: [
      (ctx, callback) => {
        if (ctx.request && ctx.request.startsWith('@ai-analyzer/')) {
          return callback();
        }
        const defaultExternals = options.externals?.[0];
        if (typeof defaultExternals === 'function') {
          return defaultExternals(ctx, callback);
        }
        callback();
      },
    ],
  };
};
