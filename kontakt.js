/* =========================================================
   CarForge — kontakt.js
   Enkel klientvalidering av kontaktformuläret.

   [Instruktion: Formuläret skickas inte till någon server ännu.
   Byt ut simulateSend() mot ett riktigt fetch()-anrop till er
   backend eller tjänst (t.ex. Formspree) när det finns.]
   ========================================================= */

(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name: { input: document.getElementById('name'), error: document.getElementById('name-error') },
    email: { input: document.getElementById('email'), error: document.getElementById('email-error') },
    message: { input: document.getElementById('message'), error: document.getElementById('message-error') }
  };

  const statusEl = document.getElementById('form-status');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(fieldKey, message) {
    const field = fields[fieldKey];
    field.error.textContent = message || '';
    field.input.closest('.form-field').classList.toggle('has-error', Boolean(message));
  }

  function validate() {
    let valid = true;

    if (!fields.name.input.value.trim()) {
      setError('name', 'Ange ditt namn.');
      valid = false;
    } else {
      setError('name', '');
    }

    const emailValue = fields.email.input.value.trim();
    if (!emailValue) {
      setError('email', 'Ange din e-postadress.');
      valid = false;
    } else if (!emailPattern.test(emailValue)) {
      setError('email', 'Ange en giltig e-postadress.');
      valid = false;
    } else {
      setError('email', '');
    }

    if (!fields.message.input.value.trim()) {
      setError('message', 'Skriv ett meddelande.');
      valid = false;
    } else {
      setError('message', '');
    }

    return valid;
  }

  /**
   * [Plats för backend-integration]
   * Simulerar ett skick just nu. Ersätt med ett riktigt anrop, t.ex.:
   *
   *   return fetch('https://din-endpoint.se/kontakt', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(data)
   *   });
   */
  function simulateSend(data) {
    return new Promise(function (resolve) {
      setTimeout(resolve, 500);
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!validate()) {
      statusEl.textContent = 'Kontrollera fälten markerade i rött.';
      statusEl.classList.add('is-error');
      return;
    }

    const data = {
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      subject: document.getElementById('subject').value,
      message: fields.message.input.value.trim()
    };

    statusEl.classList.remove('is-error');
    statusEl.textContent = 'Skickar...';

    simulateSend(data).then(function () {
      statusEl.textContent = 'Tack! Meddelandet är skickat — vi hör av oss.';
      form.reset();
    });
  });

  // Ta bort felmarkering direkt när användaren börjar rätta
  Object.keys(fields).forEach(function (key) {
    fields[key].input.addEventListener('input', function () {
      if (fields[key].input.closest('.form-field').classList.contains('has-error')) {
        setError(key, '');
      }
    });
  });
})();
