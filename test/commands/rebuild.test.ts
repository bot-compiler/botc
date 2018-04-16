import {expect, test} from '@oclif/test'

describe('rebuild', () => {
  test
  .stdout()
  .command(['rebuild'])
  .it('runs rebuild', ctx => {
    expect(ctx.stdout).to.contain('Done applying changes from bot.json')
  })
})
