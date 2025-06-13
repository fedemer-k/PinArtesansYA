document.addEventListener("DOMContentLoaded", () => {
  // Botones de seguir/dejar de seguir
  const followBtns = document.querySelectorAll(".follow-btn")
  const unfollowBtns = document.querySelectorAll(".unfollow-btn")

  // Función para seguir a un usuario
  followBtns.forEach((btn) => {
    btn.addEventListener("click", async function () {
      const userId = this.getAttribute("data-user-id")
      try {
        const response = await fetch(`/api/follow/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          // Cambiar el botón a "Dejar de seguir"
          this.classList.remove("btn-primary", "follow-btn")
          this.classList.add("btn-outline-primary", "unfollow-btn")
          this.textContent = "Dejar de seguir"

          // Actualizar contador de seguidores
          const followerCountEl = document.querySelector(".follower-count")
          if (followerCountEl) {
            const currentCount = Number.parseInt(followerCountEl.textContent)
            followerCountEl.textContent = currentCount + 1
          }

          // Recargar para reflejar los cambios
          window.location.reload()
        }
      } catch (error) {
        console.error("Error al seguir usuario:", error)
      }
    })
  })

  // Función para dejar de seguir a un usuario
  unfollowBtns.forEach((btn) => {
    btn.addEventListener("click", async function () {
      const userId = this.getAttribute("data-user-id")
      try {
        const response = await fetch(`/api/unfollow/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          // Cambiar el botón a "Seguir"
          this.classList.remove("btn-outline-primary", "unfollow-btn")
          this.classList.add("btn-primary", "follow-btn")
          this.textContent = "Seguir"

          // Actualizar contador de seguidores
          const followerCountEl = document.querySelector(".follower-count")
          if (followerCountEl) {
            const currentCount = Number.parseInt(followerCountEl.textContent)
            followerCountEl.textContent = Math.max(0, currentCount - 1)
          }

          // Recargar para reflejar los cambios
          window.location.reload()
        }
      } catch (error) {
        console.error("Error al dejar de seguir usuario:", error)
      }
    })
  })
})
