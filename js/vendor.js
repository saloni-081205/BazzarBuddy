document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentLocation = null;
    let isUsingGPS = true;
    let manualLocationText = '';
    
    // DOM Elements
    const suppliersList = document.getElementById('suppliers-list');
    const searchItems = document.getElementById('search-items');
    const searchBtn = document.getElementById('search-btn');
    const openOnly = document.getElementById('open-only');
    const sortBy = document.getElementById('sort-by');
    const refreshBtn = document.getElementById('refresh-btn');
    const locationText = document.getElementById('location-text');
    const changeLocationBtn = document.getElementById('change-location');
    const locationModal = document.getElementById('location-modal');
    const useCurrentLocationBtn = document.getElementById('use-current-location');
    const saveLocationBtn = document.getElementById('save-location');
    const cancelLocationBtn = document.getElementById('cancel-location');
    const manualLocation = document.getElementById('manual-location');
    
    // Initialize the app
    initApp();
    
    function initApp() {
        // Try to get current location automatically
        getCurrentLocation();
        
        // Set up event listeners
        searchBtn.addEventListener('click', loadSuppliers);
        searchItems.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') loadSuppliers();
        });
        refreshBtn.addEventListener('click', loadSuppliers);
        openOnly.addEventListener('change', loadSuppliers);
        sortBy.addEventListener('change', loadSuppliers);
        changeLocationBtn.addEventListener('click', showLocationModal);
        useCurrentLocationBtn.addEventListener('click', useCurrentLocation);
        saveLocationBtn.addEventListener('click', saveManualLocation);
        cancelLocationBtn.addEventListener('click', hideLocationModal);
        
        // Load suppliers initially
        loadSuppliers();
    }
    
    function getCurrentLocation() {
        if (!navigator.geolocation) {
            console.error("Geolocation not supported");
            fallbackToDefaultLocation();
            return;
        }

        suppliersList.innerHTML = '<div class="loading">Detecting your location...</div>';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                isUsingGPS = true;
                locationText.textContent = 'Using your current location';
                loadSuppliers();
            },
            (error) => {
                console.error('Error getting location:', error);
                fallbackToDefaultLocation();
            },
            {
                enableHighAccuracy: true, // Uses GPS if available
                timeout: 10000, // 10 seconds timeout
                maximumAge: 0 // No cached position
            }
        );
    }

    function fallbackToDefaultLocation() {
        locationText.textContent = 'Location not available - using default area';
        currentLocation = { latitude: 19.0760, longitude: 72.8777 }; // Default to Mumbai
        isUsingGPS = false;
        loadSuppliers();
    }
    
    // Update these functions in your vendor.js:

    function showLocationModal() {
      document.getElementById('location-modal').classList.add('active');
    }

    function hideLocationModal() {
      document.getElementById('location-modal').classList.remove('active');
    }

    function useCurrentLocation() {
      locationText.textContent = "Detecting location...";
      getCurrentLocation();
      hideLocationModal();
    }

    function saveManualLocation() {
      const locationValue = document.getElementById('manual-location').value.trim();
      if (locationValue) {
        manualLocationText = locationValue;
        isUsingGPS = false;
        locationText.textContent = `Using location: ${manualLocationText}`;
        hideLocationModal();
        loadSuppliers();
      } else {
        alert('Please enter a location');
      }
    }
    
    function loadSuppliers() {
        suppliersList.innerHTML = '<div class="loading">Loading suppliers...</div>';
        
        let query = db.collection('suppliers');
        
        // Apply filters
        if (openOnly.checked) {
            query = query.where('status', '==', 'OPEN');
        }
        
        // Search by items
        const searchTerm = searchItems.value.trim().toLowerCase();
        
        query.get().then((querySnapshot) => {
            suppliersList.innerHTML = '';
            
            if (querySnapshot.empty) {
                suppliersList.innerHTML = '<div class="no-results">No suppliers found in your area</div>';
                return;
            }
            
            let suppliers = [];
            
            querySnapshot.forEach((doc) => {
                const supplier = doc.data();
                supplier.id = doc.id;
                
                // Filter by search term if provided
                if (searchTerm) {
                    const hasItem = Object.keys(supplier.stock).some(item => 
                        item.toLowerCase().includes(searchTerm) && supplier.stock[item]
                    );
                    if (!hasItem) return;
                }
                
                // Calculate distance if using GPS
                if (currentLocation && isUsingGPS) {
                    supplier.distance = calculateDistance(
                        currentLocation.latitude,
                        currentLocation.longitude,
                        supplier.location.latitude,
                        supplier.location.longitude
                    );
                } else {
                    supplier.distance = 'N/A';
                }
                
                suppliers.push(supplier);
            });
            
            // Sort suppliers
            const sortValue = sortBy.value;
            if (sortValue === 'distance' && isUsingGPS) {
                suppliers.sort((a, b) => a.distance - b.distance);
            } else if (sortValue === 'rating') {
                suppliers.sort((a, b) => {
                    const aRating = a.rating.up - a.rating.down;
                    const bRating = b.rating.up - b.rating.down;
                    return bRating - aRating;
                });
            }
            
            // Display suppliers
            if (suppliers.length === 0) {
                suppliersList.innerHTML = '<div class="no-results">No suppliers match your criteria</div>';
                return;
            }
            
            suppliers.forEach(supplier => {
                const supplierCard = createSupplierCard(supplier);
                suppliersList.appendChild(supplierCard);
            });
        }).catch(error => {
            console.error('Error loading suppliers:', error);
            suppliersList.innerHTML = '<div class="error">Error loading suppliers. Please try again.</div>';
        });
    }
    
    function createSupplierCard(supplier) {

        const card = document.createElement('div');
        card.className = 'supplier-card';
        
        // Get available items
        let availableItems;
        if(supplier?.stock) {
            availableItems = Object.entries(supplier?.stock)
                .filter(([item, available]) => available)
                .map(([item]) => item)
                .join(', ');
        }
        
        // Calculate rating percentage
        const totalRatings = supplier?.rating?.up + supplier?.rating?.down;
        const ratingPercent = totalRatings > 0 
            ? Math.round((supplier.rating.up / totalRatings) * 100) 
            : 0;
        
        card.innerHTML = `
            <h3>${supplier.shopName}</h3>
            <div class="supplier-status ${supplier.status === 'OPEN' ? 'status-open' : 'status-closed'}">
                ${supplier.status}
            </div>
            <div class="supplier-distance">
                Distance: ${isUsingGPS ? supplier?.distance?.toFixed(1) + ' km' : 'N/A'}
            </div>
            <div class="supplier-items">
                <strong>Available:</strong> ${availableItems || 'None'}
            </div>
            <div class="rating-summary">
                Rating: ${ratingPercent}% positive (${supplier?.rating?.up || 0}👍 ${supplier?.rating?.down || 0}👎)
            </div>
            <a href="https://wa.me/${supplier.contactNumber}?text=Hi ${encodeURIComponent(supplier.shopName)}, I'm interested in your products" 
               class="whatsapp-btn" target="_blank">
               <i class="fab fa-whatsapp"></i> Contact via WhatsApp
            </a>
            <div class="rating-buttons">
                <button class="rating-btn thumbs-up" data-supplier-id="${supplier.id}">
                    <i class="fas fa-thumbs-up"></i>
                </button>
                <button class="rating-btn thumbs-down" data-supplier-id="${supplier.id}">
                    <i class="fas fa-thumbs-down"></i>
                </button>
            </div>
        `;
        
        // Add rating event listeners
        card.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const supplierId = this.getAttribute('data-supplier-id');
                const isUpvote = this.classList.contains('thumbs-up');
                updateRating(supplierId, isUpvote);
            });
        });
        
        return card;
    }
    
    function updateRating(supplierId, isUpvote) {
        const supplierRef = db.collection('suppliers').doc(supplierId);
        
        db.runTransaction((transaction) => {
            return transaction.get(supplierRef).then(doc => {
                if (!doc.exists) throw new Error('Supplier does not exist!');
                
                const data = doc.data();
                // Handle missing rating fields
                const currentRating = data.rating || { up: 0, down: 0 };
                const newRating = {
                    up: currentRating.up || 0,
                    down: currentRating.down || 0
                };
                
                // Apply vote
                if (isUpvote) {
                    newRating.up++;
                } else {
                    newRating.down++;
                }
                
                // Prepare update object (entire rating object)
                const updateData = { rating: newRating };
                transaction.update(supplierRef, updateData);
                
                return updateData;
            });
        }).then(() => {
            alert('Thank you for your feedback!');
            loadSuppliers();
        }).catch(error => {
            console.error('Transaction failure: ', error);
            alert('Failed to submit rating. Please try again.');
        });
    }
    
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }
    
    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }
});