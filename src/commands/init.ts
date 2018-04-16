import { Command, flags } from '@oclif/command'
import * as fs from 'fs';
import * as path from 'path';

export default class init extends Command {
  static description = 'create bot.json and functions.json'

  static examples = [
    `$ botc init --name bot_name
creating bot.json
`,
  ]

  static flags = {
    name: flags.string({ char: 'n', description: 'name of the bot' })
  }

  static args = []

  async run() {
    const { args, flags } = this.parse(init)

    const name = flags.name || 'bot'

    if (!name.match(/^[a-z0-9]+$/i))
      this.error('Name must be alphanumeric');
    
    else
    {
      let botDir = path.join(process.cwd(), name);
      fs.mkdirSync(botDir);
      fs.writeFileSync(path.join(botDir, 'bot.json'), '');
      this.log('To get started');
      this.log('open ' + botDir + ' in vscode');
      this.log('Install https://marketplace.visualstudio.com/items?itemName=abhivijay96.bot-compiler-schema-support\n');
      this.log('Docs at https://abhivijay96.gitbooks.io/bot-compiler/content/\n');
      this.log('use "botc build" after editing bot.json to do the initial scaffolding\n');
      this.log('"botc rebuild" to edit microbots without deleting functions already implemented in any *impl.js');
    }
  }
}
