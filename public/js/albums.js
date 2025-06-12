document.addEventListener("DOMContentLoaded", () => {
  const createAlbumBtns = document.querySelectorAll(".create-album-btn")
  const editAlbumBtns = document.querySelectorAll(".edit-album-btn")
  const deleteAlbumBtns = document.querySelectorAll(".delete-album-btn")
  const albumModal = document.getElementById("albumModal")
  const albumForm = document.getElementById("albumForm")
  const albumTitle = document.getElementById("albumTitle")
  const modalTitle = document.getElementById("modalTitle")
  const saveAlbumBtn = document.getElementById("saveAlbumBtn")
  const closeAlbumModal = document.getElementById("closeAlbumModal")
  const cancelAlbumBtn = document.getElementById("cancelAlbumBtn")
  const currentCount = document.querySelector(".current-count")

  let currentAlbumId = null
  let isEditing = false

  // Crear álbum
  createAlbumBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      openAlbumModal(false)
    })
  })

  // Editar álbum
  editAlbumBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const albumId = btn.dataset.albumId
      const albumTitleText = btn.dataset.albumTitle
      openAlbumModal(true, albumId, albumTitleText)
    })
  })

  // Eliminar álbum
  deleteAlbumBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const albumId = btn.dataset.albumId
      const albumTitleText = btn.dataset.albumTitle
      const imageCount = Number.parseInt(btn.dataset.imageCount)

      if (imageCount > 0) {
        alert("No se puede eliminar un álbum que contiene imágenes. Primero elimina o mueve todas las imágenes.")
        return
      }

      if (confirm(`¿Estás seguro de que quieres eliminar el álbum "${albumTitleText}"?`)) {
        deleteAlbum(albumId)
      }
    })
  })

  // Abrir modal
  function openAlbumModal(editing = false, albumId = null, title = "") {
    isEditing = editing
    currentAlbumId = albumId

    modalTitle.textContent = editing ? "Editar Álbum" : "Crear Álbum"
    saveAlbumBtn.textContent = editing ? "Guardar Cambios" : "Crear Álbum"
    albumTitle.value = title
    updateCharacterCount()

    albumModal.style.display = "flex"
    albumTitle.focus()
  }

  // Cerrar modal
  function closeModal() {
    albumModal.style.display = "none"
    albumForm.reset()
    currentAlbumId = null
    isEditing = false
    updateCharacterCount()
  }

  closeAlbumModal.addEventListener("click", closeModal)
  cancelAlbumBtn.addEventListener("click", closeModal)

  // Contador de caracteres
  albumTitle.addEventListener("input", updateCharacterCount)

  function updateCharacterCount() {
    const length = albumTitle.value.length
    currentCount.textContent = length

    if (length > 100) {
      currentCount.style.color = "#dc2626"
    } else {
      currentCount.style.color = "#6b7280"
    }
  }

  // Envío del formulario
  albumForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const title = albumTitle.value.trim()
    if (!title) {
      alert("El título del álbum es requerido")
      return
    }

    if (title.length > 100) {
      alert("El título no puede exceder 100 caracteres")
      return
    }

    // Deshabilitar botón durante el envío
    saveAlbumBtn.disabled = true
    saveAlbumBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'

    try {
      let response
      if (isEditing) {
        response = await fetch(`/albums/${currentAlbumId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ titulo: title }),
        })
      } else {
        response = await fetch("/albums", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ titulo: title }),
        })
      }

      const result = await response.json()

      if (result.success) {
        showNotification(result.message, "success")
        closeModal()
        // Recargar la página para mostrar los cambios
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        showNotification(result.message || "Error al procesar solicitud", "error")
      }
    } catch (error) {
      console.error("Error:", error)
      showNotification("Error al procesar solicitud", "error")
    } finally {
      saveAlbumBtn.disabled = false
      saveAlbumBtn.innerHTML = isEditing ? "Guardar Cambios" : "Crear Álbum"
    }
  })

  // Eliminar álbum
  async function deleteAlbum(albumId) {
    try {
      const response = await fetch(`/albums/${albumId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        showNotification(result.message, "success")
        // Remover el álbum de la vista
        const albumCard = document.querySelector(`[data-album-id="${albumId}"]`)
        if (albumCard) {
          albumCard.style.opacity = "0"
          albumCard.style.transform = "scale(0.8)"
          setTimeout(() => {
            albumCard.remove()
            // Si no quedan álbumes, mostrar mensaje
            const remainingAlbums = document.querySelectorAll(".album-card")
            if (remainingAlbums.length === 0) {
              showNoAlbumsMessage()
            }
          }, 300)
        }
      } else {
        showNotification(result.message || "Error al eliminar álbum", "error")
      }
    } catch (error) {
      console.error("Error:", error)
      showNotification("Error al eliminar álbum", "error")
    }
  }

  // Mostrar mensaje de no hay álbumes
  function showNoAlbumsMessage() {
    const albumsGrid = document.getElementById("albumsGrid")
    albumsGrid.innerHTML = `
      <div class="no-albums">
        <i class="fas fa-folder-open"></i>
        <h3>No tienes álbumes aún</h3>
        <p>Crea tu primer álbum para organizar tus imágenes</p>
        <button class="create-album-btn primary-btn">
          <i class="fas fa-plus"></i>
          <span>Crear mi primer álbum</span>
        </button>
      </div>
    `

    // Agregar event listener al nuevo botón
    const newCreateBtn = albumsGrid.querySelector(".create-album-btn")
    newCreateBtn.addEventListener("click", () => {
      openAlbumModal(false)
    })
  }

  // Función para mostrar notificaciones
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        <span>${message}</span>
      </div>
    `

    document.body.appendChild(notification)

    // Mostrar notificación
    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    // Ocultar después de 3 segundos
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }

  // Cerrar modal al hacer click fuera
  albumModal.addEventListener("click", (e) => {
    if (e.target === albumModal) {
      closeModal()
    }
  })

  // Cerrar modal con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && albumModal.style.display === "flex") {
      closeModal()
    }
  })
})
