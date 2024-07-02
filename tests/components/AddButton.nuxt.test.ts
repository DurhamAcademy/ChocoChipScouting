// tests/components/AddButton.nuxt.test.ts
import { renderSuspended, mountSuspended } from '@nuxt/test-utils/runtime'
import { AddButton } from '#components'
import { it, expect } from 'vitest'
import { screen } from '@testing-library/vue'

it('is just a button without text', async () => {
    const button = await mountSuspended(AddButton)
    expect(button.text()).toHaveLength(0)
})

it('is not open before being clicked', async () => {
    await renderSuspended(AddButton);
    expect(screen.queryByText("Scout Match")).not.to.exist;
    // there shouldnt be a scout match option yet because the button to make the list appear has not been clicked
})

it("opens menu after being clicked", async () => {
    await renderSuspended(AddButton);
    await (screen.getByTestId("AddButton")).click()
    expect(screen.getByText("Scout Match")).to.exist
})