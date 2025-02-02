'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = defaultResolver;
exports.clearDefaultResolverCache = clearDefaultResolverCache;

function fs() {
  const data = _interopRequireWildcard(require('fs'));

  fs = function() {
    return data;
  };

  return data;
}

function _resolve() {
  const data = require('resolve');

  _resolve = function() {
    return data;
  };

  return data;
}

function _browserResolve() {
  const data = require('browser-resolve');

  _browserResolve = function() {
    return data;
  };

  return data;
}

function _realpathNative() {
  const data = require('realpath-native');

  _realpathNative = function() {
    return data;
  };

  return data;
}

function _jestPnpResolver() {
  const data = _interopRequireDefault(require('jest-pnp-resolver'));

  _jestPnpResolver = function() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function() {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function defaultResolver(path, options) {
  // @ts-ignore: the "pnp" version named isn't in DefinitelyTyped
  if (process.versions.pnp) {
    return (0, _jestPnpResolver().default)(path, options);
  }

  const resolve = options.browser ? _browserResolve().sync : _resolve().sync;
  const result = resolve(path, {
    basedir: options.basedir,
    extensions: options.extensions,
    isDirectory,
    isFile,
    moduleDirectory: options.moduleDirectory,
    paths: options.paths,
    preserveSymlinks: false
  });

  try {
    // Dereference symlinks to ensure we don't create a separate
    // module instance depending on how it was referenced.
    const resolved = (0, _realpathNative().sync)(result);

    if (resolved) {
      return resolved;
    }
  } catch (_unused) {
    // ignore
  }

  return result;
}

function clearDefaultResolverCache() {
  checkedPaths.clear();
}

var IPathType;

(function(IPathType) {
  IPathType[(IPathType['FILE'] = 1)] = 'FILE';
  IPathType[(IPathType['DIRECTORY'] = 2)] = 'DIRECTORY';
  IPathType[(IPathType['OTHER'] = 3)] = 'OTHER';
})(IPathType || (IPathType = {}));

const checkedPaths = new Map();

function statSyncCached(path) {
  const result = checkedPaths.get(path);

  if (result !== undefined) {
    return result;
  }

  let stat;

  try {
    stat = fs().statSync(path);
  } catch (e) {
    if (!(e && (e.code === 'ENOENT' || e.code === 'ENOTDIR'))) {
      throw e;
    }
  }

  if (stat) {
    if (stat.isFile() || stat.isFIFO()) {
      checkedPaths.set(path, IPathType.FILE);
      return IPathType.FILE;
    } else if (stat.isDirectory()) {
      checkedPaths.set(path, IPathType.DIRECTORY);
      return IPathType.DIRECTORY;
    }
  }

  checkedPaths.set(path, IPathType.OTHER);
  return IPathType.OTHER;
}
/*
 * helper functions
 */

function isFile(file) {
  return statSyncCached(file) === IPathType.FILE;
}

function isDirectory(dir) {
  return statSyncCached(dir) === IPathType.DIRECTORY;
}
