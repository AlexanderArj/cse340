document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".feedback-icons");
  if (!container) return;

  // simplificacion

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".reaction-btn");
    if (!btn) return;

    // Enviar reaccion al server

    const response = await fetch("/inv/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inv_id: container.dataset.invId,
        reaction_type: btn.dataset.type
      })
    });

    const result = await response.json();
    
    if (result.success) {

      document.getElementById("count-1").innerText = "0";

      document.getElementById("count-2").innerText = "0";

      document.getElementById("count-3").innerText = "0";

      result.counts.forEach(row => {
        document.getElementById(`count-${row.reaction_type}`).innerText = row.count;
      });

      // css cambios

      document.querySelectorAll(".reaction-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
  });
});