import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'

const app = new Aragon()

app.store(
  async (state, { event }) => {
    const nextState = {
      ...state,
    }

    try {
      switch (event) {
        case 'Voted':
          return { ...nextState, votes: await getVotes(0) }
        case events.SYNC_STATUS_SYNCING:
          return { ...nextState, isSyncing: true }
        case events.SYNC_STATUS_SYNCED:
          return { ...nextState, isSyncing: false }
        default:
          return state
      }
    } catch (err) {
      console.log(err)
    }
  },
  {
    init: initializeState(),
  }
)

/***********************
 *                     *
 *   Event Handlers    *
 *                     *
 ***********************/

function initializeState() {
  return async cachedState => {
    return {
      ...cachedState,
      count: await getArgumentsCount(),
      votes: await getVotes(0),
    }
  }
}

async function getArgumentsCount() {
  return parseInt(await app.call('argumentsCount').toPromise(), 10)
}

async function getVotes(id) {
  return parseInt(await app.call('getVotes', id).toPromise(), 10)
}
