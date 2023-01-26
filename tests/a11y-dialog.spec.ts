import { expect } from '@playwright/test'
import test from './voiceover-test'
import type { VoiceOver } from '@guidepup/guidepup/lib/macOS/VoiceOver/VoiceOver'

function delay (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForWebContentAnnouncement (voiceOver: VoiceOver) {
  for (let i = 0; i < 10; i++) {
    const itemText = await voiceOver.itemText()

    if (itemText?.includes('web content')) {
      return
    }

    await delay(50)
  }

  throw new Error('web content could not be found')
}

const moveToNextAndSpeak = async (voiceOver: VoiceOver, caseSensitive = false): Promise<string> => {
  await voiceOver.perform(voiceOver.keyboard.commands.moveToNext)
  const lastSpokenPhrase = await voiceOver.lastSpokenPhrase()
  return caseSensitive ? lastSpokenPhrase : lastSpokenPhrase.toLowerCase()
}
const moveToNextUntil = async (voiceOver: VoiceOver, str): Promise<void> => {
  while (await moveToNextAndSpeak(voiceOver) !== str) {
    continue
  }
}

test.describe('Dialog VoiceOver', () => {
  test('I can navigate to dialog demo', async ({
    page,
    voiceOver,
  }) => {
    await page.goto('https://i1gvw3.csb.app', {
      waitUntil: 'domcontentloaded',
    })

    const buttonSelector = '[data-a11y-dialog-show="my-dialog"]'
    const [buttonElement] = await page.locator(buttonSelector).all()
    await expect(buttonElement).toBeVisible()
    await waitForWebContentAnnouncement(voiceOver)
    await voiceOver.interact()

    await moveToNextUntil(voiceOver, 'open the dialog window button')
    await voiceOver.perform(voiceOver.keyboard.commands.performDefaultActionForItem)

    const dialogAnnouncement = await voiceOver.lastSpokenPhrase()
    const spokenPhraseLog = await voiceOver.spokenPhraseLog()
    console.log('dialogAnnouncement:', dialogAnnouncement)
    console.log('spokenPhraseLog:', spokenPhraseLog)

    expect(await voiceOver.lastSpokenPhrase()).toContain('Subscribe to our newsletter web dialog with 2 items')
  })
})
