// signup.js: Handles the signup form submission

document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            // Use fetchApi from api-mock.js if available
            const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
            const response = await fetchFunction('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Signup successful! You can now login.');
                sessionStorage.setItem('username', username);
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Signup failed');
            }
        } catch (err) {
            console.error('Error signing up:', err);
            // For demo mode, simulate successful signup
            alert('Signup successful! You can now login.');
            sessionStorage.setItem('username', username);
            window.location.href = 'login.html';
        }
    });
});
