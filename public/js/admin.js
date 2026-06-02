(function () {
  "use strict";

  const API_BASE = window.RVG_API_BASE || "";
  const state = {
    loading: true,
    error: "",
    dashboard: null,
    vendors: [],
    services: [],
    bookings: [],
    contacts: [],
    reviews: [],
    gallery: { categories: [], images: [], services: [] },
    payments: [],
    users: [],
    quickPlanner: [],
  };

  const pages = [
    ["dashboard", "Dashboard", "bi-grid-1x2", "/admin-dashboard.html"],
    [
      "vendors",
      "Vendors",
      "bi-patch-check",
      "/admin-dashboard.html#vendorApprovals",
    ],
    ["services", "Services", "bi-gem", "/admin-services.html"],
    ["bookings", "Bookings", "bi-calendar-check", "/admin-bookings.html"],
    ["planner-leads", "Planner Leads", "bi-stars", "/admin-planner-leads.html"],
    ["gallery", "Gallery", "bi-images", "/admin-gallery.html"],
    [
      "contact-inquiries",
      "Contacts",
      "bi-envelope",
      "/admin-contact-inquiries.html",
    ],
    ["reviews", "Reviews", "bi-star", "/admin-reviews.html"],
    ["users", "Users", "bi-people", "/admin-users.html"],
    ["payments", "Payments", "bi-credit-card", "/admin-payments.html"],
    ["settings", "Settings", "bi-sliders", "/admin-settings.html"],
  ];

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[char],
    );
  }

  function money(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function statusClass(status) {
    const value = String(status || "").toLowerCase();
    if (
      [
        "approved",
        "accepted",
        "completed",
        "active",
        "closed",
        "resolved",
        "paid",
      ].includes(value)
    )
      return "good";
    if (
      ["rejected", "suspended", "cancelled", "failed", "inactive"].includes(
        value,
      )
    )
      return "bad";
    return "warn";
  }

  function statusPill(status) {
    return `<span class="status-pill ${statusClass(status)}">${escapeHtml(status || "pending")}</span>`;
  }

  function mediaUrl(value) {
    const image = String(value || "");
    if (image.startsWith("/uploads/")) return image;
    return image || "/og.svg";
  }

  function toast(message) {
    const node = $("#adminToast");
    if (!node || !window.bootstrap) return;
    node.querySelector(".toast-body").textContent = message;
    window.bootstrap.Toast.getOrCreateInstance(node, { delay: 2400 }).show();
  }

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers:
        options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" },
      ...options,
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.message || `Request failed: ${path}`);
    }
    return payload;
  }

  async function loadAdminData() {
    state.loading = true;
    state.error = "";
    renderLoading();
    try {
      const [
        dashboard,
        vendors,
        services,
        bookings,
        contacts,
        reviews,
        gallery,
        payments,
        users,
        quickPlanner,
      ] = await Promise.all([
        api("/api/admin/dashboard"),
        api("/api/admin/vendors"),
        api("/api/admin/services"),
        api("/api/admin/bookings"),
        api("/api/admin/contact-inquiries"),
        api("/api/admin/reviews"),
        api("/api/admin/gallery"),
        api("/api/admin/payments"),
        api("/api/admin/users"),
        api("/api/admin/quick-planner"),
      ]);
      state.dashboard = dashboard;
      state.vendors = vendors.vendors || [];
      state.services = services.services || [];
      state.bookings = bookings.bookings || [];
      state.contacts = contacts.inquiries || [];
      state.reviews = reviews.reviews || [];
      state.gallery = {
        categories: gallery.categories || [],
        images: gallery.images || [],
        services: gallery.services || [],
      };
      state.payments = payments.payments || [];
      state.users = users.users || [];
      state.quickPlanner = quickPlanner.leads || [];
    } catch (error) {
      state.error =
        error instanceof Error ? error.message : "Could not load admin data.";
    } finally {
      state.loading = false;
      renderAll();
    }
  }

  function renderLoading() {
    const loading = $("#loadingScreen");
    if (loading) loading.style.display = "grid";
    $all("[data-admin-status]").forEach((node) => {
      node.innerHTML = `<div class="admin-state"><div class="loader-ring"></div><p>Loading live MySQL data...</p></div>`;
    });
  }

  function renderError(container) {
    if (!state.error) return false;
    container.innerHTML = `
      <section class="admin-section glass-panel">
        <p class="eyebrow">Connection Error</p>
        <h2>Admin data could not load</h2>
        <p class="text-warning">${escapeHtml(state.error)}</p>
        <button class="btn gold-btn" id="retryAdminLoad" type="button"><i class="bi bi-arrow-clockwise"></i> Retry</button>
      </section>
    `;
    $("#retryAdminLoad")?.addEventListener("click", loadAdminData);
    return true;
  }

  function metricCards() {
    const metrics = state.dashboard?.metrics || {};
    const pendingVendors = state.vendors.filter(
      (vendor) => vendor.status === "pending",
    ).length;
    const pendingServices = state.services.filter(
      (service) => service.status === "pending",
    ).length;
    return [
      [
        "Total Vendors",
        metrics.vendors ?? state.vendors.length,
        "bi-building-check",
      ],
      ["Pending Vendors", pendingVendors, "bi-hourglass-split"],
      ["Total Services", metrics.services ?? state.services.length, "bi-gem"],
      ["Pending Services", pendingServices, "bi-clock-history"],
      [
        "Bookings",
        metrics.bookings ?? state.bookings.length,
        "bi-calendar-check",
      ],
      ["Contacts", metrics.contacts ?? state.contacts.length, "bi-envelope"],
      ["Reviews", metrics.reviews ?? state.reviews.length, "bi-star"],
    ]
      .map(
        ([label, value, icon]) => `
      <article class="stat-card">
        <i class="bi ${icon}"></i>
        <span>${label}</span>
        <strong>${escapeHtml(value)}</strong>
        <div class="mini-bars"><b style="height:35%"></b><b style="height:70%"></b><b style="height:48%"></b><b style="height:82%"></b></div>
      </article>
    `,
      )
      .join("");
  }

  function actionButton(label, cls, action, id, extra = "") {
    return `<button class="btn btn-sm gold-outline ${cls}" data-action="${action}" data-id="${escapeHtml(id)}" ${extra} type="button">${label}</button>`;
  }

  function renderVendors() {
    const rows = state.vendors
      .map(
        (vendor) => `
      <tr>
        <td><strong>${escapeHtml(vendor.business_name || "Vendor")}</strong><br><small>${escapeHtml(vendor.full_name || "")}</small></td>
        <td>${escapeHtml(vendor.email || "-")}<br><small>${escapeHtml(vendor.phone || "")}</small></td>
        <td>${escapeHtml(vendor.category || "-")}</td>
        <td>${escapeHtml(vendor.city || "-")}</td>
        <td>${statusPill(vendor.status)}</td>
        <td>
          <div class="row-actions">
            ${actionButton("Approve", "admin-action", "vendor:approved", vendor.id)}
            ${actionButton("Reject", "admin-action", "vendor:rejected", vendor.id)}
            ${actionButton("Suspend", "admin-action", "vendor:suspended", vendor.id)}
          </div>
        </td>
      </tr>
    `,
      )
      .join("");
    const table = $("#vendorApprovalRows");
    if (table) table.innerHTML = rows || emptyRow(6, "No vendors found.");
    return rows;
  }

  function renderServices() {
    const cards = state.services
      .map(
        (service) => `
      <article class="service-card">
        <img src="${escapeHtml(mediaUrl(service.cover_image || service.image))}" alt="${escapeHtml(service.service_name || service.name || "Service")}">
        <div class="card-pad">
          <div class="d-flex justify-content-between gap-2 align-items-start">
            <h3 class="h5">${escapeHtml(service.service_name || service.name || "Service")}</h3>
            ${statusPill(service.status)}
          </div>
          <p>${escapeHtml(service.category || "-")} · ${money(service.price)}</p>
          <p>${escapeHtml(service.description || "")}</p>
          <div class="row-actions mt-auto">
            ${actionButton("Approve", "admin-action", "service:approved", service.id)}
            ${actionButton("Reject", "admin-action", "service:rejected", service.id)}
            ${actionButton("Delete", "admin-action", "service:delete", service.id)}
          </div>
        </div>
      </article>
    `,
      )
      .join("");
    const grid = $("#serviceCards");
    if (grid) grid.innerHTML = cards || emptyPanel("No services found.");
    return cards;
  }

  function renderBookings() {
    const rows = state.bookings
      .map(
        (booking) => `
      <tr>
        <td>BKG-${escapeHtml(booking.id)}</td>
        <td><strong>${escapeHtml(booking.customer_name || booking.name || "Customer")}</strong><br><small>${escapeHtml(booking.customer_phone || booking.mobile || "")}</small></td>
        <td>${escapeHtml(booking.service_name || booking.business_name || (booking.event_type ? `${booking.event_type} Planner` : "-"))}</td>
        <td>${escapeHtml(booking.event_date || "-")}</td>
        <td>${money(booking.amount)}</td>
        <td>${statusPill(booking.status)}</td>
        <td>${actionButton("View", "admin-action", "details:booking", booking.id)}</td>
      </tr>
    `,
      )
      .join("");
    const table = $("#bookingRows");
    if (table) table.innerHTML = rows || emptyRow(7, "No bookings found.");
    return rows;
  }

  function renderContacts() {
    const rows = state.contacts
      .map(
        (contact) => `
      <tr>
        <td><strong>${escapeHtml(contact.name || "Contact")}</strong><br><small>${escapeHtml(contact.email || "")}</small></td>
        <td>${escapeHtml(contact.mobile || contact.phone || "-")}</td>
        <td>${escapeHtml(contact.message || "")}</td>
        <td>${statusPill(contact.status)}</td>
        <td>${escapeHtml(contact.created_at || "-")}</td>
        <td>${actionButton("Mark Resolved", "admin-action", "contact:closed", contact.id, `data-source="${escapeHtml(contact.source_table)}"`)}</td>
      </tr>
    `,
      )
      .join("");
    const table = $("#contactRows");
    if (table)
      table.innerHTML = rows || emptyRow(6, "No contact messages found.");
    return rows;
  }

  function renderReviews() {
    const cards = state.reviews
      .map(
        (review) => `
      <article class="review-card">
        <div class="d-flex justify-content-between gap-2">
          <strong>${escapeHtml(review.customer_name || "Customer")}</strong>
          ${statusPill(review.status)}
        </div>
        <div class="review-stars my-2">${"★".repeat(Math.max(1, Math.min(5, Number(review.rating || 5))))}</div>
        <p>${escapeHtml(review.feedback || review.review || "")}</p>
        <div class="row-actions mt-auto">
          ${actionButton("Approve", "admin-action", "review:approved", review.id, `data-source="${escapeHtml(review.source_table)}"`)}
          ${actionButton("Reject", "admin-action", "review:rejected", review.id, `data-source="${escapeHtml(review.source_table)}"`)}
        </div>
      </article>
    `,
      )
      .join("");
    const grid = $("#reviewCards");
    if (grid) grid.innerHTML = cards || emptyPanel("No reviews found.");
    return cards;
  }

  function renderGallery() {
    const tiles = state.gallery.images
      .map((image) => {
        const isVideo = Boolean(image.video_url);
        const thumb = image.image_url || image.image;
        return `
      <article class="gallery-tile">
        ${thumb ? `<img src="${escapeHtml(mediaUrl(thumb))}" alt="${escapeHtml(image.alt_text || image.title || (isVideo ? "Gallery video" : "Gallery image"))}">` : `<div class="gallery-tile-placeholder">${isVideo ? "Video item" : "No preview"}</div>`}
        <div class="gallery-actions">
          <span class="status-pill warn">${escapeHtml(isVideo ? "Video" : image.category_name || image.category || "Gallery")}</span>
          <span class="row-actions">
            ${actionButton("Edit", "admin-action", "gallery:edit", image.id)}
            ${actionButton("Delete", "admin-action", "gallery:delete", image.id)}
          </span>
        </div>
        ${isVideo ? `<div class="px-3 pb-3 text-xs text-cream/70">${escapeHtml(image.video_url)}</div>` : ""}
      </article>
    `;
      })
      .join("");
    const grid = $("#galleryGrid");
    if (grid) grid.innerHTML = tiles || emptyPanel("No gallery items found.");
    hydrateGalleryForms();
    return tiles;
  }

  function renderUsers() {
    const rows = state.users
      .map(
        (user) => `
      <tr>
        <td>${escapeHtml(user.name || "User")}</td>
        <td>${escapeHtml(user.email || "-")}</td>
        <td>${escapeHtml(user.phone || user.mobile || "-")}</td>
        <td>${escapeHtml(user.role || "customer")}</td>
        <td>-</td>
        <td>-</td>
        <td>${escapeHtml(user.created_at || "-")}</td>
        <td>${statusPill(user.status)}</td>
      </tr>
    `,
      )
      .join("");
    const table = $("#userRows");
    if (table) table.innerHTML = rows || emptyRow(9, "No users found.");
    return rows;
  }

  function renderPayments() {
    const rows = state.payments
      .map(
        (payment) => `
      <tr>
        <td>${escapeHtml(payment.transaction_id || `PAY-${payment.id}`)}</td>
        <td>${escapeHtml(payment.customer_name || payment.customer_email || "-")}</td>
        <td>${escapeHtml(payment.gateway || "manual")}</td>
        <td>${money(payment.amount)}</td>
        <td>${statusPill(payment.status)}</td>
      </tr>
    `,
      )
      .join("");
    const table = $("#transactionRows");
    if (table) table.innerHTML = rows || emptyRow(5, "No payments found.");
    const metrics = $("#paymentMetrics");
    if (metrics)
      metrics.innerHTML = `
      <div class="metric-row"><span>Total Payments</span><strong>${state.payments.length}</strong></div>
      <div class="metric-row"><span>Total Revenue</span><strong>${money(state.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0))}</strong></div>
    `;
  }

  function renderPlannerLeads() {
    const rows = state.quickPlanner
      .map((lead) => {
        let services = [];
        try {
          services = JSON.parse(lead.recommended_services || "[]");
        } catch {
          services = [];
        }
        const serviceText = services.length
          ? services
              .map(
                (service) =>
                  `${service.serviceName || service.category || "Service"} (${service.matchPercentage || 0}%)`,
              )
              .join(", ")
          : "-";
        return `
        <tr>
          <td><strong>${escapeHtml(lead.name || "Customer")}</strong><br><small>${escapeHtml(lead.email || "")}</small><br><small>${escapeHtml(lead.mobile || "")}</small></td>
          <td>${escapeHtml(lead.event_type || "-")}<br><small>${escapeHtml(lead.event_date || "-")} · ${escapeHtml(lead.city || "-")}</small><br><small>${escapeHtml(lead.guest_count || "-")} guests · ${escapeHtml(lead.budget || "-")}</small></td>
          <td>${escapeHtml(serviceText)}</td>
          <td><span class="status-pill good">${escapeHtml(lead.match_score || 0)}%</span><br><small>${escapeHtml(lead.recommended_package || "-")}</small></td>
          <td>${statusPill(lead.booking_status || "not_booked")}</td>
          <td>${statusPill(lead.lead_status || "new")}</td>
        </tr>
      `;
      })
      .join("");
    return rows || emptyRow(6, "No planner leads found.");
  }

  function hydratePlannerLeads() {
    const table = $("#plannerLeadRows");
    if (table) table.innerHTML = renderPlannerLeads();
  }

  function renderFullDashboard() {
    $("#overviewCards") && ($("#overviewCards").innerHTML = metricCards());
    $("#todayRevenue") &&
      ($("#todayRevenue").textContent = money(
        state.dashboard?.metrics?.revenue || 0,
      ));
    renderVendors();
    renderServices();
    renderBookings();
    hydratePlannerLeads();
    renderGallery();
    renderContacts();
    renderReviews();
    renderUsers();
    renderPayments();
    const loading = $("#loadingScreen");
    if (loading) loading.style.display = "none";
  }

  function simpleShell(active, title) {
    return `
      <aside class="rv-sidebar" id="rvSidebar">
        <div class="sidebar-brand"><span class="brand-mark small">RV</span><div><strong>Royal Vivah</strong><small>Luxury Admin</small></div></div>
        <nav class="sidebar-nav">
          ${pages.map(([key, label, icon, href]) => `<a class="${key === active ? "active" : ""}" href="${href}"><i class="bi ${icon}"></i> ${label}</a>`).join("")}
          <button id="logoutBtn" type="button"><i class="bi bi-box-arrow-right"></i> Logout</button>
        </nav>
      </aside>
      <div class="dashboard-main">
        <header class="topbar glass-panel">
          <button class="icon-btn d-xl-none" id="sidebarToggle" type="button" aria-label="Open menu"><i class="bi bi-list"></i></button>
          <div><p class="eyebrow mb-1">Royal Vivah Gardens</p><h1 class="simple-title">${escapeHtml(title)}</h1></div>
          <div class="topbar-actions"><span id="liveClock" class="clock-pill"></span><div class="admin-profile"><span>AV</span><div><strong>Admin</strong><small>Concierge Desk</small></div></div></div>
        </header>
        <main class="dashboard-content simple-content" id="simpleContent" data-admin-status></main>
      </div>
      <div class="toast-container position-fixed bottom-0 end-0 p-3"><div id="adminToast" class="toast luxury-toast"><div class="toast-body"></div></div></div>
      <div class="modal fade" id="detailModal" tabindex="-1"><div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content luxury-modal"><div class="modal-header"><h5 class="modal-title" id="detailTitle">Details</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div><div class="modal-body" id="detailBody"></div></div></div></div>
    `;
  }

  function renderSimplePage() {
    const active = document.body.dataset.adminPage;
    const page = pages.find(([key]) => key === active) || pages[0];
    const root = $("#simpleAdminRoot");
    if (!root) return;
    if (!root.dataset.ready) {
      root.innerHTML = simpleShell(page[0], page[1]);
      root.dataset.ready = "true";
      bindChrome();
    }
    const content = $("#simpleContent");
    if (!content || renderError(content)) return;
    content.innerHTML = pageContent(page[0]);
    bindActions();
    hydrateGalleryForms();
  }

  function pageContent(page) {
    if (page === "services")
      return section(
        "Services",
        "Approve, reject or delete vendor-created services.",
        `<div class="service-grid">${renderServices()}</div>`,
      );
    if (page === "gallery") return gallerySection();
    if (page === "contact-inquiries")
      return tableSection(
        "Contacts",
        "View messages and mark resolved.",
        ["Name", "Phone", "Message", "Status", "Created", "Actions"],
        renderContacts(),
      );
    if (page === "reviews" || page === "service-reviews")
      return section(
        "Reviews",
        "Approve or reject customer reviews.",
        `<div class="review-grid">${renderReviews()}</div>`,
      );
    if (page === "bookings")
      return tableSection(
        "Bookings",
        "Live booking requests.",
        ["Booking", "Client", "Service", "Date", "Amount", "Status", "Actions"],
        renderBookings(),
      );
    if (page === "planner-leads")
      return tableSection(
        "Planner Leads",
        "Smart planner matches, booking status and lead status.",
        [
          "Customer",
          "Event",
          "Recommended Services",
          "Match",
          "Booking Status",
          "Lead Status",
        ],
        renderPlannerLeads(),
      );
    if (page === "users")
      return tableSection(
        "Users",
        "Registered website users.",
        [
          "Name",
          "Email",
          "Phone",
          "Role",
          "Guests",
          "Budget",
          "Date",
          "Status",
        ],
        renderUsers(),
      );
    if (page === "payments")
      return tableSection(
        "Payments",
        "Payment records from MySQL.",
        ["Transaction", "Client", "Method", "Amount", "Status"],
        state.payments
          .map(
            (payment) => `
      <tr><td>${escapeHtml(payment.transaction_id || `PAY-${payment.id}`)}</td><td>${escapeHtml(payment.customer_name || payment.customer_email || "-")}</td><td>${escapeHtml(payment.gateway || "manual")}</td><td>${money(payment.amount)}</td><td>${statusPill(payment.status)}</td></tr>
    `,
          )
          .join("") || emptyRow(5, "No payments found."),
      );
    if (page === "settings")
      return section(
        "Settings",
        "Static admin settings are intentionally not persisted to duplicate tables.",
        `<p class="text-warning">Database-backed modules are active. No mock settings are stored.</p>`,
      );
    return section(
      "Dashboard",
      "Live MySQL overview.",
      `<div class="overview-grid">${metricCards()}</div>${tableMarkup(["Vendor", "Contact", "Category", "City", "Status", "Actions"], renderVendors())}`,
    );
  }

  function section(title, subtitle, body) {
    return `<section class="admin-section glass-panel"><p class="eyebrow">${escapeHtml(subtitle)}</p><h2>${escapeHtml(title)}</h2>${body}</section>`;
  }

  function tableSection(title, subtitle, headers, rows) {
    return section(title, subtitle, tableMarkup(headers, rows));
  }

  function tableMarkup(headers, rows) {
    return `<div class="table-responsive"><table class="table luxury-table align-middle"><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows || emptyRow(headers.length, "No records found.")}</tbody></table></div>`;
  }

  function gallerySection() {
    return section(
      "Gallery",
      "Upload, edit and delete gallery items.",
      `
      <form id="galleryUploadForm" class="settings-grid mb-4">
        <select class="luxury-input" name="category_id" required>${state.gallery.categories.map((cat) => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join("")}</select>
        <select class="luxury-input" name="service_id"><option value="">No service link</option>${state.gallery.services.map((service) => `<option value="${service.id}">${escapeHtml(service.service_name)}</option>`).join("")}</select>
        <input class="luxury-input" name="title" placeholder="Item title">
        <input class="luxury-input" name="alt_text" placeholder="Alt text">
        <input class="luxury-input" name="video_url" placeholder="Video URL (leave empty for images)">
        <label class="upload-box"><i class="bi bi-cloud-upload"></i><span>Upload images</span><input name="images[]" type="file" accept="image/*" multiple></label>
        <button class="btn gold-btn" type="submit"><i class="bi bi-upload"></i> Upload Content</button>
      </form>
      <div class="gallery-grid">${renderGallery()}</div>
    `,
    );
  }

  function emptyRow(colspan, message) {
    return `<tr><td colspan="${colspan}" class="text-center text-warning py-4">${escapeHtml(message)}</td></tr>`;
  }

  function emptyPanel(message) {
    return `<article class="admin-section glass-panel"><p class="text-warning mb-0">${escapeHtml(message)}</p></article>`;
  }

  function bindChrome() {
    $("#sidebarToggle")?.addEventListener("click", () =>
      $("#rvSidebar")?.classList.toggle("open"),
    );
    $("#logoutBtn")?.addEventListener("click", async () => {
      try {
        await api("/api/admin/logout", { method: "POST" });
      } catch (_error) {
        // ignore logout failures and continue to redirect
      }
      window.location.href = "/";
    });
    window.setInterval(() => {
      const clock = $("#liveClock");
      if (clock)
        clock.textContent = new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
    }, 1000);
  }

  function bindActions() {
    $all(".admin-action").forEach((button) => {
      button.addEventListener("click", async () => {
        const [type, value] = String(button.dataset.action || "").split(":");
        const id = button.dataset.id;
        const source = button.dataset.source;
        try {
          button.disabled = true;
          if (type === "vendor")
            await api(`/api/admin/vendors/${id}`, {
              method: "PATCH",
              body: JSON.stringify({ status: value }),
            });
          if (type === "service" && value !== "delete")
            await api(`/api/admin/services/${id}`, {
              method: "PATCH",
              body: JSON.stringify({ status: value }),
            });
          if (
            type === "service" &&
            value === "delete" &&
            confirm("Delete this service?")
          )
            await api(`/api/admin/services/${id}`, { method: "DELETE" });
          if (type === "contact")
            await api(`/api/admin/contact-inquiries/${source}/${id}`, {
              method: "PATCH",
              body: JSON.stringify({ status: value }),
            });
          if (type === "review")
            await api(`/api/admin/reviews/${source}/${id}`, {
              method: "PATCH",
              body: JSON.stringify({ status: value }),
            });
          if (
            type === "gallery" &&
            value === "delete" &&
            confirm("Delete this gallery image?")
          )
            await api(`/api/admin/gallery/images/${id}`, { method: "DELETE" });
          if (type === "gallery" && value === "edit")
            await editGalleryImage(id);
          if (type === "details") showDetails(value, id);
          toast("Admin action saved.");
          await loadAdminData();
        } catch (error) {
          toast(error instanceof Error ? error.message : "Action failed.");
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  async function editGalleryImage(id) {
    const image = state.gallery.images.find(
      (item) => String(item.id) === String(id),
    );
    if (!image) return;
    const title = prompt("Item title", image.title || "");
    if (title === null) return;
    const alt = prompt("Alt text", image.alt_text || title || "");
    if (alt === null) return;
    const videoUrl = prompt(
      "Video URL (leave empty if this is a photo)",
      image.video_url || "",
    );
    if (videoUrl === null) return;
    await api(`/api/admin/gallery/images/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title,
        alt_text: alt,
        video_url: videoUrl || null,
        category_id: image.category_id,
        service_id: image.service_id || null,
        status: image.status || "active",
        sort_order: image.sort_order || 0,
      }),
    });
  }

  function showDetails(type, id) {
    const record =
      type === "booking"
        ? state.bookings.find((item) => String(item.id) === String(id))
        : null;
    $("#detailTitle") && ($("#detailTitle").textContent = "Record Details");
    $("#detailBody") &&
      ($("#detailBody").innerHTML =
        `<pre class="text-warning mb-0">${escapeHtml(JSON.stringify(record, null, 2))}</pre>`);
    const modal = $("#detailModal");
    if (modal && window.bootstrap)
      window.bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  function hydrateGalleryForms() {
    const uploadForm = $("#galleryUploadForm");
    if (uploadForm && !uploadForm.dataset.bound) {
      uploadForm.dataset.bound = "true";
      uploadForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
          await api("/api/admin/gallery/images", {
            method: "POST",
            body: new FormData(uploadForm),
          });
          uploadForm.reset();
          toast("Gallery images uploaded.");
          await loadAdminData();
        } catch (error) {
          toast(error instanceof Error ? error.message : "Upload failed.");
        }
      });
    }

    const legacyUpload = $("#galleryUpload");
    if (legacyUpload && !legacyUpload.dataset.bound) {
      legacyUpload.dataset.bound = "true";
      legacyUpload.addEventListener("change", async () => {
        const category = state.gallery.categories[0];
        if (!category || !legacyUpload.files.length) return;
        const form = new FormData();
        form.set("category_id", String(category.id));
        Array.from(legacyUpload.files).forEach((file) =>
          form.append("images[]", file),
        );
        try {
          await api("/api/admin/gallery/images", {
            method: "POST",
            body: form,
          });
          legacyUpload.value = "";
          toast("Gallery images uploaded.");
          await loadAdminData();
        } catch (error) {
          toast(error instanceof Error ? error.message : "Upload failed.");
        }
      });
    }
  }

  function renderAll() {
    if (document.body.classList.contains("admin-simple-page")) {
      renderSimplePage();
    } else if (document.body.classList.contains("dashboard-page")) {
      if (state.error) {
        const loading = $("#loadingScreen");
        if (loading) loading.style.display = "none";
        const overview = $("#overviewCards");
        if (overview) {
          overview.innerHTML = `<article class="admin-section glass-panel" style="grid-column:1/-1"><p class="eyebrow">Connection Error</p><h2>Admin data could not load</h2><p class="text-warning">${escapeHtml(state.error)}</p><button class="btn gold-btn" id="retryAdminLoad" type="button"><i class="bi bi-arrow-clockwise"></i> Retry</button></article>`;
          $("#retryAdminLoad")?.addEventListener("click", loadAdminData);
        }
      } else {
        renderFullDashboard();
      }
      bindChrome();
      bindActions();
    }
  }

  function initLogin() {
    const form = $("#adminLoginForm");
    if (!form) return false;
    $(".password-toggle")?.addEventListener("click", () => {
      const password = $("#adminPassword");
      if (password)
        password.type = password.type === "password" ? "text" : "password";
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = $("#adminEmail")?.value.trim();
      const password = $("#adminPassword")?.value;
      const remember = $("#rememberAdmin")?.checked || false;

      try {
        await api("/api/admin/login", {
          method: "POST",
          body: JSON.stringify({ email, password, remember }),
        });
        window.location.href = "/admin-dashboard.html";
      } catch (error) {
        const alert = $("#loginAlert");
        if (alert) {
          alert.textContent =
            error instanceof Error
              ? error.message
              : "Invalid admin credentials.";
          alert.classList.remove("d-none");
        }
      }
    });
    return true;
  }

  async function verifyAdmin() {
    try {
      await api("/api/admin/verify");
      return true;
    } catch {
      return false;
    }
  }

  async function initAdmin() {
    if (initLogin()) return;
    const hasAccess = await verifyAdmin();
    if (!hasAccess) {
      window.location.href = "/admin-login.html";
      return;
    }
    bindChrome();
    loadAdminData();
  }

  document.addEventListener("DOMContentLoaded", initAdmin);
})();
