$(document).ready(function () {
  $("#assinar").click(function () {
    var moagem = $("#moagem").val();
    $("#msg").text("Pronto! Sua assinatura com moagem "" + moagem + "" foi registrada. Você receberá um e-mail de confirmação.");
  });
  $(".menu-btn").click(function () { $("nav").toggle(); });
});
