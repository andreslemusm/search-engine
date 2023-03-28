import { expect, test } from "@playwright/test";

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    /**
     * Usually we hace a staging env where we control the data of our database
     * so it is easier to avoid false positives.
     */
    await page.goto("https://search-engine.andreslemusm.com/");
  });

  test("Has call to action message when no search", async ({ page }) => {
    await expect(
      page.getByRole("img", { name: /woman organizing blocks on a ui/i })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /what are you searching for\?/i })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /what are you searching for\?/i })
    ).toBeVisible();
  });

  test("Search for 'capital' includes filters, results count and list", async ({
    page,
  }) => {
    const mockedSearch = "capital";

    const searchInput = page.getByRole("textbox", { name: /search/i });
    await searchInput.fill(mockedSearch);
    await searchInput.press("Enter");

    // I have all(default), organization, and topic filters.
    await expect(page.getByRole("link", { name: /all/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /organization/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /topic/i })).toBeVisible();

    // I have the results count
    await expect(
      page.getByText(
        new RegExp(`we found \\w+ results for "${mockedSearch}"`, "i")
      )
    ).toBeVisible();

    // I have a list of result
    expect(await page.getByRole("listitem").count()).toBeGreaterThan(0);
  });
});
