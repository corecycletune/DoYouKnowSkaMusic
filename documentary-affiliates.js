// Product search links with the site's Amazon Associates tag (doyouknowska-22).
// Search links (not edition-specific), same pattern as articles/records-to-start.html:
// buyers confirm format/edition on Amazon.
window.DOCUMENTARY_AFFILIATES = {
  "legends-of-ska": "https://www.amazon.co.jp/s?k=Legends%20of%20Ska%20DVD&tag=doyouknowska-22",
  "dance-craze": "https://www.amazon.co.jp/s?k=Dance%20Craze%202%20Tone%20DVD%20Blu-ray&tag=doyouknowska-22",
  "rudeboy": "https://www.amazon.co.jp/s?k=Rudeboy%20The%20Story%20of%20Trojan%20Records%20DVD&tag=doyouknowska-22",
  "rocksteady-roots": "https://www.amazon.co.jp/s?k=Rocksteady%20The%20Roots%20of%20Reggae%20DVD&tag=doyouknowska-22",
  "marley": "https://www.amazon.co.jp/s?k=Marley%20Bob%20Marley%20DVD%20Blu-ray&tag=doyouknowska-22",
  "fishmans": "https://www.amazon.co.jp/s?k=%E6%98%A0%E7%94%BB%20%E3%83%95%E3%82%A3%E3%83%83%E3%82%B7%E3%83%A5%E3%83%9E%E3%83%B3%E3%82%BA%20DVD%20Blu-ray&tag=doyouknowska-22"
};
document.querySelectorAll('[data-affiliate-key]').forEach(slot => {
  const url = window.DOCUMENTARY_AFFILIATES[slot.dataset.affiliateKey];
  if (typeof url !== 'string' || !/^https:\/\//i.test(url)) return;
  const link = document.createElement('a');
  link.href = url;
  link.textContent = '購入先を見る（広告）';
  link.target = '_blank';
  link.rel = 'sponsored noopener noreferrer';
  link.className = 'film-purchase';
  slot.append(link);
});
