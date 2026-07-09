const CACHE_NOME = "livro-caixa-v1";
const ARQUIVOS_ESSENCIAIS = ["./", "./index.html", "./manifest.json", "./icone-192.png", "./icone-512.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((chave) => chave !== CACHE_NOME).map((chave) => caches.delete(chave)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  // Só cuida de pedidos GET; deixa o resto (ex: POST) passar direto
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    fetch(evento.request)
      .then((resposta) => {
        // Guarda uma cópia atualizada no cache sempre que consegue baixar
        const copia = resposta.clone();
        caches.open(CACHE_NOME).then((cache) => cache.put(evento.request, copia));
        return resposta;
      })
      .catch(() => caches.match(evento.request)) // sem internet: usa o que tem salvo
  );
});
