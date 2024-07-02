// tests/pages/login.nuxt.test.ts
import { renderSuspended, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { it, expect } from 'vitest'
import {fireEvent, screen} from '@testing-library/vue'
import App from "~/app.vue";
import {HTMLInputElement} from "happy-dom";

it('renders without crashing', async () => {
    await renderSuspended(App, {route: '/login'});
    expect(screen.findByText("Login")).toBeDefined
})

it('username area exists and is a textbox', async () => {
    await renderSuspended(App, {route: '/login'})

    const usernameBox = await screen.findByTestId("username");
    expect(usernameBox).to.exist
    expect(usernameBox).to.be.an.instanceOf(HTMLInputElement.prototype.constructor)
})

it('passwords area exists and is a textbox', async () => {
    await renderSuspended(App, {route: '/login'})

    const usernameBox = await screen.findByTestId("password");
    expect(usernameBox).to.exist
    expect(usernameBox).to.be.an.instanceOf(HTMLInputElement.prototype.constructor)
})