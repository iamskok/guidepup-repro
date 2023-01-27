import { expect } from '@playwright/test'
import { voTest as test } from '@guidepup/playwright'
import { voiceOver as _voiceOver } from '@guidepup/guidepup'

type VoiceOver = typeof _voiceOver;

const moveToNextAndSpeak = async (voiceOver: VoiceOver): Promise<string> => {
  await voiceOver.perform(voiceOver.keyboard.commands.moveToNext)
  const lastSpokenPhrase = await voiceOver.lastSpokenPhrase()

  return lastSpokenPhrase.toLowerCase()
}

const moveToNextUntil = async (
  voiceOver: VoiceOver,
  str: string,
): Promise<void> => {
  while (!(await moveToNextAndSpeak(voiceOver)).includes(str)) {
    continue
  }
}

test.describe('Dialog VoiceOver', () => {
  test('I can navigate to dialog demo', async ({ page, voiceOver }) => {
    await page.goto('https://i1gvw3.csb.app', {
      waitUntil: 'domcontentloaded',
    })

    const buttonSelector = '[data-a11y-dialog-show="my-dialog"]'
    const buttonElement = await page.locator(buttonSelector).first()

    await expect(buttonElement).toBeVisible()
    await voiceOver.interact()

    await moveToNextUntil(voiceOver, 'open the dialog window button')
    await voiceOver.perform(
      voiceOver.keyboard.commands.performDefaultActionForItem,
    )

    const dialogAnnouncement = await voiceOver.lastSpokenPhrase()
    const spokenPhraseLog = await voiceOver.spokenPhraseLog()

    console.log('dialogAnnouncement:', dialogAnnouncement)
    console.log('spokenPhraseLog:', spokenPhraseLog)

    expect(dialogAnnouncement).toContain(
      'Subscribe to our newsletter web dialog with 2 items',
    )
  })
})
