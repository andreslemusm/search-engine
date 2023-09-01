import { expect, test } from "@playwright/test";

test.describe("Search", () => {
  const query = "capital";

  test(`Search for '${query}' includes filters, results count and list`, async ({
    page,
  }) => {
    /**
     * Usually we hace a staging env where we control the data of our database
     * so it is easier to avoid false positives.
     */
    await page.goto("https://search-engine.andreslemusm.com/");

    // Has call to action message by default
    await expect(
      page.getByRole("img", { name: /woman organizing blocks on a ui/i }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /what are you searching for\?/i }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /what are you searching for\?/i }),
    ).toBeVisible();

    const searchInput = page.getByRole("textbox", { name: /search/i });
    await searchInput.fill(query);
    await searchInput.press("Enter");

    // Has all, organization, and topic filters.
    await expect(page.getByRole("link", { name: /all/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /organization/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /topic/i })).toBeVisible();

    // Has the results count
    await expect(
      page.getByText(new RegExp(`we found \\w+ results for "${query}"`, "i")),
    ).toBeVisible();

    // Has a list of result
    expect(await page.getByRole("listitem").count()).toBeGreaterThan(0);
  });
});
