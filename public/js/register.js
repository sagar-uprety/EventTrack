
var checkbox=document.querySelector("#check");
var ability=document.querySelector("#submit");
ability.disabled=true;

//Password Check
function checkPassword(){
    var password=document.querySelector("#password").value;
    var retyped=document.querySelector("#retype").value;
    var validity=document.querySelector("#invalid-password");
    if(password===retyped) {
        validity.innerHTML="Your Password has matched.";
        validity.classList.add("valid");
        return true;
    }
    else{
        validity.innerHTML="*Sorry, Your Passwords does not match.";
        validity.classList.add("invalid");
        return false;
    }
}

//Password Visibility
function showPassword() {
    var password=document.querySelector("#password");
    if(password.type==="password") {
        password.type="text";
    }
    else {
        password.type="password";
    }
}

//Password Validity
function passwordValidity() {
    var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    var password=document.querySelector("#password").value;

    if(password.match(passw))
    {
        return true;
    }
    else{
        return false;
    }
}

//Email validation
function event() {
    var email = document.querySelector("#email").value;
      if (validateEmail(email)) {
        return true;
      } else {
        return false;
      }
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

//Sex
function sex(){
    var radio=document.getElementsByName("radio");
    var sex=document.getElementById("sex")
    for(var i=0;i<radio.length;i++){
        if(radio[i].checked){
            sex.value=radio[i].value;
        }
    }
}
//Terms and Conditions
function terms() {

    if(checkbox.checked !=true){
        ability.disabled=true;
    }
    else {
        ability.disabled=false;
    }
}

//file upload
  
const fileInput = document.querySelector("#avatar-upload input[type=file]");
    fileInput.onchange = () => {
      if (fileInput.files.length > 0) {
        const fileName = document.querySelector("#avatar-upload .file-name");
        fileName.textContent = fileInput.files[0].name;
      }
    };
//Check Information
function checkInfo() {
    if(checkPassword()!=true) {
        alert("Your passwords does not match.");
    }
    
    if(event()!=true){
        alert("Please write a valid email.");
    }
}