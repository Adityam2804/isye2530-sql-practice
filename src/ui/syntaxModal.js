function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[ch],
  );
}

export function renderSyntaxModal(items, dayLabel) {
  return `
    <div class="modal-backdrop" id="syntaxModalBackdrop" role="presentation">
      <section class="syntax-modal" role="dialog" aria-modal="true" aria-labelledby="syntaxModalTitle">
        <div class="syntax-modal-header">
          <div>
            <span class="eyebrow">Reference</span>
            <h2 id="syntaxModalTitle">${esc(dayLabel)} Syntax Guide</h2>
            <p>SQL patterns used in today's practice.</p>
          </div>
          <button class="modal-close" id="closeSyntaxGuide" aria-label="Close syntax guide">×</button>
        </div>

        <div class="syntax-modal-body">
          ${items
            .map(
              (item) => `
            <article class="syntax-item">
              <div class="syntax-item-copy">
                <h3>${esc(item.title)}</h3>
                <p>${esc(item.description)}</p>
              </div>
              <pre><code>${esc(item.syntax)}</code></pre>
            </article>
          `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}
