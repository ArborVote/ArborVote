import React from 'react'
import { useAragonApi } from '@aragon/api-react'
import {
  Box,
  Button,
  GU,
  Header,
  IconMinus,
  IconPlus,
  IconAddUser,
  Main,
  SyncIndicator,
  Tabs,
  Text,
  textStyle,
} from '@aragon/ui'
import styled from 'styled-components'

function App() {
  const { api, appState, path, requestPath } = useAragonApi()
  const { count, votes, isSyncing } = appState

  const pathParts = path.match(/^\/tab\/([0-9]+)/)
  const pageIndex = Array.isArray(pathParts)
    ? parseInt(pathParts[1], 10) - 1
    : 0

  return (
    <Main>
      {isSyncing && <SyncIndicator />}
      <Header
        primary="Counter"
        secondary={
          <Text
            css={`
              ${textStyle('title2')}
            `}
          >
            {count}
          </Text>
        }
      />
      <Tabs
        items={['Tab 1', 'Tab 2']}
        selected={pageIndex}
        onChange={index => requestPath(`/tab/${index + 1}`)}
      />
      <Box
        css={`
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: ${50 * GU}px;
          ${textStyle('title3')};
        `}
      >
        Count: {count}, Votes: {votes}
        <Buttons>
          <Button
            display="icon"
            icon={<IconAddUser />}
            label="join"
            onClick={() => api.join().toPromise()}
          />
          <Button
            display="icon"
            icon={<IconMinus />}
            label="voteAgainst"
            onClick={() => api.voteAgainst(0,1).toPromise()}
          />
          <Button
            display="icon"
            icon={<IconPlus />}
            label="voteFor"
            onClick={() => api.voteFor(0,1).toPromise()}
          />
        </Buttons>
      </Box>
    </Main>
  )
}

const Buttons = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 40px;
  margin-top: 20px;
`

export default App
