const form = document.querySelector("#updateForm")
    form.addEventListener("change", function () {
      const updateBtn = form.querySelector("button[type='submit']");
      updateBtn.removeAttribute("disabled")
    })