gpm
===

A package manager built on top of Dat. For fun. THIS IS JUST A DEMO/TOY PROJECT.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/gpm.svg)](https://npmjs.org/package/gpm)
[![Downloads/week](https://img.shields.io/npm/dw/gpm.svg)](https://npmjs.org/package/gpm)
[![License](https://img.shields.io/npm/l/gpm.svg)](https://github.com/geut/gpm/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @geut/gpm
$ gpm COMMAND
running command...
$ gpm (-v|--version|version)
gpm/0.0.0 darwin-x64 node-v8.11.3
$ gpm --help [COMMAND]
USAGE
  $ gpm COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`gpm hello`](#gpm-hello)
* [`gpm help [COMMAND]`](#gpm-help-command)

## `gpm install`

Install a new package from the dat based registry.
```
USAGE
  $ gpm install <somePackage>

DESCRIPTION
  ...
  If no arguments are passed it will try to parse your package.json dependencies and retrieve them.
```

_See code: [src/commands/install.js](https://github.com/geut/gpm/blob/v0.0.0/src/commands/install.js)_

## `gpm help [COMMAND]`

display help for gpm

```
USAGE
  $ gpm help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_
<!-- commandsstop -->
