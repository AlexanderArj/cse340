document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".feedback-icons");
  if (!container) return;

  const invId = container.dataset.invId; 

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".reaction-btn");
    if (!btn) return;

    const reactionType = btn.dataset.type;

    console.log("Enviando:", { invId, reactionType });

    try {
      const response = await fetch("/inv/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inv_id: invId,
          reaction_type: reactionType
        })
      });

      const result = await response.json();

      if (result.success) {
        updateReactionUI(result.counts);
        
        document.querySelectorAll(".reaction-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
    } catch (err) {
      console.error("Error en la petición:", err);
    }
  });
});

function updateReactionUI(countsArray) {
  [1, 2, 3].forEach(id => {
    const el = document.getElementById(`count-${id}`);
    if (el) el.innerText = "0";
  });

  countsArray.forEach(row => {
    const p = document.getElementById(`count-${row.reaction_type}`);
    if (p) p.innerText = row.count;
  });
}
