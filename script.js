var reader = new commonmark.Parser({smart: true});
var writer = new commonmark.HtmlRenderer({softbreak: "<br />", safe: true});
let user;
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
    fetch('.netlify/functions/check-if-signed?email=' + user.email + '&name=' + user.user_metadata.full_name)
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
    document.getElementById("comment-login").style.display = 'none';
    document.querySelector("form[name='comments-queue']").style.display = 'inline';
}
function loggedOut() {
    document.getElementById("sign-petition").style.display = 'none';
    document.getElementById("signin-btn").style.display = 'inline';
    document.getElementById("alreadySigned").style.display = 'none';
    document.getElementById("comment-login").style.display = 'inline';
    document.querySelector("form[name='comments-queue']").style.display = 'none';

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
const commentSubmit = (e) => {
    e.preventDefault()
    let form = document.querySelector("form[name='comments-queue'")
    let formData = new FormData(form)
    let date = new Date()
    formData.set("name",user.user_metadata.full_name);
    formData.set("email",user.email);
    formData.set("date", date.toDateString())
    fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    }).then((response) => {
        if (response.status >= 400 && response.status < 600) {
            throw new Error(response.status);
        }
        alert.classList.remove("bg-danger");
        alert.classList.add("bg-success");
        document.getElementById("toast-body").innerHTML = "Comment successfully submitted!"
        toast = new bootstrap.Toast(alert);
        toast.show();
        grabComments();
    }).catch((error) => {
        alert.classList.remove("bg-success")
        alert.classList.add("bg-danger")
        document.getElementById("toast-body").innerHTML = "An error occured: " + error;
        toast = new bootstrap.Toast(alert);
        toast.show();
        console.log(error);
    })
}

class CommentElement extends HTMLElement{
    constructor() {
        super();
    }
    connectedCallback() {
        var parsed = reader.parse(`### ${this.getAttribute("name")} \n ##### ${this.getAttribute("date")} \n ___ \n ${this.innerText}`);
        let div;
        this.innerHTML = `<div>${writer.render(parsed)}</div>`
        div = this.children[0]
        div.style.backgroundColor = "#ffffff75";
        div.style.borderRadius = "5px";
        div.style.borderStyle = "solid";
        div.style.padding = "1rem";
        div.style.marginBottom = "1rem";
    }
}
customElements.define("comment-message", CommentElement)

function grabComments() {
    
    fetch('.netlify/functions/commentgrabber')
    .then(response => response.text())
    .then(data => {
        const removeChilds = (parent) => {
            while (parent.lastChild) {
                parent.removeChild(parent.lastChild);
            }
        };
        let commentDiv = document.getElementById("comments")
        removeChilds(commentDiv)
        comments = JSON.parse(data);
        comments.forEach(element => {
            let commentEl = document.createElement('comment-message',{ is : 'comment-message' })
            commentEl.setAttribute('name',element.data.name)
            commentEl.setAttribute('date', element.data.date)
            let body = element.body
            body = body.replace(/(?:\r\n|\r|\n)/g, '\n ');
            commentEl.innerText = body;
            commentDiv.appendChild(commentEl);
        })
    })
    .catch(error => {
        console.log(error);
    })

};

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
    document.querySelector("form[name='comments-queue']").addEventListener("submit", commentSubmit);
    grabComments();
});

netlifyIdentity.on('login', user => loggedIn());
netlifyIdentity.on('logout', user => loggedOut());
