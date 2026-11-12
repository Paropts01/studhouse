/* ============================================================
   Stud House – shared JavaScript
   v14: Netlify URL fix, LCP WebP optimization
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     CONSTANTS
     ============================================================ */
  const SESSION_KEY       = "studHouseLoggedIn";
  const EMAIL_KEY         = "studHouseCurrentEmail";
  const USERS_KEY         = "studHouseUsers";
  const LISTINGS_KEY      = "studHouseListings";
  const MESSAGES_KEY      = "studHouseMessages";
  const REPORTS_KEY       = "studHouseReports";
  const ENQUIRIES_KEY     = "studHouseEnquiries";
  const VERIFICATIONS_KEY = "studHouseVerifications";
  const REMOVED_KEY       = "studHouseRemovedIds";
  const DEMO_SEEDED_KEY   = "studHouseDemoSeeded";
  const PUBLIC_PAGES      = ["login.html", "register.html"];

  const ADMIN_EMAIL    = "admin@studhouse.com";
  const ADMIN_PASSWORD = "StudHouse#Admin1";

  const PROVINCES = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
                     "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"];

  const BUDGET_RANGES = [
    { value: "0-3000",      min: 0,    max: 3000 },
    { value: "3000-5000",   min: 3000, max: 5000 },
    { value: "5000-8000",   min: 5000, max: 8000 },
    { value: "8000-999999", min: 8000, max: 999999 }
  ];

  const BUSINESS_CATEGORIES = ["Café", "Food", "Retail", "Printing",
                                "Repairs", "Services", "Other"];
  const INFO_CATEGORIES = ["Accommodation", "Student deals", "Transport",
                            "Study tips", "Other"];
  const REPORT_REASONS = ["Scam or fraud", "Incorrect information",
                           "Inappropriate content", "Not a real business",
                           "Not a real listing", "Other"];

  const NAV_ICONS = {
    "index.html":         "fa-house",
    "accommodation.html": "fa-bed",
    "businesses.html":    "fa-store",
    "transport.html":     "fa-bus",
    "discounts.html":     "fa-percent",
    "about_us.html":      "fa-circle-info",
    "login.html":         "fa-right-from-bracket",
    "register.html":      "fa-user-plus",
    "profile.html":       "fa-circle-user",
    "admin.html":         "fa-shield-halved"
  };

  /* Image helper — optimized for LCP (WebP, smaller size, compression) */
  function uns(id) {
    return `https://images.unsplash.com/photo-${id}?w=500&auto=format,compress&fm=webp&q=75`;
  }

  /* ============================================================
     INSTITUTIONS
     ============================================================ */
  const INSTITUTIONS = [
    { id: "wits", short: "Wits", name: "University of the Witwatersrand",
      campus: "Braamfontein East Campus", province: "Gauteng", town: "Braamfontein" },
    { id: "uj", short: "UJ", name: "University of Johannesburg",
      campus: "Auckland Park Kingsway", province: "Gauteng", town: "Auckland Park" },
    { id: "up", short: "UP", name: "University of Pretoria",
      campus: "Hatfield Campus", province: "Gauteng", town: "Hatfield" },
    { id: "uct", short: "UCT", name: "University of Cape Town",
      campus: "Upper Campus", province: "Western Cape", town: "Observatory" },
    { id: "tut", short: "TUT", name: "Tshwane University of Technology",
      campus: "Pretoria Campus", province: "Gauteng", town: "Sunnyside" },
    { id: "nmu", short: "NMU", name: "Nelson Mandela University",
      campus: "South Campus", province: "Eastern Cape", town: "Port Elizabeth" },
    { id: "ukzn", short: "UKZN", name: "University of KwaZulu-Natal",
      campus: "Howard College", province: "KwaZulu-Natal", town: "Durban" }
  ];

  function getInstitutionById(id) { return INSTITUTIONS.find(i => i.id === id) || null; }

  function populateInstitutionSelect(selectEl) {
    if (!selectEl) return;
    const current = selectEl.value;
    while (selectEl.options.length > 1) selectEl.remove(1);
    INSTITUTIONS.forEach(inst => {
      const opt = document.createElement("option");
      opt.value = inst.id;
      opt.textContent = `${inst.short} — ${inst.campus}`;
      selectEl.appendChild(opt);
    });
    selectEl.value = current;
  }
  function populateInstitutionSelects() {
    document.querySelectorAll("select[data-institution-select]").forEach(populateInstitutionSelect);
  }

  /* ============================================================
     STORAGE
     ============================================================ */
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (err) { return fallback; }
  }
  function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function readUsers()           { return readJSON(USERS_KEY, []); }
  function writeUsers(v)         { writeJSON(USERS_KEY, v); }
  function readListings()        { return readJSON(LISTINGS_KEY, []); }
  function writeListings(v)      { writeJSON(LISTINGS_KEY, v); }
  function readMessages()        { return readJSON(MESSAGES_KEY, []); }
  function writeMessages(v)      { writeJSON(MESSAGES_KEY, v); }
  function readReports()         { return readJSON(REPORTS_KEY, []); }
  function writeReports(v)       { writeJSON(REPORTS_KEY, v); }
  function readEnquiries()       { return readJSON(ENQUIRIES_KEY, []); }
  function writeEnquiries(v)     { writeJSON(ENQUIRIES_KEY, v); }
  function readVerifications()   { return readJSON(VERIFICATIONS_KEY, []); }
  function writeVerifications(v) { writeJSON(VERIFICATIONS_KEY, v); }
  function readRemovedIds()      { return readJSON(REMOVED_KEY, []); }
  function writeRemovedIds(v)    { writeJSON(REMOVED_KEY, v); }

  /* ============================================================
     SESSION / USER
     ============================================================ */
  function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === "true"; }
  function logIn(email) {
    sessionStorage.setItem(SESSION_KEY, "true");
    if (email) sessionStorage.setItem(EMAIL_KEY, email);
  }
  function logOut() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
  }
  function currentEmail() { return sessionStorage.getItem(EMAIL_KEY) || ""; }
  function currentUser() {
    const e = currentEmail().toLowerCase();
    if (!e) return null;
    return readUsers().find(u => u.email.toLowerCase() === e) || null;
  }
  function isAdmin() {
    const u = currentUser();
    return !!u && u.role === "admin";
  }
  
  /* --- NETLIFY FIX: Forces .html back onto the page name --- */
  function currentPageName() {
    let name = window.location.pathname.split("/").pop().toLowerCase();
    if (!name) name = "index.html";
    if (!name.endsWith(".html")) name += ".html";
    return name;
  }

  function seedAdmin() {
    const users = readUsers();
    if (!users.some(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())) {
      users.push({
        id: "user-admin",
        name: "Stud House Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "admin",
        createdAt: Date.now()
      });
      writeUsers(users);
    }
  }

  /* ============================================================
     UTILITIES
     ============================================================ */
  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function escapeHtml(v) {
    return String(v === null || v === undefined ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function formatPrice(n) {
    return "R" + Number(n).toLocaleString("en-ZA").replace(/,/g, " ");
  }
  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString() + " " +
           d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function sanitizePhone(v) { return String(v || "").replace(/[^0-9]/g, ""); }

  function isValidSAID(id) {
    if (!/^\d{13}$/.test(id)) return false;
    const mm = parseInt(id.slice(2, 4), 10);
    const dd = parseInt(id.slice(4, 6), 10);
    if (mm < 1 || mm > 12) return false;
    if (dd < 1 || dd > 31) return false;
    let sum = 0, alt = false;
    for (let i = id.length - 1; i >= 0; i--) {
      let n = parseInt(id[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }
  function dobMatchesID(dobStr, id) {
    if (!dobStr || !/^\d{13}$/.test(id)) return false;
    const [y, m, d] = dobStr.split("-").map(Number);
    const yy   = parseInt(id.slice(0, 2), 10);
    const idMM = parseInt(id.slice(2, 4), 10);
    const idDD = parseInt(id.slice(4, 6), 10);
    const nowYY = new Date().getFullYear() % 100;
    const century = yy <= nowYY ? 2000 : 1900;
    return (century + yy) === y && idMM === m && idDD === d;
  }
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ============================================================
     SEED DATA — ACCOMMODATION (16)
     ============================================================ */
  const SEED_ACCOMMODATION = [
    { id: "seed-acc-1", kind: "accommodation", title: "En-suite room, Braamfontein",
      roomType: "En-suite", town: "Braamfontein", province: "Gauteng", price: 4800,
      institutions: ["wits"],
      description: "Single room with a private bathroom, uncapped Wi-Fi and 24-hour security. Walking distance to the Wits East campus.",
      image: uns("1522708323590-d24dbb6b0267"),
      images: [uns("1522708323590-d24dbb6b0267"), uns("1560448204-e02f11c3d0e2"), uns("1586023492125-27b2c045efd7")],
      amenities: ["Private bathroom", "Uncapped Wi-Fi", "24-hour security", "Furnished", "Study desk"],
      phone: "+27 11 000 1001", whatsapp: "+27110001001", verified: true },

    { id: "seed-acc-2", kind: "accommodation", title: "Shared flat, Rosebank",
      roomType: "Shared flat", town: "Rosebank", province: "Gauteng", price: 3200,
      institutions: ["wits"],
      description: "Two-bedroom flat shared with one other student. Kitchen and lounge included.",
      image: uns("1502672260266-1c1ef2d93688"),
      images: [uns("1502672260266-1c1ef2d93688"), uns("1554995207-c18c203602cb")],
      amenities: ["Shared kitchen", "Lounge", "Prepaid electricity", "Off-street parking"],
      phone: "+27 11 000 1002", whatsapp: "+27110001002", verified: true },

    { id: "seed-acc-3", kind: "accommodation", title: "Studio apartment, Hatfield",
      roomType: "Studio", town: "Hatfield", province: "Gauteng", price: 5500,
      institutions: ["up"],
      description: "Self-contained studio with a kitchenette and secure parking, 3 minutes from UP's main gate.",
      image: uns("1493809842364-78817add7ffb"),
      images: [uns("1493809842364-78817add7ffb"), uns("1502005229762-cf1b2da7c5d6")],
      amenities: ["Kitchenette", "Secure parking", "Furnished", "Wi-Fi"],
      phone: "+27 11 000 1003", whatsapp: "+27110001003", verified: true },

    { id: "seed-acc-4", kind: "accommodation", title: "Student residence, Auckland Park",
      roomType: "Residence", town: "Auckland Park", province: "Gauteng", price: 4100,
      institutions: ["uj"],
      description: "Furnished room in a modern student residence with common room, laundry and quiet study areas.",
      image: uns("1555854877-bab0e564b8d5"),
      images: [uns("1555854877-bab0e564b8d5"), uns("1560185893-a55cbc8c57e8")],
      amenities: ["Laundry", "Study room", "Common room", "Wi-Fi", "24-hour access"],
      phone: "+27 11 000 1004", whatsapp: "+27110001004", verified: true },

    { id: "seed-acc-5", kind: "accommodation", title: "Room in house, Melville",
      roomType: "Room in house", town: "Melville", province: "Gauteng", price: 3800,
      institutions: ["uj"],
      description: "Quiet street, garden and shared kitchen with three other students. 10 minutes to UJ by bike.",
      image: uns("1536376072261-38c75010e6c9"),
      images: [uns("1536376072261-38c75010e6c9"), uns("1560448205-4d9b3e6bb6db")],
      amenities: ["Garden", "Shared kitchen", "Wi-Fi", "Bicycle parking"],
      phone: "+27 11 000 1005", whatsapp: "", verified: false },

    { id: "seed-acc-6", kind: "accommodation", title: "Bachelor flat, Sunnyside",
      roomType: "Bachelor flat", town: "Sunnyside", province: "Gauteng", price: 4600,
      institutions: ["tut"],
      description: "Open-plan flat close to the bus route and local shops, ideal for a TUT student.",
      image: uns("1560448204-e02f11c3d0e2"),
      images: [uns("1560448204-e02f11c3d0e2")],
      amenities: ["Kitchenette", "Bus route", "Shops nearby", "Prepaid meter"],
      phone: "+27 12 000 1006", whatsapp: "+27120001006", verified: true },

    { id: "seed-acc-7", kind: "accommodation", title: "En-suite room, Hatfield",
      roomType: "En-suite", town: "Hatfield", province: "Gauteng", price: 5200,
      institutions: ["up"],
      description: "Modern en-suite in a secure building, walking distance to UP campus and the Gautrain.",
      image: uns("1586023492125-27b2c045efd7"),
      images: [uns("1586023492125-27b2c045efd7")],
      amenities: ["Private bathroom", "Wi-Fi", "Walking distance to campus", "24-hour security"],
      phone: "+27 12 000 1007", whatsapp: "", verified: false },

    { id: "seed-acc-8", kind: "accommodation", title: "Shared house, Observatory",
      roomType: "Room in house", town: "Observatory", province: "Western Cape", price: 3400,
      institutions: ["uct"],
      description: "Room in a four-person student house, close to shops, cafés and the UCT shuttle stop.",
      image: uns("1616486338812-3dadae4b4ace"),
      images: [uns("1616486338812-3dadae4b4ace"), uns("1615874959474-d609969a20ed")],
      amenities: ["Shared kitchen", "Wi-Fi", "Close to transport", "Pet friendly"],
      phone: "+27 21 000 1008", whatsapp: "+27210001008", verified: true },

    { id: "seed-acc-9", kind: "accommodation", title: "Studio, Sunnyside (TUT)",
      roomType: "Studio", town: "Sunnyside", province: "Gauteng", price: 4300,
      institutions: ["tut"],
      description: "Compact studio just off Steve Biko Road — walking distance to TUT's Pretoria campus.",
      image: uns("1502005229762-cf1b2da7c5d6"),
      images: [uns("1502005229762-cf1b2da7c5d6")],
      amenities: ["Kitchenette", "Wi-Fi", "Furnished", "Prepaid meter"],
      phone: "+27 12 000 1009", whatsapp: "+27120001009", verified: true },

    { id: "seed-acc-10", kind: "accommodation", title: "En-suite, Hatfield (UP)",
      roomType: "En-suite", town: "Hatfield", province: "Gauteng", price: 5800,
      institutions: ["up"],
      description: "Premium en-suite with study nook and rooftop study lounge. Secure building with biometric access.",
      image: uns("1595526114035-0d45ed16cfbf"),
      images: [uns("1595526114035-0d45ed16cfbf"), uns("1616594039964-ae9021a400a0")],
      amenities: ["Private bathroom", "Study nook", "Rooftop lounge", "Wi-Fi", "Biometric access"],
      phone: "+27 12 000 1010", whatsapp: "+27120001010", verified: true },

    { id: "seed-acc-11", kind: "accommodation", title: "Shared flat, Observatory (UCT)",
      roomType: "Shared flat", town: "Observatory", province: "Western Cape", price: 3900,
      institutions: ["uct"],
      description: "Furnished two-bed flat to share. Perfect for a UCT postgrad. Rent includes water.",
      image: uns("1554995207-c18c203602cb"),
      images: [uns("1554995207-c18c203602cb")],
      amenities: ["Furnished", "Water included", "Wi-Fi", "Balcony"],
      phone: "+27 21 000 1011", whatsapp: "+27210001011", verified: true },

    { id: "seed-acc-12", kind: "accommodation", title: "Residence room, Durban (UKZN)",
      roomType: "Residence", town: "Durban", province: "KwaZulu-Natal", price: 3700,
      institutions: ["ukzn"],
      description: "Single room in a managed residence 10 minutes from UKZN Howard College.",
      image: uns("1568605114967-8130f3a36994"),
      images: [uns("1568605114967-8130f3a36994")],
      amenities: ["24-hour security", "Study room", "Laundry", "Wi-Fi"],
      phone: "+27 31 000 1012", whatsapp: "+27310001012", verified: true },

    { id: "seed-acc-13", kind: "accommodation", title: "Room in house, Port Elizabeth (NMU)",
      roomType: "Room in house", town: "Port Elizabeth", province: "Eastern Cape", price: 2900,
      institutions: ["nmu"],
      description: "Affordable room in a quiet family home, 15 minutes from NMU South Campus by taxi.",
      image: uns("1560184897-ae75f418493e"),
      images: [uns("1560184897-ae75f418493e")],
      amenities: ["Shared kitchen", "Wi-Fi", "Garden", "Off-street parking"],
      phone: "+27 41 000 1013", whatsapp: "", verified: false },

    { id: "seed-acc-14", kind: "accommodation", title: "Studio, Braamfontein (Wits)",
      roomType: "Studio", town: "Braamfontein", province: "Gauteng", price: 5100,
      institutions: ["wits"],
      description: "Bright studio in a converted office block — 5 minute walk to Wits and the Neighbourgoods Market.",
      image: uns("1560448205-4d9b3e6bb6db"),
      images: [uns("1560448205-4d9b3e6bb6db")],
      amenities: ["Kitchenette", "Wi-Fi", "Rooftop access", "Prepaid meter"],
      phone: "+27 11 000 1014", whatsapp: "+27110001014", verified: true },

    { id: "seed-acc-15", kind: "accommodation", title: "En-suite, Auckland Park (UJ)",
      roomType: "En-suite", town: "Auckland Park", province: "Gauteng", price: 4900,
      institutions: ["uj"],
      description: "Modern en-suite in a new build with gym and common kitchen. Walking distance to UJ Kingsway.",
      image: uns("1615874959474-d609969a20ed"),
      images: [uns("1615874959474-d609969a20ed")],
      amenities: ["Private bathroom", "Gym", "Common kitchen", "Wi-Fi"],
      phone: "+27 11 000 1015", whatsapp: "+27110001015", verified: true },

    { id: "seed-acc-16", kind: "accommodation", title: "Bachelor flat, Hatfield (UP)",
      roomType: "Bachelor flat", town: "Hatfield", province: "Gauteng", price: 4400,
      institutions: ["up"],
      description: "Compact bachelor flat with secure parking, close to Hatfield Plaza and the Gautrain.",
      image: uns("1616594039964-ae9021a400a0"),
      images: [uns("1616594039964-ae9021a400a0")],
      amenities: ["Kitchenette", "Secure parking", "Wi-Fi"],
      phone: "+27 12 000 1016", whatsapp: "", verified: false }
  ];

  /* ============================================================
     SEED DATA — BUSINESSES (12)
     ============================================================ */
  const SEED_BUSINESSES = [
    { id: "seed-biz-1", kind: "business", title: "Corner Bean Café",
      category: "Café", town: "Braamfontein", province: "Gauteng",
      institutions: ["wits"],
      description: "Student-run coffee spot with free Wi-Fi and quiet study seating upstairs.",
      phone: "+27 11 000 0001", whatsapp: "+27110000001",
      image: uns("1554118811-1e0d58224f24"), verified: true },

    { id: "seed-biz-2", kind: "business", title: "Print & Copy Hub",
      category: "Printing", town: "Braamfontein", province: "Gauteng",
      institutions: ["wits"],
      description: "Cheap black-and-white and colour printing, binding and laminating. 5 minutes from Wits main gate.",
      phone: "+27 11 000 0002", whatsapp: "+27110000002",
      image: uns("1568732941692-aad2e2e06239"), verified: true },

    { id: "seed-biz-3", kind: "business", title: "Thandi's Fresh Meals",
      category: "Food", town: "Braamfontein", province: "Gauteng",
      institutions: ["wits"],
      description: "Home-cooked lunch boxes delivered to campus between 11:00 and 14:00.",
      phone: "+27 11 000 0003", whatsapp: "+27110000003",
      image: uns("1504674900247-0877df9cc836"), verified: false },

    { id: "seed-biz-4", kind: "business", title: "Campus Bike Repairs",
      category: "Repairs", town: "Auckland Park", province: "Gauteng",
      institutions: ["uj"],
      description: "Bicycle servicing, tyre repairs and second-hand bike sales.",
      phone: "+27 11 000 0004", whatsapp: "",
      image: uns("1485965120184-e220f721d03e"), verified: true },

    { id: "seed-biz-5", kind: "business", title: "Cape Coffee Co.",
      category: "Café", town: "Observatory", province: "Western Cape",
      institutions: ["uct"],
      description: "Late-night coffee and snacks for exam season. Open till midnight during swot week.",
      phone: "+27 21 000 0005", whatsapp: "+27210000005",
      image: uns("1447933601403-0c6688de566e"), verified: false },

    { id: "seed-biz-6", kind: "business", title: "Mzansi Student Printing",
      category: "Printing", town: "Hatfield", province: "Gauteng",
      institutions: ["up"],
      description: "Fast A4/A3 printing, scanning and binding. Bulk discounts for dissertations.",
      phone: "+27 12 000 0006", whatsapp: "+27120000006",
      image: uns("1498050108023-c5249f4df085"), verified: true },

    { id: "seed-biz-7", kind: "business", title: "Zee's African Kitchen",
      category: "Food", town: "Durban", province: "KwaZulu-Natal",
      institutions: ["ukzn"],
      description: "Authentic bunny chow, kota and grilled chicken. Delivery to UKZN Howard College.",
      phone: "+27 31 000 0007", whatsapp: "+27310000007",
      image: uns("1555396273-367ea4eb4db5"), verified: true },

    { id: "seed-biz-8", kind: "business", title: "Residence Fitness Hub",
      category: "Services", town: "Auckland Park", province: "Gauteng",
      institutions: ["uj"],
      description: "Small neighbourhood gym with student rates, boxing classes and strength coaching.",
      phone: "+27 11 000 0008", whatsapp: "",
      image: uns("1534438327276-14e5300c3a48"), verified: false },

    { id: "seed-biz-9", kind: "business", title: "Braam Barber Studio",
      category: "Services", town: "Braamfontein", province: "Gauteng",
      institutions: ["wits"],
      description: "Fresh fades, line-ups and beard trims. Walk-ins welcome, student discount after 3pm.",
      phone: "+27 11 000 0009", whatsapp: "+27110000009",
      image: uns("1503951914875-452162b0f3f1"), verified: true },

    { id: "seed-biz-10", kind: "business", title: "Textbook Traders",
      category: "Retail", town: "Hatfield", province: "Gauteng",
      institutions: ["up"],
      description: "Second-hand textbooks, study guides and past papers for UP and UNISA students.",
      phone: "+27 12 000 0010", whatsapp: "",
      image: uns("1544716278-ca5e3f4abd8c"), verified: false },

    { id: "seed-biz-11", kind: "business", title: "Thrifty Threads",
      category: "Retail", town: "Observatory", province: "Western Cape",
      institutions: ["uct"],
      description: "Vintage and second-hand clothing curated for students — hoodies, jeans and jackets.",
      phone: "+27 21 000 0011", whatsapp: "+27210000011",
      image: uns("1489987707025-afc232f7ea0f"), verified: true },

    { id: "seed-biz-12", kind: "business", title: "Campus Phone Fix",
      category: "Repairs", town: "Sunnyside", province: "Gauteng",
      institutions: ["tut"],
      description: "Screen replacements, battery swaps and data recovery — same-day where possible.",
      phone: "+27 12 000 0012", whatsapp: "+27120000012",
      image: uns("1523206489230-c012c64b2b48"), verified: true }
  ];

  /* ============================================================
     SEED DATA — TRANSPORT (8)
     ============================================================ */
  const SEED_TRANSPORT = [
    { id: "seed-trn-1", kind: "transport", title: "Campus Shuttle",
      mode: "Bus", route: "Main residence → East campus gate",
      frequency: "Every 20 minutes", duration: "12 minutes", stops: "4 stops",
      town: "Braamfontein", province: "Gauteng", institutions: ["wits"],
      price: 0, priceUnit: "free with student card",
      description: "Direct shuttle between the main residence and the east campus gate.",
      image: uns("1570125909232-eb263c188f7e"),
      phone: "+27 11 200 3001", whatsapp: "+27112003001", verified: true },

    { id: "seed-trn-2", kind: "transport", title: "Metro Rail Line",
      mode: "Train", route: "Southern suburbs → Park station",
      frequency: "Every 30 minutes", duration: "18 minutes", stops: "2 stations",
      town: "Johannesburg", province: "Gauteng", institutions: ["wits"],
      price: 12, priceUnit: "per trip",
      description: "Fast route from the southern suburbs to the station near campus.",
      image: uns("1544620347-c4fd4a3d5957"),
      phone: "+27 11 200 3002", whatsapp: "", verified: true },

    { id: "seed-trn-3", kind: "transport", title: "Local Minibus Taxi",
      mode: "Minibus", route: "Taxi rank → Campus entrance",
      frequency: "Every 5 minutes", duration: "10 minutes", stops: "Direct",
      town: "Braamfontein", province: "Gauteng", institutions: ["wits"],
      price: 14, priceUnit: "per trip",
      description: "Frequent service from the taxi rank to the campus entrance.",
      image: uns("1558618666-fcd25c85cd64"),
      phone: "+27 11 200 3003", whatsapp: "+27112003003", verified: false },

    { id: "seed-trn-4", kind: "transport", title: "Campus Bike Hire",
      mode: "Cycle", route: "On-campus hire point",
      frequency: "Anytime", duration: "15 minute ride", stops: "12 bikes available",
      town: "Auckland Park", province: "Gauteng", institutions: ["uj"],
      price: 25, priceUnit: "per day",
      description: "Short-term bike hire with a helmet, lock and secure parking on campus.",
      image: uns("1485965120184-e220f721d03e"),
      phone: "+27 11 200 3004", whatsapp: "+27112003004", verified: true },

    { id: "seed-trn-5", kind: "transport", title: "Hatfield Student Bus",
      mode: "Bus", route: "Hatfield station → UP main gate → Hillcrest",
      frequency: "Every 15 minutes", duration: "8 minutes", stops: "3 stops",
      town: "Hatfield", province: "Gauteng", institutions: ["up"],
      price: 0, priceUnit: "free with student card",
      description: "Loop service covering the Gautrain station and UP main campus.",
      image: uns("1570125909232-eb263c188f7e"),
      phone: "+27 12 200 3005", whatsapp: "+27122003005", verified: true },

    { id: "seed-trn-6", kind: "transport", title: "Jammie Shuttle",
      mode: "Bus", route: "Upper Campus → Lower Campus → Medical School",
      frequency: "Every 10 minutes", duration: "6 minutes", stops: "6 stops",
      town: "Observatory", province: "Western Cape", institutions: ["uct"],
      price: 0, priceUnit: "free for UCT students",
      description: "UCT's official campus shuttle. Scan your student card when boarding.",
      image: uns("1570125909232-eb263c188f7e"),
      phone: "+27 21 200 3006", whatsapp: "", verified: true },

    { id: "seed-trn-7", kind: "transport", title: "Durban People Mover",
      mode: "Bus", route: "Howard College → Westville → City Centre",
      frequency: "Every 30 minutes", duration: "22 minutes", stops: "5 stops",
      town: "Durban", province: "KwaZulu-Natal", institutions: ["ukzn"],
      price: 18, priceUnit: "per trip",
      description: "Runs between the UKZN campuses and central Durban, with a stop at the beachfront.",
      image: uns("1558618666-fcd25c85cd64"),
      phone: "+27 31 200 3007", whatsapp: "+27312003007", verified: false },

    { id: "seed-trn-8", kind: "transport", title: "Auckland Park Bike Share",
      mode: "Cycle", route: "UJ Kingsway → Melville → Westdene",
      frequency: "Anytime", duration: "20 minute ride", stops: "8 stations",
      town: "Auckland Park", province: "Gauteng", institutions: ["uj"],
      price: 20, priceUnit: "per hour",
      description: "Dock-based bike share with helmets available at each station.",
      image: uns("1485965120184-e220f721d03e"),
      phone: "+27 11 200 3008", whatsapp: "", verified: true }
  ];

  /* ============================================================
     SEED DATA — DEALS (8)
     ============================================================ */
  const SEED_DEALS = [
    { id: "seed-deal-1", kind: "deal", title: "20% off stationery",
      business: "Stationery Warehouse", category: "Stationery",
      discount: "20% off", code: "", expiry: "Ends 30 Nov",
      town: "Braamfontein", province: "Gauteng", institutions: ["wits"],
      terms: "Show your student card at the till.",
      description: "20% off notebooks, pens and printing paper. Show your student card at the till.",
      image: uns("1531346878377-a5be20888e57"),
      phone: "+27 11 300 4001", whatsapp: "+27113004001", verified: true },

    { id: "seed-deal-2", kind: "deal", title: "2-for-1 coffee",
      business: "Corner Bean Café", category: "Food & Drink",
      discount: "2 for 1", code: "", expiry: "Weekdays before 10:00",
      town: "Braamfontein", province: "Gauteng", institutions: ["wits"],
      terms: "Valid on any regular-size hot drink.",
      description: "Buy one coffee, get a second free every weekday before 10:00.",
      image: uns("1495474472287-4d71bcdd2085"),
      phone: "+27 11 300 4002", whatsapp: "+27113004002", verified: true },

    { id: "seed-deal-3", kind: "deal", title: "15% off hoodies & sneakers",
      business: "Campus Threads", category: "Clothing",
      discount: "15% off", code: "STUD15", expiry: "Ends 15 Dec",
      town: "Auckland Park", province: "Gauteng", institutions: ["uj"],
      terms: "Use code STUD15 at checkout, online or in store.",
      description: "15% off all hoodies and sneakers with the code STUD15.",
      image: uns("1556821840-3a63f95609a7"),
      phone: "+27 11 300 4003", whatsapp: "+27113004003", verified: false },

    { id: "seed-deal-4", kind: "deal", title: "R100 off gym sign-up",
      business: "Residence Gym", category: "Fitness",
      discount: "R100 off", code: "", expiry: "New members only",
      town: "Auckland Park", province: "Gauteng", institutions: ["uj"],
      terms: "Sign up with a student email address to claim.",
      description: "R100 off your first month when you sign up with a student email address.",
      image: uns("1534438327276-14e5300c3a48"),
      phone: "+27 11 300 4004", whatsapp: "", verified: true },

    { id: "seed-deal-5", kind: "deal", title: "Free delivery on lunch boxes",
      business: "Thandi's Fresh Meals", category: "Food & Drink",
      discount: "Free delivery", code: "", expiry: "Weekdays only",
      town: "Braamfontein", province: "Gauteng", institutions: ["wits"],
      terms: "Minimum order of R60 delivered to campus between 11:00 and 14:00.",
      description: "Skip the delivery fee when you order a lunch box and a drink together.",
      image: uns("1504674900247-0877df9cc836"),
      phone: "+27 11 300 4005", whatsapp: "+27113004005", verified: false },

    { id: "seed-deal-6", kind: "deal", title: "10% off bulk printing",
      business: "Print & Copy Hub", category: "Printing",
      discount: "10% off", code: "BULK10", expiry: "Ongoing",
      town: "Braamfontein", province: "Gauteng", institutions: ["wits"],
      terms: "Applies to any order over 100 pages.",
      description: "10% off any printing order over 100 pages. Perfect for dissertations and study packs.",
      image: uns("1568732941692-aad2e2e06239"),
      phone: "+27 11 300 4006", whatsapp: "+27113004006", verified: true },

    { id: "seed-deal-7", kind: "deal", title: "R50 off any haircut",
      business: "Braam Barber Studio", category: "Services",
      discount: "R50 off", code: "", expiry: "Mon–Wed after 3pm",
      town: "Braamfontein", province: "Gauteng", institutions: ["wits"],
      terms: "Show your student card. One discount per student per week.",
      description: "R50 off any cut or line-up on weekday afternoons. No booking required.",
      image: uns("1503951914875-452162b0f3f1"),
      phone: "+27 11 300 4007", whatsapp: "+27113004007", verified: true },

    { id: "seed-deal-8", kind: "deal", title: "Buy 1 get 1 on study guides",
      business: "Textbook Traders", category: "Books",
      discount: "Buy 1 get 1", code: "", expiry: "Ends 30 Nov",
      town: "Hatfield", province: "Gauteng", institutions: ["up"],
      terms: "Cheapest item in the pair is free.",
      description: "Buy one study guide, get another free. Includes past paper collections.",
      image: uns("1544716278-ca5e3f4abd8c"),
      phone: "+27 12 300 4008", whatsapp: "", verified: false }
  ];

  /* ============================================================
     SEED DATA — STUDENT INFO & TIPS (8)
     ============================================================ */
  const SEED_INFO_POSTS = [
    { id: "seed-info-1", kind: "info", title: "How to survive load-shedding during exams",
      category: "Study tips", town: "Braamfontein", province: "Gauteng", institutions: ["wits"],
      description: "Check the load-shedding schedule for your area, download your study notes for offline access, and invest in a good power bank and rechargeable study lamp. The Wits library also has backup generators.",
      image: uns("1516321318423-f06f85e504b3"),
      authorName: "Lerato M.", createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },

    { id: "seed-info-2", kind: "info", title: "Cheapest printing spots near campus",
      category: "Student deals", town: "Auckland Park", province: "Gauteng", institutions: ["uj"],
      description: "Don't pay R2 per page at the library! Print & Copy Hub on Kingsway charges R0.60 per page for black and white, and they give a discount if you print over 100 pages.",
      image: uns("1568732941692-aad2e2e06239"),
      authorName: "Sipho K.", createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },

    { id: "seed-info-3", kind: "info", title: "Safety tip: Sharing Ubers after late labs",
      category: "Transport", town: "Hatfield", province: "Gauteng", institutions: ["up"],
      description: "If you're taking an Uber or Bolt back to res after dark, always share your trip status with a friend, check the license plate before getting in, and try to sit in the back seat.",
      image: uns("1517524015642-6df35737b1cc"),
      authorName: "Naledi D.", createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 },

    { id: "seed-info-4", kind: "info", title: "Red flags when viewing a student house",
      category: "Accommodation", town: "Observatory", province: "Western Cape", institutions: ["uct"],
      description: "Watch out for landlords who ask for a deposit before showing you the lease, or who refuse to put maintenance agreements in writing. Always check if the electric meter is on a prepaid split.",
      image: uns("1560184897-ae75f418493e"),
      authorName: "Thabo M.", createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000 },

    { id: "seed-info-5", kind: "info", title: "Best free study spots on campus",
      category: "Study tips", town: "Durban", province: "KwaZulu-Natal", institutions: ["ukzn"],
      description: "The main library gets packed during swot week. Try the 4th floor of the Howard College building or the postgrad quiet rooms. The Computer Science labs are usually quiet after 5 PM.",
      image: uns("1521587760476-6c12a4b040da"),
      authorName: "Zanele S.", createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000 },

    { id: "seed-info-6", kind: "info", title: "My experience with the Campus Shuttle",
      category: "Transport", town: "Braamfontein", province: "Gauteng", institutions: ["wits"],
      description: "The shuttle is actually super reliable if you catch it before 7:30 AM. After that, traffic on Empire Road gets heavy and it can take 20 minutes to get to campus.",
      image: uns("1570125909232-eb263c188f7e"),
      authorName: "David P.", createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },

    { id: "seed-info-7", kind: "info", title: "Where to get cheap groceries near TUT",
      category: "Student deals", town: "Sunnyside", province: "Gauteng", institutions: ["tut"],
      description: "The local spaza shops are great for quick snacks, but for a full grocery run, take the short walk to the Sunnyside market on Saturdays. You can get a whole week of veggies for under R100.",
      image: uns("1542838132-92c53300491e"),
      authorName: "Amina B.", createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 },

    { id: "seed-info-8", kind: "info", title: "Textbook exchange meetup this Friday",
      category: "Other", town: "Auckland Park", province: "Gauteng", institutions: ["uj"],
      description: "Bring your old first-year textbooks (Accounting, Stats, Psych) and swap them for second-year books. We'll be at the UJ Kingsway cafeteria from 12:00 to 15:00.",
      image: uns("1544716278-ca5e3f4abd8c"),
      authorName: "Kabelo T.", createdAt: Date.now() - 12 * 60 * 60 * 1000 }
  ];

  /* ============================================================
     LISTING RETRIEVAL (removal-aware)
     ============================================================ */
  function allListingsRaw() {
    return [].concat(SEED_ACCOMMODATION, SEED_BUSINESSES, SEED_TRANSPORT,
                     SEED_DEALS, SEED_INFO_POSTS, readListings());
  }
  function isRemoved(id) { return readRemovedIds().includes(id); }

  function getAllAccommodation() {
    return allListingsRaw().filter(l => l.kind === "accommodation" && !isRemoved(l.id));
  }
  function getAllBusinesses() {
    return allListingsRaw().filter(l => l.kind === "business" && !isRemoved(l.id));
  }
  function getAllTransport() {
    return allListingsRaw().filter(l => l.kind === "transport" && !isRemoved(l.id));
  }
  function getAllDeals() {
    return allListingsRaw().filter(l => l.kind === "deal" && !isRemoved(l.id));
  }
  function getAllInfoPosts() {
    return allListingsRaw().filter(l => l.kind === "info" && !isRemoved(l.id));
  }
  function findAnyListing(id) {
    return getAllAccommodation().find(a => a.id === id)
        || getAllBusinesses().find(b => b.id === id)
        || getAllTransport().find(t => t.id === id)
        || getAllDeals().find(d => d.id === id)
        || getAllInfoPosts().find(p => p.id === id);
  }
  function findAnyListingRaw(id) {
    return allListingsRaw().find(l => l.id === id) || null;
  }
  function listingImages(item) {
    if (Array.isArray(item.images) && item.images.length) return item.images;
    return item.image ? [item.image] : [];
  }

  /* ============================================================
     DEMO SEED (runs once)
     ============================================================ */
  function seedDemoData() {
    if (localStorage.getItem(DEMO_SEEDED_KEY)) return;

    const users = readUsers();
    const demoOwners = [
      { id: "demo-owner-thabo", name: "Thabo Mokoena", email: "thabo@demo.com",
        password: "demo123456", role: "business", phone: "+27 82 111 2222",
        campus: "wits", bio: "Family braai business in Braamfontein.",
        createdAt: Date.now() - 30*24*60*60*1000 },
      { id: "demo-owner-zanele", name: "Zanele Dlamini", email: "zanele@demo.com",
        password: "demo123456", role: "business", phone: "+27 82 333 4444",
        campus: "uj", bio: "Hair studio owner in Auckland Park.",
        createdAt: Date.now() - 20*24*60*60*1000 },
      { id: "demo-owner-sipho", name: "Sipho Ndlovu", email: "sipho@demo.com",
        password: "demo123456", role: "business", phone: "+27 82 555 6666",
        campus: "up", bio: "Maths tutor for first and second years.",
        createdAt: Date.now() - 15*24*60*60*1000 }
    ];
    demoOwners.forEach(u => {
      if (!users.some(x => x.email.toLowerCase() === u.email.toLowerCase())) users.push(u);
    });
    writeUsers(users);

    const listings = readListings();
    const demoBusinesses = [
      { id: "demo-biz-thabo", kind: "business", title: "Thabo's Braai Stand",
        category: "Food", town: "Braamfontein", province: "Gauteng",
        institutions: ["wits"],
        description: "Traditional braai with pap, chakalaka and salads. Lunch specials for students.",
        phone: "+27 82 111 2222", whatsapp: "+27821112222",
        image: uns("1555939594-58d7cb561ad1"),
        ownerEmail: "thabo@demo.com", authorName: "Thabo Mokoena",
        verified: false, createdAt: Date.now() - 28*24*60*60*1000 },
      { id: "demo-biz-zanele", kind: "business", title: "Zanele's Hair Studio",
        category: "Services", town: "Auckland Park", province: "Gauteng",
        institutions: ["uj"],
        description: "Braiding, weaving and treatments. Student discount on Tuesdays.",
        phone: "+27 82 333 4444", whatsapp: "+27823334444",
        image: uns("1523289333742-be1143f6b766"),
        ownerEmail: "zanele@demo.com", authorName: "Zanele Dlamini",
        verified: false, createdAt: Date.now() - 18*24*60*60*1000 },
      { id: "demo-biz-sipho", kind: "business", title: "Sipho's Maths Tutorials",
        category: "Services", town: "Hatfield", province: "Gauteng",
        institutions: ["up"],
        description: "Weekly maths and stats tutoring for first and second year students.",
        phone: "+27 82 555 6666", whatsapp: "+27825556666",
        image: uns("1498050108023-c5249f4df085"),
        ownerEmail: "sipho@demo.com", authorName: "Sipho Ndlovu",
        verified: false, createdAt: Date.now() - 13*24*60*60*1000 }
    ];
    demoBusinesses.forEach(b => {
      if (!listings.some(x => x.id === b.id)) listings.push(b);
    });
    writeListings(listings);

    const verifs = readVerifications();
    const demoVerifs = [
      { id: "ver-seed-1", ownerEmail: "thabo@demo.com", ownerName: "Thabo Mokoena",
        fullName: "Thabo Mokoena", idNumber: "8501015800088", dob: "1985-01-01",
        businessId: "demo-biz-thabo", businessName: "Thabo's Braai Stand",
        regNumber: "2020/123456/07", address: "123 Main Street, Braamfontein",
        phone: "+27 82 111 2222", idDocName: "thabo-id.jpg", idDocData: "",
        status: "pending", submittedAt: Date.now() - 2*24*60*60*1000 },
      { id: "ver-seed-2", ownerEmail: "zanele@demo.com", ownerName: "Zanele Dlamini",
        fullName: "Zanele Dlamini", idNumber: "9205155800002", dob: "1992-05-15",
        businessId: "demo-biz-zanele", businessName: "Zanele's Hair Studio",
        regNumber: "", address: "45 Kingsway Ave, Auckland Park",
        phone: "+27 82 333 4444", idDocName: "zanele-id.jpg", idDocData: "",
        status: "pending", submittedAt: Date.now() - 1*24*60*60*1000 },
      { id: "ver-seed-3", ownerEmail: "sipho@demo.com", ownerName: "Sipho Ndlovu",
        fullName: "Sipho Ndlovu", idNumber: "8811235800002", dob: "1988-11-23",
        businessId: "demo-biz-sipho", businessName: "Sipho's Maths Tutorials",
        regNumber: "", address: "12 Burnett Street, Hatfield",
        phone: "+27 82 555 6666", idDocName: "sipho-id.jpg", idDocData: "",
        status: "rejected", reviewNotes: "ID document image was too blurry to read. Please re-upload.",
        submittedAt: Date.now() - 5*24*60*60*1000, reviewedAt: Date.now() - 2*24*60*60*1000 }
    ];
    demoVerifs.forEach(v => {
      if (!verifs.some(x => x.id === v.id)) verifs.push(v);
    });
    writeVerifications(verifs);

    const reports = readReports();
    const demoReports = [
      { id: "rep-seed-1", businessId: "seed-biz-3", reason: "Scam or fraud",
        notes: "Asked me to pay a deposit before showing the food.",
        reporterEmail: "student1@example.com", createdAt: Date.now() - 3*24*60*60*1000 },
      { id: "rep-seed-2", businessId: "seed-biz-3", reason: "Incorrect information",
        notes: "Delivery times do not match the listing.",
        reporterEmail: "student2@example.com", createdAt: Date.now() - 2*24*60*60*1000 },
      { id: "rep-seed-3", businessId: "seed-biz-3", reason: "Not a real business",
        notes: "No one answered the phone after 3 attempts.",
        reporterEmail: "student3@example.com", createdAt: Date.now() - 1*24*60*60*1000 },
      { id: "rep-seed-4", businessId: "seed-biz-5", reason: "Incorrect information",
        notes: "Prices are higher than listed.",
        reporterEmail: "student1@example.com", createdAt: Date.now() - 4*24*60*60*1000 },
      { id: "rep-seed-5", businessId: "seed-biz-5", reason: "Not a real business",
        notes: "Location is a vacant stand.",
        reporterEmail: "student4@example.com", createdAt: Date.now() - 2*24*60*60*1000 },
      { id: "rep-seed-6", businessId: "demo-biz-sipho", reason: "Incorrect information",
        notes: "Tutor cancelled last minute.",
        reporterEmail: "student5@example.com", createdAt: Date.now() - 1*24*60*60*1000 }
    ];
    demoReports.forEach(r => {
      if (!reports.some(x => x.id === r.id)) reports.push(r);
    });
    writeReports(reports);

    localStorage.setItem(DEMO_SEEDED_KEY, "1");
  }

  /* ============================================================
     PASSWORD RESET
     ============================================================ */
  function openForgotPasswordModal() {
    const body = `
      <form id="forgot-form" class="auth-form" novalidate>
        <p class="small-note" style="margin:0;">Enter the email address you registered with.</p>
        <div class="field">
          <label for="forgot-email">Email address</label>
          <input type="email" id="forgot-email" required placeholder="you@example.com">
        </div>
        <div id="forgot-new-fields" class="is-hidden">
          <div class="field">
            <label for="forgot-new-password">New password</label>
            <input type="password" id="forgot-new-password" autocomplete="new-password" placeholder="At least 6 characters">
          </div>
          <div class="field">
            <label for="forgot-confirm-password">Confirm new password</label>
            <input type="password" id="forgot-confirm-password" autocomplete="new-password" placeholder="Repeat new password">
          </div>
        </div>
        <p class="auth-message" id="forgot-message" role="status"></p>
        <button class="button button-primary" type="submit" id="forgot-submit">Continue</button>
      </form>
    `;
    openModal("Reset password", body);

    let step = "verify";
    let verifiedEmail = "";
    const messageEl = document.getElementById("forgot-message");
    const submitBtn = document.getElementById("forgot-submit");

    document.getElementById("forgot-form").addEventListener("submit", e => {
      e.preventDefault();
      if (step === "verify") {
        const email = document.getElementById("forgot-email").value.trim();
        if (!email) { messageEl.textContent = "Please enter your email."; return; }
        const user = readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) { messageEl.textContent = "No account with that email."; return; }
        verifiedEmail = email;
        step = "reset";
        document.getElementById("forgot-new-fields").classList.remove("is-hidden");
        document.getElementById("forgot-email").disabled = true;
        submitBtn.textContent = "Update password";
        messageEl.textContent = "";
        document.getElementById("forgot-new-password").focus();
        return;
      }
      const newPw = document.getElementById("forgot-new-password").value;
      const confirmPw = document.getElementById("forgot-confirm-password").value;
      if (!newPw || newPw.length < 6) { messageEl.textContent = "Password must be at least 6 characters."; return; }
      if (newPw !== confirmPw) { messageEl.textContent = "The two passwords do not match."; return; }
      const users = readUsers();
      const user = users.find(u => u.email.toLowerCase() === verifiedEmail.toLowerCase());
      if (!user) { messageEl.textContent = "Something went wrong. Please try again."; return; }
      user.password = newPw;
      writeUsers(users);
      messageEl.style.color = "var(--color-success)";
      messageEl.textContent = "Password updated! You can log in now.";
      submitBtn.disabled = true;
      setTimeout(closeModal, 1400);
    });
  }

  /* ============================================================
     ACCOUNT GATE
     ============================================================ */
  let gateElement = null;

  function buildGate() {
    const gate = document.createElement("div");
    gate.className = "auth-gate";
    gate.id = "auth-gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "auth-gate-title");

    gate.innerHTML = `
      <div class="auth-gate__card">
         <img src="assets/official.png" alt="Stud House logo" class="login-logo">
        <h2 id="auth-gate-title">Welcome to Stud House</h2>
        <p class="auth-gate__sub">Log in or create an account to explore accommodation,
          businesses, transport and student deals.</p>

        <div class="auth-tabs" role="tablist" aria-label="Account options">
          <button type="button" class="auth-tab is-active"
                  data-target="gate-login-form" role="tab" aria-selected="true">Log In</button>
          <button type="button" class="auth-tab"
                  data-target="gate-register-form" role="tab" aria-selected="false">Create Account</button>
        </div>

        <form class="auth-form" id="gate-login-form" novalidate>
          <div class="field">
            <label for="gate-login-email">Email address</label>
            <input type="email" id="gate-login-email" autocomplete="email" placeholder="you@example.com" required>
          </div>
          <div class="field">
            <label for="gate-login-password">Password</label>
            <input type="password" id="gate-login-password" autocomplete="current-password" placeholder="Your password" required>
          </div>
          <p class="auth-message" id="gate-login-message" role="status"></p>
          <button class="button button-primary" type="submit">Log In</button>
          <button type="button" class="auth-link-btn" id="gate-forgot-btn">Forgot password?</button>
        </form>

        <form class="auth-form is-hidden" id="gate-register-form" novalidate>
          <div class="field">
            <label for="gate-register-name">Full name</label>
            <input type="text" id="gate-register-name" autocomplete="name" placeholder="Your name" required>
          </div>
          <div class="field">
            <label for="gate-register-email">Email address</label>
            <input type="email" id="gate-register-email" autocomplete="email" placeholder="you@example.com" required>
          </div>
          <div class="field">
            <label>I am a…</label>
            <div class="role-options">
              <label class="role-option">
                <input type="radio" name="gate-role" value="student" checked>
                <span class="role-option__title">Student</span>
                <span class="role-option__desc">Find info &amp; deals</span>
              </label>
              <label class="role-option">
                <input type="radio" name="gate-role" value="business">
                <span class="role-option__title">Business owner</span>
                <span class="role-option__desc">List my business</span>
              </label>
            </div>
          </div>
          <div class="field">
            <label for="gate-register-password">Password</label>
            <input type="password" id="gate-register-password" autocomplete="new-password" placeholder="At least 6 characters" required>
          </div>
          <div class="field">
            <label for="gate-register-confirm">Confirm password</label>
            <input type="password" id="gate-register-confirm" autocomplete="new-password" placeholder="Repeat your password" required>
          </div>
          <p class="auth-message" id="gate-register-message" role="status"></p>
          <button class="button button-primary" type="submit">Create Account</button>
        </form>

        <p class="auth-gate__foot">Prototype only — accounts are stored in this browser.</p>
      </div>
    `;
    return gate;
  }

  function wireGate(gate) {
    const tabs  = gate.querySelectorAll(".auth-tab");
    const login = gate.querySelector("#gate-login-form");
    const reg   = gate.querySelector("#gate-register-form");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        login.classList.toggle("is-hidden", tab.dataset.target !== "gate-login-form");
        reg.classList.toggle("is-hidden", tab.dataset.target !== "gate-register-form");
        const first = (tab.dataset.target === "gate-login-form" ? login : reg).querySelector("input");
        if (first) first.focus();
      });
    });

    login.addEventListener("submit", e => {
      e.preventDefault();
      const email    = gate.querySelector("#gate-login-email").value.trim();
      const password = gate.querySelector("#gate-login-password").value;
      const message  = gate.querySelector("#gate-login-message");
      message.classList.remove("is-success");
      if (!email || !password) { message.textContent = "Please enter both your email and password."; return; }
      const user = readUsers().find(u =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) { message.textContent = "No account matches those details. Try creating an account."; return; }
      message.textContent = "";
      logIn(user.email);
      closeGate();
      addAccountNavLinks();
      if (user.role === "admin") window.location.href = "admin.html";
      else if (currentPageName() === "profile.html") window.location.reload();
    });

    reg.addEventListener("submit", e => {
      e.preventDefault();
      const name     = gate.querySelector("#gate-register-name").value.trim();
      const email    = gate.querySelector("#gate-register-email").value.trim();
      const password = gate.querySelector("#gate-register-password").value;
      const confirm  = gate.querySelector("#gate-register-confirm").value;
      const roleEl   = gate.querySelector("input[name='gate-role']:checked");
      const role     = roleEl ? roleEl.value : "student";
      const message  = gate.querySelector("#gate-register-message");
      if (!name || !email || !password) { message.textContent = "Please fill in every field."; return; }
      if (password.length < 6) { message.textContent = "Use a password with at least 6 characters."; return; }
      if (password !== confirm) { message.textContent = "The two passwords do not match."; return; }
      const users = readUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        message.textContent = "An account with that email already exists. Please log in."; return;
      }
      users.push({ id: uid("user"), name, email, password, role, createdAt: Date.now() });
      writeUsers(users);
      message.textContent = "";
      logIn(email);
      closeGate();
      addAccountNavLinks();
      if (currentPageName() === "profile.html") window.location.reload();
    });

    gate.querySelector("#gate-forgot-btn").addEventListener("click", openForgotPasswordModal);

    if (!gate.querySelector("#gate-admin-btn")) {
      const forgotBtn = gate.querySelector("#gate-forgot-btn");
      const adminBtn = document.createElement("button");
      adminBtn.type = "button";
      adminBtn.id = "gate-admin-btn";
      adminBtn.className = "auth-link-btn auth-link-btn--admin";
      adminBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Sign in as Admin';
      forgotBtn.parentNode.insertBefore(adminBtn, forgotBtn.nextSibling);

      adminBtn.addEventListener("click", () => {
        gate.querySelector("#gate-login-email").value = ADMIN_EMAIL;
        gate.querySelector("#gate-login-password").value = ADMIN_PASSWORD;
        const message = gate.querySelector("#gate-login-message");
        message.classList.remove("is-error");
        message.classList.add("is-success");
        message.textContent = "Admin credentials loaded — click Log In to continue.";
        const submitBtn = login.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.focus();
      });
    }
  }

  function openGate() {
    if (gateElement) return;
    gateElement = buildGate();
    document.body.appendChild(gateElement);
    document.body.classList.add("auth-locked");
    wireGate(gateElement);
    const first = gateElement.querySelector("#gate-login-email");
    if (first) first.focus();
  }
  function closeGate() {
    if (!gateElement) return;
    gateElement.remove();
    gateElement = null;
    document.body.classList.remove("auth-locked");
  }

  /* ============================================================
     SHARED MODAL & LIGHTBOX
     ============================================================ */
  function openModal(title, bodyHtml) {
    closeModal();
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "shared-modal";
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="shared-modal-title">
        <div class="modal-header">
          <h2 id="shared-modal-title">${escapeHtml(title)}</h2>
          <button class="modal-close" type="button" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
      </div>
    `;
    document.body.appendChild(backdrop);
    backdrop.querySelector(".modal-close").addEventListener("click", closeModal);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { closeModal(); document.removeEventListener("keydown", esc); }
    });
    return backdrop;
  }
  function closeModal() {
    const m = document.getElementById("shared-modal");
    if (m) m.remove();
  }

  function openLightbox(src) {
    closeLightbox();
    const lb = document.createElement("div");
    lb.className = "lightbox-backdrop";
    lb.id = "shared-lightbox";
    lb.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close expanded image">&times;</button>
      <img src="${escapeHtml(src)}" alt="Expanded view">
    `;
    document.body.appendChild(lb);

    const close = () => closeLightbox();
    lb.querySelector(".lightbox-close").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
    });
  }
  function closeLightbox() {
    const lb = document.getElementById("shared-lightbox");
    if (lb) lb.remove();
  }

  /* ============================================================
     SHARED CARD HELPERS
     ============================================================ */
  function verificationBadge(verified) {
    return verified
      ? `<span class="verified-badge verified" title="Verified listing"><i class="fa-solid fa-check"></i> Verified</span>`
      : `<span class="verified-badge not-verified" title="Not yet verified"><i class="fa-solid fa-xmark"></i> Not verified</span>`;
  }
  function reportWarning(id) {
    const n = readReports().filter(r => r.businessId === id).length;
    return n >= 3 ? `<span class="report-warning" title="Flagged by students"><i class="fa-solid fa-triangle-exclamation"></i> ${n} reports</span>` : "";
  }
  function callWhatsapp(item) {
    const phone = item.phone
      ? `<a class="button button-primary" href="tel:${escapeHtml(sanitizePhone(item.phone))}"><i class="fa-solid fa-phone"></i> Call</a>` : "";
    const wa = sanitizePhone(item.whatsapp);
    const whatsapp = wa
      ? `<a class="button button-secondary" href="https://wa.me/${wa}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>` : "";
    return phone + whatsapp;
  }
  function priceLine(item) {
    if (typeof item.price === "number") {
      const shown = item.price === 0 ? "Free" : formatPrice(item.price);
      return `<p class="price">${shown}${item.priceUnit ? ` <small>${escapeHtml(item.priceUnit)}</small>` : ""}</p>`;
    }
    if (item.discount) return `<p class="price">${escapeHtml(item.discount)}</p>`;
    return "";
  }
  function locationLine(item) {
    if (!item.town && !item.province) return "";
    const parts = [item.town, item.province].filter(Boolean).map(escapeHtml).join(", ");
    return `<li><i class="fa-solid fa-location-dot"></i> ${parts}</li>`;
  }
  function institutionTags(item) {
    if (!Array.isArray(item.institutions) || !item.institutions.length) return "";
    return item.institutions.map(id => {
      const inst = getInstitutionById(id);
      return inst ? `<li><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(inst.short)} — ${escapeHtml(inst.campus)}</li>` : "";
    }).join("");
  }
  function buildGalleryHtml(images, title) {
    if (!images.length) return `<div class="detail-main-image"></div>`;
    return `
      <div class="detail-gallery">
        <div class="detail-main-image">
          <img id="detail-main-img" src="${escapeHtml(images[0])}" alt="${escapeHtml(title)}" fetchpriority="high" onerror="this.style.display='none'">
        </div>
        ${images.length > 1 ? `<div class="detail-thumbs">${images.map((src, i) => `
          <button type="button" class="detail-thumb${i === 0 ? " active" : ""}"
                  data-src="${escapeHtml(src)}" aria-label="View photo ${i + 1}">
            <img src="${escapeHtml(src)}" alt="" loading="lazy" onerror="this.parentElement.remove()">
          </button>`).join("")}</div>` : ""}
      </div>
    `;
  }
  function wireThumbnails() {
    document.querySelectorAll(".detail-thumb").forEach(btn => {
      btn.addEventListener("click", () => {
        const mainImg = document.getElementById("detail-main-img");
        if (mainImg) { mainImg.style.display = ""; mainImg.src = btn.dataset.src; }
        document.querySelectorAll(".detail-thumb").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
    const mainImg = document.getElementById("detail-main-img");
    if (mainImg) {
      mainImg.addEventListener("click", () => openLightbox(mainImg.src));
    }
  }

  /* ============================================================
     ACCOMMODATION
     ============================================================ */
  function readAccommodationFilters() {
    const get = id => { const el = document.getElementById(id); return el ? el.value : ""; };
    return {
      campus:   get("filter-campus"),
      province: get("filter-province"),
      town:     get("filter-town"),
      budget:   get("filter-budget"),
      roomType: get("filter-type")
    };
  }

  function renderAccommodation() {
    const grid = document.getElementById("accommodation-grid");
    if (!grid) return;
    const f = readAccommodationFilters();
    const budget = BUDGET_RANGES.find(b => b.value === f.budget);

    const items = getAllAccommodation().filter(item => {
      if (f.campus && (!Array.isArray(item.institutions) || !item.institutions.includes(f.campus))) return false;
      if (f.province && item.province !== f.province) return false;
      if (f.town && !String(item.town).toLowerCase().includes(f.town.toLowerCase())) return false;
      if (f.roomType && item.roomType !== f.roomType) return false;
      if (budget && (item.price < budget.min || item.price > budget.max)) return false;
      return true;
    });

    if (!items.length) {
      grid.innerHTML = `<p class="empty-state">No listings match your search. Try widening the filters.</p>`;
      return;
    }

    grid.innerHTML = items.map((item, index) => `
      <article class="card" data-accommodation-id="${escapeHtml(item.id)}">
        <div class="card-media">
          <img src="${escapeHtml(listingImages(item)[0] || "")}" alt="${escapeHtml(item.title)}"
               loading="${index === 0 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" onerror="this.style.display='none'">
          <span class="card-badge">${escapeHtml(item.roomType)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="card-status-row">${verificationBadge(item.verified)}${reportWarning(item.id)}</div>
          <p class="price">${formatPrice(item.price)} <small>per month</small></p>
          <p>${escapeHtml(item.description)}</p>
          <ul class="card-meta">
            ${locationLine(item)}
            ${institutionTags(item)}
          </ul>
          <div class="card-actions">
            <button class="button button-primary" type="button" data-view-listing="${escapeHtml(item.id)}">View details</button>
            <button class="button button-secondary" type="button" data-chat-business="${escapeHtml(item.id)}"><i class="fa-solid fa-comment-dots"></i> Chat</button>
            <button class="button button-ghost" type="button" data-report-business="${escapeHtml(item.id)}">Report</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  function openAccommodationDetails(item) {
    const images = listingImages(item);
    const amenities = Array.isArray(item.amenities) ? item.amenities : [];
    const amenitiesHtml = amenities.length ? `
      <div>
        <h3 class="detail-subheading">Amenities</h3>
        <ul class="amenities-list">${amenities.map(a => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
      </div>` : "";

    const body = `
      ${buildGalleryHtml(images, item.title)}
      <div class="detail-topline">
        ${verificationBadge(item.verified)}
        <span class="card-badge" style="position:static;">${escapeHtml(item.roomType)}</span>
        ${reportWarning(item.id)}
      </div>
      <p class="price detail-price">${formatPrice(item.price)} <small>per month</small></p>
      <p>${escapeHtml(item.description)}</p>
      <ul class="card-meta">${locationLine(item)}${institutionTags(item)}</ul>
      ${amenitiesHtml}
      <div class="card-actions detail-actions">
        ${callWhatsapp(item)}
        <button class="button button-secondary" type="button" data-chat-business="${escapeHtml(item.id)}"><i class="fa-solid fa-comment-dots"></i> Chat with host</button>
        <button class="button button-ghost" type="button" data-report-business="${escapeHtml(item.id)}">Report</button>
      </div>
    `;
    openModal(item.title, body);
    wireThumbnails();
  }

  /* ============================================================
     TRANSPORT
     ============================================================ */
  function readTransportFilters() {
    const get = id => { const el = document.getElementById(id); return el ? el.value : ""; };
    return { campus: get("transport-campus"), province: get("transport-province"), town: get("transport-town") };
  }

  function renderTransport() {
    const grid = document.getElementById("transport-grid");
    if (!grid) return;
    const f = readTransportFilters();
    const items = getAllTransport().filter(item => {
      if (f.campus && (!Array.isArray(item.institutions) || !item.institutions.includes(f.campus))) return false;
      if (f.province && item.province !== f.province) return false;
      if (f.town && !String(item.town).toLowerCase().includes(f.town.toLowerCase())) return false;
      return true;
    });

    if (!items.length) {
      grid.innerHTML = `<p class="empty-state">No transport options match your search.</p>`;
      return;
    }

    grid.innerHTML = items.map((item, index) => `
      <article class="card" data-transport-id="${escapeHtml(item.id)}">
        <div class="card-media">
          <img src="${escapeHtml(listingImages(item)[0] || "")}" alt="${escapeHtml(item.title)}"
               loading="${index === 0 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" onerror="this.style.display='none'">
          <span class="card-badge">${escapeHtml(item.mode)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="card-status-row">${verificationBadge(item.verified)}${reportWarning(item.id)}</div>
          <p>${escapeHtml(item.description)}</p>
          <ul class="card-meta">
            ${locationLine(item)}
            ${institutionTags(item)}
            <li><i class="fa-regular fa-clock"></i> ${escapeHtml(item.frequency)}</li>
            <li><i class="fa-solid fa-stopwatch"></i> ${escapeHtml(item.duration)}</li>
          </ul>
          ${priceLine(item)}
          <div class="card-actions">
            <button class="button button-primary" type="button" data-view-listing="${escapeHtml(item.id)}">View details</button>
            <button class="button button-ghost" type="button" data-report-business="${escapeHtml(item.id)}">Report</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  function openTransportDetails(item) {
    const images = listingImages(item);
    const body = `
      ${buildGalleryHtml(images, item.title)}
      <div class="detail-topline">
        ${verificationBadge(item.verified)}
        <span class="card-badge" style="position:static;">${escapeHtml(item.mode)}</span>
        ${reportWarning(item.id)}
      </div>
      ${priceLine(item)}
      <p>${escapeHtml(item.description)}</p>
      <div>
        <h3 class="detail-subheading">Location &amp; route</h3>
        <ul class="card-meta">
          ${locationLine(item)}
          ${institutionTags(item)}
          ${item.route ? `<li><i class="fa-solid fa-signs-post"></i> ${escapeHtml(item.route)}</li>` : ""}
          ${item.frequency ? `<li><i class="fa-regular fa-clock"></i> ${escapeHtml(item.frequency)}</li>` : ""}
          ${item.duration ? `<li><i class="fa-solid fa-stopwatch"></i> ${escapeHtml(item.duration)}</li>` : ""}
          ${item.stops ? `<li><i class="fa-solid fa-map-pin"></i> ${escapeHtml(item.stops)}</li>` : ""}
        </ul>
      </div>
      <div class="card-actions detail-actions">
        ${callWhatsapp(item)}
        <button class="button button-secondary" type="button" data-chat-business="${escapeHtml(item.id)}"><i class="fa-solid fa-comment-dots"></i> Chat</button>
        <button class="button button-ghost" type="button" data-report-business="${escapeHtml(item.id)}">Report</button>
      </div>
    `;
    openModal(item.title, body);
    wireThumbnails();
  }

  /* ============================================================
     DEALS
     ============================================================ */
  function renderDeals() {
    const grid = document.getElementById("deals-grid");
    if (!grid) return;
    grid.innerHTML = getAllDeals().map((item, index) => `
      <article class="card" data-deal-id="${escapeHtml(item.id)}">
        <div class="card-media">
          <img src="${escapeHtml(listingImages(item)[0] || "")}" alt="${escapeHtml(item.title)}"
               loading="${index === 0 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" onerror="this.style.display='none'">
          <span class="card-badge">${escapeHtml(item.discount)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="card-status-row">${verificationBadge(item.verified)}${reportWarning(item.id)}</div>
          <p>${escapeHtml(item.description)}</p>
          <ul class="card-meta">
            ${locationLine(item)}
            ${institutionTags(item)}
            <li><i class="fa-solid fa-store"></i> ${escapeHtml(item.business)}</li>
            <li><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(item.expiry)}</li>
            ${item.code ? `<li><i class="fa-solid fa-key"></i> ${escapeHtml(item.code)}</li>` : ""}
          </ul>
          <div class="card-actions">
            <button class="button button-primary" type="button" data-view-listing="${escapeHtml(item.id)}">View deal</button>
            <button class="button button-ghost" type="button" data-report-business="${escapeHtml(item.id)}">Report</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  function openDealDetails(item) {
    const images = listingImages(item);
    const body = `
      ${buildGalleryHtml(images, item.title)}
      <div class="detail-topline">
        ${verificationBadge(item.verified)}
        <span class="card-badge" style="position:static;">${escapeHtml(item.discount)}</span>
        ${reportWarning(item.id)}
      </div>
      <p class="price detail-price">${escapeHtml(item.discount)}</p>
      <p>${escapeHtml(item.description)}</p>
      <div>
        <h3 class="detail-subheading">Deal details</h3>
        <ul class="card-meta">
          ${locationLine(item)}
          ${institutionTags(item)}
          <li><i class="fa-solid fa-store"></i> ${escapeHtml(item.business)}</li>
          <li><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(item.expiry)}</li>
          ${item.code ? `<li><i class="fa-solid fa-key"></i> Code: <strong>${escapeHtml(item.code)}</strong></li>` : ""}
        </ul>
        ${item.terms ? `<p class="small-note" style="margin-top:0.5rem;">${escapeHtml(item.terms)}</p>` : ""}
      </div>
      <div class="card-actions detail-actions">
        ${callWhatsapp(item)}
        <button class="button button-secondary" type="button" data-chat-business="${escapeHtml(item.id)}"><i class="fa-solid fa-comment-dots"></i> Chat</button>
        <button class="button button-ghost" type="button" data-report-business="${escapeHtml(item.id)}">Report</button>
      </div>
    `;
    openModal(item.title, body);
    wireThumbnails();
  }

  /* ============================================================
     BUSINESSES
     ============================================================ */
  function renderBusinesses() {
    const grid = document.getElementById("businesses-grid");
    if (!grid) return;

    const campus   = document.getElementById("biz-campus")?.value || "";
    const search   = (document.getElementById("biz-search")?.value || "").toLowerCase();
    const province = document.getElementById("biz-province")?.value || "";
    const verified = document.getElementById("biz-verified")?.value || "";

    const items = getAllBusinesses().filter(item => {
      if (campus && (!Array.isArray(item.institutions) || !item.institutions.includes(campus))) return false;
      if (search) {
        const hay = (item.title + " " + item.description + " " + item.category).toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (province && item.province !== province) return false;
      if (verified === "yes" && !item.verified) return false;
      if (verified === "no" && item.verified) return false;
      return true;
    });

    if (!items.length) {
      grid.innerHTML = `<p class="empty-state">No businesses match your search.</p>`;
      return;
    }

    const pendingEmails = new Set(
      readVerifications().filter(v => v.status === "pending").map(v => v.ownerEmail.toLowerCase())
    );

    grid.innerHTML = items.map((item, index) => {
      const pending = item.ownerEmail && pendingEmails.has(item.ownerEmail.toLowerCase())
        ? `<span class="verified-badge not-verified"><i class="fa-regular fa-clock"></i> Verification pending</span>`
        : "";
      return `
      <article class="card" data-business-id="${escapeHtml(item.id)}">
        <div class="card-media">
          <img src="${escapeHtml(item.image || "")}" alt="${escapeHtml(item.title)}"
               loading="${index === 0 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" onerror="this.style.display='none'">
          <span class="card-badge">${escapeHtml(item.category)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="card-status-row">${verificationBadge(item.verified)}${pending}${reportWarning(item.id)}</div>
          <p>${escapeHtml(item.description)}</p>
          <ul class="card-meta">${locationLine(item)}${institutionTags(item)}</ul>
          <div class="card-actions">
            <button class="button button-primary" type="button" data-view-listing="${escapeHtml(item.id)}">View details</button>
            ${callWhatsapp(item)}
            <button class="button button-secondary" type="button" data-chat-business="${escapeHtml(item.id)}"><i class="fa-solid fa-comment-dots"></i> Chat</button>
            <button class="button button-ghost" type="button" data-report-business="${escapeHtml(item.id)}">Report</button>
          </div>
        </div>
      </article>
    `;
    }).join("");
  }

  function openBusinessDetails(item) {
    const images = listingImages(item);
    const contactRows = [
      locationLine(item),
      institutionTags(item),
      item.phone    ? `<li><i class="fa-solid fa-phone"></i> ${escapeHtml(item.phone)}</li>`    : "",
      item.whatsapp ? `<li><i class="fa-brands fa-whatsapp"></i> ${escapeHtml(item.whatsapp)}</li>` : ""
    ].filter(Boolean).join("");

    const body = `
      ${buildGalleryHtml(images, item.title)}
      <div class="detail-topline">
        ${verificationBadge(item.verified)}
        <span class="card-badge" style="position:static;">${escapeHtml(item.category)}</span>
        ${reportWarning(item.id)}
      </div>
      <p>${escapeHtml(item.description)}</p>
      <div>
        <h3 class="detail-subheading">Contact &amp; location</h3>
        <ul class="card-meta">${contactRows}</ul>
      </div>
      <div class="card-actions detail-actions">
        ${callWhatsapp(item)}
        <button class="button button-secondary" type="button" data-chat-business="${escapeHtml(item.id)}"><i class="fa-solid fa-comment-dots"></i> Chat</button>
        <button class="button button-ghost" type="button" data-report-business="${escapeHtml(item.id)}">Report</button>
      </div>
    `;
    openModal(item.title, body);
    wireThumbnails();
  }

  /* ============================================================
     INFO POSTS
     ============================================================ */
  function renderInfoPosts() {
    const grid = document.getElementById("info-grid");
    if (!grid) return;
    const items = getAllInfoPosts().slice().sort((a, b) => b.createdAt - a.createdAt);
    if (!items.length) {
      grid.innerHTML = `<p class="empty-state">No student posts yet. Be the first to share something useful.</p>`;
      return;
    }
    grid.innerHTML = items.map((item, index) => `
      <article class="card" data-post-id="${escapeHtml(item.id)}">
        <div class="card-media">
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="${index === 0 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" onerror="this.style.display='none'">` : ""}
          <span class="card-badge">${escapeHtml(item.category)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          <ul class="card-meta">
            ${locationLine(item)}
            ${institutionTags(item)}
            <li><i class="fa-solid fa-user"></i> ${escapeHtml(item.authorName || "Student")}</li>
            <li><i class="fa-regular fa-clock"></i> ${escapeHtml(formatDate(item.createdAt))}</li>
          </ul>
          <div class="card-actions">
            <button class="button button-ghost" type="button" data-report-business="${escapeHtml(item.id)}">Report</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  /* ============================================================
     LATEST POSTS (HOME)
     ============================================================ */
  function renderLatestPosts() {
    const grid = document.getElementById("latest-posts-grid");
    if (!grid) return;
    const items = allListingsRaw()
      .filter(l => !isRemoved(l.id))
      .slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 3);

    if (!items.length) {
      grid.innerHTML = `<p class="empty-state">No new posts yet. Head to the <a class="text-link" href="businesses.html">Businesses page</a> to share the first one.</p>`;
      return;
    }

    const kindLabel = { business: "Business", info: "Student info", accommodation: "Accommodation", transport: "Transport", deal: "Deal" };
    const kindPage  = { business: "businesses.html", info: "businesses.html", accommodation: "accommodation.html", transport: "transport.html", deal: "discounts.html" };

    grid.innerHTML = items.map((item, index) => `
      <article class="card">
        <div class="card-media">
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="${index === 0 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" onerror="this.style.display='none'">` : ""}
          <span class="card-badge">${escapeHtml(kindLabel[item.kind] || "Post")}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          <ul class="card-meta">
            <li><i class="fa-solid fa-user"></i> ${escapeHtml(item.authorName || "Student")}</li>
            ${item.town ? `<li><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.town)}</li>` : ""}
            <li><i class="fa-regular fa-clock"></i> ${escapeHtml(formatDate(item.createdAt || Date.now()))}</li>
          </ul>
          <div class="card-actions">
            <a class="button button-primary" href="${kindPage[item.kind] || "index.html"}">View</a>
          </div>
        </div>
      </article>
    `).join("");
  }

  /* ============================================================
     LISTING DISPATCHER & CARD ACTIONS
     ============================================================ */
  function openListingDetails(id) {
    const item = findAnyListing(id);
    if (!item) return;
    switch (item.kind) {
      case "accommodation": return openAccommodationDetails(item);
      case "transport":     return openTransportDetails(item);
      case "deal":          return openDealDetails(item);
      case "business":      return openBusinessDetails(item);
      default:              return;
    }
  }
  function wireCardActions() {
    document.addEventListener("click", e => {
      const img = e.target.closest(".card-media img");
      if (img) { e.preventDefault(); openLightbox(img.src); return; }

      const viewBtn = e.target.closest("[data-view-listing]");
      if (viewBtn) { e.preventDefault(); openListingDetails(viewBtn.dataset.viewListing); return; }
      const chatBtn = e.target.closest("[data-chat-business]");
      if (chatBtn) { e.preventDefault(); openChatModal(chatBtn.dataset.chatBusiness); return; }
      const reportBtn = e.target.closest("[data-report-business]");
      if (reportBtn) { e.preventDefault(); openReportModal(reportBtn.dataset.reportBusiness); }
    });
  }

  /* ============================================================
     CHAT MODAL
     ============================================================ */
  function openChatModal(businessId) {
    const business = findAnyListing(businessId);
    if (!business) return;
    const user = currentUser();
    if (!user) { alert("Please log in to chat."); return; }

    const body = `
      <div class="chat-window" id="chat-window"></div>
      <form id="chat-form" class="chat-compose">
        <input type="text" id="chat-input" autocomplete="off" placeholder="Type a message…" required>
        <button class="button button-primary" type="submit">Send</button>
      </form>
      <p class="small-note" style="margin:0;">
        ${business.phone
          ? `Prefer to talk? Call <a class="text-link" href="tel:${escapeHtml(sanitizePhone(business.phone))}">${escapeHtml(business.phone)}</a>.`
          : "The host hasn't shared a phone number yet."}
      </p>
    `;
    openModal(`Chat · ${business.title}`, body);

    const windowEl = document.getElementById("chat-window");
    const formEl   = document.getElementById("chat-form");
    const inputEl  = document.getElementById("chat-input");

    function paint() {
      const msgs = readMessages().filter(m => m.businessId === businessId).sort((a, b) => a.createdAt - b.createdAt);
      if (!msgs.length) {
        windowEl.innerHTML = `<p class="chat-empty"><i class="fa-solid fa-hand-wave"></i>No messages yet. Say hello!</p>`;
        return;
      }
      windowEl.innerHTML = msgs.map(m => {
        const mine = m.fromEmail.toLowerCase() === user.email.toLowerCase();
        return `<div class="chat-message ${mine ? "me" : "them"}">
          <span>${escapeHtml(m.body)}</span>
          <small>${mine ? "You" : escapeHtml(m.fromName || "Them")} · ${escapeHtml(formatDate(m.createdAt))}</small>
        </div>`;
      }).join("");
      windowEl.scrollTop = windowEl.scrollHeight;
    }

    formEl.addEventListener("submit", e => {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;
      const msgs = readMessages();
      msgs.push({ id: uid("msg"), businessId, fromEmail: user.email, fromName: user.name, body: text, createdAt: Date.now() });
      writeMessages(msgs);
      inputEl.value = "";
      paint();
    });

    paint();
    inputEl.focus();
  }

  /* ============================================================
     REPORT MODAL
     ============================================================ */
  function openReportModal(targetId) {
    const business = findAnyListing(targetId);
    if (!business) return;
    const user = currentUser();
    if (!user) { alert("Please log in to report."); return; }

    const options = REPORT_REASONS.map(r => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("");

    const body = `
      <form id="report-form" class="auth-form" novalidate>
        <p class="small-note" style="margin:0;">Reporting <strong>${escapeHtml(business.title)}</strong>. Your report keeps Stud House safe.</p>
        <div class="field">
          <label for="report-reason">Reason</label>
          <select id="report-reason">${options}</select>
        </div>
        <div class="field">
          <label for="report-notes">Notes (optional)</label>
          <textarea id="report-notes" rows="3" placeholder="Anything else we should know?"></textarea>
        </div>
        <p class="auth-message" id="report-message" role="status"></p>
        <button class="button button-primary" type="submit">Submit report</button>
      </form>
    `;
    openModal("Report content", body);

    document.getElementById("report-form").addEventListener("submit", e => {
      e.preventDefault();
      const reason = document.getElementById("report-reason").value;
      const notes  = document.getElementById("report-notes").value.trim();
      const message = document.getElementById("report-message");

      const reports = readReports();
      reports.push({ id: uid("rep"), businessId: targetId, reason, notes, reporterEmail: user.email, createdAt: Date.now() });
      writeReports(reports);

      message.textContent = "Thank you — your report has been recorded.";
      message.style.color = "var(--color-success)";

      renderAccommodation();
      renderBusinesses();
      renderTransport();
      renderDeals();
      setTimeout(closeModal, 1200);
    });
  }

  /* ============================================================
     POST MODAL
     ============================================================ */
  function openPostModal(kind) {
    const user = currentUser();
    if (!user) { alert("Please log in to post."); return; }
    if (kind === "business" && user.role !== "business") {
      alert("Only business owners can post a business. Register as a business owner to use this feature.");
      return;
    }
    if (kind === "info" && user.role !== "student") {
      alert("Only students can share info. Register as a student to use this feature.");
      return;
    }

    const categoryOptions = (kind === "business" ? BUSINESS_CATEGORIES : INFO_CATEGORIES)
      .map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    const provinceOptions = PROVINCES.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join("");

    const extraFields = kind === "business" ? `
      <div class="field"><label for="post-phone">Phone number</label><input type="tel" id="post-phone" placeholder="+27 11 000 0000"></div>
      <div class="field"><label for="post-whatsapp">WhatsApp number (optional)</label><input type="tel" id="post-whatsapp" placeholder="+27 11 000 0000"></div>
    ` : "";

    const body = `
      <form id="post-form" class="auth-form" novalidate>
        <div class="field"><label for="post-title">Title</label><input type="text" id="post-title" placeholder="e.g. Corner Bean Café" required></div>
        <div class="field"><label for="post-category">Category</label><select id="post-category">${categoryOptions}</select></div>
        <div class="field"><label for="post-institution">Institution / campus</label>
          <select id="post-institution" data-institution-select><option value="">Any / not specified</option></select>
        </div>
        <div class="field"><label for="post-town">Town</label><input type="text" id="post-town" placeholder="e.g. Braamfontein" required></div>
        <div class="field"><label for="post-province">Province</label><select id="post-province">${provinceOptions}</select></div>
        <div class="field"><label for="post-description">Description</label><textarea id="post-description" rows="4" required></textarea></div>
        ${extraFields}
        <div class="field"><label for="post-image">Image URL (optional)</label><input type="text" id="post-image" placeholder="assets/my-image.jpg"></div>
        <p class="auth-message" id="post-message" role="status"></p>
        <button class="button button-primary" type="submit">Publish</button>
      </form>
    `;
    openModal(kind === "business" ? "Post your business" : "Share info", body);
    populateInstitutionSelect(document.getElementById("post-institution"));

    document.getElementById("post-form").addEventListener("submit", e => {
      e.preventDefault();
      const title       = document.getElementById("post-title").value.trim();
      const category    = document.getElementById("post-category").value;
      const institution = document.getElementById("post-institution").value;
      const town        = document.getElementById("post-town").value.trim();
      const province    = document.getElementById("post-province").value;
      const description = document.getElementById("post-description").value.trim();
      const image       = document.getElementById("post-image").value.trim();
      const message     = document.getElementById("post-message");

      if (!title || !town || !description) { message.textContent = "Please fill in title, town and description."; return; }

      const record = {
        id: uid(kind === "business" ? "biz" : "info"),
        kind, title, category, town, province, description, image,
        institutions: institution ? [institution] : [],
        ownerEmail: user.email, authorName: user.name, createdAt: Date.now()
      };
      if (kind === "business") {
        record.phone    = document.getElementById("post-phone").value.trim();
        record.whatsapp = document.getElementById("post-whatsapp").value.trim();
        record.verified = false;
      }

      const listings = readListings();
      listings.push(record);
      writeListings(listings);

      message.textContent = "Published!";
      message.style.color = "var(--color-success)";
      if (kind === "business") renderBusinesses(); else renderInfoPosts();
      setTimeout(closeModal, 800);
    });
  }

  /* ============================================================
     ABOUT US ENQUIRY
     ============================================================ */
  function wireAboutPage() {
    const form = document.getElementById("enquiry-form");
    if (!form) return;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name    = document.getElementById("enquiry-name").value.trim();
      const email   = document.getElementById("enquiry-email").value.trim();
      const subject = document.getElementById("enquiry-subject").value.trim();
      const message = document.getElementById("enquiry-message").value.trim();
      const status  = document.getElementById("enquiry-status");
      status.classList.remove("is-success", "is-error");

      if (!name || !email || !message) {
        status.textContent = "Please fill in your name, email and message.";
        status.classList.add("is-error");
        return;
      }
      const enquiries = readEnquiries();
      enquiries.push({ id: uid("enq"), name, email, subject, message, createdAt: Date.now() });
      writeEnquiries(enquiries);
      form.reset();
      status.textContent = "Thank you! Your enquiry has been received — we'll get back to you within one working day.";
      status.classList.add("is-success");
    });
  }

  /* ============================================================
     NAV
     ============================================================ */
  function setActiveNavLink() {
    const page = currentPageName();
    const dropBtn = document.querySelector(".nav-drop-btn");
    let isDropActive = false;

    document.querySelectorAll("#primary-links a").forEach(a => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      const finalHref = href.endsWith(".html") || href.includes("login") || href.includes("register") ? href : href + ".html";
      
      if (finalHref === page) {
        a.setAttribute("aria-current", "page");
        if (a.closest(".nav-dropdown-menu")) {
          isDropActive = true;
        }
      } else {
        a.removeAttribute("aria-current");
      }
    });

    if (dropBtn) {
      if (isDropActive) dropBtn.classList.add("is-active");
      else dropBtn.classList.remove("is-active");
    }
  }

  function addNavIcons() {
    document.querySelectorAll("#primary-links a").forEach(a => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      const icon = NAV_ICONS[href];
      if (icon && !a.querySelector("i")) {
        a.insertAdjacentHTML("afterbegin", `<i class="fa-solid ${icon}"></i> `);
      }
    });
  }

  function addAccountNavLinks() {
    const nav = document.getElementById("primary-links");
    if (!nav) return;
    const logout = document.getElementById("logout-link");
    const user = currentUser();

    if (user && !nav.querySelector(".nav-profile-link")) {
      const profileLink = document.createElement("a");
      profileLink.href = "profile.html";
      profileLink.className = "nav-profile-link";
      profileLink.innerHTML = '<i class="fa-solid fa-circle-user"></i> Profile';
      nav.insertBefore(profileLink, logout || null);
    }
    if (isAdmin() && !nav.querySelector(".nav-admin-link")) {
      const adminLink = document.createElement("a");
      adminLink.href = "admin.html";
      adminLink.className = "nav-admin-link";
      adminLink.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Admin';
      nav.insertBefore(adminLink, logout || null);
    }
  }

  function wireNav() {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks  = document.getElementById("primary-links");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(open));
      });
    }

    const dropBtn = document.querySelector(".nav-drop-btn");
    if (dropBtn) {
      dropBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropBtn.closest(".nav-dropdown").classList.toggle("is-open");
      });
    }

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-dropdown")) {
        document.querySelectorAll(".nav-dropdown").forEach(d => d.classList.remove("is-open"));
      }
    });

    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", e => {
        e.preventDefault();
        logOut();
        window.location.href = "login.html";
      });
    }
    
    addAccountNavLinks();
    addNavIcons();
    setActiveNavLink();
  }

  /* ============================================================
     LOGIN / REGISTER
     ============================================================ */
  function wireLoginPage() {
    const form = document.getElementById("login-form");
    if (!form) return;
    if (isLoggedIn()) { window.location.replace("index.html"); return; }

    const footer = document.querySelector(".login-footer");
    if (footer && !footer.dataset.adminHint) {
      footer.dataset.adminHint = "1";
      footer.insertAdjacentHTML("beforeend",
        `<br>Admin: <strong>${ADMIN_EMAIL}</strong> / <strong>${ADMIN_PASSWORD}</strong>` +
        `<br>Demo business: <strong>thabo@demo.com</strong> / <strong>demo123456</strong>`);
    }

    const adminQuickBtn = document.getElementById("admin-quick-btn");
    if (adminQuickBtn && !adminQuickBtn.dataset.wired) {
      adminQuickBtn.dataset.wired = "1";
      adminQuickBtn.addEventListener("click", () => {
        document.getElementById("email").value = ADMIN_EMAIL;
        document.getElementById("password").value = ADMIN_PASSWORD;
        const message = document.getElementById("login-message");
        message.classList.remove("is-error");
        message.classList.add("is-success");
        message.textContent = "Admin credentials loaded — click Log In to continue.";
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.focus();
      });
    }

    form.addEventListener("submit", e => {
      e.preventDefault();
      const email    = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const message  = document.getElementById("login-message");
      message.classList.remove("is-success");
      message.classList.add("is-error");
      if (!email || !password) { message.textContent = "Please enter your email and password."; return; }
      const user = readUsers().find(u =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) { message.textContent = "No account matches those details."; return; }
      message.textContent = "";
      logIn(user.email);
      window.location.href = user.role === "admin" ? "admin.html" : "index.html";
    });

    const forgotBtn = document.getElementById("forgot-password-btn");
    if (forgotBtn) forgotBtn.addEventListener("click", openForgotPasswordModal);
  }

  function wireRegisterPage() {
    const form = document.getElementById("register-form");
    if (!form) return;
    if (isLoggedIn()) { window.location.replace("index.html"); return; }
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name     = document.getElementById("name").value.trim();
      const email    = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const confirm  = document.getElementById("reg-confirm").value;
      const roleEl   = form.querySelector("input[name='role']:checked");
      const role     = roleEl ? roleEl.value : "student";
      const message  = document.getElementById("register-message");
      message.classList.add("is-error");
      if (!name || !email || !password) { message.textContent = "Please fill in every field."; return; }
      if (password.length < 6) { message.textContent = "Use a password with at least 6 characters."; return; }
      if (password !== confirm) { message.textContent = "The two passwords do not match."; return; }
      const users = readUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        message.textContent = "That email is already registered. Please log in."; return;
      }
      users.push({ id: uid("user"), name, email, password, role, createdAt: Date.now() });
      writeUsers(users);
      message.textContent = "";
      logIn(email);
      window.location.href = "index.html";
    });
  }

  /* ============================================================
     USER PROFILE
     ============================================================ */
  function updateCurrentUser(patch) {
    const email = currentEmail().toLowerCase();
    if (!email) return null;
    const users = readUsers();
    const user = users.find(u => u.email.toLowerCase() === email);
    if (!user) return null;
    Object.assign(user, patch);
    writeUsers(users);
    return user;
  }
  function avatarHtml(user, extraClass) {
    const cls = `profile-avatar ${extraClass || ""}`.trim();
    if (user.avatar) {
      return `<img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" class="${cls}">`;
    }
    const initials = String(user.name || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
    return `<span class="${cls} profile-avatar--initials" aria-hidden="true">${escapeHtml(initials)}</span>`;
  }
  function profileRoleLabel(role) {
    if (role === "business") return "Business owner";
    if (role === "admin") return "Administrator";
    return "Student";
  }
  function renderProfileHeader(user) {
    const el = document.getElementById("profile-header");
    if (!el) return;
    const since = user.createdAt ? formatDate(user.createdAt) : "—";
    el.innerHTML = `
      <div class="profile-header-inner">
        ${avatarHtml(user, "lg")}
        <div>
          <h2>${escapeHtml(user.name)}</h2>
          <p class="small-note">${escapeHtml(user.email)} · ${escapeHtml(profileRoleLabel(user.role))}</p>
          <p class="small-note">Member since ${escapeHtml(since)}</p>
        </div>
      </div>
    `;
  }
  function fillProfileForm(user) {
    const campusSelect = document.getElementById("profile-campus");
    if (campusSelect) { populateInstitutionSelect(campusSelect); campusSelect.value = user.campus || ""; }
    document.getElementById("profile-name").value = user.name || "";
    document.getElementById("profile-email").value = user.email || "";
    document.getElementById("profile-phone").value = user.phone || "";
    document.getElementById("profile-bio").value = user.bio || "";
    document.getElementById("profile-avatar-preview").innerHTML = avatarHtml(user, "md");
  }
  function renderProfileVerification(user) {
    const el = document.getElementById("profile-verification");
    if (!el) return;
    if (user.role !== "business") {
      el.innerHTML = `<h3>Business verification</h3><p class="small-note">Verification is only available to business owners.</p>`;
      return;
    }
    const requests = readVerifications()
      .filter(v => v.ownerEmail.toLowerCase() === user.email.toLowerCase())
      .sort((a, b) => b.submittedAt - a.submittedAt);
    const latest = requests[0];
    const myBusinesses = readListings().filter(l =>
      l.kind === "business" && l.ownerEmail && l.ownerEmail.toLowerCase() === user.email.toLowerCase());

    let status = `<span class="verified-badge not-verified"><i class="fa-solid fa-xmark"></i> Not verified</span>`;
    let extra = "", action = "";

    if (!latest) {
      if (!myBusinesses.length) extra = `<p class="small-note">Post a business first, then request verification.</p>`;
      else action = `<button class="button button-primary" type="button" data-request-verification><i class="fa-solid fa-shield-halved"></i> Request verification</button>`;
    } else if (latest.status === "pending") {
      status = `<span class="verified-badge not-verified"><i class="fa-regular fa-clock"></i> Pending review</span>`;
      extra = `<p class="small-note">Submitted ${escapeHtml(formatDate(latest.submittedAt))}. The admin team will review your ID details.</p>`;
    } else if (latest.status === "approved") {
      status = `<span class="verified-badge verified"><i class="fa-solid fa-check"></i> Verified</span>`;
      extra = `<p class="small-note">Your identity has been verified. Your business listings show the verified badge.</p>`;
    } else {
      status = `<span class="verified-badge not-verified"><i class="fa-solid fa-xmark"></i> Rejected</span>`;
      extra = `<p class="small-note">${latest.reviewNotes ? `Reason: ${escapeHtml(latest.reviewNotes)}` : "Your request was not approved."}</p>
        <button class="button button-primary" type="button" data-request-verification><i class="fa-solid fa-shield-halved"></i> Request again</button>`;
    }
    el.innerHTML = `<h3>Business verification</h3><div class="card-status-row" style="margin-bottom:0.75rem;">${status}</div>${extra}${action}`;
  }
  function renderProfileListings(user) {
    const el = document.getElementById("profile-listings");
    if (!el) return;
    const mine = readListings()
      .filter(l => l.ownerEmail && l.ownerEmail.toLowerCase() === user.email.toLowerCase())
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (!mine.length) {
      el.innerHTML = `<h3>My listings</h3><p class="empty-state">You have not posted anything yet.</p>`;
      return;
    }
    const kindLabel = { business: "Business", info: "Student info", accommodation: "Accommodation", transport: "Transport", deal: "Deal" };
    el.innerHTML = `
      <h3>My listings</h3>
      <ul class="profile-list">
        ${mine.map(l => {
          const verified = l.kind === "business" ? verificationBadge(!!l.verified) : "";
          const view = l.kind === "info"
            ? `<a class="button button-secondary" href="businesses.html">View</a>`
            : `<button class="button button-secondary" type="button" data-view-listing="${escapeHtml(l.id)}">View</button>`;
          return `<li class="profile-list-item">
            <div>
              <strong>${escapeHtml(l.title)}</strong>
              <p class="small-note">${escapeHtml(kindLabel[l.kind] || l.kind)}${l.town ? ` · ${escapeHtml(l.town)}` : ""}</p>
              <div class="card-status-row">${verified}</div>
            </div>${view}
          </li>`;
        }).join("")}
      </ul>
    `;
  }
  function renderProfileReports(user) {
    const el = document.getElementById("profile-reports");
    if (!el) return;
    const mine = readReports()
      .filter(r => r.reporterEmail && r.reporterEmail.toLowerCase() === user.email.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt);
    if (!mine.length) {
      el.innerHTML = `<h3>My reports</h3><p class="empty-state">You have not submitted any reports.</p>`;
      return;
    }
    el.innerHTML = `
      <h3>My reports</h3>
      <ul class="profile-list">
        ${mine.map(r => {
          const item = findAnyListingRaw(r.businessId);
          return `<li class="profile-list-item">
            <div>
              <strong>${escapeHtml(item ? item.title : r.businessId)}</strong>
              <p class="small-note">${escapeHtml(r.reason)} · ${escapeHtml(formatDate(r.createdAt))}</p>
            </div>
          </li>`;
        }).join("")}
      </ul>
    `;
  }
  function renderProfilePage() {
    if (!document.getElementById("profile-header")) return;
    const user = currentUser();
    if (!user) return;
    renderProfileHeader(user);
    fillProfileForm(user);
    renderProfileVerification(user);
    renderProfileListings(user);
    renderProfileReports(user);
  }
  function wireProfilePage() {
    const profileForm = document.getElementById("profile-form");
    const passwordForm = document.getElementById("password-form");
    if (!profileForm || !passwordForm) return;

    profileForm.addEventListener("submit", async e => {
      e.preventDefault();
      const user = currentUser();
      if (!user) return;
      const message = document.getElementById("profile-message");
      message.classList.remove("is-error", "is-success");
      const name = document.getElementById("profile-name").value.trim();
      if (!name) { message.textContent = "Your name is required."; message.classList.add("is-error"); return; }
      const phone = document.getElementById("profile-phone").value.trim();
      const campus = document.getElementById("profile-campus").value;
      const bio = document.getElementById("profile-bio").value.trim();
      const removeAvatar = document.getElementById("profile-remove-avatar").checked;
      const fileInput = document.getElementById("profile-avatar");
      const file = fileInput.files[0];

      let avatar = user.avatar || "";
      if (removeAvatar) avatar = "";
      if (file) {
        if (file.size > 500 * 1024) { message.textContent = "Please choose an image smaller than 500 KB."; message.classList.add("is-error"); return; }
        avatar = await readFileAsDataURL(file);
      }
      updateCurrentUser({ name, phone, campus, bio, avatar });

      const listings = readListings();
      let listingsChanged = false;
      listings.forEach(l => {
        if (l.ownerEmail && l.ownerEmail.toLowerCase() === user.email.toLowerCase() && l.authorName !== name) {
          l.authorName = name; listingsChanged = true;
        }
      });
      if (listingsChanged) writeListings(listings);
      const messages = readMessages();
      let messagesChanged = false;
      messages.forEach(m => {
        if (m.fromEmail && m.fromEmail.toLowerCase() === user.email.toLowerCase() && m.fromName !== name) {
          m.fromName = name; messagesChanged = true;
        }
      });
      if (messagesChanged) writeMessages(messages);

      fileInput.value = "";
      document.getElementById("profile-remove-avatar").checked = false;
      message.textContent = "Profile updated.";
      message.classList.add("is-success");
      renderProfilePage();
    });

    passwordForm.addEventListener("submit", e => {
      e.preventDefault();
      const user = currentUser();
      if (!user) return;
      const message = document.getElementById("password-message");
      message.classList.remove("is-error", "is-success");
      const current = document.getElementById("current-password").value;
      const newPw = document.getElementById("new-password").value;
      const confirm = document.getElementById("confirm-password").value;
      if (!current || !newPw || !confirm) { message.textContent = "Please fill in all password fields."; message.classList.add("is-error"); return; }
      if (user.password !== current) { message.textContent = "Your current password is incorrect."; message.classList.add("is-error"); return; }
      if (newPw.length < 6) { message.textContent = "Your new password must be at least 6 characters."; message.classList.add("is-error"); return; }
      if (newPw !== confirm) { message.textContent = "The new passwords do not match."; message.classList.add("is-error"); return; }
      updateCurrentUser({ password: newPw });
      passwordForm.reset();
      message.textContent = "Password updated successfully.";
      message.classList.add("is-success");
    });

    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-request-verification]");
      if (btn) { e.preventDefault(); openVerificationModal(); }
    });
    document.addEventListener("studhouse:verification-submitted", renderProfilePage);
  }

  /* ============================================================
     BUSINESS VERIFICATION
     ============================================================ */
  function openVerificationModal() {
    const user = currentUser();
    if (!user) { alert("Please log in to request verification."); return; }
    if (user.role !== "business") {
      alert("Only business owners can request verification. Register as a business owner first.");
      return;
    }
    const myListings = readListings().filter(l =>
      l.kind === "business" && l.ownerEmail && l.ownerEmail.toLowerCase() === user.email.toLowerCase());
    if (!myListings.length) { alert("Post your business first — then you can request verification."); return; }
    const pending = readVerifications().find(v =>
      v.ownerEmail.toLowerCase() === user.email.toLowerCase() && v.status === "pending");
    if (pending) { alert("You already have a verification request pending review."); return; }

    const businessOptions = myListings.map(l => `<option value="${escapeHtml(l.id)}">${escapeHtml(l.title)}</option>`).join("");

    const body = `
      <form id="verify-form" class="auth-form" novalidate>
        <p class="small-note" style="margin:0;">We check every business owner's identity before awarding a verified badge. Your details are only visible to the Stud House admin team.</p>
        <div class="field"><label for="verify-fullname">Full legal name (as on your ID)</label><input type="text" id="verify-fullname" value="${escapeHtml(user.name)}" required></div>
        <div class="field"><label for="verify-id">South African ID number</label><input type="text" id="verify-id" inputmode="numeric" maxlength="13" placeholder="e.g. 9001015800088" required></div>
        <div class="field"><label for="verify-dob">Date of birth</label><input type="date" id="verify-dob" required></div>
        <div class="field"><label for="verify-business">Business</label><select id="verify-business">${businessOptions}</select></div>
        <div class="field"><label for="verify-reg">Company registration number (optional)</label><input type="text" id="verify-reg" placeholder="e.g. 2019/123456/07"></div>
        <div class="field"><label for="verify-address">Business address</label><input type="text" id="verify-address" placeholder="Street, suburb, town" required></div>
        <div class="field"><label for="verify-phone">Contact phone</label><input type="tel" id="verify-phone" placeholder="+27 82 000 0000" required></div>
        <div class="field"><label for="verify-doc">Upload ID document (image or PDF, max 1.5 MB)</label><input type="file" id="verify-doc" accept="image/*,application/pdf"></div>
        <p class="auth-message" id="verify-message" role="status"></p>
        <button class="button button-primary" type="submit">Submit for verification</button>
      </form>
    `;
    openModal("Verify your business", body);

    document.getElementById("verify-form").addEventListener("submit", async e => {
      e.preventDefault();
      const msg = document.getElementById("verify-message");
      msg.textContent = "";
      const fullName = document.getElementById("verify-fullname").value.trim();
      const idNumber = document.getElementById("verify-id").value.trim();
      const dob = document.getElementById("verify-dob").value;
      const businessId = document.getElementById("verify-business").value;
      const business = myListings.find(l => l.id === businessId);
      const regNumber = document.getElementById("verify-reg").value.trim();
      const address = document.getElementById("verify-address").value.trim();
      const phone = document.getElementById("verify-phone").value.trim();
      const docInput = document.getElementById("verify-doc");
      const file = docInput.files[0];

      if (!fullName || !idNumber || !dob || !address || !phone) { msg.textContent = "Please complete all required fields."; return; }
      if (!isValidSAID(idNumber)) { msg.textContent = "Please enter a valid 13-digit South African ID number."; return; }
      if (!dobMatchesID(dob, idNumber)) { msg.textContent = "The date of birth does not match the first six digits of your ID number."; return; }
      if (regNumber && !/^\d{4}\/\d{6}\/\d{2}$/.test(regNumber)) { msg.textContent = "Company registration numbers look like 2019/123456/07."; return; }

      let idDocData = "", idDocName = "";
      if (file) {
        if (file.size > 1.5 * 1024 * 1024) { msg.textContent = "The ID document must be 1.5 MB or smaller."; return; }
        idDocName = file.name;
        idDocData = await readFileAsDataURL(file);
      }

      const verifs = readVerifications();
      verifs.push({
        id: uid("ver"), ownerEmail: user.email, ownerName: user.name,
        fullName, idNumber, dob, businessId, businessName: business ? business.title : "",
        regNumber, address, phone, idDocName, idDocData, status: "pending", submittedAt: Date.now()
      });
      writeVerifications(verifs);
      document.dispatchEvent(new CustomEvent("studhouse:verification-submitted"));
      msg.style.color = "var(--color-success)";
      msg.textContent = "Submitted! The admin team will review your details.";
      setTimeout(closeModal, 1500);
    });
  }

  /* ============================================================
     ADMIN DASHBOARD
     ============================================================ */
  function removeListing(id) {
    const removed = readRemovedIds();
    if (!removed.includes(id)) { removed.push(id); writeRemovedIds(removed); }
  }
  function restoreListing(id) {
    writeRemovedIds(readRemovedIds().filter(x => x !== id));
  }
  function clearReportsFor(id) {
    writeReports(readReports().filter(r => r.businessId !== id));
  }
  function approveVerification(id) {
    const verifs = readVerifications();
    const req = verifs.find(v => v.id === id);
    if (!req) return;
    req.status = "approved";
    req.reviewedAt = Date.now();
    writeVerifications(verifs);

    const listings = readListings();
    let changed = false;
    listings.forEach(l => {
      if (l.kind === "business" && l.ownerEmail && l.ownerEmail.toLowerCase() === req.ownerEmail.toLowerCase()) {
        l.verified = true; changed = true;
      }
    });
    if (changed) writeListings(listings);
    renderAdminPage();
  }
  function openRejectVerificationModal(id) {
    const body = `
      <form id="reject-form" class="auth-form" novalidate>
        <div class="field"><label for="reject-notes">Reason for rejection</label><textarea id="reject-notes" rows="3" placeholder="e.g. ID number does not match the uploaded document" required></textarea></div>
        <p class="auth-message" id="reject-message" role="status"></p>
        <button class="button button-primary" type="submit">Reject request</button>
      </form>
    `;
    openModal("Reject verification", body);
    document.getElementById("reject-form").addEventListener("submit", e => {
      e.preventDefault();
      const notes = document.getElementById("reject-notes").value.trim();
      if (!notes) { document.getElementById("reject-message").textContent = "Please give a reason."; return; }
      const verifs = readVerifications();
      const req = verifs.find(v => v.id === id);
      if (req) { req.status = "rejected"; req.reviewNotes = notes; req.reviewedAt = Date.now(); writeVerifications(verifs); }
      closeModal();
      renderAdminPage();
    });
  }
  function docPreview(v) {
    if (!v.idDocData) return `<p class="small-note">No document uploaded (${escapeHtml(v.idDocName || "none")}).</p>`;
    if (v.idDocData.startsWith("data:application/pdf")) {
      return `<a class="text-link" href="${v.idDocData}" target="_blank" rel="noopener"><i class="fa-solid fa-file-pdf"></i> View uploaded PDF (${escapeHtml(v.idDocName)})</a>`;
    }
    return `<img src="${v.idDocData}" alt="ID document for ${escapeHtml(v.fullName)}" class="admin-doc-preview" style="cursor:zoom-in;" onclick="openLightbox(this.src)">`;
  }
  function verificationCard(v, withActions) {
    const statusBadge =
      v.status === "pending"  ? `<span class="verified-badge not-verified"><i class="fa-regular fa-clock"></i> Pending</span>` :
      v.status === "approved" ? `<span class="verified-badge verified"><i class="fa-solid fa-check"></i> Approved</span>` :
                                `<span class="verified-badge not-verified"><i class="fa-solid fa-xmark"></i> Rejected</span>`;
    return `
      <article class="panel admin-card">
        <div class="admin-card-head"><h3>${escapeHtml(v.fullName)}</h3>${statusBadge}</div>
        <ul class="card-meta">
          <li><i class="fa-solid fa-envelope"></i> ${escapeHtml(v.ownerEmail)}</li>
          <li><i class="fa-solid fa-id-card"></i> ID: ${escapeHtml(v.idNumber)}</li>
          <li><i class="fa-solid fa-cake-candles"></i> DOB: ${escapeHtml(v.dob)}</li>
          <li><i class="fa-solid fa-briefcase"></i> ${escapeHtml(v.businessName || "—")}</li>
          ${v.regNumber ? `<li><i class="fa-solid fa-file-lines"></i> Reg: ${escapeHtml(v.regNumber)}</li>` : ""}
          <li><i class="fa-solid fa-phone"></i> ${escapeHtml(v.phone)}</li>
          <li><i class="fa-solid fa-location-dot"></i> ${escapeHtml(v.address)}</li>
          <li><i class="fa-regular fa-clock"></i> Submitted ${escapeHtml(formatDate(v.submittedAt))}</li>
        </ul>
        <div class="admin-doc">${docPreview(v)}</div>
        ${v.reviewNotes ? `<p class="small-note">Review notes: ${escapeHtml(v.reviewNotes)}</p>` : ""}
        ${withActions ? `
          <div class="card-actions">
            <button class="button button-primary" type="button" data-approve-verification="${escapeHtml(v.id)}"><i class="fa-solid fa-check"></i> Approve &amp; verify</button>
            <button class="button button-secondary" type="button" data-reject-verification="${escapeHtml(v.id)}"><i class="fa-solid fa-xmark"></i> Reject</button>
          </div>` : ""}
      </article>
    `;
  }
  function renderAdminStats() {
    const el = document.getElementById("admin-stats");
    if (!el) return;
    const pending  = readVerifications().filter(v => v.status === "pending").length;
    const reports  = readReports();
    const reported = new Set(reports.map(r => r.businessId)).size;
    const removed  = readRemovedIds().length;
    el.innerHTML = `
      <div class="panel stat-card"><span class="stat-value">${pending}</span><span class="stat-label">Pending verifications</span></div>
      <div class="panel stat-card"><span class="stat-value">${reports.length}</span><span class="stat-label">Total reports</span></div>
      <div class="panel stat-card"><span class="stat-value">${reported}</span><span class="stat-label">Reported listings</span></div>
      <div class="panel stat-card"><span class="stat-value">${removed}</span><span class="stat-label">Removed listings</span></div>
    `;
  }
  function renderAdminVerifications() {
    const el = document.getElementById("admin-verifications");
    if (!el) return;
    const all = readVerifications().sort((a, b) => b.submittedAt - a.submittedAt);
    if (!all.length) { el.innerHTML = `<p class="empty-state">No verification requests yet.</p>`; return; }
    const pending  = all.filter(v => v.status === "pending");
    const reviewed = all.filter(v => v.status !== "pending").slice(0, 5);
    el.innerHTML =
      (pending.length ? pending.map(v => verificationCard(v, true)).join("") : `<p class="empty-state">No pending verification requests.</p>`) +
      (reviewed.length ? `<h3 class="admin-subheading">Recently reviewed</h3>` + reviewed.map(v => verificationCard(v, false)).join("") : "");
  }
  function renderAdminReports() {
    const el = document.getElementById("admin-reports");
    if (!el) return;
    const reports = readReports().sort((a, b) => b.createdAt - a.createdAt);
    if (!reports.length) { el.innerHTML = `<p class="empty-state">No reports have been submitted.</p>`; return; }
    const groups = {};
    reports.forEach(r => { (groups[r.businessId] = groups[r.businessId] || []).push(r); });
    el.innerHTML = Object.keys(groups).map(id => {
      const list    = groups[id];
      const item    = findAnyListingRaw(id);
      const title   = item ? item.title : "Unknown listing";
      const removed = isRemoved(id);
      const priority = list.length >= 2
        ? `<span class="verified-badge not-verified" title="Reported more than once"><i class="fa-solid fa-fire"></i> Priority</span>`
        : "";
      const reasonCounts = {};
      list.forEach(r => { reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1; });
      const reasons = Object.entries(reasonCounts).map(([reason, n]) => `<li>${escapeHtml(reason)} ×${n}</li>`).join("");
      return `
        <article class="panel admin-card">
          <div class="admin-card-head">
            <h3>${escapeHtml(title)}</h3>
            <div class="card-status-row">
              ${priority}
              <span class="report-warning"><i class="fa-solid fa-triangle-exclamation"></i> ${list.length} report${list.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <p class="small-note" style="margin:0;">Listing ID: ${escapeHtml(id)}${removed ? " · <strong>removed</strong>" : ""}</p>
          <ul class="simple-list">${reasons}</ul>
          <details>
            <summary class="small-note">View individual reports</summary>
            <ul class="simple-list">
              ${list.map(r => `<li>${escapeHtml(r.reason)} — ${escapeHtml(r.reporterEmail)} · ${escapeHtml(formatDate(r.createdAt))}${r.notes ? ` — "${escapeHtml(r.notes)}"` : ""}</li>`).join("")}
            </ul>
          </details>
          <div class="card-actions">
            ${removed
              ? `<button class="button button-secondary" type="button" data-restore-listing="${escapeHtml(id)}"><i class="fa-solid fa-rotate-left"></i> Restore listing</button>`
              : `<button class="button button-primary" type="button" data-remove-listing="${escapeHtml(id)}"><i class="fa-solid fa-trash"></i> Remove listing</button>`}
            <button class="button button-ghost" type="button" data-clear-reports="${escapeHtml(id)}">Clear reports</button>
          </div>
        </article>
      `;
    }).join("");
  }
  function renderAdminRemoved() {
    const el = document.getElementById("admin-removed");
    if (!el) return;
    const ids = readRemovedIds();
    if (!ids.length) { el.innerHTML = `<p class="empty-state">No listings have been removed.</p>`; return; }
    el.innerHTML = ids.map(id => {
      const item = findAnyListingRaw(id);
      const meta = item ? `${item.kind} · ${item.town || ""} ${item.province || ""}`.trim() : "Unknown listing";
      return `<div class="panel admin-card admin-card-row">
        <div>
          <strong>${escapeHtml(item ? item.title : id)}</strong>
          <p class="small-note" style="margin:0;">${escapeHtml(meta)}</p>
        </div>
        <button class="button button-secondary" type="button" data-restore-listing="${escapeHtml(id)}"><i class="fa-solid fa-rotate-left"></i> Restore</button>
      </div>`;
    }).join("");
  }
  function renderAdminPage() {
    if (!document.getElementById("admin-stats")) return;
    renderAdminStats();
    renderAdminVerifications();
    renderAdminReports();
    renderAdminRemoved();
  }
  function wireAdminActions() {
    document.addEventListener("click", e => {
      const approve = e.target.closest("[data-approve-verification]");
      if (approve) { approveVerification(approve.dataset.approveVerification); return; }
      const reject = e.target.closest("[data-reject-verification]");
      if (reject) { openRejectVerificationModal(reject.dataset.rejectVerification); return; }
      const remove = e.target.closest("[data-remove-listing]");
      if (remove) { removeListing(remove.dataset.removeListing); renderAdminPage(); return; }
      const restore = e.target.closest("[data-restore-listing]");
      if (restore) { restoreListing(restore.dataset.restoreListing); renderAdminPage(); return; }
      const clear = e.target.closest("[data-clear-reports]");
      if (clear) { clearReportsFor(clear.dataset.clearReports); renderAdminPage(); return; }
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    seedAdmin();
    seedDemoData();
    wireNav();
    wireLoginPage();
    wireRegisterPage();
    wireCardActions();
    wireAboutPage();
    populateInstitutionSelects();

    const page = currentPageName();

    if (page === "admin.html") {
      if (!isLoggedIn()) { window.location.replace("login.html"); return; }
      if (!isAdmin())    { window.location.replace("index.html"); return; }
    } else if (page === "profile.html") {
      if (!isLoggedIn()) { window.location.replace("login.html"); return; }
    } else if (!PUBLIC_PAGES.includes(page) && !isLoggedIn()) {
      openGate();
    }

    if (page === "accommodation.html") {
      const form = document.getElementById("accommodation-filters");
      if (form) {
        form.addEventListener("submit", e => { e.preventDefault(); renderAccommodation(); });
        form.addEventListener("input",  renderAccommodation);
        form.addEventListener("change", renderAccommodation);
      }
      renderAccommodation();
    }
    if (page === "businesses.html") {
      const form = document.getElementById("businesses-filters");
      if (form) {
        form.addEventListener("submit", e => { e.preventDefault(); renderBusinesses(); });
        form.addEventListener("input",  renderBusinesses);
        form.addEventListener("change", renderBusinesses);
      }
      renderBusinesses();
      renderInfoPosts();
      const postBtn   = document.getElementById("post-business-btn");
      const infoBtn   = document.getElementById("post-info-btn");
      const verifyBtn = document.getElementById("verify-business-btn");
      if (postBtn)   postBtn.addEventListener("click", () => openPostModal("business"));
      if (infoBtn)   infoBtn.addEventListener("click", () => openPostModal("info"));
      if (verifyBtn) verifyBtn.addEventListener("click", openVerificationModal);
    }
    if (page === "transport.html") {
      const form = document.getElementById("transport-filters");
      if (form) {
        form.addEventListener("submit", e => { e.preventDefault(); renderTransport(); });
        form.addEventListener("input",  renderTransport);
        form.addEventListener("change", renderTransport);
      }
      renderTransport();
    }
    if (page === "discounts.html")  renderDeals();
    if (page === "index.html")      renderLatestPosts();
    if (page === "profile.html") { wireProfilePage(); renderProfilePage(); }
    if (page === "admin.html") { wireAdminActions(); renderAdminPage(); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();