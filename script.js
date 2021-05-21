let signers;
let alreadySigned;
var alert = document.querySelector("[role='alert']")
let toast;
netlifyIdentity.on('login', user => loggedIn());
netlifyIdentity.on('logout', user => loggedOut());

function loggedIn() {
    netlifyIdentity.open();
    user = netlifyIdentity.currentUser();
    document.getElementById("signin-btn").style.display = 'none';
    fetch('.netlify/functions/check-if-signed?email=' + user.email + '&name=' + user.user_metadata)
    .then(response => response.text())
    .then(data => {
        alreadySigned = data;
        if (alreadySigned == "true") {
            document.getElementById("alreadySigned").style.display = 'inline';
            document.getElementById("sign-petition").style.display = 'none';
        } else {
            document.getElementById("alreadySigned").style.display = 'none';
            document.getElementById("sign-petition").style.display = 'inline';    
        }
    });
}
function loggedOut() {
    document.getElementById("sign-petition").style.display = 'none';
    document.getElementById("signin-btn").style.display = 'inline';
    document.getElementById("alreadySigned").style.display = 'none';
}
function encode(data) {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&")
  }
function sign() {
    if(alreadySigned == "true") { 
        alert.classList.remove("bg-success")
        alert.classList.add("bg-danger")
        document.getElementById("toast-body").innerHTML = "An error occured: 403 Forbidden - You already signed this petition";
        toast = new bootstrap.Toast(alert);
        toast.show();
        throw new Error ("403: Forbidden - You already signed this petition.");
    }
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "petition",
          "name": user.user_metadata.full_name,
          "email": user.email
        })
      }).then(response => {
          if (response.status >= 400 && response.status < 600) {
            throw new Error(response.status);
          }
          alert.classList.remove("bg-danger");
          alert.classList.add("bg-success");
          document.getElementById("toast-body").innerHTML = "Thank you for signing this petition!"
          toast = new bootstrap.Toast(alert);
          toast.show();
          document.getElementById("alreadySigned").style.display = 'inline';
          document.getElementById("sign-petition").style.display = 'none';
          signers = Number(signers)
          signers = signers + 1;
          signers = String(signers);
          document.getElementById("signers").innerHTML = signers;

        }).catch(error => {
            alert.classList.remove("bg-success")
            alert.classList.add("bg-danger")
            document.getElementById("toast-body").innerHTML = "An error occured: " + error;
            toast = new bootstrap.Toast(alert);
            toast.show();
        })
}

document.addEventListener('DOMContentLoaded', (event) => {
    user = netlifyIdentity.currentUser();
    if (user == null) {
        loggedOut();        
    } else {
        loggedIn();
    }
    fetch('.netlify/functions/submissiongrabber')
    .then(response => response.text())
    .then(data => {
        signers = data;
        document.getElementById("signers").innerHTML = signers;

    });
});

netlifyIdentity.on('login', user => loggedIn());
netlifyIdentity.on('logout', user => loggedOut());
