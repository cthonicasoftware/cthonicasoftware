from pathlib import Path

from django.conf import settings
from django.core.checks import Error, Tags, register
from django.template import Context, engines
from django.template.base import Template
from django.template.loader_tags import BlockNode, ExtendsNode


def _own_blocks(template: Template) -> dict[str, BlockNode]:
    """Block names defined literally in this template's own source, at any nesting depth."""
    return {node.name: node for node in template.nodelist.get_nodes_by_type(BlockNode)}


def _extends_target(template: Template) -> str | None:
    extends_nodes = template.nodelist.get_nodes_by_type(ExtendsNode)
    if not extends_nodes:
        return None
    return extends_nodes[0].parent_name.resolve(Context({}))


@register(Tags.templates)
def check_orphan_template_blocks(app_configs, **kwargs):
    """A `{% block %}` a template defines is dead if no ancestor in its `{% extends %}`
    chain declares that name anywhere in its own source. Django discards such a block
    silently at render time rather than raising, so this walks every project template's
    extends chain up front and flags the mismatch as a build-breaking error instead.
    """
    errors = []
    engine = engines["django"]
    template_dir = Path(settings.BASE_DIR) / "templates"
    names = sorted(p.relative_to(template_dir).as_posix() for p in template_dir.rglob("*.html"))

    compiled: dict[str, Template] = {name: engine.get_template(name).template for name in names}

    def get_compiled(name: str) -> Template:
        if name not in compiled:
            compiled[name] = engine.get_template(name).template
        return compiled[name]

    parents = {parent for name in names if (parent := _extends_target(compiled[name]))}
    leaves = [name for name in names if name not in parents]

    for leaf in leaves:
        chain = []
        seen = set()
        current = leaf
        while (parent_name := _extends_target(get_compiled(current))) and parent_name not in seen:
            seen.add(parent_name)
            chain.append(parent_name)
            current = parent_name

        if not chain:
            continue

        own = _own_blocks(compiled[leaf])
        declared: set[str] = set()
        for ancestor_name in chain:
            declared |= _own_blocks(compiled[ancestor_name]).keys()

        for block_name in sorted(own.keys() - declared):
            errors.append(
                Error(
                    f"Template '{leaf}' defines block '{block_name}', which no ancestor "
                    f"in its {{% extends %}} chain ({', '.join(chain)}) declares. Django "
                    "silently discards this block at render time.",
                    id="website.E001",
                )
            )

    return errors
