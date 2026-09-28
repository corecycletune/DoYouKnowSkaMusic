"""Report the executed DOM inventory, preserving uncertainty about video identity/playback."""
import json,re
from pathlib import Path
from html.parser import HTMLParser
R=Path(__file__).resolve().parent.parent
run=json.loads((R/'docs/listening-dom-audit.json').read_text())
review=json.loads((R/'docs/editorial-review.json').read_text())
registry=json.loads((R/'docs/listening-sources.json').read_text())
class Body(HTMLParser):
 def __init__(self):super().__init__();self.main=False;self.parts=[];self.h2=0
 def handle_starttag(self,t,a):
  if t=='main':self.main=True
  if self.main and t=='h2':self.h2+=1
 def handle_endtag(self,t):
  if t=='main':self.main=False
 def handle_data(self,s):
  if self.main:self.parts.append(s)
rows=run['rows'];music=[r for r in rows if r['file']!='articles/documentary-films.html'];missing=[r for r in music if not r['controls']]
lines=['# 音源・記事の改修リスト','', '更新：2026-09-29。制作管理用。年表・系譜図は凍結中。','',f'紹介ページ {len(rows)}件（映画1件を含む）。音楽ページ {len(music)}件のうち、表示される音源候補ゼロは **{len(missing)}件**。短縮版だけのCOOL WISE MANは別途未完了。','',
'## 確認レベル','',
'- 動画IDの固有数は、同じIDのボタンを除去した後の数。映画・演奏集・短縮版は曲数と分ける。異なるIDで同一曲になっている例の全件照合は未完了。',
'- 「候補曲数」は表示タイトルと既知の種別からの暫定値。全曲の内容同定や実再生成功を意味しない。',
'- DOM検査：サイトのJavaScriptを実行し、各ボタンの枠の開閉、ID重複、内部リンク先の存在を検査。YouTubeのネットワークや実機表示は対象外。',
'- 公開ページのBob Marley「Three Little Birds」は再生枠が開くが黒画面のまま。実再生は未確認。削除・地域制限・通信のどれが原因か未確定。',
'- 出典照合は listening-sources.json に記録。公式ページからのリンク、公式投稿の記載、第三者の投稿情報を区別。旧来のIDは再同定待ち。','',
'## 全ページ','',
'| ページ | 内容監査 | 本文等文字数 / h2 | 固有ID / 候補曲 / その他 | 除去・非表示候補数 | 残存ID重複 | 内部リンク | 再生確認 |','|---|---|---:|---:|---:|---:|---:|---|']
for row in sorted(rows,key=lambda r:(r['controls'],r['file'])):
 f=row['file'];p=Body();p.feed((R/f).read_text());chars=len(re.sub(r'\s+','', ''.join(p.parts)))
 other=sum(registry.get(v,{}).get('kind') in ['short_version','performance_collection'] for v in row['ids'])
 status=review.get(f,{}).get('status','全文再監査待ち')
 if f=='articles/documentary-films.html':status='映画の同定・本編確認待ち（音楽曲数対象外）'
 lines.append(f'| [{f}](../{f}) | {status} | {chars} / {p.h2} | {row["controls"]} / {row["controls"]-other} / {other} | {row.get("removedOrHidden",0)} | {row.get("duplicateIdsAfter",0)} | {row["internalLinks"]} | 未確認 |')
lines+=['','## 優先して解消する項目','']
for row in missing:lines.append('- [ ] '+row['file']+'：当該演奏者の録音と照合できるYouTubeリンク未取得。検索結果に無関係な項目が多く、未照合のIDで埋めていない。')
lines+=['- [ ] artists/cool-wise-man.html：短縮版だけ。単独名義の全曲音源を追加。','- [ ] MUTE BEAT / Scientist / Calypso：第三者の投稿情報段階。映像・録音内容と一次資料の突き合わせが必要。','- [ ] アーティスト・ジャンルで候補曲2未満のページ：異なる代表曲を追加。','- [ ] 全記事の曲名に音源が付いているか、アルバム名との区別も含めて目視精査。','- [ ] 日本のSka個別記事を拡充。今回の新規アーティストはBob Marley / ASOUND / Christopher Ellisで、日本Skaの網羅は未達。','- [ ] 現代日本ReggaeはASOUNDのみ新規。複数バンド・現場の比較調査は未完了。','- [ ] 地域別8記事は各地域1〜2組の入口。地域全体の調査完了ではない。','- [ ] 聴きどころの案内を実音で精査し、固有のフレーズや展開への具体性を増す。','- [ ] 日本での埋め込み実再生を全候補で確認。oEmbedや投稿タイトルだけで成功扱いしない。','- [ ] スマホ実機のタッチ操作・再生。390px検査用ページは docs/qa-mobile.html。','', '## 再現手順','','```sh','npm install --no-save --package-lock=false linkedom','node scripts/check-listening-dom.cjs --write','python scripts/report-listening-audit.py','```','', '文字数と見出し数は厚みの参考値であり、内容の質や史実の正確さの合格判定ではない。']
(R/'docs/listening-audit.md').write_text('\n'.join(lines)+'\n')
print(f'{len(rows)} pages; {len(missing)} music pages without controls; {len(run["errors"])} DOM errors')
