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
            
            // Try to fetch from API, but handle the case where the API doesn't exist (static deployment)
            let userData = null;
            let apiSuccess = false;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                if (response.ok) {
                    userData = await response.json();
                    apiSuccess = true;
                }
            } catch (apiError) {
                console.log('API not available, using mock login instead');
                // API not available, continue with mock data
            }
            
            // Reset button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            
            // If API succeeded, use that data
            if (apiSuccess) {
                // Store login status in sessionStorage
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('userRole', userData.role);
                sessionStorage.setItem('userId', userData.id);
                
                console.log('Login successful via API, redirecting to dashboard');
                // Redirect based on user role
                if (userData.role === 'admin') {
                    window.location.href = '/admin-dashboard.html';
                } else {
                    window.location.href = '/dashboard.html';
                }
            } 
            // Otherwise use mock login for demo purposes
            else {
                // Simple mock authentication for demo
                let mockRole = 'user';
                let mockId = '1';
                let loginSuccess = false;
                
                // Admin credentials
                if (username.toLowerCase() === 'admin' && password === 'admin123') {
                    mockRole = 'admin';
                    mockId = 'admin1';
                    loginSuccess = true;
                } 
                // User credentials
                else if (username.toLowerCase() === 'user' && password === 'user123') {
                    mockRole = 'user';
                    mockId = 'user1';
                    loginSuccess = true;
                }
                // Demo mode - any username with password 'demo'
                else if (password === 'demo') {
                    mockRole = username.toLowerCase().includes('admin') ? 'admin' : 'user';
                    mockId = username.toLowerCase().includes('admin') ? 'admin1' : 'user1';
                    loginSuccess = true;
                }
                
                if (loginSuccess) {
                    // Store login status in sessionStorage
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('username', username);
                    sessionStorage.setItem('userRole', mockRole);
                    sessionStorage.setItem('userId', mockId);
                    
                    console.log('Login successful via mock auth, redirecting to dashboard');
                    // Redirect based on user role
                    if (mockRole === 'admin') {
                        window.location.href = '/admin-dashboard.html';
                    } else {
                        window.location.href = '/dashboard.html';
                    }
                } else {
                    // Show error message
                    showMessage('error', 'Login failed. Please check your credentials or use demo mode.');
                }
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
