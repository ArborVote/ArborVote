const { assert } = require('chai')
const { assertRevert } = require('@aragon/contract-test-helpers/assertThrow')
const { newDao, newApp } = require('./helpers/dao')
const { setOpenPermission } = require('./helpers/permissions')

const ArborVoteApp = artifacts.require('ArborVoteApp.sol')

contract('ArborVoteApp', ([appManager, user]) => {
  const INIT_VALUE = 'We should plant more trees in cities.'

  let appBase, app

  before('deploy base app', async () => {
    // Deploy the app's base contract.
    appBase = await ArborVoteApp.new(INIT_VALUE)
  })

  beforeEach('deploy dao and app', async () => {
    const { dao, acl } = await newDao(appManager)

    // Instantiate a proxy for the app, using the base contract as its logic implementation.
    const proxyAddress = await newApp(dao, 'ArborVote', appBase.address, appManager)
    app = await ArborVoteApp.at(proxyAddress)

    // Set up the app's permissions.
    await setOpenPermission(acl, app.address, await app.VOTE_ROLE(), appManager)

    // Initialize the app's proxy.
    await app.initialize(INIT_VALUE)
  })

  it('should be incremented by any address', async () => {
    await app.increment(1, { from: user })
    assert.equal(await app.value(), INIT_VALUE + 1)
  })

  it('should not be decremented beyond 0', async () => {
    await assertRevert(app.decrement(INIT_VALUE + 1))
  })
})

///*0*/debate = await new Debate('We should plant more trees in cities.');
//const creator = await debate.getCreator(0);
//console.log(debate);
///*1*/debate.addArgument(debate.getId(0), 'Trees are good for the environment.', true);
///*2*/debate.addArgument(debate.getId(0), 'Trees are too costly.', false);
///*3*/debate.addArgument(debate.getId(0), 'Trees are just awesome.', false);
//
///*4*/debate.addArgument(debate.getId(1), 'Trees improve air quality.', true);
///*5*/debate.addArgument(debate.getId(1), 'Trees cool cities during hot seasons.', true);
///*6*/debate.addArgument(debate.getId(2), 'Trees are expensive to maintain.', false);
///*7*/debate.addArgument(debate.getId(2), 'Trees block valuable public space.', false);
//
///*8*/debate.addArgument(debate.getId(6), 'Maintenance only costs 5£/month.', true);
//