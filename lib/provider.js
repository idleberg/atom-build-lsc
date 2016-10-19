'use babel';

import { install } from 'atom-package-deps';
import { execSync } from 'child_process';
import { EventEmitter } from 'events';

// Package settings
import meta from '../package.json';

this.config = {
  customArguments: {
    title: "Custom Arguments",
    description: "Specify your preferred arguments for `lsc`",
    type: "string",
    "default": "--compile",
    order: 0
  }
};

// This package depends on build, make sure it's installed
export function activate() {
  if (!atom.inSpecMode()) {
    install(meta.name);
  }
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
      try {
        stdout = execSync('lsc --version');
        if (atom.inDevMode()) atom.notifications.addInfo(meta.name, { detail: stdout, dismissable: false });
        return true;
      } catch (error) {
        if (atom.inDevMode()) atom.notifications.addError(meta.name, { detail: error, dismissable: true });
        return false;
      }
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
      let customArguments = atom.config.get('build-lsc.customArguments').trim().split(" ");
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
