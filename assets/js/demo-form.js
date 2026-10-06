// Demo request form: client-side validation + Formspree AJAX submit.
// Without JS the form still works as a plain POST to its action URL.
(function () {
  const form = document.getElementById('demo-form');
  if (!form) return;

  const success = document.getElementById('form-success');
  const generalError = document.getElementById('form-error');
  const button = form.querySelector('button[type="submit"]');
  const fields = Array.from(form.querySelectorAll('input[required]'));

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const GENERAL_ERROR = 'Something went wrong. Please try again or email hello@getsafewalk.com.';

  function errorFor(field) {
    return document.getElementById('err-' + field.name);
  }

  function isValid(field) {
    const value = field.value.trim();
    if (!value) return false;
    if (field.type === 'email') return EMAIL_RE.test(value);
    return true;
  }

  function setError(field, invalid) {
    const error = errorFor(field);
    if (invalid) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
    if (error) error.hidden = !invalid;
  }

  function setLoading(loading) {
    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
    if (loading) {
      form.setAttribute('aria-busy', 'true');
    } else {
      form.removeAttribute('aria-busy');
    }
  }

  // Clear a field's error as soon as it becomes valid again.
  fields.forEach((field) => {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true' && isValid(field)) {
        setError(field, false);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    generalError.hidden = true;

    let firstInvalid = null;
    fields.forEach((field) => {
      const invalid = !isValid(field);
      setError(field, invalid);
      if (invalid && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string') data[key] = data[key].trim();
    });

    setLoading(true);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Submission failed');
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (err) {
      generalError.textContent = GENERAL_ERROR;
      generalError.hidden = false;
      setLoading(false);
    }
  });
})();
