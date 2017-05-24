'use babel';

import { EventEmitter } from 'events';
import { platform} from 'os';
import { spawnSync } from 'child_process';

// Package settings
import meta from '../package.json';

export const config = {
  customArguments: {
    title: 'Custom Arguments',
    description: 'Specify your preferred arguments for `lsc`',
    type: 'string',
    'default': '--compile',
    order: 0
  },
  manageDependencies: {
    title: 'Manage Dependencies',
    description: 'When enabled, third-party dependencies will be installed automatically',
    type: 'boolean',
    default: true,
    order: 1
  },
  alwaysEligible: {
    title: 'Always Eligible',
    description: 'The build provider will be available in your project, even when not eligible',
    type: 'boolean',
    default: false,
    order: 2
  }
};

// This package depends on build, make sure it's installed
export function activate() {
  if (atom.config.get(meta.name + '.manageDependencies') === true) {
    this.satisfyDependencies();
  }
}

export function which() {
  if (platform() === 'win32') {
    return 'where';
  }
  return 'which';
}

export function satisfyDependencies() {
  let k;
  let v;

  require('atom-package-deps').install(meta.name);

  const ref = meta['package-deps'];
  const results = [];

  for (k in ref) {
    if (typeof ref !== 'undefined' && ref !== null) {
      v = ref[k];
      if (atom.packages.isPackageDisabled(v)) {
        if (atom.inDevMode()) {
          console.log('Enabling package \'' + v + '\'');
        }
        results.push(atom.packages.enablePackage(v));
      } else {
        results.push(void 0);
      }
    }
  }
  return results;
}

export function provideBuilder() {
  return class LscProvider extends EventEmitter {
    constructor(cwd) {
      super();
      this.cwd = cwd;
      atom.config.observe('build-lsc.customArguments', () => this.emit('refresh'));
    }

    getNiceName() {
      return 'LiveScript';
    }

    isEligible() {
      if (atom.config.get(meta.name + '.alwaysEligible') === true) {
        return true;
      }

      const cmd = spawnSync(which(), ['lsc']);
      if (!cmd.stdout.toString()) {
        return false;
      }

      return true;
    }

    settings() {
      const errorMatch = [
        '(?<message>.+rror.+) on line (?<line>\\d+)\\r?\\nat (?<file>.+)'
      ];
      // SyntaxError: unmatched dedent (1 for 3) on line 5
      // at /Users/jst1/.atom/packages/build-lsc/test.ls

      const warningMatch = [
      ];

      // User settings
      const customArguments = atom.config.get(meta.name + '.customArguments').trim().split(' ');
      customArguments.push('{FILE_ACTIVE}');

      return [
        {
          name: 'LiveScript',
          exec: 'lsc',
          args: [ '--compile', '{FILE_ACTIVE}' ],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'cmd-alt-b',
          atomCommandName: 'lsc:compile',
          errorMatch: errorMatch,
          warningMatch: warningMatch
        },
        {
          name: 'LiveScript --map',
          exec: 'lsc',
          args: [ '--compile', '--map', 'linked', '{FILE_ACTIVE}' ],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'cmd-alt-b',
          atomCommandName: 'lsc:compile-and-create-map',
          errorMatch: errorMatch,
          warningMatch: warningMatch
        },
        {
          name: 'LiveScript (user)',
          exec: 'lsc',
          args: customArguments,
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'cmd-alt-b',
          atomCommandName: 'lsc:compile-with-user-settings',
          errorMatch: errorMatch,
          warningMatch: warningMatch
        },
        {
          name: 'Watch LiveScript',
          exec: 'lsc',
          args: [ '--watch', '--compile', '{FILE_ACTIVE}' ],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'cmd-alt-b',
          atomCommandName: 'lsc:watch-and-compile',
          errorMatch: errorMatch,
          warningMatch: warningMatch
        },
        {
          name: 'Watch LiveScript --map',
          exec: 'lsc',
          args: [ '--watch', '--compile', '--map', 'linked', '{FILE_ACTIVE}' ],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'cmd-alt-b',
          atomCommandName: 'lsc:watch-and-compile-with-map',
          errorMatch: errorMatch,
          warningMatch: warningMatch
        }
      ];
    }
  };
}
