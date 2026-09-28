"""Static inventory only. Candidate IDs are not proof of playback availability."""
import json
import re
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parent.parent
app = (ROOT / 'app.js').read_text()
tracks = dict((name, (video, title)) for name, video, title in re.findall(r'"([^"\n]+)":\["([^"\n]+)","([^"\n]+)"\]', app))
known_block = re.split(r'const YT_KNOWN\s*=\s*', app, maxsplit=1)[1].split('\n};', 1)[0]
known = dict(re.findall(r'"([^"\n]+)"\s*:\s*"([\w-]{11})"', known_block))

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_main = False
        self.words = []
        self.ids = []
        self.searches = 0
        self.internal = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main': self.in_main = True
        if not self.in_main: return
        if attrs.get('data-video'): self.ids.append(attrs['data-video'])
        href = attrs.get('href', '')
        match = re.search(r'(?:youtu\.be/|[?&]v=|youtube(?:-nocookie)?\.com/embed/)([\w-]{11})', href)
        if match: self.ids.append(match[1])
        if 'youtube.com/results' in href: self.searches += 1
        if href and not re.match(r'(https?:|#|mailto:)', href): self.internal += 1
    def handle_endtag(self, tag):
        if tag == 'main': self.in_main = False
    def handle_data(self, value):
        if self.in_main: self.words.append(value)

rows = []
for folder in ['articles', 'artists', 'genres', 'labels', 'people', 'studios']:
    for file in sorted((ROOT / folder).glob('*.html')):
        page = Page()
        page.feed(file.read_text())
        text = ' '.join(page.words)
        quoted = re.findall(r'[“「『]([^”」』]{2,70})[”」』]', text)
        inferred = [tracks[t][0] for t in quoted if t in tracks]
        inferred += [video for title, video in known.items() if title in text]
        ids = sorted(set(page.ids + inferred))
        rows.append({'file': str(file.relative_to(ROOT)), 'candidate_ids': ids,
                     'explicit_controls': len(page.ids), 'legacy_search_links': page.searches,
                     'text_characters': len(text), 'internal_links': page.internal,
                     'playback_status': 'unverified'})
print('# 音源・記事の棚卸し\n\n2026-09-28。制作管理用。公開本文には表示しない。\n')
print('候補数は本文の曲名からの自動挿入も含む静的推定。表示・曲の同一性・日本での再生可否は未確認。映画動画も含む。文字数は内容の充実度の判定ではなく、見直す順番の参考。\n')
print(f'対象：{len(rows)}ページ。音源候補ゼロ：{sum(not r["candidate_ids"] for r in rows)}ページ。\n')
print('| ページ | 音源候補数 | 検索リンク | 本文等の文字数 | 再生確認 |\n|---|---:|---:|---:|---|')
for r in sorted(rows, key=lambda r: (len(r['candidate_ids']), r['text_characters'])):
    print(f'| {r["file"]} | {len(r["candidate_ids"])} | {r["legacy_search_links"]} | {r["text_characters"]} | 未確認 |')
print('\n## 次の確認\n\n- [ ] 各紹介ページ最低1曲、アーティスト・ジャンルは異なる2〜3曲へ\n- [ ] 動画の曲名・演奏者・日本での埋め込み再生を確認\n- [ ] 世界の聴き比べ入口と地域別詳細の分離\n- [ ] Bob Marley、Calypso、Mentoの充実\n- [ ] 現代ジャマイカの家族関係を出典で確認\n- [ ] 日本のスカ個別記事とASOUNDなど現代レゲエ\n- [ ] 音の具体的な聴きどころ、自然な日本語、内部リンク\n\n年表・系譜図の追加と再構築は保留。')
