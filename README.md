botc
====

CLI to create Chat bots using [Bot Compiler](https://abhivijay96.gitbooks.io/bot-compiler/content/)

[![Version](https://img.shields.io/npm/v/botc.svg)](https://npmjs.org/package/botc)
[![License](https://img.shields.io/npm/l/botc.svg)](https://github.com/bot-compiler/botc/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [VSCode extension ](#vs-code-extension)
* [Quickstart](#quickstart)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g botc
$ botc COMMAND
running command...
$ botc (-v|--version|version)
botc/1.2.1 linux-x64 node-v10.0.0
$ botc --help [COMMAND]
USAGE
  $ botc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [botc build](#botc-build)
* [botc help [COMMAND]](#botc-help-command)
* [botc init](#botc-init)
* [botc rebuild](#botc-rebuild)

## botc build

initial scaffolding from bot.atmt.json

```
USAGE
  $ botc build

OPTIONS
  -d, --dialogflow  use dialogflow

EXAMPLE
  $ botc build
```

_See code: [src/commands/build.ts](https://github.com/bot-compiler/botc/blob/v1.2.1/src/commands/build.ts)_

## botc help [COMMAND]

display help for botc

```
USAGE
  $ botc help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v1.2.1/src/commands/help.ts)_

## botc init

create bot.json and functions.json

```
USAGE
  $ botc init

OPTIONS
  -n, --name=name  name of the bot

EXAMPLE
  $ botc init --name bot_name
  creating bot.json
```

_See code: [src/commands/init.ts](https://github.com/bot-compiler/botc/blob/v1.2.1/src/commands/init.ts)_

## botc rebuild

apply changes in bot.atmt.json, preserve function implementations in *Impl.js files

```
USAGE
  $ botc rebuild

EXAMPLE
  $ botc rebuild
```

_See code: [src/commands/rebuild.ts](https://github.com/bot-compiler/botc/blob/v1.2.1/src/commands/rebuild.ts)_
<!-- commandsstop -->
* [botc init]
* [botc build]
* [botc rebuild]

# VSCode extension 
[Get VSCode extension here to start writing Bot Compiler schema with intellisense](https://marketplace.visualstudio.com/items?itemName=abhivijay96.bot-compiler-schema-support)

# Quickstart
[Gmail Filter creator - Chat bot for pizza ordering](https://abhivijay96.gitbooks.io/bot-compiler/content/chapter1/example.html)

## botc init -n [BotName]

describe the command here
create bot.json and functions.json
```

USAGE
  $ botc init

OPTIONS
  -n, --name=name  name of the bot

EXAMPLE
  $ botc init --name bot_name
  creating bot.json
```

## botc build
initial scaffolding from bot.json
```

USAGE
  $ botc build

OPTIONS
  -d, --dialogflow  use dialogflow

EXAMPLE
  $ botc build
```

## botc rebuild
apply changes in bot.json, preserve function implementations in *Impl.js files
```

USAGE
  $ botc rebuild

EXAMPLE
  $ botc rebuild
```
