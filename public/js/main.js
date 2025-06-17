document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1
  const loadMoreBtn = document.getElementById("loadMoreBtn")
  const galleryGrid = document.getElementById("galleryGrid")
  const contentSearchInput = document.getElementById("contentSearchInput")

  // User menu functionality
  const userMenuToggle = document.getElementById("userMenuToggle")
  const userDropdown = document.getElementById("userDropdown")

  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation()
      userDropdown.classList.toggle("show")
      userMenuToggle.classList.toggle("active")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove("show")
        userMenuToggle.classList.remove("active")
      }
    })

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        userDropdown.classList.remove("show")
        userMenuToggle.classList.remove("active")
      }
    })
  }

  // Notifications menu functionality
  const notificationsToggle = document.getElementById("notificationsToggle")
  const notificationsDropdown = document.getElementById("notificationsDropdown")
  const notificationsList = document.getElementById("notificationsList")

  if (notificationsToggle && notificationsDropdown) {
    notificationsToggle.addEventListener("click", async (e) => {
      e.stopPropagation()
      notificationsDropdown.classList.toggle("show")

      // Cargar notificaciones recientes cuando se abre el menú
      if (notificationsDropdown.classList.contains("show")) {
        await loadRecentNotifications()
      }

      // Cerrar el menú de usuario si está abierto
      if (userDropdown) {
        userDropdown.classList.remove("show")
        userMenuToggle.classList.remove("active")
      }
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!notificationsToggle.contains(e.target) && !notificationsDropdown.contains(e.target)) {
        notificationsDropdown.classList.remove("show")
      }
    })

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        notificationsDropdown.classList.remove("show")
      }
    })
  }

  // Cargar notificaciones recientes
  async function loadRecentNotifications() {
    try {
      const response = await fetch("/api/notifications/recent")
      const notifications = await response.json()

      if (notificationsList) {
        if (notifications.length === 0) {
          notificationsList.innerHTML = `
            <div class="notification-item">
              <div class="notification-content">
                <p style="text-align: center; color: #8e8e8e;">No tienes notificaciones</p>
              </div>
            </div>
          `
        } else {
          notificationsList.innerHTML = notifications
            .map(
              (notification) => `
            <div class="notification-item" onclick="window.location.href='/notifications'">
              <div class="notification-avatar">
                <img src="${notification.imagen_perfil || "/uploads/profiles/default.png"}" alt="Usuario">
              </div>
              <div class="notification-content">
                <p>${notification.mensaje}</p>
                <span class="notification-time">${formatDate(notification.fecha)}</span>
              </div>
            </div>
          `,
            )
            .join("")
        }
      }
    } catch (error) {
      console.error("Error al cargar notificaciones recientes:", error)
    }
  }

  // Función para formatear fechas
  function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "hace 1 día"
    if (diffDays < 7) return `hace ${diffDays} días`
    if (diffDays < 30) return `hace ${Math.ceil(diffDays / 7)} semanas`
    return date.toLocaleDateString()
  }

  // Función para cargar más imágenes
  async function loadMoreImages() {
    const btnText = loadMoreBtn.querySelector(".btn-text")
    const spinner = loadMoreBtn.querySelector(".loading-spinner")

    // Mostrar loading
    btnText.style.display = "none"
    spinner.style.display = "inline-block"
    loadMoreBtn.disabled = true

    try {
      currentPage++
      const response = await fetch(`/api/images?page=${currentPage}&limit=12`)
      const newImages = await response.json()

      // Agregar nuevas imágenes al grid
      newImages.forEach((image) => {
        const imageElement = createImageElement(image)
        galleryGrid.appendChild(imageElement)
      })

      // Animar la entrada de las nuevas imágenes
      const newElements = galleryGrid.querySelectorAll(".gallery-item:nth-last-child(-n+12)")
      newElements.forEach((el, index) => {
        el.style.opacity = "0"
        el.style.transform = "translateY(20px)"
        setTimeout(() => {
          el.style.transition = "all 0.5s ease"
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
        }, index * 100)
      })
    } catch (error) {
      console.error("Error cargando imágenes:", error)
      alert("Error al cargar más imágenes. Inténtalo de nuevo.")
    } finally {
      // Ocultar loading
      btnText.style.display = "inline"
      spinner.style.display = "none"
      loadMoreBtn.disabled = false
    }
  }

  // Función para crear elemento de imagen
  function createImageElement(image) {
    const div = document.createElement("div")
    div.className = "gallery-item"
    div.setAttribute("data-id", image.id)

    div.innerHTML = `
            <img src="${image.src}" alt="Imagen ${image.id}" loading="lazy">
            <div class="gallery-overlay">
                <div class="overlay-stats">
                    <div class="stat-item">
                        <i class="fas.fa-heart"></i>
                        <span class="likes-count">${image.likes || 0}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-comment"></i>
                        <span>${image.comments || 0}</span>
                    </div>
                </div>
            </div>
        `

    // Agregar evento de click para ver imagen completa
    div.addEventListener("click", (e) => {
      window.location.href = `/image/${image.id}`
    })

    return div
  }

  // Event listener para el botón de cargar más
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreImages)
  }

  // Animación de scroll suave para follows
  const followsContainer = document.querySelector(".follows-container")
  if (followsContainer) {
    let isScrolling = false

    followsContainer.addEventListener("wheel", function (e) {
      if (!isScrolling) {
        isScrolling = true
        e.preventDefault()

        this.scrollLeft += e.deltaY

        setTimeout(() => {
          isScrolling = false
        }, 100)
      }
    })
  }

  // Lazy loading para imágenes
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src || img.src
        img.classList.remove("lazy")
        observer.unobserve(img)
      }
    })
  })

  // Observar todas las imágenes
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    imageObserver.observe(img)
  })

  // Settings page functionality
  if (window.location.pathname === "/settings") {
    // Preview image before upload
    const profileImageInput = document.getElementById("profileImage")
    const currentProfileImage = document.getElementById("currentProfileImage")

    if (profileImageInput && currentProfileImage) {
      profileImageInput.addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            currentProfileImage.src = e.target.result
          }
          reader.readAsDataURL(file)
        }
      })
    }
  }

  // Event listeners para imágenes existentes en la galería
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const imageId = item.dataset.id
      window.location.href = `/image/${imageId}`
    })
  })
})
