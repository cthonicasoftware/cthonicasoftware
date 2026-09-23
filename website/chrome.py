from dataclasses import dataclass, field
from types import MappingProxyType
from typing import Mapping, Union

from django.urls import reverse


@dataclass(frozen=True, slots=True)
class Section:
    """One in-page landmark. `id` is simultaneously the DOM id, the nav href,
    and the CSS anchor `static/js/site-nav.js` smooth-scrolls to. One
    declaration, three consumers."""

    id: str
    label: str
    mobile_label: str = ""
    placements: tuple[str, ...] = ("desktop", "mobile")

    @property
    def href(self) -> str:
        return f"#{self.id}"


@dataclass(frozen=True, slots=True)
class Link:
    """An off-page destination. `route` is a `website:`-namespaced URL name,
    resolved at render via `reverse()`."""

    label: str
    route: str = ""
    url: str = ""
    mobile_label: str = ""
    placements: tuple[str, ...] = ("desktop", "mobile")

    @property
    def href(self) -> str:
        if self.route:
            return reverse(f"website:{self.route}")
        return self.url


NavItem = Union[Section, Link]


@dataclass(frozen=True, slots=True)
class Accent:
    """Emitted only as a CSS custom-property VALUE, never as a class name —
    the fix for the `border-{accent}/30` blocks Tailwind's JIT could never see."""

    line: str = "var(--color-celestial)"
    line_alpha: int = 30

    def as_style(self) -> str:
        return f"--chrome-line:color-mix(in srgb, {self.line} {self.line_alpha}%, transparent);"


@dataclass(frozen=True, slots=True)
class Mark:
    """Exactly one of glyph or svg_partial is set."""

    title: str
    tagline: str
    glyph: str = ""
    glyph_class: str = ""
    svg_partial: str = ""


@dataclass(frozen=True, slots=True)
class Page:
    key: str  # matches the URL name
    title: str
    description: str
    mark: Mark
    accent: Accent = field(default_factory=Accent)
    nav: tuple[NavItem, ...] = ()
    scope: str = ""  # authored set-piece class, never a utility
    body_data: Mapping[str, str] = field(default_factory=lambda: MappingProxyType({}))

    def items(self, placement: str) -> tuple[NavItem, ...]:
        return tuple(item for item in self.nav if placement in item.placements)

    @property
    def desktop_nav(self) -> tuple[NavItem, ...]:
        return self.items("desktop")

    @property
    def mobile_nav(self) -> tuple[NavItem, ...]:
        return self.items("mobile")


PAGES: Mapping[str, Page] = MappingProxyType(
    {
        "index": Page(
            key="index",
            title="Cthonica | instruments of understanding",
            description="Cthonica - Trusted, traceable release intelligence for hardware test teams.",
            mark=Mark(
                title="CTHONICA",
                tagline="Instruments of understanding",
                svg_partial="includes/cthonica-mark.svg",
            ),
            nav=(
                Section("instruments", "Instruments"),
                Section("workflow", "Workflow"),
                Section("outcomes", "Outcomes"),
                Link("Pricing", route="pricing"),
            ),
        ),
        "astrolabe": Page(
            key="astrolabe",
            title="Cthonica | Astrolabe",
            description=(
                "Astrolabe | Go CLI/TUI for standardized data capture, normalization, "
                "and upload across QA instrumentation."
            ),
            mark=Mark(title="ASTROLABE", tagline="Field Data Capture", glyph="☽"),
            nav=(
                Section("capabilities", "Capabilities"),
                Section("workflow", "Workflow"),
                Section("integration", "Integration"),
                Link("Orrery", route="orrery"),
            ),
        ),
        "orrery": Page(
            key="orrery",
            title="Cthonica | Orrery",
            description=(
                "Orrery | Hardware QA analysis backend. Ingest test runs from Astrolabe, "
                "validate against versioned YAML rules, analyze with Claude Sonnet, ship "
                "signed release reports."
            ),
            mark=Mark(title="ORRERY", tagline="Analysis Backend", glyph="🜨", glyph_class="text-celestial"),
            nav=(
                Section("features", "Features"),
                Section("preview", "Dashboard"),
                Section("schema", "Data model"),
                Section("rules", "Rules & AI"),
                Section("api", "API"),
                Link("Astrolabe", route="astrolabe"),
            ),
            scope="orrery-page",
        ),
        "pricing": Page(
            key="pricing",
            title="Pricing | Cthonica",
            description="Cthonica pricing for Astrolabe and Orrery.",
            mark=Mark(
                title="CTHONICA",
                tagline="Instruments of understanding",
                svg_partial="includes/cthonica-mark.svg",
            ),
            nav=(
                Section("plans", "Plans"),
                Section("compare", "Compare"),
                Section("custom", "Custom"),
            ),
            scope="pricing-page",
            body_data=MappingProxyType({"billing": "monthly"}),
        ),
    }
)


def context(request):
    """Context processor; resolves the page from resolver_match.url_name so
    views stay bare render() one-liners and the key lives once, in urls.py.

    This engine is shared with django.contrib.admin, so this also runs
    against admin templates. A miss (including admin's own `index` name,
    which lives in a different namespace) returns {} rather than raising.
    """
    resolver_match = getattr(request, "resolver_match", None)
    url_name = getattr(resolver_match, "url_name", None) if resolver_match else None
    page = PAGES.get(url_name)
    if page is None:
        return {}
    return {"page": page}
