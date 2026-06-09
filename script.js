document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================================================
     1. PERSONAL PERSISTENT COUNTDOWN TIMER
     ========================================================================== */
  const countdownDuration = 25 * 60; // 25 minutes in seconds
  let timeRemaining;

  const savedStartTime = localStorage.getItem('dollSalesTimerStart');
  const currentTime = Math.floor(Date.now() / 1000);

  if (savedStartTime) {
    const elapsed = currentTime - parseInt(savedStartTime, 10);
    if (elapsed < countdownDuration) {
      timeRemaining = countdownDuration - elapsed;
    } else {
      localStorage.setItem('dollSalesTimerStart', currentTime.toString());
      timeRemaining = countdownDuration;
    }
  } else {
    localStorage.setItem('dollSalesTimerStart', currentTime.toString());
    timeRemaining = countdownDuration;
  }

  const timerElement = document.getElementById('countdown-timer');

  function updateTimer() {
    if (timeRemaining <= 0) {
      localStorage.setItem('dollSalesTimerStart', Math.floor(Date.now() / 1000).toString());
      timeRemaining = countdownDuration;
    }

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    if (timerElement) {
      timerElement.textContent = `00:${formattedMinutes}:${formattedSeconds}`;
    }

    timeRemaining--;
  }

  updateTimer();
  setInterval(updateTimer, 1000);


  /* ==========================================================================
     2. INTERACTIVE ACCORDION (FAQ)
     ========================================================================== */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-content').style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });


  /* ==========================================================================
     3. MOBILE FLOATING CTA BAR TRIGGERS
     ========================================================================== */
  const heroCtaBtn = document.getElementById('hero-cta-btn');
  const floatingCtaBar = document.querySelector('.floating-cta-bar');

  window.addEventListener('scroll', () => {
    if (heroCtaBtn && floatingCtaBar) {
      const heroBtnPosition = heroCtaBtn.getBoundingClientRect().bottom + window.scrollY;
      const currentScroll = window.scrollY;

      if (currentScroll > heroBtnPosition) {
        floatingCtaBar.style.display = 'block';
        setTimeout(() => {
          floatingCtaBar.style.opacity = '1';
          floatingCtaBar.style.transform = 'translateY(0)';
        }, 10);
      } else {
        floatingCtaBar.style.display = 'none';
      }
    }
  });


  /* ==========================================================================
     4. ULTRA-FLUID PREVIEWS CAROUSEL WITH SWIPE SUPPORT
     ========================================================================== */
  const track = document.getElementById('carousel-track');
  const slides = Array.from(track.children);
  const nextBtn = document.getElementById('carousel-next');
  const prevBtn = document.getElementById('carousel-prev');
  const dotsContainer = document.getElementById('carousel-dots');
  
  let currentIndex = 0;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;
  let animationID = 0;

  function getVisibleSlidesCount() {
    const width = window.innerWidth;
    if (width > 1024) return 3;
    if (width > 768) return 2;
    return 1;
  }

  function setupDots() {
    dotsContainer.innerHTML = '';
    const visibleCount = getVisibleSlidesCount();
    const dotsCount = Math.max(0, slides.length - visibleCount + 1);

    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => moveToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = Array.from(dotsContainer.children);
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function moveToSlide(index) {
    const visibleCount = getVisibleSlidesCount();
    const maxIndex = slides.length - visibleCount;

    currentIndex = Math.max(0, Math.min(index, maxIndex));

    const slideWidth = slides[0].getBoundingClientRect().width;
    const amountToMove = -currentIndex * slideWidth;
    
    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    track.style.transform = `translateX(${amountToMove}px)`;

    prevTranslate = amountToMove;
    updateDots();
  }

  nextBtn.addEventListener('click', () => {
    const visibleCount = getVisibleSlidesCount();
    if (currentIndex < slides.length - visibleCount) {
      moveToSlide(currentIndex + 1);
    } else {
      moveToSlide(0);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      moveToSlide(currentIndex - 1);
    } else {
      const visibleCount = getVisibleSlidesCount();
      moveToSlide(slides.length - visibleCount);
    }
  });

  track.addEventListener('touchstart', touchStart);
  track.addEventListener('touchend', touchEnd);
  track.addEventListener('touchmove', touchMove);

  track.addEventListener('mousedown', touchStart);
  track.addEventListener('mouseup', touchEnd);
  track.addEventListener('mouseleave', touchEnd);
  track.addEventListener('mousemove', touchMove);

  function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  function touchStart(event) {
    isDragging = true;
    startX = getPositionX(event);
    track.style.transition = 'none';
    
    if (event.type === 'mousedown') {
      event.preventDefault();
    }
    
    animationID = requestAnimationFrame(animation);
  }

  function touchMove(event) {
    if (!isDragging) return;
    const currentX = getPositionX(event);
    const diff = currentX - startX;
    
    const visibleCount = getVisibleSlidesCount();
    const slideWidth = slides[0].getBoundingClientRect().width;
    const maxTranslate = -(slides.length - visibleCount) * slideWidth;
    
    let targetTranslate = prevTranslate + diff;
    if (targetTranslate > 0) {
      targetTranslate = diff * 0.3;
    } else if (targetTranslate < maxTranslate) {
      targetTranslate = maxTranslate + (diff * 0.3);
    }
    
    currentTranslate = targetTranslate;
  }

  function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);

    const slideWidth = slides[0].getBoundingClientRect().width;
    const movedBy = currentTranslate - prevTranslate;
    const threshold = slideWidth * 0.25;

    if (movedBy < -threshold) {
      moveToSlide(currentIndex + 1);
    } else if (movedBy > threshold) {
      moveToSlide(currentIndex - 1);
    } else {
      moveToSlide(currentIndex);
    }
  }

  function animation() {
    if (isDragging) {
      track.style.transform = `translateX(${currentTranslate}px)`;
      requestAnimationFrame(animation);
    }
  }

  window.addEventListener('resize', () => {
    setupDots();
    moveToSlide(currentIndex);
  });

  setupDots();
  moveToSlide(0);

  let autoplay = setInterval(() => {
    if (!isDragging) {
      const visibleCount = getVisibleSlidesCount();
      if (currentIndex < slides.length - visibleCount) {
        moveToSlide(currentIndex + 1);
      } else {
        moveToSlide(0);
      }
    }
  }, 4000);

  const stopAutoplay = () => {
    clearInterval(autoplay);
  };
  
  track.addEventListener('touchstart', stopAutoplay, { passive: true });
  track.addEventListener('mousedown', stopAutoplay);
  prevBtn.addEventListener('click', stopAutoplay);
  nextBtn.addEventListener('click', stopAutoplay);


  /* ==========================================================================
     5. TESTIMONIALS MODAL & CAROUSEL SYSTEM
     ========================================================================== */
  const modal = document.getElementById('testimonials-modal');
  const openModalBtn = document.getElementById('open-testimonials-modal-btn');
  const closeModalBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  
  const previewCards = [
    document.getElementById('open-modal-card-1'),
    document.getElementById('open-modal-card-2'),
    document.getElementById('open-modal-card-3')
  ];

  // Modal Open Function
  function openModal(initialSlideIndex = 0) {
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Stop background scrolling
      
      // Setup and move to the selected comment slide index
      setupModalCarousel();
      moveToModalSlide(initialSlideIndex);
    }
  }

  // Modal Close Function
  function closeModal() {
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
    }
  }

  // Open listeners
  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => openModal(0));
  }
  previewCards.forEach((card, index) => {
    if (card) {
      card.addEventListener('click', () => openModal(index));
    }
  });

  // Close listeners
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  // Close on Escape Key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // --- Modal Slider Code ---
  const modalTrack = document.getElementById('modal-modal-track');
  const modalSlides = modalTrack ? Array.from(modalTrack.children) : [];
  const modalNextBtn = document.getElementById('modal-modal-next');
  const modalPrevBtn = document.getElementById('modal-modal-prev');
  const modalDotsContainer = document.getElementById('modal-modal-dots');
  
  let modalCurrentIndex = 0;
  let modalStartX = 0;
  let modalCurrentTranslate = 0;
  let modalPrevTranslate = 0;
  let modalIsDragging = false;
  let modalAnimationID = 0;

  function setupModalCarousel() {
    if (!modalDotsContainer || modalSlides.length === 0) return;
    
    modalDotsContainer.innerHTML = '';
    modalSlides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.classList.add('modal-carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => moveToModalSlide(i));
      modalDotsContainer.appendChild(dot);
    });
  }

  function updateModalDots() {
    if (!modalDotsContainer) return;
    const dots = Array.from(modalDotsContainer.children);
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === modalCurrentIndex);
    });
  }

  function moveToModalSlide(index) {
    if (modalSlides.length === 0) return;
    
    modalCurrentIndex = Math.max(0, Math.min(index, modalSlides.length - 1));

    const slideWidth = modalSlides[0].getBoundingClientRect().width;
    const amountToMove = -modalCurrentIndex * slideWidth;
    
    modalTrack.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    modalTrack.style.transform = `translateX(${amountToMove}px)`;

    modalPrevTranslate = amountToMove;
    updateModalDots();
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => {
      if (modalCurrentIndex < modalSlides.length - 1) {
        moveToModalSlide(modalCurrentIndex + 1);
      } else {
        moveToModalSlide(0); // loop
      }
    });
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', () => {
      if (modalCurrentIndex > 0) {
        moveToModalSlide(modalCurrentIndex - 1);
      } else {
        moveToModalSlide(modalSlides.length - 1); // loop back
      }
    });
  }

  // Swipe logic for modal slider (crucial for mobile smoothness)
  if (modalTrack) {
    modalTrack.addEventListener('touchstart', modalTouchStart, { passive: true });
    modalTrack.addEventListener('touchend', modalTouchEnd);
    modalTrack.addEventListener('touchmove', modalTouchMove, { passive: true });

    modalTrack.addEventListener('mousedown', modalTouchStart);
    modalTrack.addEventListener('mouseup', modalTouchEnd);
    modalTrack.addEventListener('mouseleave', modalTouchEnd);
    modalTrack.addEventListener('mousemove', modalTouchMove);
  }

  function getModalPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  function modalTouchStart(event) {
    modalIsDragging = true;
    modalStartX = getModalPositionX(event);
    modalTrack.style.transition = 'none';
    
    if (event.type === 'mousedown') {
      event.preventDefault();
    }
    modalAnimationID = requestAnimationFrame(modalAnimation);
  }

  function modalTouchMove(event) {
    if (!modalIsDragging) return;
    const currentX = getModalPositionX(event);
    const diff = currentX - modalStartX;
    
    const slideWidth = modalSlides[0].getBoundingClientRect().width;
    const maxTranslate = -(modalSlides.length - 1) * slideWidth;
    
    let targetTranslate = modalPrevTranslate + diff;
    
    // elastic boundary effect
    if (targetTranslate > 0) {
      targetTranslate = diff * 0.3;
    } else if (targetTranslate < maxTranslate) {
      targetTranslate = maxTranslate + (diff * 0.3);
    }
    
    modalCurrentTranslate = targetTranslate;
  }

  function modalTouchEnd() {
    modalIsDragging = false;
    cancelAnimationFrame(modalAnimationID);

    const slideWidth = modalSlides[0].getBoundingClientRect().width;
    const movedBy = modalCurrentTranslate - modalPrevTranslate;
    const threshold = slideWidth * 0.25;

    if (movedBy < -threshold) {
      moveToModalSlide(modalCurrentIndex + 1);
    } else if (movedBy > threshold) {
      moveToModalSlide(modalCurrentIndex - 1);
    } else {
      moveToModalSlide(modalCurrentIndex);
    }
  }

  function modalAnimation() {
    if (modalIsDragging) {
      modalTrack.style.transform = `translateX(${modalCurrentTranslate}px)`;
      requestAnimationFrame(modalAnimation);
    }
  }

  window.addEventListener('resize', () => {
    if (modal && modal.style.display === 'flex') {
      moveToModalSlide(modalCurrentIndex);
    }
  });


  /* ==========================================================================
     6. INTERACTIVE LIKE BUTTONS (MICRO-FEEDBACK)
     ========================================================================== */
  const likeButtons = document.querySelectorAll('.like-btn');

  likeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isLicked = btn.classList.contains('active-heart');
      const countSpan = btn.querySelector('span');
      let count = parseInt(countSpan.textContent, 10);
      if (isLicked) {
        btn.classList.remove('active-heart');
        countSpan.textContent = (count - 1).toString();
      } else {
        btn.classList.add('active-heart');
        countSpan.textContent = (count + 1).toString();
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => { btn.style.transform = 'none'; }, 150);
      }
    });
  });


  /* ==========================================================================
     7. TESTIMONIALS PHOTO-CARD CAROUSEL
     ========================================================================== */
  const testiTrack = document.getElementById('testi-track');
  if (testiTrack) {
    const testiSlides = Array.from(testiTrack.children);
    const testiPrevBtn = document.getElementById('testi-prev');
    const testiNextBtn = document.getElementById('testi-next');
    const testiDotsEl  = document.getElementById('testi-dots');
    let testiIndex = 0;
    let testiStartX = 0, testiCurX = 0, testiPrevTX = 0, testiDragging = false;

    // Build dots
    testiSlides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'testi-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => testiGo(i));
      testiDotsEl.appendChild(d);
    });

    function testiUpdateDots() {
      Array.from(testiDotsEl.children).forEach((d, i) => {
        d.classList.toggle('active', i === testiIndex);
      });
    }

    function testiGo(idx) {
      testiIndex = Math.max(0, Math.min(idx, testiSlides.length - 1));
      const container = testiTrack.parentElement; // .testi-track-container
      const w = container.offsetWidth;
      const tx = -testiIndex * w;
      testiTrack.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
      testiTrack.style.transform = `translateX(${tx}px)`;
      testiPrevTX = tx;
      testiUpdateDots();
    }

    testiNextBtn.addEventListener('click', () => testiGo(testiIndex < testiSlides.length - 1 ? testiIndex + 1 : 0));
    testiPrevBtn.addEventListener('click', () => testiGo(testiIndex > 0 ? testiIndex - 1 : testiSlides.length - 1));

    // Touch & drag
    function testiGetX(e) { return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX; }

    function onStart(e) {
      testiDragging = true;
      testiStartX = testiGetX(e);
      testiTrack.style.transition = 'none';
      if (e.type === 'mousedown') e.preventDefault();
    }
    function onMove(e) {
      if (!testiDragging) return;
      const diff = testiGetX(e) - testiStartX;
      const container = testiTrack.parentElement;
      const w = container.offsetWidth;
      const maxTX = -(testiSlides.length - 1) * w;
      let tx = testiPrevTX + diff;
      if (tx > 0) tx = diff * 0.3;
      if (tx < maxTX) tx = maxTX + diff * 0.3;
      testiCurX = tx;
      testiTrack.style.transform = `translateX(${tx}px)`;
    }
    function onEnd() {
      if (!testiDragging) return;
      testiDragging = false;
      const container = testiTrack.parentElement;
      const w = container.offsetWidth;
      const moved = testiCurX - testiPrevTX;
      if (moved < -w * 0.25) testiGo(testiIndex + 1);
      else if (moved > w * 0.25) testiGo(testiIndex - 1);
      else testiGo(testiIndex);
    }

    testiTrack.addEventListener('touchstart', onStart, { passive: true });
    testiTrack.addEventListener('touchmove', onMove, { passive: true });
    testiTrack.addEventListener('touchend', onEnd);
    testiTrack.addEventListener('mousedown', onStart);
    testiTrack.addEventListener('mousemove', onMove);
    testiTrack.addEventListener('mouseup', onEnd);
    testiTrack.addEventListener('mouseleave', onEnd);

    // Autoplay
    let testiAuto = setInterval(() => {
      if (!testiDragging) testiGo(testiIndex < testiSlides.length - 1 ? testiIndex + 1 : 0);
    }, 5000);
    [testiNextBtn, testiPrevBtn].forEach(b => b.addEventListener('click', () => clearInterval(testiAuto)));
    testiTrack.addEventListener('mousedown', () => clearInterval(testiAuto));
  }

});
