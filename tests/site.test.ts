import assert from "node:assert/strict";
import test from "node:test";
import { mockNews } from "../data/mock-news.ts";
import { mockPlayers } from "../data/mock-players.ts";
import { mockSkins } from "../data/mock-skins.ts";
import {
  buildManifestConfig,
  buildRobotsConfig,
  buildSitemapEntries,
  resolveSiteUrl,
  siteConfig,
} from "../lib/site.ts";

test("site name is not empty", () => {
  assert.ok(siteConfig.name.trim().length > 0);
});

test("default site title is not empty", () => {
  assert.ok(siteConfig.defaultTitle.trim().length > 0);
});

test("configured site URL is a valid absolute HTTP URL", () => {
  const url = new URL(siteConfig.url);

  assert.ok(["http:", "https:"].includes(url.protocol));
  assert.equal(url.pathname, "/");
});

test("missing site URL safely falls back to localhost", () => {
  assert.equal(resolveSiteUrl(undefined).toString(), "http://localhost:3000/");
});

test("invalid or unsafe site URLs safely fall back to localhost", () => {
  assert.equal(resolveSiteUrl("not-a-url").toString(), "http://localhost:3000/");
  assert.equal(resolveSiteUrl("javascript:alert(1)").toString(), "http://localhost:3000/");
});

test("sitemap contains the homepage", () => {
  assert.ok(buildSitemapEntries().some(({ url }) => new URL(url).pathname === "/"));
});

test("sitemap contains the market, players, and news directories", () => {
  const paths = new Set(buildSitemapEntries().map(({ url }) => new URL(url).pathname));

  assert.ok(["/market", "/players", "/news"].every((path) => paths.has(path)));
});

test("sitemap contains every simulated skin detail", () => {
  const paths = new Set(buildSitemapEntries().map(({ url }) => new URL(url).pathname));

  assert.ok(mockSkins.every(({ id }) => paths.has(`/market/${id}`)));
});

test("sitemap contains every simulated player detail", () => {
  const paths = new Set(buildSitemapEntries().map(({ url }) => new URL(url).pathname));

  assert.ok(mockPlayers.every(({ id }) => paths.has(`/players/${id}`)));
});

test("sitemap contains every simulated news detail", () => {
  const paths = new Set(buildSitemapEntries().map(({ url }) => new URL(url).pathname));

  assert.ok(mockNews.every(({ slug }) => paths.has(`/news/${slug}`)));
});

test("sitemap excludes the unfinished login page", () => {
  assert.ok(
    buildSitemapEntries().every(({ url }) => new URL(url).pathname !== "/login"),
  );
});

test("sitemap URLs are unique", () => {
  const urls = buildSitemapEntries().map(({ url }) => url);

  assert.equal(new Set(urls).size, urls.length);
});

test("robots points to the generated sitemap URL", () => {
  const robots = buildRobotsConfig();

  assert.equal(robots.sitemap, new URL("/sitemap.xml", siteConfig.url).toString());
});

test("robots keeps API and admin paths out of crawlers", () => {
  const robots = buildRobotsConfig();

  assert.deepEqual(robots.rules.disallow, ["/api/", "/admin/"]);
});

test("manifest uses the SkinRadar site name", () => {
  assert.equal(buildManifestConfig().name, siteConfig.name);
});

test("manifest starts at the homepage", () => {
  assert.equal(buildManifestConfig().start_url, "/");
});

test("all configured navigation links are internal absolute paths", () => {
  assert.ok(siteConfig.navigation.every(({ href }) => href.startsWith("/")));
});

test("configured navigation does not contain placeholder links", () => {
  assert.ok(siteConfig.navigation.every(({ href }) => String(href) !== "#"));
});

test("sitemap contains the expected number of public pages", () => {
  assert.equal(
    buildSitemapEntries().length,
    4 + mockSkins.length + mockPlayers.length + mockNews.length,
  );
});
