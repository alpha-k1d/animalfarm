// assets/js/app.js - Animal Farm Ghana Client Enhancements

document.addEventListener('DOMContentLoaded', function () {
    // 1. OTP Resend Cooldown Countdown
    const cooldownEl = document.getElementById('otp-cooldown-timer');
    const resendBtn = document.getElementById('btn-resend-otp');

    if (cooldownEl && resendBtn) {
        let remaining = parseInt(cooldownEl.getAttribute('data-seconds') || '0', 10);

        function updateTimer() {
            if (remaining > 0) {
                resendBtn.disabled = true;
                cooldownEl.textContent = `(${remaining}s)`;
                remaining--;
                setTimeout(updateTimer, 1000);
            } else {
                resendBtn.disabled = false;
                cooldownEl.textContent = '';
            }
        }

        if (remaining > 0) {
            updateTimer();
        }
    }

    // 2. Clipboard Copy Helper
    document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const targetId = this.getAttribute('data-copy-target');
            const input = document.getElementById(targetId);
            if (input) {
                input.select();
                navigator.clipboard.writeText(input.value).then(() => {
                    const originalText = this.innerHTML;
                    this.innerHTML = '✓ Copied!';
                    this.classList.replace('btn-outline-secondary', 'btn-success');
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.classList.replace('btn-success', 'btn-outline-secondary');
                    }, 2000);
                });
            }
        });
    });

    // 3. Image File Upload Preview
    const fileInput = document.querySelector('input[type="file"][data-preview]');
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const previewId = this.getAttribute('data-preview');
            const previewImg = document.getElementById(previewId);
            if (previewImg && this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImg.src = e.target.result;
                    previewImg.classList.remove('d-none');
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // 4. Double Submit Prevention
    document.querySelectorAll('form:not([data-no-double-submit])').forEach(function (form) {
        form.addEventListener('submit', function () {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                setTimeout(() => {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Processing...';
                }, 50);
            }
        });
    });
});
