// Add only confirmed product-specific affiliate URLs, e.g.:
// window.DOCUMENTARY_AFFILIATES = { "dance-craze": "https://example.com/product?tag=..." };
window.DOCUMENTARY_AFFILIATES = {};
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
