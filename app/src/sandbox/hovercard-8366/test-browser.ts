import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { countAnimations } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

const hideTimeout = 500;

withFramework(import.meta.dirname, async ({ test, query }) => {
  const waitForOpen = async (card: Locator) => {
    await test.expect(card).toBeVisible();
    await test.expect.poll(() => countAnimations(card)).toBe(0);
  };

  const moveBeside = async (page: Page, card: Locator) => {
    const box = await card.boundingBox();
    const viewport = page.viewportSize();
    invariant(box, "The hovercard has no bounding box.");
    invariant(viewport, "The page has no viewport size.");
    const x = box.x + box.width + 40;
    invariant(x < viewport.width, "There's no room beside the hovercard.");
    await page.mouse.move(x, box.y + box.height / 2, { steps: 5 });
  };

  const expectRootFocus = async (locator: Locator) => {
    await test.expect
      .poll(() =>
        locator.evaluate(
          (element) =>
            (element.getRootNode() as ShadowRoot).activeElement === element,
        ),
      )
      .toBe(true);
  };

  // https://github.com/ariakit/ariakit/issues/8366
  test("keep the hovercard open on mouse leave while focus is inside it in the light DOM", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Light card");
    await q.link("Light anchor").hover();
    await waitForOpen(card);
    await q.button("Light button").click();
    await test.expect(q.button("Light button")).toBeFocused();
    await moveBeside(page, card);
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8366
  test("keep the hovercard open on mouse leave while focus is inside it in a shadow root", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Shadow card");
    await q.link("Shadow anchor").hover();
    await waitForOpen(card);
    await q.button("Shadow button").click();
    await expectRootFocus(q.button("Shadow button"));
    await moveBeside(page, card);
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8366
  test("keep a nested hovercard open on mouse leave while focus is inside it in a shadow root", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Shadow card");
    const nestedCard = q.dialog("Shadow nested card");
    await q.link("Shadow anchor").hover();
    await waitForOpen(card);
    await query(card).link("Shadow nested anchor").hover();
    await waitForOpen(nestedCard);
    await q.button("Shadow nested button").click();
    await expectRootFocus(q.button("Shadow nested button"));
    await moveBeside(page, card);
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
    await test.expect(nestedCard).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8366
  test("hide the hovercard on mouse leave when nothing inside it has focus in a shadow root", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Shadow card");
    await q.link("Shadow anchor").hover();
    await waitForOpen(card);
    await moveBeside(page, card);
    await test.expect(card).toBeHidden();
  });
});
