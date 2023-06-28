from django import template
from django.template.loader import render_to_string

register = template.Library()


@register.tag
def nav(parser, token):
    nodelist = parser.parse(("endnav",))
    parser.delete_first_token()
    return NavNode(nodelist)


class NavNode(template.Node):

    def __init__(self, nodelist):
        self.nodelist = nodelist

    def render(self, context):
        output = self.nodelist.render(context)
        request = context.get("request", None)
        return render_to_string("pastes/partials/nav.html", {"extra_nav": output}, request=request)
