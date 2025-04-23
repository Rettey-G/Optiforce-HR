// Handle login form submission and redirect to dashboard on success

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Check if user is already logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    
    if (isLoggedIn === 'true') {
        // Redirect based on user role
        if (userRole === 'admin') {
            window.location.href = '/admin-dashboard.html';
        } else {
            window.location.href = '/dashboard.html';
        }
        return;
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="loading"></span> Logging in...';
            submitButton.disabled = true;
            
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            // Reset button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            
            if (response.ok) {
                // Store login status in sessionStorage (more secure than localStorage for auth)
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('userRole', data.role);
                sessionStorage.setItem('userId', data.id);
                
                console.log('Login successful, redirecting to dashboard');
                
                // All users go to the normal dashboard first
                window.location.href = '/dashboard.html';
            } else {
                // Show error message
                showMessage('error', data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            showMessage('error', 'Error connecting to server. Please try again later.');
        }
    });
    
    // Function to show messages
    function showMessage(type, text) {
        // Check if message element exists, if not create it
        let messageElement = document.querySelector('.message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'message';
            loginForm.insertAdjacentElement('beforebegin', messageElement);
        }
        
        // Set message content and style
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
});
