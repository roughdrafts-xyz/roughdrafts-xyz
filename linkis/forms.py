
from django import forms


class ArticleForm(forms.Form):
    name = forms.CharField(max_length=250)
    content = forms.CharField(widget=forms.Textarea)
    pass
