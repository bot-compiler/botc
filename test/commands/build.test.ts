import {expect, test} from '@oclif/test'

describe('build', () => {
  test
  .stdout()
  .command(['build'])
  .it('runs build', ctx => {
    expect(ctx.stdout).to.contain('Done scaffolding from bot.json')
  })
})
