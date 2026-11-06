// Central affiliate configuration for Do you know ska music?
// Fill in ONLY the tracking ID (e.g. "yourname-22"). Never put passwords here.
// When AMAZON_ASSOCIATE_TAG is empty, links are left untouched and earn nothing.
window.AFFILIATE_CONFIG = {
  amazonAssociateTag: "doyouknowska-22"
};
(function () {
  var tag = (window.AFFILIATE_CONFIG && window.AFFILIATE_CONFIG.amazonAssociateTag || "").trim();
  if (!tag) return;
  document.querySelectorAll('a[href*="amazon.co.jp"]').forEach(function (a) {
    try {
      var u = new URL(a.href);
      if (!u.searchParams.get("tag")) u.searchParams.set("tag", tag);
      a.href = u.toString();
      var rel = new Set((a.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("sponsored"); rel.add("noopener"); rel.add("noreferrer");
      a.setAttribute("rel", Array.from(rel).join(" "));
    } catch (e) { /* leave link as-is */ }
  });
})();
