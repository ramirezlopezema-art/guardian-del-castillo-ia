(function () {
  const INITIAL_TRUST = 30;
  const MAX_MESSAGE_LENGTH = 120;
  const TRUST_PER_POINT = 3;
  const NEUTRAL_CHANGE = -2;
  const brain = window.DragonBrain;
  const elements = {
    chatLog: document.getElementById("chat-log"),
    form: document.getElementById("message-form"),
    input: document.getElementById("message-input"),
    sendButton: document.getElementById("send-button"),
    characterCount: document.getElementById("character-count"),
    messageCount: document.getElementById("message-count"),
    trustValue: document.getElementById("trust-value"),
    trustTrack: document.getElementById("trust-track"),
    trustFill: document.getElementById("trust-fill"),
    gameStatus: document.getElementById("game-status"),
    guardianDescription: document.getElementById("guardian-description"),
    formError: document.getElementById("form-error"),
    announcer: document.getElementById("announcer")
  };
  let trust = INITIAL_TRUST;
  let sentMessages = 0;
  let finished = false;

  function appendMessage(kind, author, text, analysis) {
    const item = document.createElement("li");
    item.className = `chat-message ${kind}-message`;
    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = kind === "dragon" ? "🐉" : "🧭";

    const body = document.createElement("div");
    body.className = "message-body";
    const authorLabel = document.createElement("span");
    authorLabel.className = "message-author";
    authorLabel.textContent = author;
    const message = document.createElement("p");
    message.textContent = text;
    body.append(authorLabel, message);

    if (analysis) {
      const explanation = document.createElement("div");
      explanation.className = "analysis-note";
      const matchesLabel = document.createElement("span");
      matchesLabel.className = "analysis-title";
      if (analysis.matches.length) {
        matchesLabel.textContent = `Palabras detectadas (${analysis.matches.length})`;
        const chips = document.createElement("span");
        chips.className = "word-chips";
        for (const match of analysis.matches) {
          const chip = document.createElement("span");
          chip.className = `word-chip ${match.sentiment}`;
          chip.textContent = `${match.word} ${match.value > 0 ? "+1" : "−1"}`;
          chips.append(chip);
        }
        explanation.append(matchesLabel, chips);
      } else {
        matchesLabel.textContent = "No se encontraron palabras del vocabulario.";
        explanation.append(matchesLabel);
      }
      const score = document.createElement("span");
      score.className = "score-label";
      score.textContent = `Puntuación: ${analysis.score > 0 ? "+" : ""}${analysis.score}`;
      explanation.append(score);
      body.append(explanation);
    }
    item.append(avatar, body);
    elements.chatLog.append(item);
    elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
  }

  function updateTrust() {
    elements.trustValue.replaceChildren(document.createTextNode(String(trust)));
    const total = document.createElement("span");
    total.textContent = " / 100";
    elements.trustValue.append(total);
    elements.trustFill.style.width = `${trust}%`;
    elements.trustTrack.setAttribute("aria-valuenow", String(trust));
    elements.trustTrack.setAttribute("aria-valuetext", `${trust} de 100`);
  }

  function dragonReply(analysis, change) {
    if (analysis.label === "positive") {
      return "El dragón inclina la cabeza. Ha reconocido un tono amable y parece confiar un poco más.";
    }
    if (analysis.label === "negative") {
      return "El dragón retrocede y protege la puerta. Las palabras hostiles han reducido su confianza.";
    }
    return `El dragón no encontró palabras conocidas en su lista. Su confianza baja ${Math.abs(change)} puntos.`;
  }

  function finishGame(won) {
    finished = true;
    elements.input.disabled = true;
    elements.sendButton.disabled = true;
    elements.gameStatus.textContent = won ? "¡Llave conseguida!" : "Puerta cerrada";
    elements.gameStatus.className = `status-pill ${won ? "status-won" : "status-lost"}`;
    elements.guardianDescription.textContent = won
      ? "El dragón te entrega la llave. La puerta del castillo se abre ante ti."
      : "La confianza llegó a cero y el dragón cerró la entrada. Puedes volver a intentarlo.";
    appendMessage("dragon", "Guardián", won
      ? "Has ganado mi confianza. Toma la llave y entra al castillo. ¡Buena aventura!"
      : "No puedo dejarte pasar. La puerta queda cerrada por ahora.", null);
    appendRestartButton();
    elements.announcer.textContent = won
      ? "Final: ganaste la confianza del dragón y conseguiste la llave."
      : "Final: la confianza llegó a cero y la puerta se cerró.";
  }

  function appendRestartButton() {
    const item = document.createElement("li");
    item.className = "restart-row";
    const button = document.createElement("button");
    button.className = "restart-button";
    button.type = "button";
    button.textContent = "↻  Volver a jugar";
    button.addEventListener("click", resetGame);
    item.append(button);
    elements.chatLog.append(item);
    elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
  }

  function updateMessageCount() {
    elements.messageCount.textContent = `${sentMessages} ${sentMessages === 1 ? "mensaje" : "mensajes"}`;
  }

  function updateCharacterCount() {
    const length = elements.input.value.length;
    elements.characterCount.textContent = `${length}/${MAX_MESSAGE_LENGTH}`;
    elements.characterCount.classList.toggle("near-limit", length >= MAX_MESSAGE_LENGTH - 15);
  }

  function resetGame() {
    trust = INITIAL_TRUST;
    sentMessages = 0;
    finished = false;
    elements.chatLog.replaceChildren();
    elements.input.disabled = false;
    elements.sendButton.disabled = false;
    elements.gameStatus.textContent = "A la espera";
    elements.gameStatus.className = "status-pill";
    elements.guardianDescription.textContent = "Salúdalo con un mensaje. Las palabras que detecte cambiarán su confianza.";
    elements.input.value = "";
    updateTrust();
    updateMessageCount();
    updateCharacterCount();
    appendMessage("dragon", "Guardián", "Alto ahí, viajero. ¿Qué tienes que decir antes de entrar?", null);
    elements.announcer.textContent = "Partida reiniciada. La confianza empieza en 30 de 100.";
    elements.input.focus();
  }

  elements.input.addEventListener("input", updateCharacterCount);
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (finished) return;
    const text = elements.input.value.trim();
    elements.formError.hidden = true;
    elements.formError.textContent = "";
    if (!text) {
      elements.formError.textContent = "Escribe un mensaje antes de enviarlo.";
      elements.formError.hidden = false;
      elements.input.focus();
      return;
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      elements.formError.textContent = `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.`;
      elements.formError.hidden = false;
      elements.input.focus();
      return;
    }

    const analysis = brain.analyze(text);
    const change = analysis.score === 0 ? NEUTRAL_CHANGE : analysis.score * TRUST_PER_POINT;
    trust = Math.max(0, Math.min(100, trust + change));
    sentMessages += 1;
    appendMessage("player", "Tú", text, analysis);
    updateTrust();
    updateMessageCount();
    if (trust === 100 || trust === 0) {
      finishGame(trust === 100);
    } else {
      appendMessage("dragon", "Guardián", dragonReply(analysis, change), null);
      elements.announcer.textContent = `El modelo dio una puntuación de ${analysis.score}. Confianza actual: ${trust} de 100.`;
    }
    elements.input.value = "";
    updateCharacterCount();
    elements.input.focus();
  });

  if (!brain || !elements.form || !elements.chatLog) {
    throw new Error("No se pudo iniciar el juego: faltan los elementos o el módulo de análisis.");
  }
  updateTrust();
  updateMessageCount();
  updateCharacterCount();
})();
