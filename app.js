$(function () {
    function escapeHtml(value) {
        return $("<div>").text(value).html();
    }

    function showStatus(selector, message, type) {
        $(selector)
            .removeClass("is-success is-error")
            .addClass(type ? "is-" + type : "")
            .text(message)
            .show();
    }

    function loadEvents() {
        var eventList = $("#event-list");

        eventList.html('<p class="event-status">Memuat event dari server...</p>');

        $.ajax({
            url: "https://jsonplaceholder.typicode.com/posts",
            method: "GET",
            data: { _limit: 6 },
            dataType: "json"
        })
            .done(function (events) {
                var cards = $.map(events, function (event, index) {
                    var title = event.title.charAt(0).toUpperCase() + event.title.slice(1);
                    return (
                        '<article class="event-card">' +
                        '<span class="event-number">EVENT 0' + (index + 1) + "</span>" +
                        "<h3>" + escapeHtml(title) + "</h3>" +
                        "<p>" + escapeHtml(event.body) + "</p>" +
                        "</article>"
                    );
                }).join("");

                eventList.html(cards);
            })
            .fail(function () {
                eventList.html(
                    '<p class="event-status is-error">Event gagal dimuat. Periksa koneksi lalu coba lagi.</p>'
                );
            });
    }

    if ($("#event-list").length) {
        loadEvents();
        $("#reloadEvents").on("click", loadEvents);
    }

    $("#loginForm").on("submit", function (event) {
        event.preventDefault();

        var form = this;
        var button = $("#loginButton");
        var identifier = $("#identifier").val().trim();
        var password = $("#password").val();

        $("#identifierError, #passwordError").hide();
        if (!identifier || !password) {
            if (!identifier) $("#identifierError").show();
            if (!password) $("#passwordError").show();
            return;
        }

        button.prop("disabled", true).text("Memproses...");
        $.ajax({
            url: "https://dummyjson.com/auth/login",
            method: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                username: identifier,
                password: password,
                expiresInMins: 30
            })
        })
            .done(function (response) {
                showStatus(
                    "#loginStatus",
                    "Login berhasil. Selamat datang, " + (response.firstName || identifier) + "!",
                    "success"
                );
                form.reset();
            })
            .fail(function () {
                showStatus(
                    "#loginStatus",
                    "Login gagal. Untuk demo API, coba username emilys dan password emilyspass.",
                    "error"
                );
            })
            .always(function () {
                button.prop("disabled", false).text("Masuk");
            });
    });

    $("#registerForm").on("submit", function (event) {
        event.preventDefault();

        var form = this;
        var button = $("#registerButton");
        var password = $("#password").val();
        var confirmation = $("#konfirmasi_password").val();

        $(".error-text").hide();
        if (password !== confirmation) {
            $("#konfirmasiError").show();
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        button.prop("disabled", true).text("Mendaftarkan...");
        $.ajax({
            url: "https://dummyjson.com/users/add",
            method: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                firstName: $("#nama").val().trim(),
                email: $("#email").val().trim(),
                password: password,
                gender: $('input[name="jenis_kelamin"]:checked').val()
            })
        })
            .done(function (response) {
                showStatus(
                    "#registerStatus",
                    "Pendaftaran berhasil untuk " + response.firstName + ". Data demo telah dikirim ke API.",
                    "success"
                );
                form.reset();
            })
            .fail(function () {
                showStatus(
                    "#registerStatus",
                    "Pendaftaran gagal dikirim. Periksa koneksi internet lalu coba lagi.",
                    "error"
                );
            })
            .always(function () {
                button.prop("disabled", false).text("Daftar Sekarang");
            });
    });
});
