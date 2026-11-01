(function () {
  const positiveWords = new Set([
    "amable", "amor", "amigo", "amistad", "ayudar", "bien", "bondad",
    "brillante", "calma", "carino", "compartir", "confianza", "cuidar",
    "divertido", "excelente", "favor", "feliz", "genial", "gracias",
    "honesto", "maravilloso", "paz", "porfavor", "respeto", "seguro",
    "sonrisa", "valiente", "bienvenido", "encantado", "proteccion",
    "amiga", "hermoso"
  ]);

  const negativeWords = new Set([
    "agresivo", "amenaza", "atacar", "basura", "cruel", "destruir",
    "enemigo", "estupido", "feo", "furia", "horrible", "herir",
    "insulto", "malo", "matar", "mentira", "miedo", "odio", "peligro",
    "pelea", "robar", "romper", "trampa", "traidor", "violencia",
    "lastimar", "callate", "tonto", "detesto", "asqueroso", "desprecio"
  ]);

  function normalize(text) {
    return text.toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n");
  }

  function analyze(text) {
    const tokens = normalize(text).match(/[\p{L}\p{N}]+/gu) || [];
    const matches = [];
    let score = 0;

    for (const token of tokens) {
      if (positiveWords.has(token)) {
        score += 1;
        matches.push({ word: token, sentiment: "positive", value: 1 });
      } else if (negativeWords.has(token)) {
        score -= 1;
        matches.push({ word: token, sentiment: "negative", value: -1 });
      }
    }

    return {
      tokens,
      score,
      matches,
      label: score > 0 ? "positive" : score < 0 ? "negative" : "neutral"
    };
  }

  window.DragonBrain = Object.freeze({ analyze, positiveWords, negativeWords });
})();
