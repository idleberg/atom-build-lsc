'use babel';

import { install } from 'atom-package-deps';
import { execSync } from 'child_process';

// Package settings
import meta from '../package.json';
const notEligible = `**${meta.name}**: \`lsc\` is not in your PATH`;

// This package depends on build, make sure it's installed
export function activate() {
  if (!atom.inSpecMode()) {
    install(meta.name);
  }
}

export function provideBuilder() {
  return class LscProvider {
    constructor(cwd) {
      this.cwd = cwd;
    }

    getNiceName() {
      return 'LiveScript';
    }

    isEligible() {
      try {
        stdout = execSync('lsc --version');
        if (atom.inDevMode()) atom.notifications.addInfo(`**${meta.name}**`, { detail: stdout, dismissable: false });
        return true;
      } catch (error) {
        if (atom.inDevMode()) atom.notifications.addError(notEligible, { detail: error, dismissable: true });
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
          atomCommandName: 'lsc:compile',
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
          atomCommandName: 'lsc:compile',
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
          atomCommandName: 'lsc:compile',
          errorMatch: errorMatch,
          warningMatch: warningMatch
        }
      ];
    }
  };
}
