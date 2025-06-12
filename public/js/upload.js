document.addEventListener("DOMContentLoaded", () => {
  const fileUploadArea = document.getElementById("fileUploadArea")
  const imageFiles = document.getElementById("imageFiles")
  const imagesPreview = document.getElementById("imagesPreview")
  const uploadForm = document.getElementById("uploadForm")
  const uploadBtn = document.querySelector(".upload-btn")
  const albumSelect = document.getElementById("albumSelect")
  const newAlbumName = document.getElementById("newAlbumName")

  // Modal elements
  const privacyModal = document.getElementById("privacyModal")
  const closePrivacyModal = document.getElementById("closePrivacyModal")
  const modalImagePreview = document.getElementById("modalImagePreview")
  const imageTitle = document.getElementById("imageTitle")
  const imageDescription = document.getElementById("imageDescription")
  const privacyLevel = document.getElementById("privacyLevel")
  const sharedUsersSection = document.getElementById("sharedUsersSection")
  const savePrivacyBtn = document.getElementById("savePrivacyBtn")
  const cancelPrivacyBtn = document.getElementById("cancelPrivacyBtn")

  let selectedFiles = []
  let currentImageIndex = 0
  let imageSettings = []

  // Drag and drop functionality
  fileUploadArea.addEventListener("click", () => imageFiles.click())

  fileUploadArea.addEventListener("dragover", (e) => {
    e.preventDefault()
    fileUploadArea.classList.add("drag-over")
  })

  fileUploadArea.addEventListener("dragleave", () => {
    fileUploadArea.classList.remove("drag-over")
  })

  fileUploadArea.addEventListener("drop", (e) => {
    e.preventDefault()
    fileUploadArea.classList.remove("drag-over")
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    handleFiles(files)
  })

  imageFiles.addEventListener("change", (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  })

  // Handle selected files
  function handleFiles(files) {
    if (files.length > 10) {
      alert("Máximo 10 imágenes permitidas")
      return
    }

    selectedFiles = files
    imageSettings = files.map(() => ({
      title: "",
      description: "",
      privacy: "1",
      sharedUsers: [],
    }))

    displayPreview()
    uploadBtn.disabled = false
  }

  // Display image previews
  function displayPreview() {
    imagesPreview.innerHTML = ""

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewItem = document.createElement("div")
        previewItem.className = "preview-item"
        previewItem.innerHTML = `
          <div class="preview-image">
            <img src="${e.target.result}" alt="Preview ${index + 1}">
            <button class="remove-image" data-index="${index}">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="preview-info">
            <h5>Imagen ${index + 1}</h5>
            <p class="privacy-info">${getPrivacyText(imageSettings[index].privacy)}</p>
            <button class="configure-btn" data-index="${index}">
              <i class="fas fa-cog"></i> Configurar
            </button>
          </div>
        `
        imagesPreview.appendChild(previewItem)
      }
      reader.readAsDataURL(file)
    })

    // Add event listeners after creating elements
    setTimeout(() => {
      document.querySelectorAll(".remove-image").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const index = Number.parseInt(e.currentTarget.dataset.index)
          removeImage(index)
        })
      })

      document.querySelectorAll(".configure-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()
          const index = Number.parseInt(e.currentTarget.dataset.index)
          openPrivacyModal(index)
        })
      })
    }, 100)
  }

  // Remove image from selection
  function removeImage(index) {
    selectedFiles.splice(index, 1)
    imageSettings.splice(index, 1)

    if (selectedFiles.length === 0) {
      uploadBtn.disabled = true
      imagesPreview.innerHTML = ""
    } else {
      displayPreview()
    }
  }

  // Open privacy configuration modal
  function openPrivacyModal(index) {
    currentImageIndex = index
    const settings = imageSettings[index]

    // Set current values
    imageTitle.value = settings.title
    imageDescription.value = settings.description
    privacyLevel.value = settings.privacy

    // Show image preview in modal
    const reader = new FileReader()
    reader.onload = (e) => {
      modalImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`
    }
    reader.readAsDataURL(selectedFiles[index])

    // Show/hide shared users section
    toggleSharedUsersSection()

    privacyModal.style.display = "flex"

    // Prevenir envío del formulario mientras el modal está abierto
    privacyModal.dataset.configuring = "true"
  }

  // Close privacy modal
  function closeModal() {
    privacyModal.style.display = "none"

    // Permitir envío del formulario cuando se cierra el modal
    privacyModal.dataset.configuring = "false"
  }

  closePrivacyModal.addEventListener("click", closeModal)
  cancelPrivacyBtn.addEventListener("click", closeModal)

  // Privacy level change handler
  privacyLevel.addEventListener("change", toggleSharedUsersSection)

  function toggleSharedUsersSection() {
    if (privacyLevel.value === "3") {
      sharedUsersSection.style.display = "block"
    } else {
      sharedUsersSection.style.display = "none"
    }
  }

  // Save privacy settings
  savePrivacyBtn.addEventListener("click", () => {
    const settings = imageSettings[currentImageIndex]
    settings.title = imageTitle.value
    settings.description = imageDescription.value
    settings.privacy = privacyLevel.value

    if (privacyLevel.value === "3") {
      const checkedUsers = Array.from(document.querySelectorAll('#followersList input[type="checkbox"]:checked')).map(
        (cb) => cb.value,
      )
      settings.sharedUsers = checkedUsers
    } else {
      settings.sharedUsers = []
    }

    // Update preview info
    const previewInfo = document.querySelector(`.preview-item:nth-child(${currentImageIndex + 1}) .privacy-info`)
    if (previewInfo) {
      previewInfo.textContent = getPrivacyText(settings.privacy)
    }

    closeModal()
  })

  // Get privacy text for display
  function getPrivacyText(privacy) {
    switch (privacy) {
      case "0":
        return "Privada"
      case "1":
        return "Seguidores"
      case "2":
        return "Pública"
      case "3":
        return "Usuario específico"
      default:
        return "Seguidores"
    }
  }

  // Form submission
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Verificar que no estamos en modo configuración
    if (privacyModal.style.display === "flex") {
      return false
    }

    const albumId = albumSelect.value
    const newAlbum = newAlbumName.value.trim()

    if (!albumId && !newAlbum) {
      alert("Debe seleccionar un álbum o crear uno nuevo")
      return
    }

    if (selectedFiles.length === 0) {
      alert("Debe seleccionar al menos una imagen")
      return
    }

    // Prepare form data
    const formData = new FormData()
    formData.append("albumId", albumId)
    formData.append("newAlbumName", newAlbum)
    formData.append("imageSettings", JSON.stringify(imageSettings))

    selectedFiles.forEach((file) => {
      formData.append("images", file)
    })

    // Show loading state
    uploadBtn.disabled = true
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...'

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        window.location.href = "/"
      } else {
        alert(result.message || "Error al subir imágenes")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al subir imágenes")
    } finally {
      uploadBtn.disabled = false
      uploadBtn.innerHTML = "Subir Imágenes"
    }
  })

  // Album selection handler
  albumSelect.addEventListener("change", () => {
    if (albumSelect.value) {
      newAlbumName.value = ""
      newAlbumName.disabled = true
    } else {
      newAlbumName.disabled = false
    }
  })

  newAlbumName.addEventListener("input", () => {
    if (newAlbumName.value.trim()) {
      albumSelect.value = ""
      albumSelect.disabled = true
    } else {
      albumSelect.disabled = false
    }
  })
})
