const Module = require("module");

const originalLoad = Module._load;

Module._load = function (request, parent, isMain) {
  if (request === "@sentry/profiling-node") {
    return {
      nodeProfilingIntegration: () => ({ name: "nodeProfilingIntegration" }),
    };
  }
  return originalLoad(request, parent, isMain);
};
