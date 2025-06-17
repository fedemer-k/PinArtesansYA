document.addEventListener("DOMContentLoaded", () => {
  const commentForm = document.getElementById("commentForm")
  const commentInput = document.getElementById("commentInput")
  const submitBtn = document.querySelector(".submit-comment-btn")
  const cancelBtn = document.querySelector(".cancel-comment-btn")
  const commentsList = document.getElementById("commentsList")
  const currentCount = document.querySelector(".current-count")
  const commentsCountBadge = document.querySelector(".comments-count-badge")
  const commentsCountMeta = document.querySelector(".comments-count")

  // Funcionalidad del formulario de comentarios
  if (commentInput) {
    commentInput.addEventListener("input", () => {
      const length = commentInput.value.length
      currentCount.textContent = length

      // Habilitar/deshabilitar botón de envío
      submitBtn.disabled = length === 0 || length > 500

      // Mostrar/ocultar botón cancelar
      if (length > 0) {
        cancelBtn.style.display = "inline-block"
      } else {
        cancelBtn.style.display = "none"
      }

      // Cambiar color del contador si se excede el límite
      if (length > 500) {
        currentCount.style.color = "#dc2626"
      } else {
        currentCount.style.color = "#6b7280"
      }
    })

    commentInput.addEventListener("focus", () => {
      commentInput.rows = 4
    })

    commentInput.addEventListener("blur", () => {
      if (commentInput.value.length === 0) {
        commentInput.rows = 3
        cancelBtn.style.display = "none"
      }
    })
  }

  // Envío del formulario de comentarios
  if (commentForm) {
    commentForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const comment = commentInput.value.trim()
      if (!comment) return

      // Deshabilitar formulario durante el envío
      submitBtn.disabled = true
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'
      commentInput.disabled = true

      try {
        const imageId = window.location.pathname.split("/").pop()
        const response = await fetch(`/image/${imageId}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment }),
        })

        const result = await response.json()

        if (result.success) {
          // Agregar comentario a la lista
          addCommentToList(result.comment)

          // Limpiar formulario
          commentInput.value = ""
          currentCount.textContent = "0"
          commentInput.rows = 3
          cancelBtn.style.display = "none"

          // Actualizar contadores
          updateCommentsCount(1)

          // Mostrar mensaje de éxito
          showNotification("Comentario agregado correctamente", "success")
        } else {
          showNotification(result.message || "Error al agregar comentario", "error")
        }
      } catch (error) {
        console.error("Error al enviar comentario:", error)
        showNotification("Error al enviar comentario", "error")
      } finally {
        // Rehabilitar formulario
        submitBtn.disabled = false
        submitBtn.innerHTML = "Comentar"
        commentInput.disabled = false
      }
    })
  }

  // Botón cancelar
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      commentInput.value = ""
      currentCount.textContent = "0"
      commentInput.rows = 3
      cancelBtn.style.display = "none"
      submitBtn.disabled = true
      commentInput.blur()
    })
  }

  // Eliminar comentarios
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-comment-btn")) {
      const button = e.target.closest(".delete-comment-btn")
      const commentId = button.dataset.commentId

      if (confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
        try {
          button.disabled = true
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

          const response = await fetch(`/comment/${commentId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })

          const result = await response.json()

          if (result.success) {
            // Remover comentario de la lista
            const commentItem = button.closest(".comment-item")
            commentItem.style.opacity = "0"
            commentItem.style.transform = "translateX(-100%)"

            setTimeout(() => {
              commentItem.remove()
              updateCommentsCount(-1)

              // Si no hay más comentarios, mostrar mensaje
              if (commentsList.children.length === 0) {
                showNoCommentsMessage()
              }
            }, 300)

            showNotification("Comentario eliminado correctamente", "success")
          } else {
            showNotification(result.message || "Error al eliminar comentario", "error")
            button.disabled = false
            button.innerHTML = '<i class="fas fa-trash"></i>'
          }
        } catch (error) {
          console.error("Error al eliminar comentario:", error)
          showNotification(error, "error")
          button.disabled = false
          button.innerHTML = '<i class="fas fa-trash"></i>'
        }
      }
    }
  })

  // Función para agregar comentario a la lista
  function addCommentToList(comment) {
    // Remover mensaje de "no hay comentarios" si existe
    const noComments = commentsList.querySelector(".no-comments")
    if (noComments) {
      noComments.remove()
    }

    const commentElement = document.createElement("div")
    commentElement.className = "comment-item"
    commentElement.dataset.commentId = comment.id_comentario
    commentElement.style.opacity = "0"
    commentElement.style.transform = "translateY(20px)"

    commentElement.innerHTML = `
      <div class="comment-avatar">
        <img src="${comment.usuario_avatar}" alt="${comment.usuario_nombre}">
      </div>
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${comment.usuario_nombre}</span>
          <span class="comment-date">${new Date().toLocaleDateString("es-ES")}</span>
          <button class="delete-comment-btn" data-comment-id="${comment.id_comentario}" title="Eliminar comentario">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <p class="comment-text">${comment.texto}</p>
      </div>
    `

    // Insertar al principio de la lista
    commentsList.insertBefore(commentElement, commentsList.firstChild)

    // Animar entrada
    setTimeout(() => {
      commentElement.style.transition = "all 0.3s ease"
      commentElement.style.opacity = "1"
      commentElement.style.transform = "translateY(0)"
    }, 100)
  }

  // Función para mostrar mensaje de no hay comentarios
  function showNoCommentsMessage() {
    const noCommentsElement = document.createElement("div")
    noCommentsElement.className = "no-comments"
    noCommentsElement.innerHTML = `
      <i class="fas fa-comment-slash"></i>
      <p>Aún no hay comentarios en esta imagen</p>
      <p>¡Sé el primero en comentar!</p>
    `
    commentsList.appendChild(noCommentsElement)
  }

  // Función para actualizar contadores de comentarios
  function updateCommentsCount(change) {
    if (commentsCountBadge) {
      const currentCount = Number.parseInt(commentsCountBadge.textContent) || 0
      const newCount = Math.max(0, currentCount + change)
      commentsCountBadge.textContent = newCount
    }

    if (commentsCountMeta) {
      const currentCount = Number.parseInt(commentsCountMeta.textContent.match(/\d+/)[0]) || 0
      const newCount = Math.max(0, currentCount + change)
      commentsCountMeta.textContent = `${newCount} comentario(s)`
    }
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

  // Funcionalidad de compartir imagen
  const shareBtn = document.querySelector(".share-image-btn")
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href,
        })
      } else {
        // Fallback: copiar URL al portapapeles
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => {
            showNotification("URL copiada al portapapeles", "success")
          })
          .catch(() => {
            showNotification("No se pudo copiar la URL", "error")
          })
      }
    })
  }
})
