/* =========================================================
   CarForge — reviews.js
   Stjärnbetyg (1–5) + kommentar för konfiguratorsidan.

   [Instruktion: Recensionerna sparas just nu i webbläsarens
   localStorage eftersom projektet inte har en backend än.
   Det betyder att de bara syns i den enskilda webbläsaren som
   skrev dem, inte delade mellan besökare. Byt ut loadReviews()
   och saveReviews() mot riktiga fetch()-anrop till ert API när
   ni har en server som kan lagra recensioner globalt.]
   ========================================================= */

(function () {
  'use strict';

  const STORAGE_KEY = 'carforge_reviews';

  const starRating = document.getElementById('star-rating');
  const form = document.getElementById('review-form');
  const ratingError = document.getElementById('rating-error');
  const statusEl = document.getElementById('review-status');
  const listEl = document.getElementById('review-list');
  const summaryStarsEl = document.getElementById('review-summary-stars');
  const summaryTextEl = document.getElementById('review-summary-text');
  const commentInput = document.getElementById('review-comment');

  if (!starRating || !form) return;

  let selectedRating = 0;

  function loadReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveReviews(reviews) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      // localStorage kan vara otillgängligt (t.ex. privat läge).
      // Recensionen visas ändå under den här sessionen.
    }
  }

  function starString(value) {
    return '★★★★★'.slice(0, value) + '☆☆☆☆☆'.slice(0, 5 - value);
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function renderSummary(reviews) {
    if (reviews.length === 0) {
      summaryStarsEl.textContent = starString(0);
      summaryTextEl.textContent = 'Inga recensioner än';
      return;
    }

    const avg = reviews.reduce(function (sum, r) { return sum + r.rating; }, 0) / reviews.length;
    summaryStarsEl.textContent = starString(Math.round(avg));

    const avgFormatted = avg.toFixed(1).replace('.', ',');
    const count = reviews.length;
    const countLabel = count === 1 ? 'recension' : 'recensioner';
    summaryTextEl.textContent = avgFormatted + ' av 5 · ' + count + ' ' + countLabel;
  }

  function renderList(reviews) {
    listEl.innerHTML = '';

    if (reviews.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'review-empty';
      empty.textContent = 'Bli först att recensera konfiguratorn.';
      listEl.appendChild(empty);
      return;
    }

    // Nyaste först
    reviews.slice().reverse().forEach(function (review) {
      const li = document.createElement('li');
      li.className = 'review-item';

      const starsSpan = document.createElement('span');
      starsSpan.className = 'review-item__stars';
      starsSpan.setAttribute('aria-label', review.rating + ' av 5 stjärnor');
      starsSpan.textContent = starString(review.rating);

      const dateSpan = document.createElement('span');
      dateSpan.className = 'review-item__date';
      dateSpan.textContent = formatDate(review.date);

      li.appendChild(starsSpan);
      li.appendChild(dateSpan);

      if (review.comment) {
        const p = document.createElement('p');
        p.className = 'review-item__comment';
        p.textContent = review.comment;
        li.appendChild(p);
      }

      listEl.appendChild(li);
    });
  }

  function renderAll() {
    const reviews = loadReviews();
    renderSummary(reviews);
    renderList(reviews);
  }

  /**
   * Sätter valt betyg (0 = inget val) och uppdaterar visuell
   * fyllning + aria-checked för alla stjärnor.
   */
  function setRating(value) {
    selectedRating = value;
    const stars = starRating.querySelectorAll('.star');

    stars.forEach(function (star) {
      const starValue = Number(star.dataset.value);
      star.classList.toggle('is-selected', starValue <= value);
      star.setAttribute('aria-checked', String(starValue === value));
    });

    if (value > 0) {
      ratingError.textContent = '';
    }
  }

  starRating.addEventListener('click', function (event) {
    const star = event.target.closest('.star');
    if (!star) return;
    setRating(Number(star.dataset.value));
  });

  // Tangentbordsnavigering: höger/upp ökar betyget, vänster/ner minskar det
  starRating.addEventListener('keydown', function (event) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (keys.indexOf(event.key) === -1) return;
    event.preventDefault();

    const dir = (event.key === 'ArrowRight' || event.key === 'ArrowUp') ? 1 : -1;
    const next = Math.min(5, Math.max(1, selectedRating + dir));
    setRating(next);

    const target = starRating.querySelector('.star[data-value="' + next + '"]');
    if (target) target.focus();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (selectedRating < 1) {
      ratingError.textContent = 'Välj ett betyg mellan 1 och 5 stjärnor.';
      statusEl.textContent = '';
      return;
    }

    const reviews = loadReviews();
    reviews.push({
      rating: selectedRating,
      comment: commentInput.value.trim(),
      date: new Date().toISOString()
    });
    saveReviews(reviews);

    renderAll();
    form.reset();
    setRating(0);
    statusEl.textContent = 'Tack för din recension!';
  });

  // --- Initiering ---
  renderAll();
})();
