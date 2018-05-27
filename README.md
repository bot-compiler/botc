botc
====

CLI to create Chat bots using [Bot Compiler](https://abhivijay96.gitbooks.io/bot-compiler/content/quickstart.html)

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
botc/1.2.0 linux-x64 node-v10.0.0
$ botc --help [COMMAND]
USAGE
  $ botc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [botc help [COMMAND]](#botc-help-command)

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
<!-- commandsstop -->
* [botc init]
* [botc build]
* [botc rebuild]

# VSCode extension 
[Get VSCode extension here to start writing Bot Compiler schema with intellisense](https://marketplace.visualstudio.com/items?itemName=abhivijay96.Bot Compiler-schema-intellisense)

# Quickstart
[Gmail Filter creator - Chat bot to create Gmail filters](https://abhivijay96.gitbooks.io/bot-compiler/content/quickstart.html)

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
