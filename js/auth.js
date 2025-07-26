document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const getLocationBtn = document.getElementById('get-location');
    const locationStatus = document.getElementById('location-status');
    
    let userLocation = null;
    
    // Toggle between login and register forms
    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
    
    // Login function
    loginBtn.addEventListener('click', function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Redirect to supplier dashboard
                window.location.href = 'supplier.html';
            })
            .catch((error) => {
                alert('Login failed: ' + error.message);
            });
    });
    
    // Get location
    getLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    locationStatus.textContent = `Location captured: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
                },
                (error) => {
                    alert('Error getting location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    });
    
    // Register function
    registerBtn.addEventListener('click', function() {
        const shopName = document.getElementById('reg-shop-name').value;
        const phone = document.getElementById('reg-phone').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        
        if (!userLocation) {
            alert('Please capture your location first');
            return;
        }
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Save additional user data to Firestore
                return db.collection('suppliers').doc(user.uid).set({
                    id: user.uid,
                    shopName: shopName,
                    contactNumber: phone,
                    email: email,
                    location: userLocation,
                    status: 'CLOSED',
                    stock: {},
                    rating: { up: 0, down: 0 }
                });
            })
            .then(() => {
                // Redirect to supplier dashboard
                window.location.href = 'supplier.html';
            })
            .catch((error) => {
                alert('Registration failed: ' + error.message);
            });
    });
});
