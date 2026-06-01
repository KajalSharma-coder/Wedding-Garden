(function ($) {
  "use strict";

  function showToast(message, ok) {
    var id = "toast-" + Date.now();
    var html = '<div id="' + id + '" class="toast align-items-center border-0 ' + (ok ? 'text-bg-success' : 'text-bg-danger') + '" role="alert"><div class="d-flex"><div class="toast-body">' + escapeHtml(message) + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>';
    $(".toast-container").append(html);
    var el = document.getElementById(id);
    new bootstrap.Toast(el, { delay: 3800 }).show();
    el.addEventListener("hidden.bs.toast", function () { el.remove(); });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
    });
  }

  function statusPill(status) {
    return '<span class="status-pill status-' + escapeHtml(status) + '">' + escapeHtml(status) + '</span>';
  }

  function submitAjax($form, done) {
    var button = $form.find("[type=submit]").first();
    var original = button.html();
    button.prop("disabled", true).html("Please wait...");
    $.ajax({
      url: $form.attr("action"),
      method: "POST",
      data: new FormData($form[0]),
      processData: false,
      contentType: false,
      dataType: "json"
    }).done(function (res) {
      showToast(res.message || "Saved successfully.", !!res.ok);
      if (res.redirect) window.location.href = res.redirect;
      if (done) done(res);
    }).fail(function (xhr) {
      var msg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : "Something went wrong.";
      showToast(msg, false);
    }).always(function () {
      button.prop("disabled", false).html(original);
    });
  }

  window.RVG = { showToast: showToast, escapeHtml: escapeHtml, statusPill: statusPill, submitAjax: submitAjax };

  $(document).on("submit", "[data-ajax-form]", function (event) {
    event.preventDefault();
    submitAjax($(this), function (res) {
      if (res.ok && event.target.dataset.reset !== "false") {
        event.target.reset();
      }
    });
  });

  $(document).on("click", "[data-section]", function () {
    var section = $(this).data("section");
    $("[data-section]").removeClass("active");
    $(this).addClass("active");
    $(".dashboard-section").addClass("d-none");
    $("#" + section).removeClass("d-none");
    localStorage.setItem("rvgVendorSection", section);
  });

  $(function () {
    var saved = localStorage.getItem("rvgVendorSection");
    if (saved && $("#" + saved).length) {
      $('[data-section="' + saved + '"]').trigger("click");
    }
  });
})(jQuery);
