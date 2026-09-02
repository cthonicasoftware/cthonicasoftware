"""
Smoke tests for the styling layer.

These exist because the RFC that unified the build (issue #26) collapsed three
overlapping systems into one, and the seams it removed — template class
attributes, the Tailwind build, and three unlayered stylesheets — had nothing
guarding them. Each test below pins one invariant that the old arrangement
violated, so a regression shows up as a failure rather than as a silently
broken page.
"""

import unittest
from pathlib import Path

from django.test import TestCase

REPO_ROOT = Path(__file__).resolve().parent.parent
BUILT_CSS = REPO_ROOT / "static" / "src" / "styles.css"
SET_PIECES = ("website-index.css", "website-pricing.css", "website-orrery.css")
PAGES = ("/", "/astrolabe", "/orrery", "/pricing")


class PagesRenderTests(TestCase):
    def test_every_page_returns_200(self):
        for url in PAGES:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)


class SingleStylesheetTests(TestCase):
    """The build has one entry point, so a page has one local stylesheet."""

    def test_pages_do_not_link_set_piece_stylesheets_directly(self):
        # Linking these directly is what put them outside the Tailwind build,
        # unlayered, silently outranking every utility.
        for url in PAGES:
            html = self.client.get(url).content.decode()
            for sheet in SET_PIECES:
                with self.subTest(url=url, sheet=sheet):
                    self.assertNotIn(sheet, html)

    def test_pages_link_the_built_stylesheet(self):
        for url in PAGES:
            with self.subTest(url=url):
                self.assertIn("src/styles.css", self.client.get(url).content.decode())


class FlowbiteWiringTests(TestCase):
    def test_every_page_loads_the_flowbite_bundle(self):
        for url in PAGES:
            with self.subTest(url=url):
                self.assertIn(
                    "flowbite.min.js", self.client.get(url).content.decode()
                )

    def test_mobile_nav_is_a_flowbite_collapse(self):
        # The toggle used to be three hand-written implementations keyed off
        # id="navBtn"; it is now one Flowbite Collapse on every page.
        for url in PAGES:
            html = self.client.get(url).content.decode()
            with self.subTest(url=url):
                self.assertIn('data-collapse-toggle="mobileNav"', html)
                self.assertNotIn('id="navBtn"', html)

    def test_shared_chrome_is_loaded_once(self):
        # Footer year + anchor scrolling used to be written out three times,
        # and the copies had drifted. One file, loaded on every page.
        for url in PAGES:
            html = self.client.get(url).content.decode()
            with self.subTest(url=url):
                self.assertEqual(html.count("js/site-nav.js"), 1)
                self.assertNotIn("getElementById('year')", html)

    def test_pricing_plan_selector_is_flowbite_tabs(self):
        html = self.client.get("/pricing").content.decode()
        self.assertIn('data-tabs-toggle="#pricing-focus"', html)
        self.assertEqual(html.count("data-tabs-target="), 3)
        self.assertEqual(html.count('role="tabpanel"'), 3)
        # Every tab points at a panel that exists, and names itself for it.
        for plan in ("basic", "professional", "enterprise"):
            with self.subTest(plan=plan):
                self.assertIn(f'data-tabs-target="#plan-{plan}"', html)
                self.assertIn(f'id="plan-{plan}"', html)
                self.assertIn(f'id="plan-{plan}-tab"', html)


class BuildOutputTests(TestCase):
    """Guards on the compiled bundle. Run `npm run build` before these."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        if not BUILT_CSS.exists():
            # styles.css is a build artifact and is gitignored, so a clean
            # checkout has none until `npm run build` runs.
            raise unittest.SkipTest("static/src/styles.css not built; run `npm run build`")
        cls.css = BUILT_CSS.read_text(encoding="utf-8")

    def test_dead_tailwind_config_is_gone(self):
        # Tailwind v4 never loaded it, and its palette disagreed with the live
        # one on four colours. Anyone reading it learned the wrong values.
        self.assertFalse((REPO_ROOT / "tailwind.config.js").exists())

    def test_desk_breakpoint_compiles(self):
        # --breakpoint-desk used to live only in the dead config, so every
        # `desk:` utility in the templates compiled to nothing.
        self.assertIn("--breakpoint-desk:900px", self.css)
        self.assertIn(r"desk\:grid-cols-2", self.css)
        self.assertIn(r"desk\:\!hidden", self.css)

    def test_layer_order_puts_utilities_after_set_pieces(self):
        # This ordering is what lets a `desk:` utility beat a set-piece rule
        # without hand-splitting responsive CSS.
        order = [
            self.css.index("@layer theme"),
            self.css.index("@layer base"),
            self.css.index("@layer components"),
            self.css.index("@layer utilities"),
        ]
        self.assertEqual(order, sorted(order))

    def test_set_pieces_are_inside_the_build(self):
        for marker in (".hero-grid", ".pricing-node", ".api-card"):
            with self.subTest(marker=marker):
                self.assertIn(marker, self.css)

    def test_theme_tokens_survive_tree_shaking(self):
        # @theme static exists so tokens only the set pieces read are emitted.
        for token in (
            "--color-starlight:#7fa4b5",
            "--color-celestial:#c6a664",
            "--color-verdigris:#5e8570",
        ):
            with self.subTest(token=token):
                self.assertIn(token, self.css)


class TokenOwnershipTests(TestCase):
    """One definition per token: the set pieces read them, they do not restate them."""

    def test_set_pieces_do_not_hardcode_brand_hexes(self):
        for name in SET_PIECES:
            text = (REPO_ROOT / "static" / "src" / name).read_text(encoding="utf-8")
            for var_line in ("--verdigris:", "--orrery-verdigris:", "--starlight:"):
                if var_line in text:
                    value = text.split(var_line, 1)[1].split(";", 1)[0].strip()
                    with self.subTest(file=name, var=var_line):
                        self.assertTrue(
                            value.startswith("var(--color-"),
                            f"{name}{var_line} should read a theme token, got {value!r}",
                        )
