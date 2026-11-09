import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexTemplatePath = new URL('../templates/index.json', import.meta.url);
const socialGalleryPath = new URL('../sections/jovaa-social-gallery.liquid', import.meta.url);
const faqLinksPath = new URL('../sections/jovaa-faq-links.liquid', import.meta.url);
const categoryGridPath = new URL('../sections/jovaa-category-grid.liquid', import.meta.url);

async function readShopifyJson(path) {
  const source = await readFile(path, 'utf8');
  return JSON.parse(source.replace(/\/\*[\s\S]*?\*\//g, ''));
}

test('every homepage shopping CTA points at the populated all-products catalog', async () => {
  const template = await readShopifyJson(indexTemplatePath);
  const expectedCatalog = 'shopify://collections/all';

  const links = [
    template.sections.jovaa_hero.settings.button_link,
    ...Object.values(template.sections.jovaa_categories.blocks).map((block) => block.settings.link),
    ...Object.values(template.sections.jovaa_banners.blocks).map((block) => block.settings.link),
  ];

  assert.deepEqual(
    links,
    Array.from({ length: links.length }, () => expectedCatalog),
    'A shopping CTA is opening a different or empty collection'
  );
});

test('the social gallery does not output anchors with an empty href', async () => {
  const source = await readFile(socialGalleryPath, 'utf8');

  assert.match(source, /if social_link != blank/);
  assert.doesNotMatch(
    source,
    /<a class="jv-social__item" href="\{\{ block\.settings\.link \| default: section\.settings\.profile_link \}\}"/,
    'Blank social settings currently render a broken link'
  );
});

test('FAQ cards without a destination are not misleading links back to the homepage', async () => {
  const source = await readFile(faqLinksPath, 'utf8');

  assert.match(source, /if block\.settings\.link != blank/);
  assert.doesNotMatch(source, /block\.settings\.link \| default: routes\.root_url/);
});

test('the category grid repairs the known empty all-products collection at render time', async () => {
  const source = await readFile(categoryGridPath, 'utf8');

  assert.match(source, /contains '\/collections\/all-products'/);
  assert.match(source, /assign category_link = routes\.all_products_collection_url/);
  assert.match(source, /href="\{\{ category_link \}\}"/);
});
