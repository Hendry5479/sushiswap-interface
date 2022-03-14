import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Trade as LegacyTrade } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'
import Dots from 'app/components/Dots'
import { useDerivedTridentSwapContext } from 'app/features/trident/swap/DerivedTradeContext'
import { selectTridentSwap, setTridentSwapState } from 'app/features/trident/swap/swapSlice'
import { useBentoBoxContract, useRouterContract, useTridentRouterContract } from 'app/hooks'
import { useAppDispatch, useAppSelector } from 'app/state/hooks'
import { TradeUnion } from 'app/types'
import React, { FC, useCallback } from 'react'

import TridentApproveGate from '../TridentApproveGate'

interface SwapButton {
  onClick(x: TradeUnion): void
}

const SwapButton: FC<SwapButton> = ({ onClick }) => {
  const { i18n } = useLingui()
  const dispatch = useAppDispatch()
  const tridentSwapState = useAppSelector(selectTridentSwap)
  const { attemptingTxn } = tridentSwapState
  const router = useTridentRouterContract()

  const legacyRouterContract = useRouterContract()

  const bentoBox = useBentoBoxContract()
  const { parsedAmounts, error, trade } = useDerivedTridentSwapContext()

  const handleClick = useCallback(() => {
    if (trade) onClick(trade)
    dispatch(setTridentSwapState({ ...tridentSwapState, showReview: true }))
  }, [dispatch, onClick, trade, tridentSwapState])

  const isLegacy = trade instanceof LegacyTrade

  return (
    <TridentApproveGate
      inputAmounts={[parsedAmounts?.[0]]}
      tokenApproveOn={!isLegacy ? bentoBox?.address : legacyRouterContract?.address}
      masterContractAddress={!isLegacy ? router?.address : undefined}
    >
      {({ approved, loading }) => {
        const disabled = !!error || !approved || loading || attemptingTxn
        const buttonText = attemptingTxn ? (
          <Dots>{i18n._(t`Swapping`)}</Dots>
        ) : loading ? (
          ''
        ) : error ? (
          error
        ) : (
          i18n._(t`Swap`)
        )

        return (
          <div className="flex">
            <Button
              fullWidth
              id="swap-button"
              loading={loading}
              color="gradient"
              disabled={disabled}
              onClick={handleClick}
            >
              {buttonText}
            </Button>
          </div>
        )
      }}
    </TridentApproveGate>
  )
}

export default SwapButton
