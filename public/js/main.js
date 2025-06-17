document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1
  const loadMoreBtn = document.getElementById("loadMoreBtn")
  const galleryGrid = document.getElementById("galleryGrid")
  const searchInput = document.getElementById("searchInput")
  const contentSearchInput = document.getElementById("contentSearchInput")

  // Elementos de búsqueda de usuarios
  const userSearchResults = document.getElementById("userSearchResults")
  const usersGrid = document.getElementById("usersGrid")
  const resultsCount = document.getElementById("resultsCount")
  const noResults = document.getElementById("noResults")
  const gallerySection = document.querySelector(".gallery-section")
  const followsSection = document.querySelector(".follows-section")

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

  // Funcionalidad de búsqueda de usuarios
  if (searchInput) {
    let searchTimeout

    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout)
      const query = this.value.trim()

      searchTimeout = setTimeout(async () => {
        if (query.length >= 2) {
          await searchUsers(query)
        } else {
          showGalleryMode()
        }
      }, 300)
    })
  }

  // Función para buscar usuarios
  async function searchUsers(query) {
    try {
      const response = await fetch(`/search/api/search/users?q=${encodeURIComponent(query)}`)
      const users = await response.json()

      if (users.length > 0) {
        showSearchResults(users, query)
      } else {
        showNoResults()
      }
    } catch (error) {
      console.error("Error al buscar usuarios:", error)
      showNoResults()
    }
  }

  // Mostrar resultados de búsqueda
  function showSearchResults(users, query) {
    // Ocultar galería y follows
    if (gallerySection) gallerySection.style.display = "none"
    if (followsSection) followsSection.style.display = "none"
    if (noResults) noResults.style.display = "none"

    // Mostrar resultados
    if (userSearchResults) userSearchResults.style.display = "block"
    if (resultsCount) resultsCount.textContent = `${users.length} resultado(s) para "${query}"`

    // Crear grid de usuarios
    if (usersGrid) {
      usersGrid.innerHTML = users.map((user) => createUserCard(user)).join("")
    }
  }

  // Mostrar modo galería (sin búsqueda)
  function showGalleryMode() {
    if (userSearchResults) userSearchResults.style.display = "none"
    if (noResults) noResults.style.display = "none"
    if (gallerySection) gallerySection.style.display = "block"
    if (followsSection) followsSection.style.display = "block"
  }

  // Mostrar sin resultados
  function showNoResults() {
    if (gallerySection) gallerySection.style.display = "none"
    if (followsSection) followsSection.style.display = "none"
    if (userSearchResults) userSearchResults.style.display = "none"
    if (noResults) noResults.style.display = "block"
  }

  // Crear tarjeta de usuario
  function createUserCard(user) {
    const buttonContent = ""
    const buttonClass = "follow-btn"
    let buttonHtml = ""

    switch (user.follow_status) {
      case "following":
        buttonHtml = `<form action="/profile/${user.id}/unfollow" method="POST">
                        <button type="submit" class="follow-btn following">
                          <i class="fas fa-check"></i> Siguiendo
                        </button>
                      </form>`
        break
      case "pending_sent":
        buttonHtml = `<button class="follow-btn pending" disabled>
                        <i class="fas fa-clock"></i> Pendiente
                      </button>`
        break
      case "pending_received":
        buttonHtml = `<a href="/notifications" class="follow-btn respond">
                        <i class="fas fa-user-plus"></i> Responder
                      </a>`
        break
      default:
        buttonHtml = `<form action="/profile/${user.id}/follow" method="POST">
                        <button type="submit" class="follow-btn">
                          <i class="fas fa-user-plus"></i> Seguir
                        </button>
                      </form>`
    }

    return `
      <div class="user-card" data-user-id="${user.id}">
        <div class="user-avatar-large">
          <img src="${user.imagen_perfil || "/uploads/profiles/default.png"}" alt="${user.nombre}">
          ${user.moderador ? '<div class="moderator-indicator"><i class="fas fa-shield-alt"></i></div>' : ""}
        </div>
        <div class="user-info">
          <h4 class="user-name">${user.nombre}</h4>
          ${user.intereses ? `<p class="user-interests">${user.intereses.substring(0, 100)}${user.intereses.length > 100 ? "..." : ""}</p>` : ""}
          ${user.modo_vitrina ? '<span class="showcase-badge"><i class="fas fa-star"></i> Vitrina</span>' : ""}
        </div>
        ${buttonHtml}
      </div>
    `
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



  // Animaciones CSS adicionales
  const style = document.createElement("style")
  style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .gallery-item {
            animation: fadeIn 0.5s ease forwards;
        }
        
        .follow-avatar:hover {
            transform: scale(1.05);
            transition: transform 0.2s ease;
        }
        
        .nav-btn:active {
            transform: scale(0.95);
        }

        /* User Search Results Styles */
        .user-search-results {
            margin-bottom: 2rem;
        }

        .search-results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #f1f3f4;
        }

        .search-results-header h3 {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1f2937;
        }

        .results-count {
            font-size: 0.9rem;
            color: #6b7280;
        }

        .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .user-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.2s;
            position: relative;
        }

        .user-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        .user-card .user-avatar-large {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
        }

        .user-card .user-avatar-large img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }

        .moderator-indicator {
            position: absolute;
            bottom: 0;
            right: 0;
            background: linear-gradient(45deg, #d97706, #dc2626);
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            border: 2px solid white;
        }

        .user-info {
            text-align: center;
            margin-bottom: 1rem;
        }

        .user-info .user-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }

        .user-interests {
            font-size: 0.9rem;
            color: #6b7280;
            line-height: 1.4;
            margin-bottom: 0.5rem;
        }

        .showcase-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background: linear-gradient(45deg, #d97706, #dc2626);
            color: white;
            font-size: 0.8rem;
            font-weight: 500;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
        }

        .follow-btn {
            width: 100%;
            background: linear-gradient(45deg, #d97706, #dc2626);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .follow-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }

        .follow-btn.following {
            background: #10b981;
        }

        .follow-btn.pending {
            background: #f59e0b;
        }

        .follow-btn.respond {
            background: #3b82f6;
        }

        .no-results {
            text-align: center;
            padding: 4rem 2rem;
        }

        .no-results-content {
            max-width: 400px;
            margin: 0 auto;
        }

        .no-results-icon {
            font-size: 4rem;
            color: #d1d5db;
            margin-bottom: 1rem;
        }

        .no-results h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }

        .no-results p {
            color: #6b7280;
        }

        @media (max-width: 768px) {
            .users-grid {
                grid-template-columns: 1fr;
            }
            
            .search-results-header {
                flex-direction: column;
                gap: 0.5rem;
                align-items: flex-start;
            }
        }
    `
  document.head.appendChild(style)

  // Event listeners para imágenes existentes en la galería
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const imageId = item.dataset.id
      window.location.href = `/image/${imageId}`
    })
  })
})
