let login_holder = document.getElementById("login-holder");
let header = document.getElementById("header");
let login_in_button = document.getElementById("log-in-button");
let create_account_button = document.getElementById("create-account-button");
let username_input = document.getElementById("username");
let password_input = document.getElementById("password");
let confirm_password = document.getElementById("confirm-password");
let confirm_password_guide = document.getElementById("confirm-password-guide");

let type = "login";

function switch_type() {
    if(type == "login") {
        type = "signUp";

        login_holder.style.height = "390px";
        header.innerText = "AudioCity: Sign Up";
        login_in_button.innerText = "Sign Up";
        create_account_button.innerText = "Login";
        confirm_password.hidden = false;
        confirm_password_guide.hidden = false;

        return;
    }

    type = "login";

    login_holder.style.height = "300px";
    header.innerText = "AudioCity: Login";
    login_in_button.innerText = "Login";
    create_account_button.innerText = "Create Account";
    confirm_password.hidden = true;
    confirm_password_guide.hidden = true;
}

async function login_signup() {
    if(type == "login") {
        let result = await (await fetch(`/userLogin?username=${username_input.value}&password=${password_input.value}`)).text();

        if(result == "true") {
            // This is supposed to be self hosted, so I am not as worried about the login password.
            // I could spend more time, but thats not worth it on this type of thing.
            localStorage.setItem("user", username_input.value);

            return window.location.href = "/";
        }

        login_in_button.innerText = result;


        return false;
    }

    let username = username_input.value;
    let password = password_input.value;
    let confirmed_password = confirm_password.value;

    if(password !== confirmed_password) return login_in_button.innerText = "Password must be the same";

    let result = await (await fetch(`/createUser?username=${username}&password=${password}`)).text();

    if(result == "Successfully created user!") {
        return switch_type();
    }

    return login_in_button.innerText = result;
}
