document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const editAlbumBtn = document.querySelector(".edit-album-btn")
  const editImageBtns = document.querySelectorAll(".edit-image-btn")
  const moveImageBtns = document.querySelectorAll(".move-image-btn")
  const deleteImageBtns = document.querySelectorAll(".delete-image-btn")

  // Modales
  const albumModal = document.getElementById("albumModal")
  const imageModal = document.getElementById("imageModal")
  const moveModal = document.getElementById("moveModal")

  // Formularios
  const albumForm = document.getElementById("albumForm")
  const imageForm = document.getElementById("imageForm")
  const moveForm = document.getElementById("moveForm")

  // Variables globales
  let currentImageId = null
  let currentAlbumId = null

  // Editar álbum
  if (editAlbumBtn) {
    editAlbumBtn.addEventListener("click", () => {
      const albumId = editAlbumBtn.dataset.albumId
      const albumTitle = editAlbumBtn.dataset.albumTitle
      openAlbumModal(albumId, albumTitle)
    })
  }

  // Editar imagen
  editImageBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const imageId = btn.dataset.imageId
      await openImageModal(imageId)
    })
  })

  // Mover imagen
  moveImageBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const imageId = btn.dataset.imageId
      openMoveModal(imageId)
    })
  })

  // Eliminar imagen
  deleteImageBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const imageId = btn.dataset.imageId
      const imageTitle = btn.dataset.imageTitle || "esta imagen"

      if (confirm(`¿Estás seguro de que quieres eliminar "${imageTitle}"?`)) {
        deleteImage(imageId)
      }
    })
  })

  // Abrir modal de álbum
  function openAlbumModal(albumId, title) {
    currentAlbumId = albumId
    const albumTitle = document.getElementById("albumTitle")
    const currentCount = albumModal.querySelector(".current-count")

    albumTitle.value = title
    updateCharacterCount(albumTitle, currentCount, 100)
    albumModal.style.display = "flex"
    albumTitle.focus()
  }

  // Abrir modal de imagen
  async function openImageModal(imageId) {
    currentImageId = imageId

    try {
      // Obtener datos de la imagen
      const response = await fetch(`/api/image/${imageId}`)
      const imageData = await response.json()

      if (imageData.success) {
        const image = imageData.image

        // Llenar formulario
        document.getElementById("imageTitle").value = image.titulo || ""
        document.getElementById("imageDescription").value = image.descripcion || ""
        document.getElementById("imagePrivacy").value = image.privacidad

        // Mostrar imagen actual
        const currentImagePreview = document.getElementById("currentImagePreview")
        currentImagePreview.innerHTML = `<img src="${image.ruta_imagen}" alt="${image.titulo || "Imagen"}">`

        // Manejar usuarios compartidos
        toggleSharedUsersSection()
        if (image.privacidad === 3 && image.sharedUsers) {
          image.sharedUsers.forEach((userId) => {
            const checkbox = document.getElementById(`follower_${userId}`)
            if (checkbox) checkbox.checked = true
          })
        }

        // Actualizar contadores
        updateCharacterCount(
          document.getElementById("imageDescription"),
          imageModal.querySelector(".current-count"),
          1000,
        )

        imageModal.style.display = "flex"
      }
    } catch (error) {
      console.error("Error al cargar imagen:", error)
      showNotification("Error al cargar datos de la imagen", "error")
    }
  }

  // Abrir modal de mover
  function openMoveModal(imageId) {
    currentImageId = imageId
    moveModal.style.display = "flex"
  }

  // Cerrar modales
  function closeModals() {
    albumModal.style.display = "none"
    imageModal.style.display = "none"
    moveModal.style.display = "none"

    // Limpiar formularios
    albumForm.reset()
    imageForm.reset()
    moveForm.reset()

    // Limpiar checkboxes
    document.querySelectorAll('#followersList input[type="checkbox"]').forEach((cb) => {
      cb.checked = false
    })

    currentImageId = null
    currentAlbumId = null
  }

  // Event listeners para cerrar modales
  document.querySelectorAll(".modal-close, .cancel-btn").forEach((btn) => {
    btn.addEventListener("click", closeModals)
  })

  // Cerrar modales al hacer click fuera
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModals()
      }
    })
  })

  // Manejar cambio de privacidad
  const imagePrivacy = document.getElementById("imagePrivacy")
  if (imagePrivacy) {
    imagePrivacy.addEventListener("change", toggleSharedUsersSection)
  }

  function toggleSharedUsersSection() {
    const sharedUsersSection = document.getElementById("sharedUsersSection")
    const privacy = document.getElementById("imagePrivacy").value

    if (privacy === "3") {
      sharedUsersSection.style.display = "block"
    } else {
      sharedUsersSection.style.display = "none"
    }
  }

  // Contador de caracteres
  function updateCharacterCount(input, countElement, maxLength) {
    const length = input.value.length
    countElement.textContent = length

    if (length > maxLength) {
      countElement.style.color = "#dc2626"
    } else {
      countElement.style.color = "#6b7280"
    }
  }

  // Event listeners para contadores
  const albumTitle = document.getElementById("albumTitle")
  const imageDescription = document.getElementById("imageDescription")

  if (albumTitle) {
    albumTitle.addEventListener("input", () => {
      updateCharacterCount(albumTitle, albumModal.querySelector(".current-count"), 100)
    })
  }

  if (imageDescription) {
    imageDescription.addEventListener("input", () => {
      updateCharacterCount(imageDescription, imageModal.querySelector(".current-count"), 1000)
    })
  }

  // Envío del formulario de álbum
  if (albumForm) {
    albumForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const title = document.getElementById("albumTitle").value.trim()
      if (!title) {
        alert("El título del álbum es requerido")
        return
      }

      try {
        const response = await fetch(`/albums/${currentAlbumId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ titulo: title }),
        })

        const result = await response.json()

        if (result.success) {
          showNotification(result.message, "success")
          closeModals()
          // Actualizar título en la página
          document.querySelector(".album-title").textContent = title
          editAlbumBtn.dataset.albumTitle = title
        } else {
          showNotification(result.message || "Error al actualizar álbum", "error")
        }
      } catch (error) {
        console.error("Error:", error)
        showNotification("Error al actualizar álbum", "error")
      }
    })
  }

  // Envío del formulario de imagen
  if (imageForm) {
    imageForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = new FormData(imageForm)

      // Agregar usuarios compartidos si es privacidad 3
      const privacy = document.getElementById("imagePrivacy").value
      if (privacy === "3") {
        const checkedUsers = Array.from(document.querySelectorAll('#followersList input[type="checkbox"]:checked')).map(
          (cb) => cb.value,
        )
        formData.append("sharedUsers", JSON.stringify(checkedUsers))
      }

      try {
        const response = await fetch(`/images/${currentImageId}`, {
          method: "PUT",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          showNotification(result.message, "success")
          closeModals()
          // Recargar la página para mostrar los cambios
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          showNotification(result.message || "Error al actualizar imagen", "error")
        }
      } catch (error) {
        console.error("Error:", error)
        showNotification("Error al actualizar imagen", "error")
      }
    })
  }

  // Envío del formulario de mover
  if (moveForm) {
    moveForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const newAlbumId = document.getElementById("targetAlbum").value
      if (!newAlbumId) {
        alert("Selecciona un álbum destino")
        return
      }

      try {
        const response = await fetch(`/images/${currentImageId}/move`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newAlbumId }),
        })

        const result = await response.json()

        if (result.success) {
          showNotification(result.message, "success")
          closeModals()
          // Remover imagen de la vista
          const imageCard = document.querySelector(`[data-image-id="${currentImageId}"]`)
          if (imageCard) {
            imageCard.style.opacity = "0"
            imageCard.style.transform = "scale(0.8)"
            setTimeout(() => {
              imageCard.remove()
              // Verificar si quedan imágenes
              const remainingImages = document.querySelectorAll(".image-card")
              if (remainingImages.length === 0) {
                showNoImagesMessage()
              }
            }, 300)
          }
        } else {
          showNotification(result.message || "Error al mover imagen", "error")
        }
      } catch (error) {
        console.error("Error:", error)
        showNotification("Error al mover imagen", "error")
      }
    })
  }

  // Eliminar imagen
  async function deleteImage(imageId) {
    try {
      const response = await fetch(`/images/${imageId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        showNotification(result.message, "success")
        // Remover imagen de la vista
        const imageCard = document.querySelector(`[data-image-id="${imageId}"]`)
        if (imageCard) {
          imageCard.style.opacity = "0"
          imageCard.style.transform = "scale(0.8)"
          setTimeout(() => {
            imageCard.remove()
            // Verificar si quedan imágenes
            const remainingImages = document.querySelectorAll(".image-card")
            if (remainingImages.length === 0) {
              showNoImagesMessage()
            }
          }, 300)
        }
      } else {
        showNotification(result.message || "Error al eliminar imagen", "error")
      }
    } catch (error) {
      console.error("Error:", error)
      showNotification("Error al eliminar imagen", "error")
    }
  }

  // Mostrar mensaje de no hay imágenes
  function showNoImagesMessage() {
    const imagesGrid = document.getElementById("imagesGrid")
    const albumId =
      new URLSearchParams(window.location.search).get("album") || window.location.pathname.split("/").pop()

    imagesGrid.innerHTML = `
      <div class="no-images">
        <i class="fas fa-images"></i>
        <h3>Este álbum está vacío</h3>
        <p>Agrega algunas imágenes para comenzar</p>
        <a class="primary-btn" href="/upload?album=${albumId}">
          <i class="fas fa-plus"></i>
          <span>Agregar Imágenes</span>
        </a>
      </div>
    `
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

  // Preview de nueva imagen
  const newImageFile = document.getElementById("newImageFile")
  if (newImageFile) {
    newImageFile.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const currentImagePreview = document.getElementById("currentImagePreview")
          currentImagePreview.innerHTML = `<img src="${e.target.result}" alt="Nueva imagen">`
        }
        reader.readAsDataURL(file)
      }
    })
  }
})
