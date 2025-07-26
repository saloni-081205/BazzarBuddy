# 🛒 BazaarBuddy

**BazaarBuddy** is a mobile-friendly web app designed to connect Indian street food vendors with nearby and reliable raw material suppliers in real-time. Built using HTML, CSS, and JavaScript with Firebase as the backend.

## 🚀 Live Demo
[Click here to try BazaarBuddy](https://your-netlify-link.netlify.app)  
*(Replace with your actual Netlify URL after deployment)*

---

## 👥 User Roles

### ✅ Vendors (Buyers)
- Select required items (onions, tomatoes, oil, etc.)
- Auto-detect or manually enter location
- View list of nearby suppliers (sorted by distance)
- Supplier cards display:
  - Shop name  
  - Items in stock  
  - Open/Closed status  
  - Distance from vendor  
  - WhatsApp contact button  
  - Average rating (thumbs up/down)
- Quick rating feature per supplier
- Filters (stock availability, open status)

### ✅ Suppliers (Sellers)
- Register/login with email and password
- Set shop name, location, and contact
- Update available stock (via checkboxes)
- Toggle shop status (open/closed)
- View average rating from vendors
- Receive WhatsApp orders/messages


---

## 🔧 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Auth + Firestore)
- **Hosting**: Netlify (manual deployment)
- **APIs**: Geolocation API, WhatsApp Link

---

## 🔐 Firebase Configuration

Create a `firebase.js` file in `js/` folder with your Firebase config:
```js
 js/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "...",
  projectId: "...",
  ...
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();




