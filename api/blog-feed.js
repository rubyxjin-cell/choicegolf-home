// 네이버 블로그(travelchoice) 최신 글 피드 — 메인 '블로그 소식' 섹션용
// 30분 캐시. 실패 시 빈 목록 반환(섹션이 알아서 숨음).
export default async function handler(req, res) {
  try {
    const r = await fetch('https://rss.blog.naver.com/travelchoice.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChoiceGolfBot/1.0)' }
    });
    if (!r.ok) throw new Error('RSS HTTP ' + r.status);
    const xml = await r.text();

    const pick = (block, tag) => {
      const m = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
      return m ? m[1].trim() : '';
    };

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6).map(m => {
      const b = m[1];
      const d = new Date(pick(b, 'pubDate'));
      return {
        title: pick(b, 'title'),
        link: pick(b, 'link'),
        date: isNaN(d) ? '' : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`,
        desc: pick(b, 'description').replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').trim().slice(0, 110)
      };
    }).filter(it => it.title && it.link);

    // 각 글의 대표 사진(og:image) 추출 — 병렬, 4초 제한, 실패해도 글은 표시
    await Promise.all(items.map(async it => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const mLink = it.link.replace('://blog.naver.com/', '://m.blog.naver.com/');
        const pr = await fetch(mLink, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChoiceGolfBot/1.0)' },
          signal: ctrl.signal
        });
        clearTimeout(t);
        const html = await pr.text();
        const m = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/) 
               || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/);
        if (m) it.thumb = m[1];
      } catch (e) {}
    }));

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ items });
  } catch (e) {
    res.status(200).json({ items: [] });
  }
}
